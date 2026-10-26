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

test("[AC-12] Seed content integrity", async () => {
  expect(drills.length).toBeGreaterThanOrEqual(12);
  const techSlugs = new Set(techniques.map((t) => t.slug));
  const logicSlugs = new Set(logicCaps.map((c) => c.slug));
  const introduced = new Map(techniques.map((t) => [t.slug, t.introducedInLevel]));
  for (const t of techniques) {
    expect(t.name.trim().length).toBeGreaterThan(0);
    expect(t.summary.trim().length).toBeGreaterThan(0);
  }
  for (const c of logicCaps) {
    expect(c.name.trim().length).toBeGreaterThan(0);
    expect(c.sourceUrl, c.slug).toMatch(/^https:\/\/support\.apple\.com\//);
    expect(Number.isNaN(Date.parse(c.sourceCheckedAt)), `${c.slug} checked date`).toBe(false);
  }
  const logicNames = logicCaps.map((c) => c.name.toLowerCase());
  for (const d of drills) {
    expect(d.slug).toMatch(new RegExp(`^l${d.level}-d${d.order}$`));
    expect(d.constraints.length, d.slug).toBeGreaterThanOrEqual(1);
    expect(d.key.trim().length, `${d.slug} key`).toBeGreaterThan(0);
    expect(d.progression.trim().length, `${d.slug} progression`).toBeGreaterThan(0);
    expect(d.tempo, `${d.slug} tempo`).toBeGreaterThanOrEqual(40);
    expect(d.tempo, `${d.slug} tempo`).toBeLessThanOrEqual(220);
    expect(d.moves.length, d.slug).toBeGreaterThanOrEqual(3);
    expect(d.moves.length, d.slug).toBeLessThanOrEqual(6);
    expect(["drafted", "checked"]).toContain(d.contentStatus);
    const raw = d as unknown as Record<string, unknown>;
    for (const forbidden of ["notes", "midi", "parts", "audio"]) expect(raw[forbidden], `${d.slug} ships ${forbidden}`).toBeUndefined();
    for (const m of d.moves) {
      const where = `${d.slug} m${m.order}`;
      expect(techSlugs.has(m.technique), `${where} technique ${m.technique}`).toBe(true);
      expect(logicSlugs.has(m.logicCapability), `${where} Logic ${m.logicCapability}`).toBe(true);
      expect(m.instruction.trim().length).toBeGreaterThan(0);
      expect(m.logicNote.trim().length).toBeGreaterThan(0);
      expect(m.hint.trim().length).toBeGreaterThan(0);
      const instr = m.instruction.toLowerCase();
      expect(instr, `${where} instruction names Logic`).not.toMatch(/\blogic\b/);
      for (const n of logicNames) expect(instr.includes(n), `${where} instruction names "${n}"`).toBe(false);
      expect(introduced.get(m.technique)!, `${where} uses ${m.technique} before it is introduced`).toBeLessThanOrEqual(d.level);
    }
    if (d.level > 1) {
      expect(d.moves.some((m) => introduced.get(m.technique)! < d.level), `${d.slug} combines earlier`).toBe(true);
    }
  }
  for (const t of ["slicing", "bass-line"]) expect(techSlugs.has(t)).toBe(true);
  for (const c of ["quick-sampler-slice", "bass-session-player"]) expect(logicSlugs.has(c)).toBe(true);
  expect(drill("l1-d3").moves.some((m) => m.technique === "slicing")).toBe(true);
  expect(drill("l2-d1").moves.some((m) => m.technique === "slicing")).toBe(true);
  expect(drill("l2-d2").moves.some((m) => m.technique === "bass-line" && m.logicCapability === "bass-session-player")).toBe(true);
});
