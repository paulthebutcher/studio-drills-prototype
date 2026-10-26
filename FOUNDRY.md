# Foundry prototype workspace

Use the installed shared `foundry` skill, then its `scripts/prototype.py resume --repo .`
helper. It resolves the local source binding, verifies identities and compares the
delivered contract with Foundry. Do not infer readiness from a linked repository.

The active packet is identified by `.foundry/prototype.json`. Read its immutable
`mission/foundry/<id>/files/mission/baseline.md` before local historical specs.
The packet manifest lists the exact product inputs and their hashes. Foundry owns
those product decisions; this repository owns code, architecture, work packages and
the frozen gate. Read the packet constitution and any local constitution; surface
conflicts. Never borrow Foundry's root scaffold acceptance tests.

An architect records the active packet ID and local plan/gate readiness in
`mission/build-baseline.md`. A builder needs that matching record and the existing
committed frozen gate before building. A delivery alone is not an accepted decision,
architect review, build authorization, software test pass or customer validation.
Do not edit a packet to change scope. Reconcile scope changes in the source project,
prepare a new packet, and explicitly rebase affected plans/tests onto it.

Preserve any existing `mission/baseline.md`; reconcile conflicting local authority
before building. If Foundry is unavailable, the snapshot can be read, but freshness
cannot be established. A different mount needs an explicit rebind using the shared
helper, never guessed replacement identities or hand-written machine records.

Save coding progress with the existing handoff helper using this repository and
stream main. Report results upstream with `prototype.py result`, retaining the packet
ID and actual code revision. A report records attributed claims; it does not certify
checks or import customer evidence automatically. No external publishing is implied.
