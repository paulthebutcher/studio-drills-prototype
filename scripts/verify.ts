import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { ensureDatabaseUrl } from "./env";

// Fix 1 (frozen acceptance tests) — Status: HYPOTHESIS.
// Acceptance tests are authored + frozen upstream (architect stage) and hashed
// into .foundry/frozen.lock before the build. The build agent must not touch
// tests/frozen/. This harness recomputes the hash and fails the whole run on a
// mismatch, so a compromised gate can never report as a pass. No-op (and fully
// backward-compatible) when a project has no tests/frozen/ + lock yet.
const FROZEN_DIR = "tests/frozen";
const FROZEN_LOCK = ".foundry/frozen.lock";
// The freeze reference lives in the build handoff (mission/), NOT under .foundry/
// or tests/frozen/, so that deleting those does not erase the fact that a freeze
// was declared. Its presence means "a frozen gate is expected" — deletion-tamper.
const FROZEN_REF = "mission/frozen.ref";

/**
 * /verify harness (constitution §4, CLAUDE.md "Verify before done").
 *
 * Runs the acceptance-criteria Playwright tests, then prints a pass/fail table
 * keyed to the criteria in /mission/spec/spec.md and exits non-zero on failure.
 *
 * This is a runnable STUB that works end-to-end today. The TODOs below mark the
 * parts Phase 0's full /verify will deepen.
 */

// TODO(phase-0): auto-discover acceptance criteria by parsing /mission/spec/spec.md
// instead of maintaining this registry by hand.
// Letlytics registry — updated at the architect freeze (G1); ids match
// mission/spec/spec.md and tests/frozen/ac-<n>.spec.ts one-to-one.
const ACCEPTANCE_CRITERIA: Record<string, string> = {
  "AC-1": "A landlord can scan a whole market at once (graded pins, filter, counter)",
  "AC-2": "A pin opens a full, interrogable scorecard; counter counts unique views",
  "AC-3": "Tunable assumptions visibly recompute cash flow, cash-on-cash, projection, grade",
  "AC-4": "Every sub-score explains itself, with honest provenance labels",
  "AC-5": "Market emphasis re-ranks the whole map live and survives navigation",
  "AC-6": "The gate withholds Pro features; the demo trial visibly unlocks them",
  "AC-7": "Compare shows 2–4 properties side-by-side with row-level metrics",
  "AC-8": "The alert fake-door gates in Free and confirms demo-only in Pro",
  "AC-9": "EPC D–G properties carry the explicit 2030 letting-rules warning",
  "AC-10": "Display derived, link to source: link-outs + mandatory attribution",
  "AC-11": "Prototype integrity: demo-data affordance everywhere; no login/payment inputs",
  "AC-12": "Seeded grade distribution is sane (all grades present, no D/F wall)",
  "AC-13": "Demo tier state is server-authoritative, not a client illusion",
};

const RESULTS_FILE = "test-results/results.json";
const SCREENSHOT_DIR = "test-results/screenshots";

type SpecResult = { title: string; ok: boolean; errors: string[] };

// Minimal shape of the Playwright JSON report (only the fields we read).
type JsonError = { message?: string };
type JsonTestRun = { errors?: JsonError[] };
type JsonTest = { results?: JsonTestRun[] };
type JsonSpec = { title: string; ok: boolean; tests?: JsonTest[] };
type JsonSuite = { specs?: JsonSpec[]; suites?: JsonSuite[] };

// Walk the Playwright JSON report and flatten every spec with its status.
function collectSpecs(node: JsonSuite): SpecResult[] {
  const out: SpecResult[] = [];
  for (const spec of node.specs ?? []) {
    const errors: string[] = [];
    for (const t of spec.tests ?? []) {
      for (const r of t.results ?? []) {
        for (const e of r.errors ?? []) {
          if (e.message) errors.push(String(e.message).split("\n")[0]);
        }
      }
    }
    out.push({ title: spec.title, ok: Boolean(spec.ok), errors });
  }
  for (const child of node.suites ?? []) {
    out.push(...collectSpecs(child));
  }
  return out;
}

// --- Fix 1: frozen-test integrity (HYPOTHESIS) ---------------------------------
// Canonical hash of tests/frozen, computed in Node so freeze (`--write-lock`) and
// recheck use the identical method and cannot drift across platforms. Equivalent
// to `find tests/frozen -type f | sort | xargs sha256sum | sha256sum`, but robust.
function listFilesRecursive(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...listFilesRecursive(p));
    else out.push(p);
  }
  return out;
}

function computeFrozenHash(): string | null {
  if (!existsSync(FROZEN_DIR)) return null;
  const files = listFilesRecursive(FROZEN_DIR).sort();
  const manifest = files
    .map((f) => `${createHash("sha256").update(readFileSync(f)).digest("hex")}  ${f}\n`)
    .join("");
  return createHash("sha256").update(manifest).digest("hex");
}

// `--write-lock`: record the freeze. Run at the architect's freeze step; commit
// both artifacts with tests/frozen/ before the build begins. Writes the integrity
// hash (.foundry/frozen.lock) AND the handoff freeze reference (mission/frozen.ref)
// so the "a freeze is expected" fact survives deletion of tests/frozen/ + .foundry/.
function writeLock(): never {
  const hash = computeFrozenHash();
  if (hash === null) {
    console.error(`✖ Cannot freeze: no ${FROZEN_DIR}/ directory exists.`);
    process.exit(1);
  }
  mkdirSync(dirname(FROZEN_LOCK), { recursive: true });
  writeFileSync(FROZEN_LOCK, hash + "\n");
  mkdirSync(dirname(FROZEN_REF), { recursive: true });
  writeFileSync(
    FROZEN_REF,
    `frozen-tests: ${FROZEN_DIR}\nhash: ${hash}\n` +
      `# Build-handoff freeze reference. /verify requires ${FROZEN_DIR}/ and ${FROZEN_LOCK}\n` +
      `# to be present and matching; their absence here is FROZEN_TESTS_TAMPERED.\n`,
  );
  console.log(`✓ Froze ${FROZEN_DIR} @ ${hash.slice(0, 8)} → ${FROZEN_LOCK} + ${FROZEN_REF}`);
  process.exit(0);
}

function failTampered(reason: string): never {
  console.error("\n✖ FROZEN_TESTS_TAMPERED");
  console.error(`  ${reason}`);
  console.error("  The acceptance gate was altered. Every criterion is not_tested; the run fails.\n");
  for (const id of Object.keys(ACCEPTANCE_CRITERIA)) {
    console.error(`  ? ${id.padEnd(6)} not_tested  (frozen gate tampered)`);
  }
  console.error("");
  process.exit(1);
}

// A freeze is "declared" if the build handoff carries the freeze reference, or a
// lock exists. Once declared, the gate must be fully PRESENT and INTACT — deleting
// tests/frozen/ or the lock is tampering, not a reversion to the freeze-less no-op
// (deletion-tamper is cheaper than edit-tamper). Only a genuinely freeze-less
// build — no reference and no lock anywhere — is a no-op (backward-compatible).
function frozenDeclared(): boolean {
  return existsSync(FROZEN_REF) || existsSync(FROZEN_LOCK);
}

function assertFrozenIntegrity(): void {
  if (!frozenDeclared()) return; // genuinely freeze-less build → no-op

  // Deletion path: a freeze is declared, so every gate artifact must be present.
  const missing = [
    !existsSync(FROZEN_REF) && `${FROZEN_REF} (handoff freeze reference)`,
    !existsSync(FROZEN_LOCK) && FROZEN_LOCK,
    !existsSync(FROZEN_DIR) && `${FROZEN_DIR}/`,
  ].filter((x): x is string => Boolean(x));
  if (missing.length > 0) {
    failTampered(`a freeze is declared, but gate artifacts are missing: ${missing.join(", ")}.`);
  }

  // Edit path: all present, so the hash must match the freeze.
  const expected = readFileSync(FROZEN_LOCK, "utf8").trim();
  const actual = computeFrozenHash();
  if (actual !== expected) {
    failTampered(`${FROZEN_DIR} hash ${String(actual).slice(0, 8)} ≠ frozen ${expected.slice(0, 8)}.`);
  }
}

function main() {
  // Freeze mode: record the frozen-test hash and exit (architect's freeze step).
  if (process.argv.includes("--write-lock")) writeLock();

  ensureDatabaseUrl();

  // Fix 1: the gate must be intact before we trust any result from it.
  assertFrozenIntegrity();

  console.log("\n┌─ Foundry /verify ─────────────────────────────────────────");
  console.log("│ Running acceptance-criteria tests (Playwright)…");
  console.log("└───────────────────────────────────────────────────────────\n");

  // Fix 1: once a freeze is declared, /verify runs the frozen runner config
  // (hash-covered inside tests/frozen/) — builder-authored tests under
  // tests/dev/ can never feed the AC table, even via a copied [AC-n] title.
  const playwrightArgs = ["playwright", "test"];
  if (frozenDeclared()) {
    playwrightArgs.push("--config", join(FROZEN_DIR, "playwright.config.ts"));
  }
  const run = spawnSync("npx", playwrightArgs, {
    stdio: "inherit",
    env: process.env,
  });

  // Detect the most common first-run failure: browsers not installed.
  if (run.status !== 0 && !existsSync(RESULTS_FILE)) {
    console.error(
      "\n✖ Test run produced no results. If this is a fresh checkout, install browsers:\n" +
        "    npx playwright install chromium\n",
    );
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(RESULTS_FILE, "utf8")) as JsonSuite;
  const specs = collectSpecs(report);

  // Map each acceptance criterion to the spec whose title contains its id.
  // Fix 1: PASS requires ok AND no errors — an errored test counts as a failure,
  // never a pass. A green from a builder-authored test is not counted here; only
  // frozen tests feed this table.
  const rows = Object.entries(ACCEPTANCE_CRITERIA).map(([id, description]) => {
    const match = specs.find((s) => s.title.includes(`[${id}]`));
    const status = !match ? "MISSING" : match.ok && match.errors.length === 0 ? "PASS" : "FAIL";
    return { id, description, status, errors: match?.errors ?? [] };
  });

  // Print the pass/fail table.
  console.log("\n  Acceptance criteria");
  console.log("  ───────────────────");
  const symbol = { PASS: "✓", FAIL: "✗", MISSING: "?" } as const;
  for (const row of rows) {
    console.log(
      `  ${symbol[row.status as keyof typeof symbol]} ${row.id.padEnd(6)} ${row.status.padEnd(8)} ${row.description}`,
    );
    for (const err of row.errors) console.log(`        ↳ ${err}`);
  }

  // List captured screenshots for the key flows.
  if (existsSync(SCREENSHOT_DIR)) {
    const shots = readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith(".png"));
    if (shots.length > 0) {
      console.log("\n  Screenshots");
      console.log("  ───────────");
      for (const shot of shots) console.log(`  • ${join(SCREENSHOT_DIR, shot)}`);
    }
  }

  // TODO(phase-0): surface a richer console/network error log here (currently
  // captured by the fixture and folded into the per-criterion error lines).
  // TODO(phase-0): screenshot every primary flow + visual-diff against a baseline.

  const failed = rows.filter((r) => r.status !== "PASS");
  console.log("");
  if (failed.length > 0) {
    console.log(`  Result: ${rows.length - failed.length}/${rows.length} criteria passed — FAIL\n`);
    process.exit(1);
  }
  console.log(`  Result: ${rows.length}/${rows.length} criteria passed — PASS\n`);
}

main();
