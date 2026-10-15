# Validate: adversarial audit before anyone builds on this

Read a published artifact (spec, ticket set, or map) as an outside skeptic before implementation begins.
Try to break the artifact before turning decisions into code.
Validate is **recommended by default**.
Run this audit whenever tickets or implementation span more than one session.
Finding a gap now costs an issue comment.
Finding that same gap mid-implementation requires a costly rewrite.
Skip validation only for small, well-scoped features where this risk does not apply.
Skipping is a deliberate exception rather than the default workflow.

## 2-Tier Context Isolation Protocol

Validate artifacts through the [2-Tier Context Isolation Protocol](../SKILL.md#2-tier-context-isolation-protocol).
Never simulate an outside skeptic within the authoring session context.
Inspect the harness environment dynamically before delegating validation tasks:

- **Tier 1 (Dynamic subagent dispatch)**: When subagent dispatch tools (`invoke_subagent`, `Agent`, or equivalent harness primitives) exist, spawn an isolated child agent with zero parent context. Pass only the target artifact issue number, upstream requirements, and audit instructions. Direct the child agent to audit the artifact and return a concise verdict summary directly to the parent conductor.
- **Tier 2 (Manual fallback)**: When subagent tools are absent, apply the `ready-for-agent` status label (`gh issue edit <number> --add-label "ready-for-agent"`). Output the explicit audit command for a fresh session and pause execution. A fresh session claims the issue, conducts the audit, applies outcome labels, and removes `ready-for-agent`.

## What "requirements" means, per artifact

- **Spec**: Resolved decisions from the map (if a map exists) and the conversation or ticket requesting the spec.
- **Tickets**: The spec from which tickets were split, evaluated against User Stories and Implementation Decisions.
- **Map**: The destination named in the map and settled decisions. (Fog itself is expected and not a defect.)

Read requirements before reading the artifact (`gh issue view <number> --json body`).
Begin the audit from what was requested rather than what was written.

## What to look for

Use these audit angles to evaluate target artifacts:

- **Contradictions**: Two statements that cannot both be true, or a decision quietly reversing an earlier choice.
- **Scope and Traceability**: Unrequested behavior, missing upstream requirements, or incomplete feature coverage.
- **Verification and Edge Cases**: Untestable acceptance criteria, unhandled errors, missing failure paths, or unenforced constraints.
- **Map Findings**: Settled decisions that merely restate unresolved uncertainty.
- **Ticket Findings**: Horizontal slices, sequencing preferences disguised as blockers, or incomplete specification coverage.

## Severity

Assign findings to one of three tiers based on clear operational questions:

- **Blocker**: If this defect remains unresolved, can the implementer build the right thing? If no, it is a Blocker.
- **Warning**: Can the implementer proceed only by guessing at underspecified behavior? If they must guess, it is a Warning.
- **Nit**: Is the artifact correct without this change, but improved by adding it? That is a Nit.

Do not inflate Warnings to appear thorough.
Do not downgrade Blockers to avoid delaying work.
The severity tier dictates whether work proceeds.

## Report

Post audit findings as an issue comment (`gh issue comment <number> --body "<text>"`).
Format all findings as concise statements adhering to [writing.md](writing.md):

```markdown
## Validation: <artifact type>

**Summary**: <One-line assessment of artifact shape and readiness>

### Blockers
- **B-1** [<section>]: <Defect description and blocking rationale> (or "None")

### Warnings and Nits
- **W-1** [<section>]: <Underspecified behavior or proposed improvement> (or "None")

### In-place Resolutions
- **R-1** [<section>]: <Phonetic, typo, or phrasing fix applied in-place> (or "None")

**Verdict**: <Ready to build as-is | Blocked on reported blockers>
```

Post the full report comment even for clean passes to maintain an audit trail.

## Outcomes

Evaluate findings under a binary outcome:

- **Blockers detected**: Apply `ship-it:changes-requested` (`gh issue edit <number> --add-label "ship-it:changes-requested"`). Remove `ready-for-agent` if present (`gh issue edit <number> --remove-label "ready-for-agent"`). Do not apply `ship-it:validated`. Validators must not rewrite major structural defects or missing requirements. Route the artifact back to its authoring phase for rework.
- **Clean pass or in-place fixes**: Apply `ship-it:validated` (`gh issue edit <number> --add-label "ship-it:validated"`). Remove `ready-for-agent` if present (`gh issue edit <number> --remove-label "ready-for-agent"`). Validators may resolve minor typos, phrasing nits, or formatting fixes directly in the issue body. Record these fixes under `### In-place Resolutions`. Warnings and nits do not block the label.
