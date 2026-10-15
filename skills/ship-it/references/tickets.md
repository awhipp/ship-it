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

Present the breakdown as a numbered list stating the title, blockers, and delivered behavior for each ticket.
Pause and obtain explicit user confirmation of slice boundaries and dependencies before creating GitHub issues.

### 5. Publish

After explicit user approval, publish tickets as GitHub issues in dependency order (blockers first) so child issues can reference created blocker numbers. Title each issue `[<slug>] Ticket: <gist>`. Apply the `ship-it:ticket` and `ready-for-agent` labels per [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands) and [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions).

#### Dual-Channel Relationship Contract

Maintain universal compatibility across GitHub repository tiers through dual-channel relationship management:

- **Dual-write on ticket creation**:
  Record `Part of #<spec-id>` on the first line of each ticket body.
  Declare blockers in a markdown tasklist under `## Blocked by` (or state `None (can start immediately).`).
  Concurrently attempt native relationship linking via CLI flags (`--parent`, `--blocked-by`) or API calls.
- **Silent error handling**:
  Ignore errors when native relationship operations fail on unsupported repository tiers or older CLI versions.
  Continue ticket creation without interrupting the workflow.
  Markdown pointers maintain relationship tracking when native operations fail.
- **Dual-read dependency resolution**:
  Inspect native issue dependencies first during Orient.
  Query native blockers through GitHub CLI or GraphQL APIs.
  Fall back to parsing the markdown `## Blocked by` tasklist when native relationships are absent.
  A ticket becomes unblocked when all listed blockers reach `state: "CLOSED"`.
- **Frontier resolution**:
  Discover unblocked frontier tickets using the [Orient Discovery Algorithm](../SKILL.md#orient-discovery-algorithm).

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

Format every acceptance criterion as a single-sentence imperative check adhering to [writing.md](writing.md). State verifiable outcomes incorporating verification. Avoid quantitative sentence-length criteria that encourage automated word-counting scripts. Phrase negative invariants (such as "no callers of deprecated API remain") as distinct final-check criteria. Implementers sweep them at the end rather than scanning upfront. Avoid file paths and transient code snippets. Adhere to the [ticket-naming prohibition](implement.md#ticket-naming-prohibition) for all automated test artifacts.

Recommended next step: [validate.md](validate.md) audits the ticket breakdown in a fresh context before implementation begins.
Audit any ticket set where a flawed slice risks derailment during implementation.

## Ticket set remediation

When validation applies `ship-it:changes-requested`, resolve reported blockers before starting implementation:

1. **Review findings**: Read the validation report via `gh issue view <ticket-number> --comments`.
2. **Remediate blockers**: Update ticket bodies with `gh issue edit <ticket-number>`, creating missing slices or adjusting boundaries.
3. **Confirm changes**: Obtain user approval if adjustments alter scope or sequencing.
4. **Post resolution comment**: Document fixes via `gh issue comment <ticket-number> --body "<text>"`.
5. **Remove label**: Clear the status label via `gh issue edit <ticket-number> --remove-label "ship-it:changes-requested"`.

Submit updated tickets for re-audit under [validate.md](validate.md).
