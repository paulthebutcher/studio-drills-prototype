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

test.describe("[AC-10] The Finish form rejects incomplete input and accepts honest mixed results", () => {
  const slug = "l1-d1";
  const url = `/api/drills/${slug}/attempts`;
  const full = () => ({
    moves: drill(slug).moves.map((m) => ({ moveId: moveId(slug, m.order), status: "done-unaided", newToMe: false, hintUsed: false })),
    outcome: "happy",
    note: "",
  });
  const count = async (request: APIRequestContext) => (await exportLog(request)).attempts.length;

  test("[AC-10] server rejects missing, extra and out-of-enum input", async ({ request }) => {
    await reset(request, "ordinary");
    const f = full();
    const cases: Record<string, unknown>[] = [
      { ...f, moves: f.moves.slice(1) },
      { ...f, outcome: undefined },
      { ...f, outcome: "amazing" },
      { ...f, moves: f.moves.map((m, i) => (i === 0 ? { ...m, status: "great" } : m)) },
      { ...f, moves: f.moves.map((m, i) => (i === 0 ? { ...m, newToMe: undefined } : m)) },
      { ...f, moves: f.moves.map((m, i) => (i === 0 ? { ...m, hintUsed: undefined } : m)) },
      { ...f, moves: f.moves.map((m, i) => (i === 0 ? { ...m, hintUsed: "yes" } : m)) },
      { ...f, moves: [...f.moves, { moveId: "l9-d9-m1", status: "stuck", newToMe: true, hintUsed: false }] },
    ];
    for (const c of cases) {
      const r = await request.post(url, { data: c });
      expect(r.status(), JSON.stringify(c).slice(0, 140)).toBe(400);
    }
    expect(await count(request)).toBe(0);
    expect((await request.post(url, { data: f })).status()).toBe(201);
    expect(await count(request)).toBe(1);
  });

  test("[AC-10] form names what is missing and stores nothing", async ({ page, request }) => {
    await reset(request, "ordinary");
    const d = drill(slug);
    await page.goto(`/drills/${slug}/finish`);
    for (let i = 1; i < d.moves.length; i++) {
      const id = moveId(slug, d.moves[i].order);
      await page.locator(`input[name="status-${id}"][value="done-unaided"]`).check();
      await page.locator(`input[name="new-${id}"][value="no"]`).check();
    }
    await page.getByRole("button", { name: "Save attempt" }).click();
    await expect(page.getByTestId("form-error")).toBeVisible();
    await expect(page).not.toHaveURL(/attempt=/);
    expect(await count(request)).toBe(0);
  });

  test("[AC-10] happy with skipped moves is saved as entered", async ({ page, request }) => {
    await reset(request, "ordinary");
    const d = drill(slug);
    await finishViaForm(page, slug, d.moves.map((_, i) => (i < 2 ? "skipped" : "done-unaided")) as Status[], "happy");
    const a = (await exportLog(request)).attempts[0];
    expect(a.outcome).toBe("happy");
    expect(a.moves.filter((m: { status: string }) => m.status === "skipped")).toHaveLength(2);
  });
});
