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

### 4. Check the breakdown with the user

Present it as a numbered list. For each ticket: title, what it's blocked by
(if anything), and what end-to-end behavior it delivers. Ask whether the
granularity feels right, whether the blocking edges are correct (each ticket
depends only on what genuinely gates it), and whether anything should merge or
split. Iterate until approved; this is a decision worth getting right before
tickets exist as real artifacts.

### 5. Publish

Publish the approved tickets as GitHub issues, one per ticket, in dependency
order (blockers first) so each can reference real issue numbers, titled
`[<slug>] Ticket: <gist>` and applying the `ship-it:ticket` and
`ready-for-agent` labels. Wire each ticket's blocking edges via the native
issue-dependency API, and link each ticket as a sub-issue (child) of the spec
issue via the sub-issues API (see `preflight.md` for both exact calls) —
mirroring how a map's decision tickets nest under the map, this keeps the
spec → tickets trail visible in the GitHub UI itself rather than living only
in prose. Work the frontier from here on: whichever ticket has every blocker
resolved is takeable.

Ticket body:

```markdown
    ## What to build

    The end-to-end behavior this ticket makes work, from the user's perspective.
    Not a layer-by-layer implementation list.

    ## Acceptance criteria

    - [ ] Criterion 1
    - [ ] Criterion 2

    ## Blocked by

    References to each blocking ticket, or "None (can start immediately)."
```

Avoid file paths or code snippets here too, for the same reason as the spec:
they go stale. The same prototype exception applies.

Don't close the parent spec or rewrite its body once tickets exist; it stays
as the record of intent, tickets are the record of execution. Linking tickets
under it as sub-issues is a relationship, not a content edit, and belongs
alongside publishing them.

Recommended next step: `validate.md` audits the ticket set, adversarially and
in a fresh context, before anyone starts building against it. Run it whenever
the breakdown is big enough that a bad slice would only surface partway
through implementation — which is most multi-ticket sets; skipping is the
exception, not the default.
