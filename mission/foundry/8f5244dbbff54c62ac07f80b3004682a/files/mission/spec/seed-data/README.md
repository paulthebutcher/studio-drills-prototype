# seed-data — Studio Drills (prototype)

> Fixture **plan** for baseline SD-B2. Nothing here is implemented yet. All scenario attempts are
> synthetic. Drill text is drafted by the agent at build (WP-1) and stays `drafted` until Paul checks it
> in Logic Pro 12.4 (Q2). Logic capability names are planning labels; each needs its Apple guide page
> found and checked (E-03, **needs verification**). SD-B1's plan is in `../../revisions/SD-B1-snapshot/`.

## Curriculum plan (12 drills, 3 levels, genre-neutral)

Move text is DAW-agnostic and names the technique; the Logic column is the tool layer (S-04 Q6).
Starter material is key, chord progression and tempo only; no drill ships written parts (S-04 C1).
Keys and progressions below are working values for variety, not requirements.

| Drill | Working topic | Techniques introduced | Combines | Logic layer (planning labels) | Starter (key · progression · tempo) |
| --- | --- | --- | --- | --- | --- |
| l1-d1 | 4-bar hat pattern with velocity and chance variation | step programming; velocity variation | — | Step Sequencer; step row parameters | A minor · i–VI–III–VII · 90 |
| l1-d2 | 8-bar groove that changes at bar 5 | groove arrangement | — | Drummer; Drummer Editor | C major · I–V–vi–IV · 100 |
| l1-d3 | Chop a drum loop into a new pattern | `slicing` | — | Apple Loops browser; `quick-sampler-slice` | E minor · i–iv–VII–III · 85 |
| l1-d4 | Fade the groove in and out cleanly | fades; volume automation | groove arrangement | region fades; volume automation | D major · I–vi–IV–V · 110 |
| l2-d1 | Tighten a chopped loop to the grid | timing correction | `slicing` | Flex Time; Quantize; `quick-sampler-slice` | G minor · i–VII–VI–V · 92 |
| l2-d2 | Add a bass line under the groove | `bass-line` (root-following bass); low-end EQ | groove arrangement | `bass-session-player`; Channel EQ | F major · I–iii–IV–V · 104 |
| l2-d3 | Make the bass duck under the kick | sidechain compression | `bass-line`, groove arrangement | Compressor side chain | F major · I–iii–IV–V · 104 |
| l2-d4 | A pad that opens up over 8 bars | filter movement; parameter automation | volume automation | Alchemy; plug-in automation | B♭ major · I–V–vi–IV · 96 |
| l3-d1 | Build 3 sections and switch between them live | live arrangement | step programming, `bass-line` | Live Loops grid; scenes | A minor · i–VI–III–VII · 120 |
| l3-d2 | A transition that glitches into the drop | stutter/glitch effects | live arrangement, automation | Remix FX or Beat Breaker *(choose after checking 12.4)* | A minor · i–VI–III–VII · 120 |
| l3-d3 | Resample a stem into a new part | resampling | `slicing` | Stem Splitter; Quick Sampler | E minor · i–iv–VII–III · 88 |
| l3-d4 | Glue the mix bus | bus compression; saturation | sidechain compression, low-end EQ | ChromaGlow; Compressor | Working values chosen in WP-1 (AC-12 requires a key, progression and tempo); the drill may suggest starting from an earlier drill's result |

Reserved slugs used by tests: technique `slicing` (l1-d3, l2-d1), technique `bass-line` (l2-d2), Logic
capabilities `quick-sampler-slice` and `bass-session-player`.

## Scenarios

Same schema, logic and reset boundary in all three. Scenario databases are separate from the practice
database, which is never reset (OD-13). Fixtures planned, not implemented.

| Case | Stable ID | Evidence / assumptions | Records | Expected software behavior (test oracle) | Neutral task for Paul | Observation that would weaken the bet | Reset |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Demonstration (staged) | `SD-DEMO` | Synthetic. Assumes Paul finishes Level 1 in order (A-01) | 12 drills; 4 attempts (l1-d1..l1-d4); l1-d3 `slicing` move = stuck; one move with hint used; others mixed; one note | Today recommends `l2-d1`; Revisit lists `slicing`; Path shows Level 1 done; export lists 4 attempts with hint use | "Pick up where you left off." | Paul ignores the recommendation and Revisit and jumps elsewhere every time | Reseed scenario `demo` |
| Ordinary | `SD-ORD` | Paul's real day-1 state (S-01 §2): no attempts | 12 drills; 0 attempts | Today recommends `l1-d1`; Revisit empty with direction; Path shows nothing done; technique pages show empty history | "Use this when you want to practice in Logic." | Paul reads the drill and closes it without opening Logic; or Level 1 is plainly beneath him (all "new to me" = no) | Reseed scenario `ordinary` (also the content of a new practice database) |
| Awkward | `SD-AWK` | Plausible counterexamples: Paul does it his own way; content wrong for 12.4 | 12 drills; 2 attempts: l1-d2 outcome happy with 2 moves skipped; l2-d2 `bass-line` move = content-wrong ("not where the drill says") with hint used | Mixed result saved as-is; l2-d2 flagged; `bass-line` not on Revisit; Today recommends `l1-d1` | "Do whichever drill you like." | Paul flags content on several drills: the curriculum, not the app, is the problem | Reseed scenario `awkward` |

Sparse data must show truthful empty states. The experiment reads Paul's practice export, not these fixtures.
