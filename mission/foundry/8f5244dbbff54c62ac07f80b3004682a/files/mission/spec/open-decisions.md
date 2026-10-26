# open-decisions.md — Studio Drills

> Defaults chosen by the distiller (logged, not asked). Reverse an accepted choice through a recorded
> baseline revision. Baseline SD-B2 (accepted 2026-10-24). Items marked *(SD-B2)* were revised from
> Paul's answers (S-04); SD-B1 wording is preserved in `../revisions/SD-B1-snapshot/spec/open-decisions.md`.

1. **Governing track: prototype** — a single-user practice tool for Paul; nothing in it needs accounts,
   payments, hosting or multi-user data (S-01 §5). Unchanged in SD-B2; keeping Paul's local log (#13) is a
   scoped exception inside the prototype track, not a move to promotion.
2. **Experiment route: new prototype, with a content check first.** The drill book alone tests the
   content but not the sequencing, Revisit loop and per-move record across two weeks. The build is
   small (feasibility). It is also a Foundry test run (S-01 operator context); that purpose is
   labelled in `experiment.md` so it does not pose as the learning question. Paul confirmed the build on
   2026-10-26 (Q1), with the Level 1 check running in parallel (OD-15).
3. **Content source: agent-drafted, checked by Paul.** *(SD-B2)* Technique text is DAW-agnostic; each
   Logic capability carries an Apple guide URL and checked date; drills stay `drafted` until Paul checks
   them in Logic 12.4 (Q2). No runtime generation.
4. **Technique is the unit of learning; Logic is the tool layer.** *(SD-B2, S-04 Q6)* Move instructions are
   DAW-agnostic and name a technique; each move has a Logic layer (capability + note). Revisit, Path and
   the technique page work on techniques.
5. **Curriculum: 3 levels × 4 drills, combination from Level 2.** Topics in the seed plan are a working
   draft. Level 1 introduces single techniques; Levels 2–3 combine earlier ones. Genre-neutral (S-04 Q3).
6. **Move results:** status done-unaided / done-with-help / skipped / stuck / content-wrong, plus "new to me"
   and "hint used" *(SD-B2)*. These measure the validation question (new techniques, later unaided use).
7. **"Done" is self-judged** (S-01 open threads): outcome happy / partly / not-yet. No grader.
8. **No locks; advisory recommendation.** Recommended = first drill in level order with no finished
   attempt. Any drill opens from Path. Starting level is Paul's choice via Path (critic finding 7). Onboarding calibration is a documented later phase (S-04 Q7).
9. **No gamification** (streaks, XP, badges). Paul did not ask for them; they would muddy the
   experiment's "self-started" signal.
10. **Help on demand, recorded.** *(SD-B2, S-04 Q4)* Each move has a clickable tooltip trigger that opens a
    modal with the hint and Apple guide link. Opening it sets "hint used" for that move; a move only counts
    as unaided when its hint was not opened. Design and copy of the modal can change later (Paul).
11. **Starter material = key, chord progression, tempo.** *(SD-B2, S-04 C1)* No drill ships written parts.
    Downloadable templates documented, on hold (Q5).
12. **Revisit rule:** *(SD-B2)* a stuck result adds the technique; a later done-unaided result with the hint
    not opened clears it; done-with-help, skipped, content-wrong and hint-assisted results change nothing.
13. **Keep the data.** *(SD-B2, S-04 C3)* The practice log in `practice.db` is never deleted or reset by the
    app or its tooling, so it can be used later for tracing, labelling and evals. Export and import carry it
    across rebuilds and schema changes; there are no in-place migrations. This is a **project-level
    exception** to constitution §2 (throwaway data), authorized by Paul, limited to his own machine and
    single user. Hosted or synced persistence stays out (§8). Paul confirmed the exception for this build on
   2026-10-26; a constitution §2 amendment for single-operator tools is separate engine work.
14. **Practice runs locally on Paul's Mac** (`npm run dev`). The Vercel preview carries the demonstration
    scenario only, because Vercel states SQLite writes cannot be reliably persisted on its serverless
    functions (E-05, S-03). Writes on the preview may vanish; the preview is for looking, not practice. Q8.
15. **Level 1 check runs alongside the build.** *(2026-10-26, Q1)* WP-1 drafts the content files and lists
    the Level 1 drill text for Paul. He checks it in Logic 12.4 while WP-2 to WP-5 run. Corrections and
    `contentStatus: checked` go into `content/drills.json`. If `practice.db` already exists, they reach it
    through the G1-11 procedure (export, rename aside, init, import). The two-week run starts after Q2.

## Architect decisions (G1)

SD-B2 plan (2026-10-24). SD-B1 entries are preserved in the snapshot; G1-4 and G1-8 changed, G1-10–G1-12 new.

- **G1-1. Code location:** a new standalone prototype repo from the archetype, linked with the prototype
  handoff helper. Creating and linking it is Paul's call. Frozen tests are authored here to that repo's
  root layout.
- **G1-2. Stack:** golden path, no new dependencies; hand-written validation; native `<dialog>` for the modal.
- **G1-3. One write path:** `POST /api/drills/[slug]/attempts` → `saveAttempt()`; import reuses its
  validation; all other state derived on read in `lib/progress.ts`.
- **G1-4. Hints fetched on open** *(changed)*: `GET /api/moves/[id]/hint`; never in initial HTML; use carried
  to the Finish form via `?hints=` and saved as `hintUsed` (tightens [AC-16], [AC-17]).
- **G1-5. Database boundary:** practice = any file named `practice.db`; seed refuses it; `practice:init`
  never overwrites; test reset gated by `STUDIO_DRILLS_TEST_RESET=1` ([AC-15]).
- **G1-6. Content as versioned JSON** in `content/` (techniques, Logic capabilities, drills), shape per
  architecture §4.
- **G1-7. Frozen suite runs serially** on `test.db`, port 3100, no server reuse.
- **G1-8. Export format JSON with attempt ids** *(changed)* (`studio-drills-log.json`).
- **G1-9. Reserved fixture slugs** *(changed)*: techniques `slicing`, `bass-line`; Logic capabilities
  `quick-sampler-slice`, `bass-session-player`.
- **G1-10. Import is all-or-nothing and idempotent by attempt id** ([AC-18]).
- **G1-11. Kept data has no in-place migrations.** Content or schema updates: export → rename old file
  aside → `practice:init` → import (OD-13).
- **G1-12. Logic layer kept in its own table** so other DAW layers can be added later without touching
  move text (S-04 Q6).
