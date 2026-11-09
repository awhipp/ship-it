# Tickets: split a spec into session-sized slices

Break a validated specification into vertical tracer-bullet tickets that serve as low-level design documents.
Each ticket provides concrete implementation details for its slice so the implementer faces zero design ambiguity.
Every feature produces at least one ticket.

## Process

### 1. Read the spec and explore the codebase

Read the validated spec body (`gh issue view <spec-number> --json body --jq .body`) without comment queries.
Inspect any `- **Deferred to slicing**: <detail>` entries under `## Implementation Decisions`.
Use targeted symbol and path searches anchored on the specification's modules and contracts to locate the exact files, symbols, types, and test suites each slice touches.
Read only the relevant sections of large files rather than scanning the entire repository.
Look for prefactoring opportunities that reshape existing code in an initial ticket to simplify later slices.

### 2. Draft vertical slices

- Cut each slice as a narrow, complete path through every touched layer (schema, API, UI, verification). Never create horizontal single-layer slices.
- Specify the low-level design for every slice through `Touchpoints` and `Design deltas` referencing `Spec § <section>` rather than repeating spec contracts. State concrete slice-local symbol signatures, step numbers, or behavior subsets. Define explicit inter-slice transition boundaries covering what the slice introduces, leaves in place, or removes relative to sibling tickets. Never write bare pointer stubs such as `"Apply rules in Spec § ..."`.
- Incorporate all `- **Deferred to slicing**:` entries from the spec body into ticket acceptance criteria, ensuring full coverage across the ticket set.
- Incorporate verification into every slice. Organize automated tests by domain or module seam rather than issue numbers per the [ticket-naming prohibition](writing.md#ticket-naming-prohibition), or state direct checks without custom string-matching scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
- Deliver verifiable behavior in each completed slice, scoped to fit in one fresh context window.
- When prefactoring earns a dedicated ticket under collapse rule 5, sequence that ticket first so the ticket blocks the slices that use it.
- For mechanical refactors spanning the codebase, use **expand → migrate → contract**: add the new interface alongside the old one, migrate callers in blocked tickets, and remove the old interface in a final ticket.

### 3. Publish in dependency order

Publish blockers first so dependent tickets can reference their issue numbers.
Title each issue `[<slug>] Ticket: <gist>`, apply the `ship-it:ticket` label, and link to the spec via `--parent <spec-id>`:

```shell
gh issue create --title "[<slug>] Ticket: <gist>" --body-file <file> --label "ship-it:ticket" --parent <spec-id>
```

After creating all tickets, return `done` with all published ticket numbers in `Issues: #<n>, ...` and `Evidence: None`.

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
- **Design deltas**: Specify concrete slice-local symbol signatures, step numbers, state flow, failure handling, and inter-slice transition boundaries (what the slice introduces, leaves in place, or removes relative to sibling tickets) not already itemized per-slice in the parent spec. Never write bare pointer stubs.

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
- **Dual-read on inspection**: Evaluate open tickets in ascending number order against the already-queried closed-ticket set. Inspect native blockers in-memory from the batch ticket query's `blockedBy` field, falling back to the ticket's `## Blocked by` tasklist when native relationships are empty. Stop at the first ticket whose blockers all have `state: "CLOSED"`.

## Remediation

When ticket-set validation applies `ship-it:changes-requested` to the spec:

1. **Read the report**: Inspect the latest validation report comment on the spec via `gh issue view <spec-number> --json comments --jq '[.comments[].body | select(index(({Validation:1}|keys[])) == 3)] | last // empty'`.
2. **Update the tickets**: Fold settled answers from `## Answers` comments into ticket bodies.
   Conductors may opportunistically fold advisory warnings into ticket bodies while editing for blockers or while folding answers from questions.
   Warnings never trigger independent remediation passes or revalidation loops.

   Conductors resolve every Blocker in open ticket bodies via surgical body edits (`gh issue edit <n> --body-file <file>`, deleting each temporary file immediately):
   - Update ticket bodies directly without posting issue comments.
   - Never author `## Answers` comments for autonomous blocker resolutions.
   - Correct the root cause, reproduction seam, or acceptance criteria on bug tickets, or update low-level design, create missing slices, and close redundant slices on feature tickets.
   - Obtain user approval when changes alter scope.
3. **Clear ticket validation labels**: Remove `ship-it:validated` from every open ticket in the set so validators re-audit the entire set rather than skipping untouched open tickets.
4. **Remove label**: Clear `ship-it:changes-requested` from the spec (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
5. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 9 (ticket-set validation).

## Bug preparation

The conductor dispatches `prepare-bug` to inspect open `ship-it:bug` issues lacking `ship-it:ticket`.
The subagent diagnoses the root cause, defines a reproduction seam, and formats the bug ticket for execution without re-slicing the feature.
File bug issues as `[<slug>] <gist>` with the `ship-it:bug` label so routing discovers the issues.

### Preparation process

1. **Investigate active code**: Read the bug issue body and parent spec body via `gh issue view <n> --json body --jq .body` without reading comments. Fetch `origin/<default-branch>` (and `origin/<branch>` when present on `origin`), check out `<branch>` when present or `origin/<default-branch>` otherwise, and locate the defect mechanism using targeted symbol and path searches rather than full-repository scans. When unwritten product facts block diagnosis, post the questions on the bug issue (`gh issue comment <n> --body-file <file>`, deleting the temporary file immediately) and return `questions` without adding `ship-it:ticket`.
2. **Establish reproduction seam**: Identify or verify a targeted test or CLI command that fails reliably before code changes. Discard any temporary workspace edits after verification so the working tree stays clean.
3. **Persist bug ticket**: Write the formatted bug ticket body (following the template below, including `Part of #<spec-id>`) to a temporary file. Update the issue and apply `ship-it:ticket` (`gh issue edit <n> --body-file <file> --add-label "ship-it:ticket"`), then delete the temporary file immediately. Retain `ship-it:bug` to preserve defect provenance.
4. **Link parent spec**: Attempt native parent linking (`gh issue edit <n> --parent <spec-id>`), ignoring errors on unsupported tiers per [Relationships](#relationships). Fresh-context validation runs next in Row 9 of the routing table.
5. **Handoff**: Return `done` with `Evidence: None`.

### Bug ticket template

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level based on scope, touched layers, and reasoning depth.>

## Root cause

<mechanism>

## Reproduction seam

<test or CLI command failing before fix>

## Acceptance criteria

- [ ] <Single-sentence imperative verification or edge-case check adhering to writing.md>

## Blocked by

None (can start immediately).
```
