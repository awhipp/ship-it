# Spec: synthesize what's already been decided

Turn a settled idea, whether from a map's resolved decisions, a conversation,
or both, into a spec published as a GitHub issue. This is **synthesis, not
interview**: by the time this phase runs, the open questions should already be
answered. If something genuinely still needs the user's input, ask it, but
don't turn this into a full grilling session; that already happened upstream
(in `plan.md`, or earlier in the conversation).

## Process

1. **Gather what's already settled.** If a map exists for this feature, read
   its "Decisions so far" and zoom into any ticket whose detail matters.
   Otherwise, work from the conversation.

2. **Explore the codebase**, if you haven't already, to ground the spec in
   what's actually there. Use the project's own vocabulary throughout (its
   glossary, its existing terms for things), and respect any architecture
   decision records in the area you're touching, rather than re-deciding
   something already settled.

3. **Sketch the test seams**: the points in the code where you'll verify this
   feature works. Prefer existing seams to new ones, and the highest seam you
   can, the fewest number across the codebase, ideally one. Confirm these
   match the user's expectations before moving on; a spec built on the wrong
   seam is expensive to unwind later.

4. **Write the spec** using the template below, then publish it as a GitHub
   issue titled `[<slug>] Spec: <gist>` (`gh issue create`), applying the
   `ship-it:spec` and `ready-for-agent` labels.

## Spec template

```markdown
    ## Problem Statement

    The problem the user is facing, from the user's perspective.

    ## Solution

    The solution to the problem, from the user's perspective.

    ## User Stories

    A long, numbered list. Each one:

    1. As a <actor>, I want <feature>, so that <benefit>

    Example: "As a mobile bank customer, I want to see the balance on my accounts,
    so that I can make better-informed decisions about my spending."

    Cover the feature extensively here; this list is the surface area the rest of
    the build works against.

    ## Implementation Decisions

    What will be built or modified: modules, their interfaces, technical
    clarifications, architectural decisions, schema changes, API contracts,
    specific interactions.

    Don't include file paths or code snippets; they go stale fast. Exception: if
    a prototype produced a snippet that encodes a decision more precisely than
    prose can (a state machine, a reducer, a schema shape), inline just the
    decision-rich part and note it came from a prototype.

    ## Testing Decisions

    What makes a good test here (external behavior, not implementation details),
    which modules get tested, and any prior art elsewhere in the codebase for this
    shape of test.

    ## Out of Scope

    What this spec deliberately does not cover.

    ## Further Notes

    Anything else worth recording.
```

Once published, this spec is what `tickets.md`, `implement.md`, and
`review.md` all read to know what's being built.

Recommended next step: `validate.md` audits this spec, adversarially and in a
fresh context, before anyone splits it into tickets or builds from it
directly. Worth running on anything that spans more than one session — treat
skipping it as the exception, reserved for a small feature where a missed gap
would surface (and get fixed) just as cheaply during the build itself.
