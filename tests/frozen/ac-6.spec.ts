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

test.describe("[AC-6] A later unaided success clears a technique from Revisit", () => {
  const T = "slicing";
  const onRevisit = (page: Page) => page.locator(`[data-testid="revisit-item"][data-slug="${T}"]`);

  test("[AC-6] done unaided without the hint clears it; history keeps both in order", async ({ page, request }) => {
    await reset(request, "demo");
    await page.goto("/");
    await expect(onRevisit(page)).toHaveCount(1);
    await expect(page.getByTestId("recommended-drill")).toHaveAttribute("data-slug", "l2-d1");
    const d = drill("l2-d1");
    expect(d.moves.some((m) => m.technique === T), "l2-d1 uses slicing").toBe(true);
    const statuses = d.moves.map((m) => (m.technique === T ? "done-unaided" : "done-with-help")) as Status[];
    await finishViaForm(page, "l2-d1", statuses, "happy");
    await page.goto("/");
    await expect(onRevisit(page)).toHaveCount(0);
    await page.goto(`/techniques/${T}`);
    const relevant = page.locator(
      '[data-testid="technique-history-item"][data-status="stuck"], [data-testid="technique-history-item"][data-status="done-unaided"]',
    );
    const n = await relevant.count();
    expect(n).toBeGreaterThanOrEqual(2);
    await expect(relevant.first()).toHaveAttribute("data-status", "stuck");
    await expect(relevant.nth(n - 1)).toHaveAttribute("data-status", "done-unaided");
  });

  test("[AC-6] done with help does not clear it", async ({ page, request }) => {
    await reset(request, "demo");
    const d = drill("l2-d1");
    await finishViaForm(page, "l2-d1", d.moves.map(() => "done-with-help") as Status[], "partly");
    await page.goto("/");
    await expect(onRevisit(page)).toHaveCount(1);
  });

  test("[AC-6] done unaided with the hint opened does not clear it", async ({ page, request }) => {
    await reset(request, "demo");
    const d = drill("l2-d1");
    const hinted = d.moves.filter((m) => m.technique === T).map((m) => moveId("l2-d1", m.order));
    const statuses = d.moves.map(() => "done-unaided") as Status[];
    await finishViaForm(page, "l2-d1", statuses, "happy", { hints: hinted });
    await page.goto("/");
    await expect(onRevisit(page)).toHaveCount(1);
  });
});
