# WP-1 — Domain, content, seed and the kept practice log

> Baseline SD-B2. The contracts every other WP consumes. Runs first, alone.

## Goal

Replace the archetype's Notes example with the Studio Drills domain: schema, versioned DAW-agnostic drill
content with a Logic layer, three scenario fixtures, the practice/scenario database boundary and the pure
progress functions.

## Depends on (contracts consumed)

None. Archetype: `lib/db.ts`, guarded seed pattern in `prisma/seed.ts`, `scripts/env.ts`.

## Scope (build this)

- [ ] `prisma/schema.prisma` per architecture §4 (`Technique`, `LogicCapability`, `Drill` with key,
      progression, tempo; `Move` with technique + Logic layer; `MoveResult.hintUsed`). Delete `Note`.
- [ ] `content/techniques.json`, `content/logic-capabilities.json`, `content/drills.json` per the
      architecture §4 contract and the curriculum plan in `spec/seed-data/README.md`: 12 genre-neutral drills,
      3 levels; each drill has ≥1 constraint, key, chord progression, tempo, 3–6 moves; no written parts.
      Move instructions are DAW-agnostic (no Logic names); Logic names live in `logicCapability`,
      `logicNote` and `hint`. Reserved slugs present and used as specified.
- [ ] Find each Logic capability's page in the Logic Pro (Mac) user guide on `support.apple.com`; record URL
      and check date. Do not invent menu paths. Anything unconfirmed for 12.4 keeps its drills `drafted`
      and is listed for Paul in the WP report.
- [ ] Every Level 2–3 drill uses a technique introduced earlier ([AC-12]).
- [ ] `lib/dbguard.ts`: `isPracticeDb(url)` by basename `practice.db`; `assertNotPractice(url)` exits
      non-zero. Default `DATABASE_URL` = `file:./practice.db`.
- [ ] `prisma/seed.ts --scenario=<demo|ordinary|awkward>` per architecture §5 (refuses practice; fixed
      fixture ids and timestamps). `npm run practice:init` (create only if absent; never modify).
      npm aliases `scenario:demo|ordinary|awkward`.
- [ ] `POST /api/test/reset {scenario}` gated by `STUDIO_DRILLS_TEST_RESET=1`; 409 on practice.
- [ ] `lib/progress.ts`: `recommendedDrill`, `drillState`, `revisitList` (unaided requires `hintUsed=false`),
      `contentFlagged`, `levelTechniques`; pure; unit tests in `tests/dev/`.
- [ ] `.gitignore`: `practice.db*`, `practice.*.db`, `scenario-*.db*`, `test.db*`.

## Out of scope (other WPs / not the slice)

UI (WP-2–4); attempts API and validation (WP-4); export/import (WP-5); runtime content generation (never);
calibration, genre-specific levels, templates, other DAW layers (later phases).

## Acceptance criteria

- [AC-12] Seed content integrity.
- [AC-15] Scenario resets cannot touch the practice log.

## Tests (frozen — keyed to the above, for `/verify`)

`tests/frozen/ac-12.spec.ts`, `ac-15.spec.ts`. Read-only for the builder.

## Notes

- Content is the bet. Spend the effort on accurate, level-appropriate moves.
- No code path deletes or truncates `practice.db`. Ever.
