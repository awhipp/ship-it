# Tickets: split a spec into session-sized slices

Break a validated specification into vertical tracer-bullet tickets that serve as low-level design documents.
Each ticket provides concrete implementation details for its slice so the implementer faces zero design ambiguity.
Every feature produces at least one ticket.

## Process

### 1. Read the spec and explore the codebase

Read only the validated parent specification body (`gh issue view <spec-number> --json body`) without reading comments.
Use targeted symbol and path searches anchored on the specification's modules and contracts to locate the exact files, symbols, types, and test suites each slice touches.
Read only the relevant sections of large files rather than scanning the entire repository.
Look for prefactoring opportunities that reshape existing code in an initial ticket to simplify later slices.

### 2. Draft vertical slices

- Cut each slice as a narrow, complete path through every touched layer (schema, API, UI, verification). Never create horizontal single-layer slices.
- Specify the low-level design for every slice through `Touchpoints` and `Design deltas` referencing `Spec § <section>` rather than repeating parent specification contracts.
- Incorporate verification into every slice. Organize automated tests by domain or module seam rather than issue numbers per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition), or state direct checks without custom string-matching scripts per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- Deliver verifiable behavior in each completed slice, scoped to fit in one fresh context window.
- When prefactoring earns a dedicated ticket under collapse rule 5, sequence that ticket first so the ticket blocks the slices that use it.
- For mechanical refactors spanning the codebase, use **expand → migrate → contract**: add the new interface alongside the old one, migrate callers in blocked tickets, and remove the old interface in a final ticket.

### 3. Publish in dependency order

Publish blockers first so dependent tickets can reference their issue numbers.
Title each issue `[<slug>] Ticket: <gist>`, apply the `ship-it:ticket` label, and link to the parent specification via `--parent <spec-id>`:

```shell
gh issue create --title "[<slug>] Ticket: <gist>" --body-file <file> --label "ship-it:ticket" --parent <spec-id>
```

After creating all tickets, return `done` with `Evidence: None`.

## Granularity thresholds

Apply qualitative bounds to ticket sizing:

- **Lower Bound (Minimum Viable Ticket)**: Introduce or modify executable behavior verified by tests or direct checks. Keep passive artifacts such as documentation, comments, or unused configuration keys attached to functional slices rather than standalone tickets. Collapse work lacking an independent, testable consumer seam into adjacent functional slices.
- **Upper Bound (Maximum Ticket Size)**: Keep every ticket within a single fresh subagent context window without reasoning degradation. Touch a single coherent domain rather than multiple disconnected systems.

## Collapse rules

Follow five rules to prevent unnecessary isolation overhead:

1. **Colocate Documentation with Functional Slices**: Update documentation within the functional ticket altering behavior. Reserve standalone documentation tickets for full documentation rewrites.
2. **Fold Configuration into Consumers**: Declare configuration settings, environment variables, and package dependencies in the earliest ticket consuming them. Prohibit standalone configuration tickets.
3. **Absorb Mechanical Cleanups**: Bundle localized symbol renames, parameter adjustments, and file reorganizations into the functional ticket touching those files. Reserve dedicated refactoring tickets for codebase-wide migrations.
4. **Default to Single Tickets for Small Specs**: Default a specification with a compact architectural footprint and localized changes spanning a single coherent concern to a single vertical ticket.
5. **Require Multiple Consumers for Prefactoring**: Create a dedicated prefactoring ticket only when restructuring prepares shared interfaces for two or more subsequent tickets. Merge prefactoring into the dependent functional slice when only one ticket benefits.

## Slicing anti-patterns

Avoid these five anti-patterns during ticket slicing:

| Anti-Pattern | Description | Failure Mode | Required Remediation |
| :--- | :--- | :--- | :--- |
| **The Docs-Tail** | Creating a trailing ticket solely for README updates or documentation synchronization. | Dispatches two isolated subagents to edit passive prose. Wastes tokens and execution time on zero code risk. | Bundle documentation updates into the functional ticket that modified the behavior. |
| **The Config-Preamble** | Creating an initial ticket to declare an unused configuration option, environment variable, or package dependency. | Delivers passive declarations with no executable behavior or meaningful test seam. | Fold the configuration declaration into the first ticket executing the feature logic. |
| **The Horizontal Slice** | Separating data models, business logic, and user interfaces into sequential tickets. | Violates tracer-bullet principles. Leaves dead code and non-functional intermediate states. | Cut vertically through data, logic, interface, and verification within each ticket. |
| **The Orphaned Scaffolding** | Creating empty module files, blank classes, or stub functions as an independent ticket. | Stubs lack behavioral contracts, invariants, and automated verification evidence. | Create and wire scaffolding directly inside the ticket connecting real callers. |
| **The Micro-Refactor** | Carving a localized symbol rename or import cleanup into a dedicated ticket blocking functional work. | Setup overhead for branch checkouts, fixed points, and reviews exceeds the diff size. | Absorb the localized cleanup into the functional ticket touching that module. |

## Complexity taxonomy

Assign a complexity tier to each ticket based on scope, touched layers, verification seams, and reasoning requirements.

| Level | Architectural Scope and Touchpoints | Verification Seam | Reasoning Need |
| :--- | :--- | :--- | :--- |
| **`low`** | Localized changes in 1 or 2 files. Minor fixes, absorbed cleanups, or colocated docs. | Localized unit tests or direct checks. | Minimal procedural execution with direct steps. Zero architectural ambiguity. |
| **`medium`** | Conventional vertical slice across 2 to 4 files. Standard feature logic, handlers, or schema additions. | Standard unit tests and integration tests with mocks. | Standard procedural reasoning with step-by-step verification. Routine edge-case handling. |
| **`high`** | Broad slice across 4 or more files, or cross-cutting subsystems. Complex state machines, concurrency, or security paths. | Comprehensive test suites, failure injection, or regression checks. | Deep exploratory reasoning with thorough invariant auditing. |

A slice that needs more than `high` exceeds the upper bounds in § Granularity thresholds. Split the slice into smaller vertical tickets.

## Ticket template

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level based on scope, touched layers, and reasoning depth.>

## Slice goal

Name the vertical slice in one to two sentences and cite the `Spec § <section>` sections implemented, following [writing.md](writing.md).

## Low-level design

- **Touchpoints**: Name the exact files, modules, and symbols to create, modify, or remove.
- **Design deltas**: Specify slice-specific signatures, state flow, and failure handling not already fully specified in the parent spec.

## Acceptance criteria

- [ ] <Single-sentence imperative verification or edge-case check adhering to writing.md>
- [ ] <Single-sentence imperative verification or edge-case check adhering to writing.md>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

When a ticket has no blockers, write `None (can start immediately).` under `## Blocked by`.
Use `## Acceptance criteria` as the single home for imperative, testable slice verification, happy paths, edge cases, and negative invariants (such as "confirm as a final check that no callers of the old API remain").
Omit line numbers and literal code blocks while naming exact file paths, modules, and symbols.

## Relationships

Maintain compatibility across GitHub repository tiers with dual-channel relationships:

- **Dual-write on creation**: Write `Part of #<spec-id>` on the first line and list blockers under `## Blocked by`. Also attempt native linking via `--parent <spec-id>` and `--blocked-by <blocker-id>`, ignoring errors on unsupported tiers.
- **Dual-read on inspection**: Evaluate open tickets in ascending number order against the already-queried closed-ticket set. Query native blockers first (`gh issue view <n> --json blockedBy`), falling back to the `## Blocked by` tasklist when native relationships are empty, and stop at the first ticket whose blockers all have `state: "CLOSED"`.

## Remediation

When ticket-set validation applies `ship-it:changes-requested` to the parent specification:

1. **Read the report**: Inspect the latest validation report comment on the parent specification via `gh issue view <spec-number> --json comments --jq '.comments[-1]'`.
2. **Update the tickets**: Edit ticket bodies (`gh issue edit <n> --body-file <file>`), create missing slices, or close redundant slices. Obtain user approval when changes alter scope.
3. **Clear ticket validation labels**: Remove `ship-it:validated` from any modified ticket so the validator re-audits the full set together.
4. **Remove label**: Clear `ship-it:changes-requested` from the parent specification (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
5. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 9 (ticket-set validation).
