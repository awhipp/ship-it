# Spec: synthesize what's already been decided

Turn a settled idea, whether from a map's resolved decisions, a conversation,
or both, into a spec published as a GitHub issue. This is **synthesis, not
interview**: by the time this phase runs, the open questions should already be
answered. If something genuinely still needs the user's input, ask it, but
don't turn this into a full grilling session; that already happened upstream
(in `plan.md`, or earlier in the conversation).

## Process

1. **Gather what's already settled.** If a map exists for this feature, read
   its "Decisions so far" via `gh issue view <map-number>` and zoom into any
   ticket whose detail matters. Otherwise, work from the conversation.

2. **Explore the codebase**, if you haven't already, to ground the spec in
   what's actually there. Use the project's own vocabulary throughout (its
   glossary, its existing terms for things), and respect any architecture
   decision records in the area you're touching, rather than re-deciding
   something already settled.

3. **Sketch the test seams and verification strategy**: identify where and how
   you'll verify this feature works, aligned with existing workspace test
   conventions and directory structures. Prefer existing seams to new ones, and
   the highest seam you can, the fewest number across the codebase, ideally one.
   If the repository lacks automated tests or the change is non-executable (e.g.
   documentation, configuration, skills), outline direct verification methods
   instead of inventing ad-hoc mock test harnesses. Confirm these match the
   user's expectations before moving on; a spec built on the wrong seam is
   expensive to unwind later.

4. **Draft the spec** using the template below, presenting it to the user.

   **Approval Checkpoint**: You MUST pause here and obtain explicit user confirmation
   before creating any GitHub issue. Do not autonomously publish the spec without
   user review and sign-off on the scope and decisions. Iterate until confirmed.

5. **Publish the spec.** Once explicitly approved, publish the spec as a GitHub
   issue titled `[<slug>] Spec: <gist>` using `--body-file` (writing the spec
   content to a file first to guarantee cross-platform shell compatibility):

   ```shell
   gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec,ready-for-agent"
   ```

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

    How this feature will be verified, aligned with the workspace's established
    test framework, runners, and directory conventions where they exist. What
    makes a good test here (external behavior, not implementation details), which
    domain modules or feature seams get tested, and any prior art elsewhere in the
    codebase. For areas lacking test suites or where automated tests are not
    viable or needed, state the domain-appropriate direct verification (linting,
    typechecking, build compilation, CLI/browser verification) instead of
    inventing ad-hoc test harnesses.

    ## Out of Scope

    What this spec deliberately does not cover.

    ## Further Notes

    Anything else worth recording.
```

Once published, this spec is what `tickets.md`, `implement.md`, and
`review.md` all read (`gh issue view <spec-number>`) to know what's being built.

Recommended next step: [references/validate.md](validate.md) audits this spec,
adversarially under the 2-Tier Context Isolation Protocol (Tier 1 isolated subagent
or Tier 2 fresh session; see `validate.md`), before anyone splits it into tickets
or builds from it directly. Worth running on anything that spans more than one
session — treat skipping it as the exception, reserved for a small feature where a
missed gap would surface (and get fixed) just as cheaply during the build itself.
