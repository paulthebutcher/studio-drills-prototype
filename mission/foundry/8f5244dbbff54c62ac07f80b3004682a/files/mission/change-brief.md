# Change brief — Studio Drills, SD-B2

For the next coding agent. Target repository: the standalone prototype repo at `~/Developer/Prototypes/Studio Drills`,
created from the Foundry archetype and linked to this engagement on 2026-10-26. No code exists, so this is a first build, not a change.

- **Baseline:** SD-B2 (accepted). Contract: `spec/spec.md`, `spec/scope.md`. Plan: `architecture.md`,
  `packages/WP-1..WP-5`. Gate: `tests/frozen/` (AC-1, AC-4–AC-18), lock in `.foundry/frozen.lock`,
  reference `mission/frozen.ref`. Treat `tests/frozen/` as read-only.
- **Retired:** [AC-2], [AC-3] (hints withheld until an attempt). Do not build a "Stuck on this" reveal.
- **What SD-B2 changed from SD-B1:** DAW-agnostic move text with a Logic-only tool layer; technique is the
  unit of Revisit and the per-technique page; hints behind a clickable tooltip trigger that opens a modal,
  with use recorded; starter material is key + chord progression + tempo, no written parts; the practice
  log is kept (never deleted), with export and import.
- **Impacted contracts:** content files (3 JSON files), `validateAttempt()` (adds `hintUsed`),
  `revisitList()` (unaided requires `hintUsed=false`), hint endpoint and `?hints=`, `/api/import`.
- **Checks:** `npm run typecheck`, `npm run lint`, `/verify` with the SD-B2 registry; no console errors on
  primary flows.
- **Unresolved:** Q2 content check (blocks the experiment, not the build); Logic capability names to verify
  against the Logic Pro 12.4 guide in WP-1; modal design is provisional (Paul will revise).
