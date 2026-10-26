# WP-3 — Drill page and Hint modal

> Baseline SD-B2. Parallel with WP-2 after WP-1.

## Goal

Show a drill's DAW-agnostic moves with the Logic line, keep hints one click away in a modal, and record
which hints were opened.

## Depends on (contracts consumed)

WP-1 models and stable move ids; WP-2 layout (integration only).

## Scope (build this)

- [ ] `/drills/[slug]`: title, goal, constraints, key, progression, tempo; `move` items in order with
      `move-instruction`, `move-technique`, `move-logic` ("In Logic Pro: <capability> — <logicNote>"), and
      a small `hint-trigger` button styled as a tooltip trigger (accessible name "Hint for move <order>").
      Unknown slug → 404 page with direction.
- [ ] Hint text is not serialized into the page (no hidden DOM, no client props) until requested.
- [ ] `GET /api/moves/[id]/hint` → `{hint, logicNote, capability:{name, sourceUrl}}`.
- [ ] `hint-modal` as a native `<dialog>` opened with `showModal()`: `hint-text`, `hint-logic-capability`,
      `hint-guide-link`, "Close"; Escape and Close dismiss; focus returns to the trigger.
- [ ] On first open, set the move's `data-hint-used="true"` and a visible "Hint used" label; "Finish drill"
      link carries `?hints=<moveId>,…`.

## Out of scope (other WPs / not the slice)

Saving attempts (WP-4); modal visual polish beyond the design floor (Paul will revise, Q4); timer and
copy-as-text (Should).

## Acceptance criteria

- [AC-16] A drill shows DAW-agnostic moves with a Logic layer, help kept out of the instructions.
- [AC-17] The Hint control opens that move's hint in a modal and records the use.

## Tests (frozen — keyed to the above, for `/verify`)

`tests/frozen/ac-16.spec.ts`, `ac-17.spec.ts`.

## Notes

- [AC-16] checks raw server HTML for hint text. CSS-hidden hints fail it.
