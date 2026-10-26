# data-model-hints.md — Studio Drills (prototype)

> Entities in Paul's language (S-01 §4), revised for SD-B2 (S-04 Q6, C1, C3). Architect owns the schema.

## In scope

- **Level** — a rung of the progression. Order, title, summary.
- **Technique** — the DAW-agnostic thing being learned ("sidechain compression", "slicing a loop",
  "velocity variation"). Slug, name, summary, level it is introduced in.
- **Logic capability** — the Logic Pro tool used for a technique ("Step Sequencer", "Quick Sampler
  Slice mode"). Slug, name, Logic area, Apple guide URL, checked date. The only tool-specific entity.
- **Drill** — constraints + an ordered set of moves (S-01 §4). Slug (`l<level>-d<n>`), level, order,
  title, goal, constraints, key, chord progression, tempo, optional style hint (genre-neutral now),
  estimated minutes, content status (drafted / checked by Paul).
- **Move** — one step. Order, DAW-agnostic instruction, technique, Logic layer (capability + one-line
  Logic note), hint.
- **Attempt** — drill, finished at, outcome, note.
- **Move result** — status, new to me, hint used.
- **Demo user** — single seeded user.

## Enums

- Move result status: `done-unaided` · `done-with-help` · `skipped` · `stuck` · `content-wrong`.
- Attempt outcome: `happy` · `partly` · `not-yet`.
- Drill content status: `drafted` · `checked`.

## Out of prototype scope

- ~~Template~~ — on hold (S-04 Q5).
- ~~Genre~~ entity — later phase (S-04 Q3); style hint is a plain string.
- ~~Tool layers for other DAWs~~ — later (S-04 Q6); the schema keeps the Logic layer separate so others can be added.
- ~~Calibration result~~ — later (S-04 Q7).
- ~~Submission / Grade / Feedback~~ — someday.
- ~~Account / Profile~~ — constitution §8.
