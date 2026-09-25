# Tickets: split a spec into session-sized slices

Break a spec (or a plan, or a conversation, if no formal spec exists) into
**tickets**: tracer-bullet vertical slices, each declaring what blocks it. Only
needed when the build genuinely spans more than one session; a spec that fits
in one sitting skips straight to `implement.md`.

## Process

### 1. Gather context

Work from whatever's already in view: the published spec, the map's
decisions, the conversation. If a spec exists, read its full body.

### 2. Explore the codebase (if not already done)

Ticket titles and descriptions should use the project's own vocabulary, and
respect existing architecture decisions in the area. Look for prefactoring
opportunities: "make the change easy, then make the easy change" often means
one ticket up front that reshapes the code before the feature tickets land.

### 3. Draft vertical slices

Break the work into tracer-bullet tickets:

- Each slice cuts a narrow but **complete** path through every layer it
  touches (schema, API, UI, tests), vertical, never a horizontal slice of just
  one layer.
- A completed slice is demoable or verifiable on its own.
- Each slice fits in a single fresh context window.
- Any prefactoring happens first, as its own ticket, blocking the rest.

Give each ticket its **blocking edges**: which other tickets must land first.
A ticket with no blockers is startable immediately.

**Wide refactors are the exception.** A wide refactor is one mechanical change
(rename a shared field, retype a widely-used symbol) whose blast radius fans
across the whole codebase, so no single vertical slice can land green. Don't
force it into a tracer bullet. Sequence it as **expand → migrate → contract**
instead: first expand (add the new form beside the old, nothing breaks), then
migrate call sites in blast-radius-sized batches (each batch its own ticket,
blocked by the expand, CI staying green batch to batch because the old form
still exists), then contract (delete the old form, blocked by every migrate
batch). If even a batch can't stay green alone, keep the sequence but let the
batches share an integration branch that all block a final
integrate-and-verify ticket; green is only promised there.

### 4. Check the breakdown with the user (Approval Gate)

Present it as a numbered list. For each ticket: title, what it's blocked by
(if anything), and what end-to-end behavior it delivers. Ask whether the
granularity feels right, whether the blocking edges are correct (each ticket
depends only on what genuinely gates it), and whether anything should merge or
split.

**Approval Checkpoint**: You MUST pause here and obtain explicit user confirmation
before creating any GitHub issues. Do not autonomously publish tickets without
user review and sign-off on the slice boundaries and dependency edges. Iterate
until confirmed; this is a critical gate to prevent premature issue creation and
unaligned vertical slices.

### 5. Publish

Once explicitly approved by the user, publish the tickets as GitHub issues,
one per ticket, in dependency order (blockers first) so each can reference real
issue numbers, titled `[<slug>] Ticket: <gist>` and applying the `ship-it:ticket`
and `ready-for-agent` labels.

#### Markdown Relationship Contract

To guarantee universal compatibility across all GitHub repository tiers,
environments, and MCP servers without relying on preview API access:

1. **Parent-Child Linkage (`Part of #<spec-id>`)**:
   - Every child ticket records `Part of #<spec-id>` as the very first line of its markdown body.
   - The parent spec body remains **immutable** once tickets exist; child tickets link up to the spec, avoiding race conditions or churn on the parent issue body.
   - If native GitHub sub-issue API is available, link via `LinkParentChild` (see `preflight.md`), but the markdown `Part of #<spec-id>` linkage is the primary contract.

2. **Dependency Edges (`## Blocked by`)**:
   - Tickets declare blocker dependencies in a tasklist under `## Blocked by`:
     ```markdown
     ## Blocked by

     - [ ] Blocked by #<blocker-id>
     ```
     Or `None (can start immediately).` if unblocked.
   - If native GitHub issue-dependency API is available, link via `LinkDependency` (see `preflight.md`), but the markdown tasklist is the primary contract.

3. **Frontier Resolution & Orient Discovery**:
   - Work the frontier from here on: whichever ticket has every blocker resolved is takeable.
   - Orient discovers unblocked tickets using this exact algorithm:
     - Query tickets by feature slug: `gh issue list --label "ship-it:ticket" --search "<slug> in:title" --json number,title,labels,assignees,state`
     - Filter out any tickets already claimed (`assignees` non-empty) or closed (`state: "CLOSED"`).
     - For open, unclaimed tickets, inspect each ticket's `## Blocked by` tasklist via `ReadIssue` (`gh issue view <id> --json body`).
     - Check the state of each referenced blocker issue via `ReadIssue` (`gh issue view <blocker-id> --json state`).
     - A ticket is unblocked on the frontier when all of its referenced blocker issues are closed.

Ticket body:

```markdown
Part of #<spec-id>

## What to build

The end-to-end behavior this ticket makes work, from the user's perspective.
Not a layer-by-layer implementation list.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Blocked by

- [ ] Blocked by #<blocker-id>
```

(If unblocked, state `None (can start immediately).` under `## Blocked by`.)

Avoid file paths or code snippets here too, for the same reason as the spec:
they go stale. The same prototype exception applies.

Don't close the parent spec or rewrite its body once tickets exist; it stays
as the record of intent, tickets are the record of execution. Child tickets link
up to the parent via `Part of #<spec-id>`, leaving the parent spec body immutable.
Linking tickets under it via the sub-issues API (if available) is a relationship,
not a content edit, and belongs alongside publishing them.

Recommended next step: `validate.md` audits the ticket set, adversarially and
in a fresh context, before anyone starts building against it. Run it whenever
the breakdown is big enough that a bad slice would only surface partway
through implementation — which is most multi-ticket sets; skipping is the
exception, not the default.
