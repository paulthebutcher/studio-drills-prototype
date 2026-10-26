# Clarification — readiness review answers

Status: **applied** 2026-10-26. Baseline stays **SD-B2**: no acceptance criterion, test or freeze changed
(freeze `fdcd0ced` still matches).
Authority: Paul's answers to four questions in a Claude Code readiness review session, 2026-10-26 (S-05).

## Answers and where they landed

| Question | Paul's answer | Applied in |
| --- | --- | --- |
| Q1: build now, or Level 1 drills from text first? | Build now; check Level 1 in parallel | questions.md Q1, OD-2, new OD-15, SOW Phase 0, experiment.md |
| Kept data (OD-13) vs constitution §2 | Keep the project exception for this build; also amend the constitution as separate engine work | OD-13, baseline, architecture §10, evidence E-14 |
| Must "12 drills" vs Should "Level 3 beyond two drills" | Keep 12; drop the Should | scope.md |
| Delete `_to_delete/` (byte-identical SD-B1 copies) | Keep it | baseline (superseded material) |

## Mechanical fixes made in the same review

- experiment.md: stale SD-B1 wording ("hidden-until-tried hints", capabilities as the unit) changed to SD-B2
  terms (on-demand hints with recorded use, techniques; unaided means the hint was unopened). Status
  `draft` → `planned`, to match the baseline.
- seed-data/README.md: l3-d4 had no key, progression or tempo, which [AC-12] requires. WP-1 now picks
  working values.
- gtm-positioning.md and distillation-notes.md: SD-B2 notes added. Their SD-B1 content is kept as the
  distiller's record.
- evidence.md: sources put in ID order; S-05 and E-13 to E-15 added.
- 2026-10-24 revision record: note that the architect re-planned and re-froze.
