# Current baseline — Studio Drills

- Baseline ID: SD-B2
- Product status: accepted
- Authority: Paul's answers in `spec/questions.md` (S-04, 2026-10-24) and his instruction "My take on
  questions.md are added in now. Let's run the architect" (2026-10-24 16:28 MDT). Revision record:
  `revisions/2026-10-24-paul-answers.md`.
- Experiment route: new-prototype
- Build readiness: needs-tests → **frozen locally**. Prototype repo created from the archetype and linked
  2026-10-26 (`~/Developer/Prototypes/Studio Drills`). The build waits on committing the freeze there.
  Experiment start waits on Q2.
- Supersedes: SD-B1 (proposed), preserved in `revisions/SD-B1-snapshot/`.

## Authoritative artifacts

| Artifact | Path | Baseline / status |
| --- | --- | --- |
| Product contract (scope and acceptance) | spec/spec.md (with spec/scope.md) | SD-B2 / accepted |
| Experiment | experiment.md | SD-B2 / planned |
| Evidence | evidence.md | SD-B2 / S-01–S-04 checked 2026-10-24 |
| Scenarios | spec/seed-data/README.md | SD-B2 / planned, not implemented |
| Architecture and work packages | architecture.md, packages/WP-1..WP-5 | SD-B2 / current (2026-10-24) |
| Acceptance tests and freeze | ../tests/frozen/ (AC-1, AC-4–AC-18), frozen.ref, ../.foundry/frozen.lock | SD-B2 / locked locally, not committed; not yet run (no build) |
| Change brief for the builder | change-brief.md | SD-B2 / current |
| Implementation and results | unavailable | none |

## Superseded material

- SD-B1 spec pack, architecture, WPs and frozen tests (freeze 47819e8d): `revisions/SD-B1-snapshot/`.
  They no longer control the build. [AC-2] and [AC-3] are retired.
- The old StudioDrills repo (github.com/paulthebutcher/studio-drills, Jan 2026) is excluded by instruction.
- `../_to_delete/` holds byte-identical copies of five SD-B1 files (WP-3, WP-4, WP-5, ac-2, ac-3). It has
  no authority. Paul chose to keep it (2026-10-26).
- Clarifications from 2026-10-26 (no criteria changed): `revisions/2026-10-26-readiness-answers.md`.

## Open dependencies

- Product: Q2 (Paul's Level 1 content check in Logic 12.4) is open and blocks the experiment start.
- Engine: Paul confirmed the kept-data exception for this build (OD-13, 2026-10-26). A constitution §2
  amendment for single-operator tools is proposed as separate engine work. It does not block this build.
- Build: the prototype repo is linked and receives this packet with the SD-B2 plan and gate. Committing the
  freeze there (Paul to authorize) and recording it in the repo's `mission/build-baseline.md` lets the
  builder run WP-1..WP-5.
