# Tickets: split a spec into session-sized slices

Break a validated specification into vertical tracer-bullet tickets that serve as low-level design documents.
Each ticket provides concrete implementation details for its slice so the implementer faces zero design ambiguity.
Every feature produces at least one ticket.

## Process

### 1. Read the spec and explore the codebase

Read the validated spec body (`gh issue view <spec-number> --json body --jq .body`) without comment queries.
Inspect `- **Decision Register**:` and `- **Deferred to slicing**:` entries under `## Implementation Decisions`.
Run `git fetch origin <default-branch>`, and inspect `origin/<default-branch>` with read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched.
Use targeted symbol and path searches anchored on the specification's modules and contracts to locate the exact files, symbols, types, and test suites each slice touches.
Read only the relevant sections of large files rather than scanning the entire repository.
Look for prefactoring opportunities that reshape existing code in an initial ticket to simplify later slices.

When a slice covers an enumerable source set, inspect the spec and active code on `origin/<default-branch>` to enumerate every member of that set.

### 2. Draft vertical slices

- Cut each slice as a narrow, complete vertical path through every touched layer per [Slicing anti-patterns](#slicing-anti-patterns).
- Author each slice using [Ticket template](#ticket-template), honoring `- **Decision Register**:` entries and citing `Spec § <section>` for spec-owned contracts in `## Slice goal` and `## Low-level design` while keeping slice-local `Design deltas` concrete.
- Make `## Acceptance criteria` self-contained using Rule 6 controlled vocabulary per [writing.md](writing.md#application-across-artifacts), and cover all `- **Deferred to slicing**:` entries across the ticket set.
- Emit `## Consolidation checklist` per [Ticket template](#ticket-template) whenever `## Acceptance criteria` quantify over an enumerable source set (`every`, `all`, or `each` without naming every member inside `## Acceptance criteria`), enumerating every member from the spec and active code on `origin/<default-branch>`. Omit `## Consolidation checklist` on non-consolidation tickets and `ship-it:bug` tickets.
- Auto-resolve reversible slice-local defaults into ticket bodies when active code or spec context supports a safe default, and record each resolved item for `## Auto-resolved Decisions` on `<spec>`.
- Batch any `Question` requiring an irreversible scope, observable product behavior, or architecture choice and return `Verdict: questions` with `Evidence: None` before creating any tickets, keeping `ticket_set` empty so Row 8 cleanly re-runs after `## Answers` fold into `<spec>`.
- Incorporate verification into every slice. Organize automated tests by domain or module seam rather than issue numbers per the [ticket-naming prohibition](writing.md#ticket-naming-prohibition), or state direct checks without custom string-matching scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
- Deliver verifiable behavior in each completed slice, scoped to fit in one fresh context window.
- When prefactoring earns a dedicated ticket under **Require Multiple Consumers for Prefactoring** ([Collapse rules](#collapse-rules)), sequence that prefactoring ticket first to block every dependent slice.
- For mechanical refactors spanning the codebase, use **expand → migrate → contract**: add the new interface alongside the old one, migrate callers in blocked tickets, and remove the old interface in a final ticket.

### 3. Publish in dependency order

Publish tickets only when zero irreversible `Questions` remain.
Publish blockers first so dependent tickets can reference their issue numbers.
Title each issue `[<slug>] Ticket: <gist>`, apply the `ship-it:ticket` label, and link to the spec and blockers per [§ Relationships](#relationships):

```shell
gh issue create --title "[<slug>] Ticket: <gist>" --body-file <file> --label "ship-it:ticket"
gh issue edit <n> --parent <spec-id> --add-blocked-by <blocker-id>
```

Repeat `--add-blocked-by` once per blocker, and omit the flag for tickets without blockers.
When slice-local defaults were auto-resolved, write one `## Auto-resolved Decisions` comment to a temporary file using this bullet format, post it on `<spec>` (`gh issue comment <spec-number> --body-file <file>`), and delete the temporary file immediately:

```markdown
## Auto-resolved Decisions
- **#<ticket>** [<section>]: <chosen reversible default> (<spec or active-code anchor>; reversible: <scope>)
```

After creating all tickets, return `done` with all published ticket numbers in `Issues: #<n>, ...`.
Return that `## Auto-resolved Decisions` comment URL in `Evidence:` when posted, and `Evidence: None` otherwise.

## Granularity thresholds

Apply qualitative bounds to ticket sizing:

- **Lower Bound (Minimum Viable Ticket)**: Introduce or modify executable behavior verified by tests or direct checks, collapsing work lacking a testable consumer seam per [Slicing anti-patterns](#slicing-anti-patterns).
- **Upper Bound (Maximum Ticket Size)**: Keep every ticket within a single fresh subagent context window without reasoning degradation. Touch a single coherent domain rather than multiple disconnected systems.
- **Anti-pattern precedence**: Let [Slicing anti-patterns](#slicing-anti-patterns) outrank size-driven splits. Complexity tiers describe effort without triggering splits unless the Upper Bound breaks and every resulting slice keeps a testable vertical seam.

## Collapse rules

Follow two rules to prevent unnecessary isolation overhead:

1. **Default to Single Tickets for Small Specs**: Default a specification with a compact architectural footprint and localized changes spanning a single coherent concern to a single vertical ticket.
2. **Require Multiple Consumers for Prefactoring**: Create a dedicated prefactoring ticket only when restructuring prepares shared interfaces for two or more subsequent tickets. Merge prefactoring into the dependent functional slice when only one ticket benefits.

## Slicing anti-patterns

These five anti-patterns outrank size-driven splits; avoid introducing any of them during ticket slicing:

| Anti-Pattern | Description | Failure Mode | Required Remediation |
| :--- | :--- | :--- | :--- |
| **The Docs-Tail** | Creating a trailing ticket solely for README updates, comments, or documentation synchronization. | Dispatches two isolated subagents to edit passive prose. Wastes tokens and execution time on zero code risk. | Bundle documentation updates into the functional ticket modifying that behavior. Reserve standalone documentation tickets for full documentation rewrites. |
| **The Config-Preamble** | Creating an initial ticket to declare unused configuration settings, environment variables, or package dependencies. | Delivers passive declarations with no executable behavior or meaningful test seam. | Fold configuration settings, environment variables, and package dependencies into the earliest ticket consuming them. |
| **The Horizontal Slice** | Separating data models, business logic, and user interfaces into sequential tickets. | Violates tracer-bullet principles. Leaves dead code and non-functional intermediate states. | Cut vertically through data, logic, interface, and verification within each ticket. |
| **The Orphaned Scaffolding** | Creating empty module files, blank classes, or stub functions as an independent ticket. | Stubs lack behavioral contracts, invariants, and automated verification evidence. | Create and wire scaffolding directly inside the ticket connecting real callers. |
| **The Micro-Refactor** | Carving a localized symbol rename, parameter adjustment, import cleanup, or file reorganization into a dedicated ticket blocking functional work. | Setup overhead for branch checkouts, fixed points, and reviews exceeds the diff size. | Absorb localized cleanups into the functional ticket touching those files. Reserve dedicated refactoring tickets for codebase-wide migrations. |

## Complexity taxonomy

Assign a complexity tier to each ticket based on touched source files (excluding test files), scope, verification seams, and reasoning requirements.
When non-file dimensions fit a higher tier than the source-file count, assign the higher tier.

| Level | Architectural Scope and Touchpoints | Verification Seam | Reasoning Need |
| :--- | :--- | :--- | :--- |
| **`low`** | Localized changes in 1–2 source files (excluding test files). Minor fixes, absorbed cleanups, or colocated docs. | Localized unit tests or direct checks. | Minimal procedural execution with direct steps. Zero architectural ambiguity. |
| **`medium`** | Conventional vertical slice across 3–5 source files (excluding test files). Standard feature logic, handlers, or schema additions. | Standard unit tests and integration tests with mocks. | Standard procedural reasoning with step-by-step verification. Routine edge-case handling. |
| **`high`** | Broad slice across 6+ source files (excluding test files), or cross-cutting subsystems. Complex state machines, concurrency, or security paths. | Comprehensive test suites, failure injection, or regression checks. | Deep exploratory reasoning with thorough invariant auditing. |

Complexity tiers describe effort without triggering splits. Split a slice only when the Upper Bound in [§ Granularity thresholds](#granularity-thresholds) breaks and every resulting slice preserves a testable vertical seam.

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

<!-- Optional: include ## Consolidation checklist strictly between ## Acceptance criteria and ## Blocked by only when acceptance criteria quantify over an enumerable source set without naming every member. -->
## Consolidation checklist

- [ ] <member>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

When a ticket has no blockers, write `None (can start immediately).` under `## Blocked by`.

Emit `## Consolidation checklist` strictly between `## Acceptance criteria` and `## Blocked by` with unchecked `- [ ] <member>` bullets only on qualifying consolidation slices, and omit `## Consolidation checklist` on non-consolidation tickets and `ship-it:bug` tickets.
Use `## Acceptance criteria` as the single home for imperative, testable slice verification, happy paths, edge cases, and negative invariants (such as "confirm as a final check that no callers of the old API remain").
Apply section-scoped precedence per [writing.md](writing.md#application-across-artifacts): self-containment outranks Rule 7 inside `## Acceptance criteria` while preserving Rule 6 controlled vocabulary, whereas Rule 7 outranks restatement inside `## Slice goal` and for spec-owned contracts inside `## Low-level design` while keeping `Design deltas` concrete.
Omit line numbers and literal code blocks while naming exact file paths, modules, and symbols.

## Relationships

Body text is the only relationship data the skill reads:

- **Write on creation**: Write `Part of #<spec-id>` on the first line and list blockers under `## Blocked by`. Then optionally decorate with native links in a separate `gh issue edit` call (`--parent <spec-id>` and `--add-blocked-by <blocker-id>`), ignoring its errors, so a rejected link never fails an action, blocks, or duplicates a ticket. No step reads native links.
- **Read on inspection**: A ticket's blockers are the `#<id>` entries under its `## Blocked by`, and its dependants are the open tickets whose `## Blocked by` names it. Its open direct dependency neighbors are its open blockers and dependants. Evaluate open tickets in ascending number order against the already-queried closed-ticket set, and stop at the first ticket whose blockers all have `state: "CLOSED"`.

## Remediation

When ticket-set validation applies `ship-it:changes-requested` to `<spec>`:

1. **Read the report and open tickets**:
   - Read spec comments via `gh issue view <spec-number> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Ticket set") or startswith("## Answers") or startswith("## Circuit Breaker Reset") or startswith("## Auto-resolved Decisions")) | .body]'` and select the latest `## Validation: Ticket set` report in-agent.
   - Fetch open tickets once via `gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state open --limit 100 --json number,title,body,labels`, checking the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`.
2. **Update the tickets**: Fold settled decisions from `## Answers` and `## Circuit Breaker Reset` comments into open ticket bodies.
   Leave advisory Warnings untouched. Editing warning-only sections or tickets expands the revalidation surface and removes `ship-it:validated`. Warnings never trigger independent remediation passes or revalidation loops.

   Resolve every Blocker in open ticket bodies via surgical body edits (`gh issue edit <n> --body-file <file>`, deleting each temporary file immediately):
   - Update ticket bodies directly without posting ticket comments.
   - Never author `## Answers` or `## Circuit Breaker Reset` comments during autonomous blocker resolutions.
   - When resolving a gap with a reversible slice-local default, post one `## Auto-resolved Decisions` comment on `<spec>` (`gh issue comment <spec-number> --body-file <file>`, deleting the temporary file immediately) using the bullet format in [§ 3 Publish in dependency order](#3-publish-in-dependency-order).
   - Correct the root cause, reproduction seam, or acceptance criteria on bug tickets, or update low-level design, create missing slices, and close redundant slices as not planned (`gh issue close <n> --reason "not planned"`) on feature tickets.
   - Obtain user approval when changes alter scope.
   - **Consistency sweep**: Whenever edits alter a term, numeric threshold, symbol or fixture home, or shared contract, sweep all open ticket bodies from the step 1 fetch to reconcile Rule 6 terminology and contract references in the same pass. Track every newly edited ticket for step 3.
   - **Consolidation checklists**: Preserve `## Consolidation checklist` items during surgical edits, retaining existing `- [ ]` and `- [x]` states on tickets bearing `ship-it:reviewed` or `ship-it:changes-requested`. When `- [x]` appears inside `## Consolidation checklist` on a feature ticket lacking both labels, inspect `gh issue view <n> --json comments --jq '[.comments[].body[:120]]'` for a prior `## Review: Ticket` report, retaining existing checkbox states when present and resetting `- [x]` to `- [ ]` when absent. Reconcile checklist members when requirements or active-code members change (leaving added items `- [ ]`), and omit `## Consolidation checklist` on `ship-it:bug` tickets.
3. **Selectively update ticket validation labels**: Retain `ship-it:validated` on untouched open tickets. Remove `ship-it:validated` (`gh issue edit <n> --remove-label "ship-it:validated"`) only when present on edited, created, or split tickets and their open direct dependency neighbors. Compute open direct dependency neighbors from the `## Blocked by` tasklists in the step 1 fetch per [§ Relationships](#relationships).
4. **Remove label**: Clear `ship-it:changes-requested` from `<spec>` (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
5. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Returning to Row 9 runs the conductor mechanical pre-validation gate before dispatching `validate`.
