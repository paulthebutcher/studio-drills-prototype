# architecture.md — Studio Drills (prototype slice)

> The Architect's build plan (G1). Input: the Studio Drills spec pack + `constitution.md`.
> Track: prototype, settled upstream — see open-decisions #1. Baseline: **SD-B2 (accepted)**.
> Architect run `5bdffb21932342e6a3e34c2c7b5d9fa7`, 2026-10-24. Supersedes the SD-B1 plan (preserved in
> `revisions/SD-B1-snapshot/`); revision record `revisions/2026-10-24-paul-answers.md`.

## 1. Interpretation (to plan, not reshape)

The bet as settled: drill content and sequencing. Each drill gives a key, progression and tempo and a
few DAW-agnostic moves naming a technique, with a Logic Pro tool layer. Help is one click away, and its
use is recorded, so "done unaided" means something. The record is kept.

Load-bearing mechanics every screen depends on:

1. **The content contract** — `content/techniques.json`, `content/logic-capabilities.json`,
   `content/drills.json`, loaded by the seed. Every screen renders from it; [AC-12] tests it.
2. **The attempt write path** — one server function, `saveAttempt()`, behind one route handler, plus
   `importLog()` reusing the same validation. All derived state (recommendation, drill states, Revisit,
   content flags, export) is computed from saved attempts by pure functions in `lib/progress.ts`.
3. **The kept practice log** — `practice.db` is never deleted by any code path; scenarios and tests use
   other files; export/import is the only way data crosses a rebuild.

Coherence check (G1 gate): passed. Musts do not contradict; five screens plus one modal; no §8 item is
built (the kept log is local, single user, no hosting or migration).

## 2. Constitution-gap flags

- **Kept practice data vs §2 throwaway rule.** Paul decided to keep the data (S-04 C3, OD-13). Planned as a
  scoped project exception: one local SQLite file, never deleted, no in-place migrations, export/import as
  the carry-over path. Engine note for Paul: the constitution has no rule for single-operator tools whose
  own usage is the evidence; consider amending §2 rather than repeating per-project exceptions.
- **Vercel preview cannot hold practice (§7, E-05).** Preview is demo-only (OD-14).

## 3. Stack

Golden path as-is: Next.js App Router · TypeScript strict · Tailwind · Prisma + SQLite · Playwright ·
Vercel preview. No new dependencies. The Hint modal uses the native `<dialog>` element (no UI library).
Validation is hand-written.

**Where the code lives (G1-1, unchanged):** a new standalone prototype repo created from the archetype,
linked to this engagement with the prototype handoff helper, once Paul authorizes it. Frozen tests here
are authored to that repo's root layout and copy over unchanged.

## 4. Data model

| Entity | Key fields | Notes |
| --- | --- | --- |
| `User` | id | Single seeded demo user. |
| `Level` | order (unique), title, summary | 3 rows. |
| `Technique` | slug (id), name, summary, introducedInLevel | DAW-agnostic. Unit of Revisit, Path chips and the technique page. |
| `LogicCapability` | slug (id), name, area, sourceUrl, sourceCheckedAt | Only tool-specific entity; `support.apple.com` URL required. Later DAWs get sibling tables. |
| `Drill` | slug (id, `l<n>-d<n>`), levelOrder, order, title, goal, constraints (JSON string[]), key, progression, tempo, styleHint?, estMinutes, contentStatus | 12 rows. No parts. |
| `Move` | id (`<drillSlug>-m<order>`), drillSlug, order, instruction, techniqueSlug, logicCapabilitySlug, logicNote, hint | Stable ids; tests rely on them. |
| `Attempt` | id (cuid, exported), drillSlug, userId, finishedAt, outcome, note | Written by `saveAttempt()` / `importLog()` only. |
| `MoveResult` | attemptId, moveId, status, newToMe (bool), hintUsed (bool) | Unique (attemptId, moveId). |

**Content file contract (frozen tests read these files directly):**

- `content/techniques.json`: `[{slug, name, summary, introducedInLevel}]`
- `content/logic-capabilities.json`: `[{slug, name, area, sourceUrl, sourceCheckedAt (ISO date)}]`
- `content/drills.json`: `[{slug, level, order, title, goal, constraints: string[], key, progression,
  tempo (number), styleHint?, estMinutes, contentStatus, moves: [{order, instruction, technique,
  logicCapability, logicNote, hint}]}]`. Move ids derive as `<slug>-m<order>`.
- Reserved slugs: techniques `slicing` (used in `l1-d3` and `l2-d1`), `bass-line` (used in `l2-d2`); Logic
  capabilities `quick-sampler-slice`, `bass-session-player`.
- Move `instruction` text must not contain any Logic capability name from `logic-capabilities.json` or the
  word "Logic" ([AC-12]).

## 5. State machine / shared contracts

Two mutations, one validation module.

- `POST /api/drills/[slug]/attempts` (JSON `{moves:[{moveId,status,newToMe,hintUsed}], outcome, note}`) →
  `saveAttempt()` in `lib/attempts.ts`:
  1. drill exists (404 otherwise);
  2. `validateAttempt(drill, body)` in `lib/validation.ts`: every move once, no foreign ids, status in enum,
     `newToMe` and `hintUsed` booleans, outcome in enum, note string ≤ 2000 after trim (longer is
     truncated; response says `noteTruncated: true`);
  3. one transaction writes `Attempt` + `MoveResult`s → `201 {id}`. Invalid → `400 {error, missing}`, no rows.
- `POST /api/import` (JSON = an export file) → `importLog()`: validates every attempt with
  `validateAttempt`, checks every drill/move id exists, then inserts attempts whose `id` is not already
  present (idempotent) in one transaction → `200 {imported, skipped}`. Any invalid attempt → `400` and no rows.
- Derived (pure, `lib/progress.ts`):
  - `recommendedDrill()` — first drill by (levelOrder, order) with no attempt.
  - `drillState(slug)` — `done` / `recommended` / `not-started`.
  - `revisitList()` — per technique, the move results with status `stuck`, or `done-unaided` with
    `hintUsed = false`, ordered by attempt `finishedAt`; on the list iff the latest is `stuck`.
  - `contentFlagged(slug)` — any `content-wrong` result on the drill.
  - `levelTechniques(level)` — introduces / combines (used in the level, introduced earlier).
- **Hints:** never in the Drill page's initial HTML. `GET /api/moves/[id]/hint` →
  `{hint, logicNote, capability:{name, sourceUrl}}`. The Drill page fetches on opening the modal, marks the
  move `data-hint-used="true"` with a visible "Hint used" label, and adds the move id to the "Finish drill"
  link as `?hints=<id>,<id>`. The Finish form sets `hintUsed` from that list (shown read-only per move).
- **Database boundary** (`lib/dbguard.ts`): a database is "practice" when its file basename is
  `practice.db` (the default `DATABASE_URL`).
  - `npx tsx prisma/seed.ts --scenario=<demo|ordinary|awkward>` rebuilds the `DATABASE_URL` target and
    refuses (non-zero exit, nothing touched) on a practice database. npm aliases `scenario:<name>` set
    `DATABASE_URL=file:./scenario-<name>.db`.
  - `npm run practice:init` creates the practice database with content and no attempts only if absent; it
    never modifies an existing file. Content updates for an existing practice database: export, rename the
    old file aside (never delete), `practice:init`, import.
  - `POST /api/test/reset {scenario}` exists only when `STUDIO_DRILLS_TEST_RESET=1` and returns 409 on a
    practice database.
- Demo time: fixture attempts use fixed timestamps (2026-10-01 to 2026-10-08 UTC) and fixed ids.

## 6. Screens & routing

| Route | Screen | ACs |
| --- | --- | --- |
| `/` | Today: recommended drill, Revisit list, link to Path | 1, 4, 5, 6 |
| `/drills/[slug]` | Drill: goal, constraints, key/progression/tempo, moves with Logic line and Hint modal | 16, 17 |
| `/drills/[slug]/finish` | Finish form; `?attempt=<id>` shows the summary with all hints | 4, 10 |
| `/path` | Levels, drill states, techniques, content flags, Export my log, Import a log | 7, 9, 11, 18 |
| `/techniques/[slug]` | Technique: summary, Logic capabilities with sources, drills, history | 5, 6, 8 |
| `GET /api/export` | JSON download `studio-drills-log.json` | 9 |
| `POST /api/import` · `POST /api/drills/[slug]/attempts` · `GET /api/moves/[id]/hint` · `POST /api/test/reset` | API | 4, 10, 15, 17, 18 |

Five screens; within the constitution guideline.

### UI test-id contract (frozen tests depend on these)

- Global: `prototype-banner` containing "Prototype — practice data stays on this Mac".
- Today: `recommended-drill` (`data-slug`) with `drill-title`, `drill-goal`, `drill-constraint` (×n),
  `drill-key`, `drill-progression`, `drill-tempo`, `drill-move-count`; link "Start drill"; link "Choose a
  different starting point"; `revisit-list` with `revisit-item` (`data-slug` = technique, link to
  `/techniques/[slug]`) or `revisit-empty`.
- Drill: `drill-title`, `drill-goal`, `drill-constraint`, `drill-key`, `drill-progression`, `drill-tempo`;
  `move` (×n, `data-move-id`, `data-move-order`, `data-technique-slug`, `data-logic-slug`,
  `data-hint-used`) containing `move-instruction`, `move-technique`, `move-logic`, and button
  `hint-trigger` (accessible name "Hint for move <order>"); `hint-modal` (a `<dialog>`, role dialog) with
  `hint-text`, `hint-logic-capability`, link `hint-guide-link`, button "Close"; link "Finish drill".
- Finish: `move-result` fieldset (`data-move-id`, `data-hint-used`) with radios `status-<moveId>` and
  `new-<moveId>` (`yes`/`no`); radios `outcome`; textarea `note`; button "Save attempt"; `form-error`.
  Summary: `attempt-summary`, `summary-move` (`data-move-id`, `data-status`, `data-hint-used`) each with
  `hint-text` and `hint-guide-link`.
- Path: `level` (`data-level-order`) with `level-introduces` / `level-combines` containing `technique-chip`
  (`data-slug`); `path-drill` (`data-slug`, `data-state`, `data-outcome` when done; link to the drill);
  `content-flag`; link "Export my log"; file input `import-file`, button "Import log", `import-result`,
  `import-error`.
- Technique: `technique-name`, `technique-summary`, `technique-logic` (×n, `data-slug`) each with
  `logic-capability-name`, link `logic-source`, `logic-checked`; `technique-drill` (×n, `data-slug`);
  `technique-history-item` (`data-status`, `data-hint-used`) or `technique-history-empty`.

## 7. Work packages (execution order)

| WP | Scope | Depends on | Acceptance |
| --- | --- | --- | --- |
| WP-1 | Schema, content JSON (12 drills), seed + scenarios, DB guard, reset route, pure progress lib | — | 12, 15 |
| WP-2 | Layout, banner, tokens, Today, Path (without import) | WP-1 | 1, 7, 13 |
| WP-3 | Drill page, hint endpoint, Hint modal, hint-use tracking | WP-1, WP-2 | 16, 17 |
| WP-4 | Attempts API, Finish form + summary, Revisit, Technique page | WP-1–3 | 4, 5, 6, 8, 10, 11 |
| WP-5 | Export, import, design floor pass, verify registry, preview deploy (demo) | WP-1–4 | 9, 14, 18 |

Contract sentence: WP-1 exposes the schema, `content/*.json`, reserved slugs, `lib/progress.ts` and
`lib/dbguard.ts`; WP-2 the layout and drill card; WP-3 the hint endpoint and the `?hints=` contract; WP-4
`validateAttempt()` / `saveAttempt()`, which WP-5's import reuses. WP-2 and WP-3 can run in parallel after
WP-1 in separate worktrees.

## 8. Acceptance criteria (keyed for `/verify`)

Current: [AC-1], [AC-4]–[AC-18] per `spec/spec.md` (SD-B2). Retired: [AC-2], [AC-3] (SD-B2 revision);
their IDs are never reused. Architect tightenings (no relaxation):

- [AC-16] observe tightened: the Drill page's raw server HTML contains no hint text (hints are fetched on
  opening the modal), and move instructions contain no Logic capability names.
- [AC-17] observe tightened: hint use reaches the Finish form via `?hints=` and is saved as `hintUsed`.
- [AC-10] tightened: rejection cases asserted against `POST /api/drills/[slug]/attempts` directly.
- [AC-18] tightened: a malformed import is asserted against `POST /api/import` directly (400, no rows).

The frozen runner uses a dedicated `test.db` on port 3100, runs serially, and never reuses a running
server, so the suite cannot write into the practice log.

## 9. Risks & alternatives

| Call | What would break it | Rejected alternative |
| --- | --- | --- |
| Hints fetched on open, use carried in `?hints=` | Paul opens a hint, navigates away and back; use lost before saving | sessionStorage: survives navigation but is invisible to tests and per-tab; server-side "hint opened" events: a second write path for a two-week prototype |
| Technique as the Revisit unit | One technique spans several Logic capabilities and Paul struggles with only one | Capability-keyed Revisit: contradicts Q6 (DAW-agnostic primary content) |
| Kept practice.db + export/import, no migrations | A schema change makes an old export unimportable | Prisma migrations on practice.db: §8 migration burden and a path that can damage the log |
| Import idempotent by attempt id | Two exports with conflicting edits to one attempt | Merge logic: no attempt editing exists, so there is nothing to merge |
| Route handlers over server actions | Validation duplicated client-side and trusted | Server actions: harder to hit directly in frozen tests |
| Native `<dialog>` for the modal | Older focus-return quirks | A UI library: off the archetype |
| Serial test run on one test DB | Slower suite | Per-worker databases: more harness for 16 tests |

## 10. Open flags

- **Freeze is local and uncommitted.** Tests and lock live in this engagement; repo creation, link, packet
  delivery and the freeze commit are separate actions for Paul to authorize.
- **SD-B1 freeze (47819e8d) is stale**, preserved in `revisions/SD-B1-snapshot/`, replaced by the SD-B2 freeze.
- **`scripts/verify.ts` registry is Letlytics-specific** in the archetype; WP-5 replaces it with the SD-B2
  list (AC-1, AC-4–AC-18) outside `tests/frozen/`.
- **Content accuracy** (E-03): Logic capability labels marked needs-verification are checked against the
  Logic Pro 12.4 guide in WP-1; unconfirmed drills stay `drafted` and are listed for Paul (Q2).
- **Hint modal design** is provisional (Paul, Q4); tests pin behavior and test ids, not visuals.
- **Constitution §2 exception** for kept data: Paul confirmed it for this build (2026-10-26). A §2
  amendment is separate engine work (see §2).
