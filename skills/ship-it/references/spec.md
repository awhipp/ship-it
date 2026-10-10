# Spec: synthesize what has already been decided

Turn a settled idea into a spec published as a GitHub issue. Source requirements from resolved map decisions, user conversation, or both. This phase is **synthesis, not interview**. Resolve open questions before entering this phase. If you need user input on a minor point, ask directly. Do not conduct an extensive grilling session; grilling belongs upstream in [plan.md](plan.md).

## Process

1. **Gather settled context.** If a map exists for this feature, read "Decisions so far" via `gh issue view <map-number>`. Inspect any ticket details that matter. Otherwise, synthesize context from the conversation.

2. **Explore the codebase.** Ground the spec in active code. Use the project's established vocabulary and respect existing Architecture Decision Records (ADRs).

3. **Define test seams and verification strategy.** Determine where and how to verify the feature, aligning with existing test conventions and directories. Prefer existing seams over new ones. Choose high-level seams with minimal touchpoints across the codebase. For non-executable changes or repositories without automated tests, define direct verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition). Confirm verification seams with the user before drafting.

4. **Draft the spec.** Draft the specification using the template below. Ensure all sections follow the standards in [writing.md](writing.md).

   **Approval Checkpoint**: Pause here and obtain explicit user confirmation before creating any GitHub issue. Never publish the spec without explicit user review and approval of scope and decisions. Iterate until confirmed.

5. **Publish the spec.** Once approved, publish the spec as a GitHub issue titled `[<slug>] Spec: <gist>`. Use `--body-file` per [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions) (see [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands)):

   ```shell
   gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec,ready-for-agent"
   ```

## Spec template

```markdown
    ## Problem Statement

    Describe the user problem from the user perspective. Follow sentence brevity and
    clarity rules in [writing.md](writing.md).

    ## Solution

    Describe the proposed solution from the user perspective. Follow sentence brevity
    and clarity rules in [writing.md](writing.md).

    ## User Stories

    Numbered list covering the complete feature surface area. Format every story to
    follow [writing.md](writing.md):

    1. As a <actor>, I want <feature>, so that <benefit>

    Example: "As an account holder, I want to view my account balance, so that I can track spending."

    ## Implementation Decisions

    Technical clarifications, architectural decisions, module interfaces, schema
    updates, and API contracts. Follow the 6 core rules in [writing.md](writing.md).

    Omit file paths and transient code snippets to prevent stale references.
    Exception: if a prototype established a concrete data structure, state machine,
    or schema, include only the decision-critical snippet and note its prototype origin.

    ## Testing Decisions

    Verification strategy aligned with workspace conventions and existing test runners.
    Define which domain modules and seams receive test coverage. For non-executable
    changes or projects lacking automated tests, state domain-appropriate direct
    verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
    Follow [writing.md](writing.md).

    ## Out of Scope

    Explicitly excluded capabilities. Follow [writing.md](writing.md).

    ## Further Notes

    Additional context or operational constraints. Follow [writing.md](writing.md).
```

Once published, child phases ([tickets.md](tickets.md), [implement.md](implement.md), and [review.md](review.md)) read this spec via `gh issue view <spec-number>`. These phases inspect the spec to know what to build.

Recommended next step: [validate.md](validate.md) audits this spec adversarially under the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol). Audit the spec before splitting tickets or building directly. Run validation for any multi-session build. Treat skipping validation as a rare exception for trivial features.

## Spec remediation

When adversarial validation applies `ship-it:changes-requested` to a specification, resolve reported blockers before proceeding to tickets or implementation:

1. **Review audit findings**: Inspect the validation report in the issue comments via `gh issue view <spec-number> --comments`.
2. **Remediate blockers**: Update the problem statement, solution, user stories, or implementation decisions in the issue body (`gh issue edit <spec-number> --body-file <file>`). Resolve contradictions, eliminate untestable criteria, and restore traceability.
3. **Confirm scope adjustments**: Obtain explicit user approval if remediation alters feature scope or architectural boundaries.
4. **Post resolution comment**: Post a comment detailing how each blocker was resolved (`gh issue comment <spec-number> --body "<text>"`).
5. **Remove status label**: Remove `ship-it:changes-requested` via `gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`.

Removing `ship-it:changes-requested` returns the spec to the validation queue.
Submit the updated specification for re-audit under [validate.md](validate.md) in a fresh session.
