# WP-4 — Attempts, Finish, Revisit and Technique page

> Baseline SD-B2. Runs after WP-1–3.

## Goal

The one write path, its form and summary, and the screens that read results back.

## Depends on (contracts consumed)

WP-1 models and progress functions; WP-2 Today/Path; WP-3 move ids, hint payload and the `?hints=` contract.

## Scope (build this)

- [ ] `lib/validation.ts` `validateAttempt()` and `lib/attempts.ts` `saveAttempt()` per architecture §5;
      `POST /api/drills/[slug]/attempts` → 201 / 400 / 404. Export `validateAttempt` for WP-5's import.
- [ ] `/drills/[slug]/finish`: `move-result` fieldsets (`data-hint-used` from `?hints=`, shown read-only),
      `status-<moveId>` and `new-<moveId>` radios with no defaults, `outcome` radios, `note`, "Save attempt"
      posting JSON with `hintUsed` per move; on 400 show `form-error` naming what is missing.
- [ ] On 201 → `/drills/[slug]/finish?attempt=<id>`: `attempt-summary` with `summary-move` items, each
      with `hint-text` and `hint-guide-link` (server-rendered).
- [ ] Today's Revisit reflects `revisitList()` by technique.
- [ ] `/techniques/[slug]`: name, summary, `technique-logic` entries with source link and checked date,
      drills using it, `technique-history-item`s in date order or `technique-history-empty`.

## Out of scope (other WPs / not the slice)

Export/import (WP-5); grading or audio upload (never in this prototype).

## Acceptance criteria

- [AC-4] Finishing a drill records every move result and survives reload.
- [AC-5] Stuck moves put the technique on the Revisit list.
- [AC-6] A later unaided success clears a technique from Revisit.
- [AC-8] The technique page shows sources and Paul's history honestly.
- [AC-10] The Finish form rejects incomplete input and accepts honest mixed results.
- [AC-11] "Content wrong" is recorded as a content problem, not Paul's failure.

## Tests (frozen — keyed to the above, for `/verify`)

`tests/frozen/ac-4.spec.ts`, `ac-5`, `ac-6`, `ac-8`, `ac-10`, `ac-11`.

## Notes

- All attempt writes go through `saveAttempt()` (or WP-5's `importLog()` reusing its validation).
- "happy" with skipped moves is valid. Never rewrite Paul's outcome.
