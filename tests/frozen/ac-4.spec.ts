import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * FROZEN acceptance test, Studio Drills baseline SD-B2. Authored at the
 * architect stage and hashed into .foundry/frozen.lock (Fix 1). Do not edit:
 * /verify fails the entire run on any change to tests/frozen/. Builder tests
 * belong in tests/dev/. Helpers are inlined per file (frozen specs import only
 * the bare "@playwright/test" and Node builtins).
 */
const test = base.extend<{ failOnError: void }>({
  failOnError: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") problems.push(`console.error → ${msg.text()}`);
      });
      page.on("pageerror", (err) => problems.push(`pageerror → ${err.message}`));
      page.on("requestfailed", (req) => {
        const errorText = req.failure()?.errorText ?? "";
        if (errorText.includes("ERR_ABORTED")) return;
        problems.push(`requestfailed → ${req.method()} ${req.url()} (${errorText})`);
      });
      await use();
      if (problems.length > 0) {
        throw new Error(`Console/network errors on primary flow:\n  - ${problems.join("\n  - ")}`);
      }
    },
    { auto: true },
  ],
});

type ContentMove = { order: number; instruction: string; technique: string; logicCapability: string; logicNote: string; hint: string };
type ContentDrill = {
  slug: string; level: number; order: number; title: string; goal: string; constraints: string[];
  key: string; progression: string; tempo: number; styleHint?: string; estMinutes: number;
  contentStatus: string; moves: ContentMove[];
};
type Technique = { slug: string; name: string; summary: string; introducedInLevel: number };
type LogicCapability = { slug: string; name: string; area: string; sourceUrl: string; sourceCheckedAt: string };
const drills: ContentDrill[] = JSON.parse(readFileSync("content/drills.json", "utf8"));
const techniques: Technique[] = JSON.parse(readFileSync("content/techniques.json", "utf8"));
const logicCaps: LogicCapability[] = JSON.parse(readFileSync("content/logic-capabilities.json", "utf8"));
const drill = (slug: string) => {
  const d = drills.find((x) => x.slug === slug);
  if (!d) throw new Error(`content missing drill ${slug}`);
  return { ...d, moves: [...d.moves].sort((a, b) => a.order - b.order) };
};
const tech = (slug: string) => {
  const t = techniques.find((x) => x.slug === slug);
  if (!t) throw new Error(`content missing technique ${slug}`);
  return t;
};
const logic = (slug: string) => {
  const c = logicCaps.find((x) => x.slug === slug);
  if (!c) throw new Error(`content missing Logic capability ${slug}`);
  return c;
};
const moveId = (slug: string, order: number) => `${slug}-m${order}`;

async function reset(request: APIRequestContext, scenario: "demo" | "ordinary" | "awkward") {
  const r = await request.post("/api/test/reset", { data: { scenario } });
  expect(r.status(), `reset to ${scenario}`).toBe(200);
}

type Status = "done-unaided" | "done-with-help" | "skipped" | "stuck" | "content-wrong";
/** Fill and save the Finish form. `hints` = move ids whose hint was opened (carried as ?hints=). */
async function finishViaForm(
  page: Page, slug: string, statuses: Status[], outcome: "happy" | "partly" | "not-yet",
  opts: { note?: string; hints?: string[]; navigate?: boolean } = {},
) {
  const d = drill(slug);
  if (opts.navigate !== false) {
    const q = opts.hints && opts.hints.length ? `?hints=${opts.hints.join(",")}` : "";
    await page.goto(`/drills/${slug}/finish${q}`);
  }
  for (let i = 0; i < d.moves.length; i++) {
    const id = moveId(slug, d.moves[i].order);
    await page.locator(`input[name="status-${id}"][value="${statuses[i]}"]`).check();
    await page.locator(`input[name="new-${id}"][value="${i % 2 === 0 ? "yes" : "no"}"]`).check();
  }
  await page.locator(`input[name="outcome"][value="${outcome}"]`).check();
  if (opts.note) await page.locator('textarea[name="note"]').fill(opts.note);
  await page.getByRole("button", { name: "Save attempt" }).click();
  await expect(page).toHaveURL(new RegExp(`/drills/${slug}/finish\\?attempt=`));
}
async function exportLog(request: APIRequestContext) {
  const r = await request.get("/api/export");
  expect(r.status()).toBe(200);
  return r.json();
}
void finishViaForm; void reset; void tech; void logic; void moveId; void exportLog;

test("[AC-4] Finishing a drill records every move result and survives reload", async ({ page, request }) => {
  await reset(request, "ordinary");
  const d = drill("l1-d1");
  await page.goto("/drills/l1-d1");
  await page.getByTestId("move").nth(1).getByTestId("hint-trigger").click();
  await expect(page.getByTestId("hint-modal")).toBeVisible();
  await page.getByTestId("hint-modal").getByRole("button", { name: "Close" }).click();
  await page.getByRole("link", { name: "Finish drill" }).click();
  await expect(page).toHaveURL(/\/drills\/l1-d1\/finish/);
  const m2 = moveId("l1-d1", d.moves[1].order);
  await expect(page.locator(`[data-testid="move-result"][data-move-id="${m2}"]`)).toHaveAttribute("data-hint-used", "true");
  const statuses = d.moves.map((_, i) => (i === 0 ? "done-unaided" : i === 1 ? "done-with-help" : "skipped")) as Status[];
  const note = "Chance row felt random until I lowered it.";
  await finishViaForm(page, "l1-d1", statuses, "partly", { note, navigate: false });
  const summary = page.getByTestId("attempt-summary");
  await expect(summary.getByTestId("summary-move")).toHaveCount(d.moves.length);
  for (let i = 0; i < d.moves.length; i++) {
    const id = moveId("l1-d1", d.moves[i].order);
    const sm = summary.locator(`[data-testid="summary-move"][data-move-id="${id}"]`);
    await expect(sm).toHaveAttribute("data-status", statuses[i]);
    await expect(sm).toHaveAttribute("data-hint-used", i === 1 ? "true" : "false");
    await expect(sm.getByTestId("hint-text")).toHaveText(d.moves[i].hint);
    await expect(sm.getByTestId("hint-guide-link")).toHaveAttribute("href", logic(d.moves[i].logicCapability).sourceUrl);
  }
  await page.reload();
  await page.goto("/path");
  const row = page.locator('[data-testid="path-drill"][data-slug="l1-d1"]');
  await expect(row).toHaveAttribute("data-state", "done");
  await expect(row).toHaveAttribute("data-outcome", "partly");
  await page.goto("/");
  await expect(page.getByTestId("recommended-drill")).toHaveAttribute("data-slug", "l1-d2");
  const exp = await exportLog(request);
  expect(exp.attempts).toHaveLength(1);
  const a = exp.attempts[0];
  expect(a.drill).toBe("l1-d1");
  expect(a.outcome).toBe("partly");
  expect(a.note).toBe(note);
  expect(a.moves).toHaveLength(d.moves.length);
  for (let i = 0; i < d.moves.length; i++) {
    const m = a.moves.find((x: { moveId: string }) => x.moveId === moveId("l1-d1", d.moves[i].order));
    expect(m.status).toBe(statuses[i]);
    expect(m.newToMe).toBe(i % 2 === 0);
    expect(m.hintUsed).toBe(i === 1);
  }
});
