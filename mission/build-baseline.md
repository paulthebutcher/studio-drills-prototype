# Build baseline — Studio Drills

Local build index. It binds this repository's plan and gate to the delivered product contract. Product scope
lives in the packet, not here.

- Delivered packet: `8f5244dbbff54c62ac07f80b3004682a` (`mission/foundry/8f5244dbbff54c62ac07f80b3004682a/`)
- Product baseline: **SD-B2** (accepted). Read the packet's `files/mission/baseline.md` first.
- Plan source: the architect's SD-B2 plan (Foundry engagement run `5bdffb21932342e6a3e34c2c7b5d9fa7`,
  2026-10-24), authored for this repo's root layout and copied unchanged at repo setup on 2026-10-26.
- Recorded: 2026-10-26 at repo setup (not a new architect run).

## Artifacts

| Artifact | Path | Status |
| --- | --- | --- |
| Architecture | `mission/architecture.md` | current for packet 8f5244db (byte-identical to the packet copy) |
| Work packages | `mission/packages/WP-1..WP-5` | current; WP-1 runs first, alone |
| Frozen acceptance gate | `tests/frozen/` (AC-1, AC-4–AC-18) | locked, hash `fdcd0ced`; matches `.foundry/frozen.lock` and `mission/frozen.ref` |
| Freeze commit | `c5fc9011aa3cddd56780561343c2bf3161d2d0b6` | committed 2026-10-26 on Paul's instruction; `tests/frozen/` matches `fdcd0ced` at this commit |
| Implementation | — | none; the root app is still the archetype's Notes scaffold |

## Build readiness

**Ready for the builder.** The builder runs WP-1..WP-5 against this gate, starting with WP-1 alone. `tests/frozen/` is read-only for the builder. The root `scripts/verify.ts` registry is still the
archetype's Letlytics list; WP-5 replaces it with AC-1 and AC-4–AC-18.

Open, not blocking the build: Q2 (Paul's Level 1 content check in Logic 12.4) blocks the experiment start.
