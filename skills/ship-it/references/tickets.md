# Tickets: split a spec into session-sized slices

Break a validated specification into vertical tracer-bullet tickets that serve as low-level design documents.
Each ticket provides concrete implementation details for its slice so the implementer faces zero design ambiguity.
Every feature produces at least one ticket.

## Process

### 1. Read the spec and explore the codebase

Read the parent specification (`gh issue view <spec-number>`) and any `## Answers` comments.
Inspect active code to locate the exact files, modules, symbols, types, and test suites each slice touches.
Look for prefactoring opportunities that reshape existing code in an initial ticket to simplify later slices.

### 2. Draft vertical slices

- Cut each slice as a narrow, complete path through every touched layer (schema, API, UI, verification). Never create horizontal single-layer slices.
- Specify the low-level design for every slice: target files and modules, symbol signatures, data and state flow, error handling, and integration seams with adjacent tickets.
- Incorporate verification into every slice. Organize automated tests by domain or module seam per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition), or state direct checks per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- Deliver verifiable behavior in each completed slice, scoped to fit in one fresh context window.
- Sequence prefactoring first as a dedicated ticket that blocks subsequent slices.
- For mechanical refactors spanning the codebase, use **expand → migrate → contract**: add the new interface alongside the old one, migrate callers in blocked tickets, and remove the old interface in a final ticket.

### 3. Publish in dependency order

Publish blockers first so dependent tickets can reference their issue numbers.
Title each issue `[<slug>] Ticket: <gist>`, apply the `ship-it:ticket` label, and link to the parent specification via `--parent <spec-id>`:

```shell
gh issue create --title "[<slug>] Ticket: <gist>" --body-file <file> --label "ship-it:ticket" --parent <spec-id>
```

After creating all tickets, post a summary comment on the parent specification listing the created tickets and their blockers, then return `done`.

## Granularity thresholds

Apply qualitative bounds to ticket sizing:

- **Lower Bound (Minimum Viable Ticket)**: Introduce or modify executable behavior verified by tests or direct checks. Standalone tickets must not consist solely of passive artifacts like documentation, comments, or unused configuration keys. Work lacking an independent, testable consumer seam is sub-threshold. Collapse sub-threshold items into adjacent functional slices.
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

Assign a complexity tier to each ticket based on scope, touched layers, verification seams, and reasoning requirements:

| Level | Architectural Scope and Touchpoints | Verification Seam | Reasoning Need |
| :--- | :--- | :--- | :--- |
| **`low`** | Localized changes in 1 or 2 files. Minor fixes, absorbed cleanups, or colocated docs. | Localized unit tests or direct checks. | Minimal procedural execution. Zero architectural ambiguity. |
| **`medium`** | Conventional vertical slice across 2 to 4 files. Standard feature logic, handlers, or schema additions. | Standard unit tests and integration tests with mocks. | Standard procedural reasoning. Routine edge-case handling. |
| **`high`** | Broad slice across 4 or more files, or cross-cutting subsystems. Complex state machines, concurrency, or security paths. | Comprehensive test suites, failure injection, or regression checks. | Deep exploratory reasoning. Invariant auditing. |
| **`x-high`** | System-wide architectural refactors, protocol changes, or mission-critical data flows. Expand-migrate-contract migrations. | Multi-tier test matrices, stress tests, and rollback checks. | Frontier reasoning depth. Exhaustive state-space exploration. |

## Ticket template

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level based on scope, touched layers, and reasoning depth.>

## What to build

Describe the vertical slice this ticket delivers and how the slice advances the specification, following [writing.md](writing.md).

## Low-level design

- **Touchpoints**: Name the files, modules, classes, functions, or configuration targets to create, modify, or remove.
- **Contracts and state**: Define the signatures, input and output shapes, state transitions, and control flow for this slice.
- **Edge cases and invariants**: Specify failure modes, boundary conditions, and invariants this slice enforces.
- **Slice seam**: State what this slice consumes from prerequisite tickets and what working state the slice exposes to dependent tickets.

## Acceptance criteria

- [ ] <Single-sentence imperative check adhering to writing.md>
- [ ] <Single-sentence imperative check adhering to writing.md>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

When a ticket has no blockers, write `None (can start immediately).` under `## Blocked by`.
Include concrete verification criteria for happy paths, edge cases, and negative invariants (such as "confirm as a final check that no callers of the old API remain").
Omit line numbers and literal code blocks while naming exact file paths, modules, and symbols.

## Relationships

Maintain compatibility across GitHub repository tiers with dual-channel relationships:

- **Dual-write on creation**: Write `Part of #<spec-id>` on the first line and list blockers under `## Blocked by`. Also attempt native linking via `--parent <spec-id>` and `--blocked-by <blocker-id>`, ignoring errors on unsupported tiers.
- **Dual-read on inspection**: Query native blockers first (`gh issue view <n> --json blockedBy`). Fall back to parsing the `## Blocked by` tasklist when native relationships are empty. A ticket is unblocked when every blocker has `state: "CLOSED"`.

## Remediation

When ticket-set validation applies `ship-it:changes-requested` to the parent specification:

1. **Read the report**: Inspect the validation report and any `## Answers` comments on the parent specification (`gh issue view <spec-number> --comments`).
2. **Update the tickets**: Edit ticket bodies (`gh issue edit <n> --body-file <file>`), create missing slices, or close redundant slices. Obtain user approval when changes alter scope.
3. **Clear ticket validation labels**: Remove `ship-it:validated` from any modified ticket so the full set is re-audited together.
4. **Post resolution comment**: Explain the fix for each Blocker on the parent specification (`gh issue comment <spec-number> --body "<text>"`).
5. **Remove label**: Clear `ship-it:changes-requested` from the parent specification (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
6. **Continue the routing loop**: Immediately return to `SKILL.md` § 2 (`Query state`) in the same turn so routing re-runs Row 9 (ticket-set validation).
