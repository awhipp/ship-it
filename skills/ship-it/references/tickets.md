# Tickets: split a spec into session-sized slices

Break a spec, map, or conversation into **tickets**: tracer-bullet vertical slices, each declaring explicit blockers. Run this phase only when implementation spans multiple sessions. Single-session implementations proceed directly to [implement.md](implement.md).

## Process

### 1. Gather context

Work from available context: the published spec, map decisions, or user conversations. If a spec exists, read its full issue body via `gh issue view <spec-number>`.

### 2. Explore the codebase

Inspect the codebase if you have not already done so. Use project vocabulary and respect existing architectural patterns. Look for prefactoring opportunities: reshape existing code in an initial ticket to simplify subsequent feature slices.

### 3. Draft vertical slices

Break the work into tracer-bullet tickets:

- Each slice cuts a narrow but **complete** path through every touched layer (schema, API, UI, verification). Never create horizontal single-layer slices.
- Incorporate natural verification into each slice. Organize automated tests by domain or module seams per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition). Where automated tests are not viable, define direct verification criteria (linting, typechecking, build checks, manual/CLI inspection).
- Deliver verifiable or demoable behavior with each completed slice.
- Scope each slice to fit in a single fresh context window.
- Sequence prefactoring first as a dedicated ticket that blocks subsequent slices.

Declare explicit **blocking edges** for each ticket. A ticket without blockers can start immediately.

**Wide refactors are an exception.** When a mechanical refactor spans the entire codebase, sequence it using **expand → migrate → contract**:

1. **Expand**: Add the new interface alongside the old interface.
2. **Migrate**: Update call sites in batch tickets blocked by the expand ticket.
3. **Contract**: Remove the old interface in a final ticket blocked by all migration tickets.

If intermediate batches cannot stay green in isolation, point batches to an integration branch and gate them on a final integration verification ticket.

### 4. Check the breakdown with the user (Approval Gate)

Present the breakdown as a numbered list. For each ticket, state the title, blockers, and delivered behavior. Confirm granularity, slice boundaries, and dependencies with the user.

**Approval Checkpoint**: Pause here and obtain explicit user confirmation before creating any GitHub issues. Never publish tickets without explicit user review and approval of slice boundaries and dependencies. Iterate until confirmed.

### 5. Publish

After explicit user approval, publish tickets as GitHub issues in dependency order (blockers first) so child issues can reference created blocker numbers. Title each issue `[<slug>] Ticket: <gist>` and apply the `ship-it:ticket` and `ready-for-agent` labels (see [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands) and [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions)).

#### Markdown Relationship Contract

Maintain universal compatibility across GitHub repository tiers without relying on preview API access:

1. **Parent-Child Linkage (`Part of #<spec-id>`)**:
   - Record `Part of #<spec-id>` as the first line of each ticket body.
   - Keep the parent spec body immutable once child tickets exist.
   - Link via the GitHub sub-issues API if available, retaining markdown linkage as the primary contract.
   - Execute the [Feature Close-Out Protocol](../SKILL.md#feature-close-out-protocol) upon completing the final ticket.

2. **Dependency Edges (`## Blocked by`)**:
   - Declare blockers in a markdown tasklist under `## Blocked by`:

     ```markdown
     ## Blocked by

     - [ ] Blocked by #<blocker-id>
     ```

     Or state `None (can start immediately).` if unblocked.
   - Link via the GitHub issue-dependencies API if available, retaining markdown tasklists as the primary contract.

3. **Frontier Resolution & Orient Discovery**:
   - Work tickets on the frontier where all blockers are closed.
   - Discover unblocked tickets using the [Orient Discovery Algorithm](../SKILL.md#orient-discovery-algorithm).

Ticket body:

```markdown
Part of #<spec-id>

## What to build

The end-to-end behavior this ticket makes work, described from the user perspective.
Follow [writing.md](writing.md). Not a layer-by-layer implementation list.

## Acceptance criteria

- [ ] <Single-sentence imperative check adhering to writing.md>
- [ ] <Single-sentence imperative check adhering to writing.md>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

(If unblocked, state `None (can start immediately).` under `## Blocked by`.)

Format every acceptance criterion as a single-sentence imperative check adhering to [writing.md](writing.md). State verifiable outcomes incorporating verification. Phrase negative invariants (such as "no callers of deprecated API remain") as distinct final-check criteria. Implementers sweep them at the end rather than scanning upfront. Avoid file paths and transient code snippets. Adhere to the [ticket-naming prohibition](implement.md#ticket-naming-prohibition) for all automated test artifacts.

Do not close the parent spec or edit its body while child tickets remain open. The spec records intent, while tickets record execution. Child tickets link to the spec via `Part of #<spec-id>`. Close the parent spec and map only during the [Feature Close-Out Protocol](../SKILL.md#feature-close-out-protocol) after the final ticket passes review.

Recommended next step: [validate.md](validate.md) audits the ticket breakdown in a fresh context before implementation begins. Audit any ticket set where a flawed slice risks derailment during implementation.
