# Revision — Paul's answers to the SD-B1 questions

Status: **applied** 2026-10-24.
Parent: SD-B1 (proposed), preserved in `SD-B1-snapshot/` (not in Git; the project folder is uncommitted).
SHA-256 manifest of the snapshot is recorded in the reconciler trace. The snapshot's
`spec/questions.md` already carries Paul's answers because it was copied after he edited the file.
New baseline: **SD-B2 (accepted)**.
Authority: Paul's PB answers in `spec/questions.md` (S-04), and his instruction "My take on
questions.md are added in now. Let's run the architect" (2026-10-24 16:28 MDT).
Evidence: E-09–E-12 in `../evidence.md`; E-08 superseded.

## Learned, decided, uncertain

- **Learned:** nothing from practice. No session has happened; the observation sheet stays empty.
- **Decided (Paul):** DAW-agnostic moves with a Logic-only tool layer (Q6); hints on demand through a
  clickable tooltip trigger and modal (Q4); starter material = key + chord progression, no written parts
  (C1); keep the practice data (C3); genre-neutral now, genre-specific later (Q3); templates and onboarding
  calibration documented, not built (Q5, Q7); local practice (Q8); Logic Pro 12.4 (Q9).
- **Decided (reconciler, to keep the measure honest):** opening a hint is recorded per move, and only a
  done-unaided result with the hint unopened clears Revisit. Paul can reverse this.
- **Decided (reconciler, to realize C3 inside the prototype):** keep data by never deleting `practice.db`
  and by export + import across rebuilds, with no in-place migrations.
- **Uncertain:** Q2 (Paul's Level 1 content check) unanswered; Q1 unanswered, treated as "build" from his
  instruction; C3 conflicts with constitution §2 and is applied as a scoped exception, flagged for engine review.

## Before / after

| Area | SD-B1 | SD-B2 | Authority |
| --- | --- | --- | --- |
| Bet / validation question | New Logic capabilities used unaided later | New techniques (done in Logic 12.4) done again without the hint | Q6 |
| Unit of learning | Logic capability | DAW-agnostic technique; Logic capability as tool layer | Q6 |
| Help | Hidden until stuck or finished | On demand via tooltip-triggered modal; use recorded | Q4 (+ recording: reconciler) |
| Starter material | Logic built-in loops/players | Key, chord progression, tempo; no written parts | C1 |
| Data | Throwaway + export | Kept: never deleted; export + import | C3 |
| Genres | Style hint only; picker Won't | Genre-neutral now; genre-specific levels a later phase | Q3 |
| Templates / calibration | Won't / question | Documented later phases, not built | Q5, Q7 |
| Screens | Today, Drill, Finish, Path, Capability | Today, Drill (+ Hint modal), Finish, Path (+ Import), Technique | Q4, Q6, C3 |
| Scenarios | Capability-keyed fixtures | Technique-keyed; hint use in fixtures; reserved slugs `slicing`, `bass-line` | Q4, Q6 |
| Architecture / WPs / tests | SD-B1 plan, freeze 47819e8d | **Stale**; architect re-plans for SD-B2 | this revision |

## Acceptance criteria

| ID | SD-B2 | Note |
| --- | --- | --- |
| AC-1 | changed | Shows key, progression, tempo |
| AC-2 | **retired** | Hints withheld until an attempt; contradicted by Q4. Replaced by AC-16 |
| AC-3 | **retired** | Stuck-reveal of hint; replaced by AC-17 |
| AC-4 | changed | Hint-used recorded and exported |
| AC-5, AC-6 | changed | Technique replaces capability; AC-6 unaided requires hint unopened |
| AC-7, AC-8 | changed | Techniques; capability page → technique page |
| AC-9, AC-10, AC-11, AC-12, AC-13 | changed | Fields, slugs, content shape, notice copy |
| AC-14 | retained | |
| AC-15 | retained | |
| AC-16 | new | DAW-agnostic moves with Logic layer; no inline hints |
| AC-17 | new | Hint modal for one move, keyboard operable, use recorded |
| AC-18 | new | Import an exported log; idempotent; malformed rejected |

## Next cheapest experiment

Unchanged: Paul checks Level 1 in Logic 12.4 (Q2), then two weeks of self-started practice read from the
kept log.

## Downstream artifacts

| Artifact | Readiness after this revision |
| --- | --- |
| spec/spec.md, scope.md, data-model-hints.md, open-decisions.md, questions.md, look-and-feel.md, seed-data/README.md | updated to SD-B2 |
| experiment.md, evidence.md, SOW.md, baseline.md | updated to SD-B2 |
| architecture.md, packages/WP-*.md | stale until the architect re-plans (same session) |
| tests/frozen/, .foundry/frozen.lock, frozen.ref | stale (SD-B1 freeze 47819e8d, uncommitted, preserved in the snapshot); replacement freeze required |
| Implementation | none exists |

Update (same day): the architect re-planned for SD-B2 (run `5bdffb21932342e6a3e34c2c7b5d9fa7`) and wrote
the replacement freeze `fdcd0ced`. Current artifact status is in `../baseline.md`.
