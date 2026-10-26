# WP-2 — Shell, Today and Path

> Baseline SD-B2. Can run in parallel with WP-3 after WP-1 (separate worktree).

## Goal

The app frame and the navigation screens: Today's recommendation and Revisit area, and the Path.

## Depends on (contracts consumed)

WP-1: Prisma models, `recommendedDrill`, `drillState`, `revisitList`, `contentFlagged`, `levelTechniques`.

## Scope (build this)

- [ ] Design tokens from `spec/look-and-feel.md` (quiet, focused, no gamification); root layout with
      `PrototypeBanner` text "Prototype — practice data stays on this Mac".
- [ ] `/`: `recommended-drill` card (title, goal, constraints, key, progression, tempo, move count, est.
      minutes, "Start drill"); "Choose a different starting point" → `/path`; `revisit-list` by technique
      or `revisit-empty` with direction copy.
- [ ] `/path`: levels in order; `level-introduces` / `level-combines` technique chips; `path-drill` rows
      with state, latest outcome and `content-flag`; every drill opens. Leave a slot for WP-5's export/import.
- [ ] Empty states per look-and-feel. No streaks, day counts or invented stats. Test ids per architecture §6.

## Out of scope (other WPs / not the slice)

Drill page and modal (WP-3); Finish, Technique page (WP-4); export/import (WP-5); calibration (later phase).

## Acceptance criteria

- [AC-1] A fresh start recommends the first drill and offers another starting point.
- [AC-7] Path shows the whole progression and lets Paul start anywhere.
- [AC-13] Prototype integrity.

## Tests (frozen — keyed to the above, for `/verify`)

`tests/frozen/ac-1.spec.ts`, `ac-7.spec.ts`, `ac-13.spec.ts`.

## Notes

- No locks anywhere. The recommendation is a suggestion.
