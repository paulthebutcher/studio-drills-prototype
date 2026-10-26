# scope.md — Studio Drills (prototype)

> Baseline SD-B2 (accepted, 2026-10-24). Source: S-01 interview, S-04 Paul's answers. See `spec.md` for ACs.

## Must

- **Today** with the advisory next-drill recommendation and the Revisit list ([AC-1], [AC-5], [AC-6]).
- **Drill** page: goal, constraints, key/progression/tempo, ordered DAW-agnostic moves with technique and
  an "In Logic Pro" line ([AC-16]).
- **Hint modal** per move, opened from a clickable tooltip trigger, with hint use recorded ([AC-17]).
- **Finish** form with per-move status, "new to me" and hint used; outcome; note; server-side
  validation; summary with all hints after saving ([AC-4], [AC-10]).
- **Revisit** by technique: stuck adds; a later done-unaided without the hint clears; content-wrong never
  adds ([AC-5], [AC-6], [AC-11]).
- **Path** with every level, drill states, techniques introduced/combined, open access ([AC-7]).
- **Technique** page with Logic capability sources, drills and history ([AC-8]).
- **Export my log** and **Import a log** ([AC-9], [AC-18]).
- **Seed content**: 3 levels, 12 drills, genre-neutral, each with key, chord progression and tempo, 3–6
  DAW-agnostic moves, each with a Logic layer ([AC-12]).
- **Keep the data**: the practice log is never deleted by the app or its tooling ([AC-15], [AC-18]).
- **Three scenarios** (demonstration, ordinary, awkward) on separate databases.
- **Prototype notice** and no account/payment inputs ([AC-13]); design floor ([AC-14]).

## Should (cut first under pressure)

- A per-drill elapsed timer on the Drill page (no AC; display only).
- A "copy drill as text" button on the Drill page.

All 12 drills stay Must: the frozen [AC-12] test requires at least 12 (Paul, 2026-10-26). Cutting Level 3
to two drills is no longer an option.

## Won't — this prototype (stated positively)

- The app will **not** have accounts, login, signup or sessions. *(Single seeded user; constitution §2, §8.)*
- The app will **not** take payments or show pricing. *(S-01 §5.)*
- The app will **not** listen to, upload or grade what Paul made. *(Someday; S-01 §3.)*
- The app will **not** read, write or open Logic projects, or control Logic. *(S-01 §2.)*
- The app will **not** ship pre-written parts (notes, MIDI, audio) in drills. Starter material is key,
  chords and tempo only. *(S-04 C1.)*
- The app will **not** ship downloadable DAW templates. Documented as a later possibility, on hold.
  *(S-04 Q5.)*
- The app will **not** include an onboarding calibration step. Documented for a later phase. *(S-04 Q7.)*
- The app will **not** include genre-specific drills in this version. Genre-specific levels are a later
  phase; drills stay genre-neutral now. *(S-04 Q3.)*
- The app will **not** give tool-specific guidance for DAWs other than Logic Pro. Move text is
  DAW-agnostic; only Logic gets a tool layer. *(S-04 Q6.)*
- The app will **not** schedule spaced re-quizzing. Revisit is a manual list. *(Someday; S-01 §3.)*
- The app will **not** generate drills with AI at runtime. *(Accuracy risk; gtm option 3.)*
- The app will **not** coach songwriting or composition. *(S-01 §1.)*
- The app will **not** host practice data online or sync it across devices. *(Promotion track; constitution §8.)*

## Later phases (documented, not built)

- Onboarding calibration ("I already know these") to set the starting point (S-04 Q7).
- Genre-specific drill levels after the genre-neutral core (S-04 Q3).
- Downloadable starter projects (S-04 Q5, on hold).
- Tool layers for other DAWs, reusing the DAW-agnostic move text (S-04 Q6).
- Labelling and evals over the kept practice log (S-04 C3).

## Reshaping note

One product. SD-B2 keeps the heart (progressive constrained drills) and moves the unit of learning from
"Logic capability" to "technique, shown in Logic", per Paul's Q6 answer.
