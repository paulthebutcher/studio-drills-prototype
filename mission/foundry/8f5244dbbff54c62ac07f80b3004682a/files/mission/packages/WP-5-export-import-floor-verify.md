# WP-5 — Export, import, design floor, verify and preview

> Baseline SD-B2. Last.

## Goal

Make the kept log portable in both directions, meet the design floor everywhere, wire `/verify` to this
project's ACs, and put the demo on a preview.

## Depends on (contracts consumed)

WP-1–4: all routes, `lib/progress.ts`, `validateAttempt()`.

## Scope (build this)

- [ ] `GET /api/export` → attachment `studio-drills-log.json`: `{exportedAt, contentVersion, attempts:[{id,
      finishedAt, drill, drillTitle, outcome, note, contentFlagged, moves:[{order, moveId, technique,
      logicCapability, status, newToMe, hintUsed}]}]}`. "Export my log" link on `/path`.
- [ ] `POST /api/import` → `importLog()` per architecture §5 (all-or-nothing, idempotent by attempt id).
      On `/path`: `import-file` input, "Import log" button, `import-result` ("Imported N, skipped M") or
      `import-error` with a plain message.
- [ ] Design floor on every screen and the modal: 375px with no horizontal scroll; visible focus ring; no
      animation under `prefers-reduced-motion`.
- [ ] Replace the Letlytics registry in `scripts/verify.ts` with AC-1, AC-4–AC-18 (outside `tests/frozen/`).
- [ ] Vercel preview seeded with `SD-DEMO` (writes may not persist, E-05). README: `npm run practice:init &&
      npm run dev`; the content-update procedure (export → rename old file aside → init → import).

## Out of scope (other WPs / not the slice)

Markdown export; hosted persistence or sync (promotion track); in-place migrations.

## Acceptance criteria

- [AC-9] Export gives Paul his practice log outside the app.
- [AC-14] Design floor.
- [AC-18] An exported log can be imported back.

## Tests (frozen — keyed to the above, for `/verify`)

`tests/frozen/ac-9.spec.ts`, `ac-14.spec.ts`, `ac-18.spec.ts`.

## Notes

- `/verify` green with no console errors is the definition of done; the two-week run then waits on Q2.
