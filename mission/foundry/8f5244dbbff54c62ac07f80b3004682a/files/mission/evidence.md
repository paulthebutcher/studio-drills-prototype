# Evidence — Studio Drills

This ledger separates source claims, observations and decisions. Checked dates describe the stated
inspection, not unperformed live verification.

## Sources

| ID | Exact path or URL and locator | Author / type | Document date | Checked date and method | Currency |
| --- | --- | --- | --- | --- | --- |
| S-01 | `inbox/studio-drills-intake.md`, §1–§7, open threads, operator context | Interviewer write-up of Paul's words / interview | 2026-10-22 | 2026-10-24, read in full | current |
| S-02 | https://support.apple.com/109503 — Logic Pro for Mac release notes (12.0–12.4 entries) | Apple / vendor documentation | page published 2026-09-29 | 2026-10-24, fetched and summarized by tool | current |
| S-03 | https://vercel.com/kb/guide/is-sqlite-supported-in-vercel | Vercel / vendor knowledge base | unknown | 2026-10-24, fetched and summarized by tool | current |
| S-04 | `mission/spec/questions.md`, PB answers to Q3–Q9, C1, C3 (the snapshot in `revisions/SD-B1-snapshot/spec/questions.md` already contains these answers; it was copied after Paul edited the file) | Paul / founder decisions | 2026-10-24 | 2026-10-24, read in full | current |
| S-05 | `mission/revisions/2026-10-26-readiness-answers.md` (Paul's answers in a Claude Code readiness review) | Paul / founder decisions | 2026-10-26 | 2026-10-26, recorded at the time | current |

## Consequential claims

| ID | Statement | Source IDs and locator | Type | Currency | Limitations / superseded by | Affects |
| --- | --- | --- | --- | --- | --- | --- |
| E-01 | Paul uses Logic Pro and wants to improve production skill with the tool, not songwriting | S-01 §1, §2 | assertion | current | Self-described; no record of current practice yet (session zero collects it) | Bet, scope, all ACs |
| E-02 | Progressive constrained drills will build Paul's tool knowledge over time | S-01 §1, §3 | assertion | unresolved | The hypothesis under test; no observation yet | experiment, AC-4–AC-6 |
| E-03 | Logic Pro 12.4 is the latest Mac version; 12.0 added AI Session Players (incl. Synth Player and bass styles) and Sound Library; 12.3 updated Beat Breaker and Alchemy | S-02, 12.0–12.4 entries | reported (vendor) | current | Release notes only; individual capability names in the seed plan (Step Sequencer, Quick Sampler, Flex Time, Live Loops, Stem Splitter, ChromaGlow, etc.) are **needs verification** against the user guide per page | seed plan, AC-12, Q9 |
| E-04 | Paul did not give a real drill or recent session; the "Sampler + Step Sequencer hat pattern" example is the interviewer's | S-01 §7 | reported | current | Illustrative, not observed | seed l1-d1 |
| E-05 | SQLite writes cannot be reliably persisted on Vercel serverless functions | S-03 | reported (vendor) | current | Vendor KB summary; architect may confirm detail | OD-14, deployment |
| E-06 | Paul wants no accounts, no money: "just a prototype for me to play with" | S-01 §5 | decision | current | — | track, scope |
| E-07 | The old Jan 2026 StudioDrills repo is excluded | S-01 operator context | decision | current | Not read, by instruction | all |
| E-09 | Paul runs Logic Pro 12.4 | S-04 Q9 | decision (operator fact) | current | — | content checks, AC-12 |
| E-10 | Move text is DAW-agnostic; Logic is the only tool layer; hints on demand via tooltip-triggered modal; starter = key + progression, no written parts | S-04 Q4, Q6, C1 | decision | current | Modal design/copy may change later (Paul) | AC-1, AC-12, AC-16, AC-17 |
| E-11 | Keep the practice data for tracing, labelling and evals | S-04 C3 | decision | current | Conflicts with constitution §2 throwaway rule; applied as a scoped project exception (OD-13) | AC-15, AC-18, OD-13 |
| E-12 | Genre-specific drills, templates and onboarding calibration are later phases, documented not built | S-04 Q3, Q5, Q7 | decision | current | — | scope |
| E-13 | Build now; Paul checks Level 1 in Logic in parallel | S-05 Q1 | decision | current | — | OD-2, OD-15, SOW |
| E-14 | The kept-data exception stands for this build; a constitution §2 amendment is separate engine work | S-05 | decision | current | Engine amendment not yet drafted | OD-13 |
| E-15 | All 12 drills are Must; the Level 3 cut option is removed | S-05 | decision | current | — | scope, AC-12 |
| E-08 | Drills give constraints and an ordered set of moves naming capabilities; coaching only after an attempt | S-01 §3, open threads | assertion (interviewer's reading) | superseded | Superseded by E-10 (S-04 Q4): help is on demand, not after the attempt | AC-2, AC-3 |

## Conflicts and verification needs

- E-08 is superseded by E-10 (Paul's Q4 answer).
- E-11 vs constitution §2: Paul's decision governs this project; the exception is scoped in OD-13 and confirmed
  for this build (E-14). The constitution amendment is separate engine work.
- E-03: every Logic capability needs its own Apple guide page and checked date before its
  drill leaves `drafted` (AC-12, Q2). Version-dependent features (Session Players, Stem Splitter,
  ChromaGlow) depend on Paul's Logic version (Q9).
- No external regulatory claims were needed (see distillation-notes checklist).
