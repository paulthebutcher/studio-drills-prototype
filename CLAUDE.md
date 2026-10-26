# CLAUDE.md — Studio Drills prototype

A single-user practice companion for Logic Pro, built from the Foundry archetype. Read `FOUNDRY.md`,
then `mission/build-baseline.md`, then the delivered packet's `files/mission/baseline.md`.
`constitution.md` is law; the packet's open-decisions OD-13 records the confirmed kept-data exception.

- Stack (locked): Next.js App Router · TypeScript strict · Tailwind · Prisma + SQLite · Vercel preview. No auth.
- `tests/frozen/` is the acceptance gate: read-only. Builder tests go in `tests/dev/`.
- `practice.db` is Paul's kept practice log: no code path deletes, resets or migrates it.
- Commands: `npm run dev` · `npm run typecheck` · `npm run lint` · `npm run verify`.


<!-- Foundry prototype -->
For Foundry product/build work, read `FOUNDRY.md` first and use the shared foundry skill.
<!-- /Foundry prototype -->
