import { test as base, expect, type APIRequestContext, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

test.describe("[AC-18] An exported log can be imported back", () => {
  test("[AC-18] export, reset, import restores the same state; second import adds nothing", async ({ page, request }) => {
    await reset(request, "demo");
    const before = await exportLog(request);
    await page.goto("/");
    const revisitBefore = await page.getByTestId("revisit-item").evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")));
    const recBefore = await page.getByTestId("recommended-drill").getAttribute("data-slug");

    const dir = mkdtempSync(join(tmpdir(), "sd-ac18-"));
    const file = join(dir, "studio-drills-log.json");
    writeFileSync(file, JSON.stringify(before));

    await reset(request, "ordinary");
    expect((await exportLog(request)).attempts).toHaveLength(0);
    await page.goto("/path");
    await page.getByTestId("import-file").setInputFiles(file);
    await page.getByRole("button", { name: "Import log" }).click();
    await expect(page.getByTestId("import-result")).toBeVisible();

    const after = await exportLog(request);
    const norm = (log: { attempts: Record<string, unknown>[] }) =>
      JSON.stringify([...log.attempts].sort((a, b) => String(a.id).localeCompare(String(b.id))));
    expect(norm(after)).toBe(norm(before));
    await page.goto("/");
    expect(await page.getByTestId("revisit-item").evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")))).toEqual(revisitBefore);
    await expect(page.getByTestId("recommended-drill")).toHaveAttribute("data-slug", recBefore ?? "");

    await page.goto("/path");
    await page.getByTestId("import-file").setInputFiles(file);
    await page.getByRole("button", { name: "Import log" }).click();
    await expect(page.getByTestId("import-result")).toBeVisible();
    expect((await exportLog(request)).attempts).toHaveLength(before.attempts.length);
    rmSync(dir, { recursive: true, force: true });
  });

  test("[AC-18] malformed or mismatched imports are rejected and change nothing", async ({ page, request }) => {
    await reset(request, "ordinary");
    const bad: unknown[] = [
      { attempts: "nope" },
      { attempts: [{ id: "x1", drill: "l9-d9", finishedAt: "2026-10-01T00:00:00Z", outcome: "happy", note: "", moves: [] }] },
      {
        attempts: [{
          id: "x2", drill: "l1-d1", finishedAt: "not a date", outcome: "happy", note: "",
          moves: drill("l1-d1").moves.map((m) => ({ moveId: moveId("l1-d1", m.order), status: "done-unaided", newToMe: true, hintUsed: false })),
        }],
      },
      {
        attempts: [{
          id: "x3", drill: "l1-d1", finishedAt: "2026-10-01T00:00:00Z", outcome: "amazing", note: "",
          moves: drill("l1-d1").moves.map((m) => ({ moveId: moveId("l1-d1", m.order), status: "done-unaided", newToMe: true, hintUsed: false })),
        }],
      },
    ];
    for (const b of bad) {
      const r = await request.post("/api/import", { data: b });
      expect(r.status(), JSON.stringify(b).slice(0, 120)).toBe(400);
    }
    expect((await exportLog(request)).attempts).toHaveLength(0);
    const dir = mkdtempSync(join(tmpdir(), "sd-ac18b-"));
    const file = join(dir, "broken.json");
    writeFileSync(file, "{ this is not json");
    await page.goto("/path");
    await page.getByTestId("import-file").setInputFiles(file);
    await page.getByRole("button", { name: "Import log" }).click();
    await expect(page.getByTestId("import-error")).toBeVisible();
    expect((await exportLog(request)).attempts).toHaveLength(0);
    rmSync(dir, { recursive: true, force: true });
  });
});
