# spec.md — Studio Drills (prototype)

> Distilled from `inbox/studio-drills-intake.md` (S-01, guided interview with Paul, 2026-10-22), revised
> by Paul's answers in `questions.md` (S-04, 2026-10-24). **Prototype scope only** — see `scope.md` for
> what this build will not do. Where code and this spec disagree, this spec wins (constitution §5).
> Baseline **SD-B2** (accepted). Revision: `../revisions/2026-10-24-paul-answers.md`. The old January
> 2026 StudioDrills repo is excluded by Paul and is not an input.

## Problem & user

Paul uses Logic Pro 12.4 (S-04 Q9) and wants to get better at production by learning techniques and
the tool, not by writing better songs (S-01 §1). Today he has no structured path. Studio Drills gives
him the next drill: a goal, a few constraints, a key and chord progression to work in, and a short
ordered sequence of moves. Each move is written in DAW-agnostic terms and names the production
technique; a Logic Pro layer names the Logic capability to use for it (S-04 Q6). He carries the drill
out in Logic himself, then records how each move went.

The app runs on its own, separate from Logic. It never reads or writes Logic projects.

**The single validation question this prototype answers:** across two weeks of self-started sessions,
do these drills get Paul to use techniques that were new to him, and can he do them again without the
hint when a later drill combines them?

The bet is the drill content and its sequencing. The app is the delivery and the record. Every screen
exists to (a) put the right next drill in front of Paul, (b) keep help one click away without putting
it in the instructions, and (c) record per move whether he managed it unaided, used the hint, or got
stuck.

## Core loop (≤5 screens)

1. **Today** `/` — the recommended next drill (title, goal, constraints, key, chord progression, tempo,
   move count, estimated minutes) with "Start drill"; the Revisit list (techniques marked stuck); a link
   to choose a different drill or starting point.
2. **Drill** `/drills/[slug]` — goal, constraints, key/progression/tempo, and the ordered moves. Each move
   shows the DAW-agnostic instruction, the technique, and an "In Logic Pro" line naming the capability.
   Each move has a **Hint** control (a small clickable tooltip trigger) that opens a modal with the hint
   and the Apple guide link (S-04 Q4). Opening a hint is recorded.
3. **Finish** `/drills/[slug]/finish` — per move: status (done unaided / done with help / skipped / stuck /
   content wrong) and "new to me" yes/no; overall outcome (happy / partly / not yet); optional note. Moves
   whose hint was opened are marked "hint used". After saving, the summary shows every move's hint and
   guide link.
4. **Path** `/path` — levels in order, each drill's state (done / recommended / not started), the
   techniques each level introduces or combines, "Export my log" and "Import a log".
5. **Technique** `/techniques/[slug]` — DAW-agnostic summary, the "In Logic Pro" capabilities used for it
   with Apple guide links and checked dates, the drills that use it, and Paul's results with it.

## Stories & acceptance criteria

Flow criteria are journey-shaped (start / do / observe / break-if); the `[AC-n]` ids are stable and carry
unchanged through architecture → work packages → frozen tests → `/verify`. SD-B2 status per criterion is
in the revision record. **Retired in SD-B2:** [AC-2], [AC-3] (hints withheld until an attempt; replaced by
[AC-16], [AC-17]). Retired IDs are never reused.

- **[AC-1] A fresh start recommends the first drill and offers another starting point** *(changed)*
  - start: ordinary scenario `SD-ORD` (no attempts) at `/`
  - do: load Today
  - observe: Today shows drill `l1-d1` with its title, goal, every constraint, key, chord progression,
    tempo, the move count and "Start drill"; a visible "Choose a different starting point" link goes to
    `/path`; the Revisit area says nothing is waiting and explains how techniques get there
  - break-if: no drill shown; a drill other than `l1-d1` recommended; key or progression missing; any field
    empty or placeholder ("Lorem", "TBD", "undefined"); no route to choose another drill; Revisit shows
    invented entries

- **[AC-4] Finishing a drill records every move result and survives reload** *(changed)*
  - start: `SD-ORD` at `/drills/l1-d1`; Paul opens the hint on move 2
  - do: click "Finish drill"; for each move pick a status and "new to me"; choose outcome "partly"; type a
    note; click "Save attempt"
  - observe: a summary at `/drills/l1-d1/finish?attempt=<id>` lists each move with the chosen status, shows
    move 2 as "hint used", and shows every hint and guide link; after a full reload, `/path` shows `l1-d1`
    done with outcome "partly", Today recommends `l1-d2`, and the export contains the attempt with
    hint use recorded for move 2 only
  - break-if: a success message without a persisted attempt; reload loses the attempt, a move result, the
    note or the hint-used flag; hint use recorded on moves whose hint was not opened; Today still
    recommends `l1-d1`

- **[AC-5] Stuck moves put the technique on the Revisit list** *(changed: technique replaces capability)*
  - start: `SD-ORD`, no attempts
  - do: finish `l1-d1` marking move 2 "stuck" and the others not stuck
  - observe: Today's Revisit list shows move 2's technique by name, linking to `/techniques/[slug]`; that
    page shows the stuck result from this attempt
  - break-if: Revisit is populated before any stuck result; it lists techniques from moves not marked
    stuck; the link 404s; the technique page omits the attempt

- **[AC-6] A later unaided success clears a technique from Revisit** *(changed: technique; unaided now
  also means the hint was not opened)*
  - start: demonstration scenario `SD-DEMO` (technique `slicing` on Revisit from an earlier stuck result)
  - do: open the recommended drill `l2-d1`; finish it marking the `slicing` move "done unaided" without
    opening its hint
  - observe: Today no longer lists `slicing` under Revisit; its technique page shows both results in date
    order (stuck, then done unaided)
  - break-if: Revisit clears on "done with help", "skipped", or "done unaided" with the hint opened; history
    loses the earlier stuck result; Revisit clears without a new attempt

- **[AC-7] Path shows the whole progression and lets Paul start anywhere** *(changed: techniques)*
  - start: `SD-DEMO` at `/path`
  - do: view the page; click a not-started drill in a later level
  - observe: every level in order with its drills and states (done / recommended / not started); each
    level lists the techniques it introduces and those it combines from earlier levels; the click opens
    that drill with no lock or error
  - break-if: drill states disagree with the seeded attempts; a not-started drill cannot be opened; levels
    out of order; techniques per level missing

- **[AC-8] The technique page shows sources and Paul's history honestly** *(changed: technique page)*
  - start: `SD-ORD` at `/techniques/[any seeded slug]`
  - do: load the page
  - observe: name, DAW-agnostic summary, the "In Logic Pro" capabilities used for it (each with Apple guide
    link and checked date), the drills that use it, and an empty-history message pointing to a drill
  - break-if: fabricated history; a Logic capability without its link or checked date; the drill list is
    empty while the seed uses the technique

- **[AC-9] Export gives Paul his practice log outside the app** *(changed: fields)*
  - start: `SD-DEMO` at `/path`
  - do: click "Export my log"
  - observe: a JSON file downloads containing every attempt with date, drill, outcome, note and each move's
    technique, Logic capability, status, "new to me" and hint-used values, matching what the app shows
  - break-if: export empty while attempts exist; omits move results, notes or hint use; includes rows not in
    the current database

- **[AC-10] The Finish form rejects incomplete input and accepts honest mixed results** *(changed: hint-used field)*
  - start: `SD-ORD`, on the Finish form for `l1-d1`
  - do: (a) save with one move status unset; (b) save with no outcome; (c) save outcome "happy" with two moves
    "skipped"
  - observe: (a) and (b) stay on the form with a plain message naming what is missing and no attempt row is
    created (server-side check, not only client); (c) saves and is shown as entered
  - break-if: an attempt stored with a missing status, outcome or hint-used value; the server accepts values
    outside the enums or a non-boolean hint-used; (c) rejected or rewritten

- **[AC-11] "Content wrong" is recorded as a content problem, not Paul's failure** *(changed: slugs)*
  - start: awkward scenario `SD-AWK`
  - do: view `/path`, Today and the technique page for the move flagged in `SD-AWK`
  - observe: drill `l2-d2` shows a visible "content flagged" marker; the flagged move's technique is not on
    Revisit because of it; the export lists the flag
  - break-if: content-wrong counts as stuck; the flag is invisible; Revisit includes it

- **[AC-12] Seed content integrity** *(changed)*. Every drill has ≥1 constraint, a key, a chord progression,
  a tempo, 3–6 moves and a level, and no pre-written parts (no note lists or MIDI). Every move has a
  DAW-agnostic instruction with no Logic-specific names, a technique, a Logic layer (capability + note) and
  a hint. Every Logic capability has a `support.apple.com` guide URL and a checked date. Every level after
  the first combines at least one technique introduced earlier. Drill slugs follow `l<n>-d<n>`.
- **[AC-13] Prototype integrity** *(changed: notice copy)*. Every screen shows a visible "Prototype —
  practice data stays on this Mac" notice; no login, signup, payment or account inputs exist anywhere.
- **[AC-14] Design floor** *(retained)*. Every screen is usable at 375px width with no horizontal scroll;
  every interactive control shows visible keyboard focus; animation is disabled under
  `prefers-reduced-motion`.
- **[AC-15] Scenario resets cannot touch the practice log** *(retained; added by the architect in SD-B1)*.
  Running the scenario seed against a file named `practice.db` exits non-zero and leaves it byte-identical;
  `npm run practice:init` against an existing `practice.db` leaves it byte-identical.

- **[AC-16] A drill shows DAW-agnostic moves with a Logic layer, help kept out of the instructions** *(new)*
  - start: `SD-ORD` at `/`
  - do: click "Start drill"
  - observe: browser at `/drills/l1-d1`; goal, constraints, key, progression and tempo shown; moves in seed
    order, each with its DAW-agnostic instruction, technique name and an "In Logic Pro" line naming the
    capability; each move has a Hint control; no hint text is shown until a Hint control is used
  - break-if: move order differs from seed; a move lacks its technique or Logic line; hint text is visible
    inline before any Hint control is used; the page is a generic template without seed content

- **[AC-17] The Hint control opens that move's hint in a modal and records the use** *(new)*
  - start: `SD-ORD` at `/drills/l1-d1`
  - do: activate move 2's Hint control (click, and separately by keyboard); close the modal with Escape
  - observe: a modal dialog opens showing move 2's hint, its Logic capability and a link to its Apple guide
    page; only move 2's content is in it; Escape closes it and focus returns to the Hint control; move 2 is
    then marked "hint used" on the Drill page and preselected as hint used on the Finish form
  - break-if: the modal shows another move's hint or all hints; it cannot be opened or closed by keyboard;
    focus is lost on close; hint use is not recorded or is recorded for other moves

- **[AC-18] An exported log can be imported back** *(new; keeps the data across rebuilds, S-04 C3)*
  - start: `SD-DEMO`; export the log; reset to `SD-ORD`
  - do: on `/path`, choose "Import a log" and select the exported file
  - observe: Path, Today, Revisit and the export now match the `SD-DEMO` state (same attempts, move results,
    notes and hint use); importing the same file again adds nothing
  - break-if: imported attempts differ from the file; a second import duplicates attempts; a malformed file
    changes the database (it must be rejected with a plain message)

## Input surfaces (validation vs forgiveness)

```
INPUT: Hint control (Drill)               MODE: VALIDATED
  fields:
    moveId: format=existing move id of this drill  enum=n/a  plausibility=move belongs to the drill in the URL
  out of scope: hint use is held in the page until the attempt is saved

INPUT: Finish form                         MODE: VALIDATED (note is FORGIVING)
  fields:
    moveStatus[moveId]: enum=done-unaided|done-with-help|skipped|stuck|content-wrong  plausibility=every move present, no extra ids
    newToMe[moveId]: enum=yes|no  plausibility=required per move
    hintUsed[moveId]: format=boolean  plausibility=required per move (set by the page, not typed)
    outcome: enum=happy|partly|not-yet  plausibility=required
    note: FORGIVING free text, 0–2000 chars, trimmed; longer input truncated with a visible notice
  out of scope: no check that Paul did the work in Logic; no audio upload or grading

INPUT: Import a log (Path)                 MODE: VALIDATED
  fields:
    file: format=JSON matching the export shape  enum=statuses/outcomes as above  plausibility=every drill and move id exists in current content; dates parse
  out of scope: no merging of edited content versions; files from a different content version are rejected with the mismatched ids listed
```

## Notes for the build

- Content is the product. Drill, technique and Logic-capability content lives in versioned seed files,
  drafted by the agent, checked by Paul in Logic before Level 1 counts (Q2). Move instructions are
  DAW-agnostic; Logic names live only in the Logic layer, hints and capability records (S-04 Q6).
- Starter material is a key, a chord progression and a tempo. No drill ships pre-written parts (S-04 C1).
- Help is one click away via the Hint modal and its use is recorded, so "done unaided" stays meaningful.
- Recommendation is advisory: the first drill, in level order, without a finished attempt. Nothing is locked.
- **Keep the data** (S-04 C3): the practice log is never deleted by the app or its tooling. Export and
  import carry it across rebuilds and schema changes. This is a project-level exception to the
  constitution's throwaway rule, scoped to Paul's local machine (open-decisions #13).
