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

The session that authored an artifact or diff remembers why it chose specific shortcuts and deferred edge cases.
Subsequent implementers and reviewers see only the recorded text and code.
An audit run in the authoring context inherits these rationalizations and overlooks gaps that an outside reviewer would catch.

**In-context persona simulation is strictly prohibited**: An agent must never simulate an outside skeptic within the authoring session.
Persona switching within an authoring session introduces confirmation bias and context token leakage.
Claims of clearing working state within an active context fail to eliminate authoring bias.

All validation and review phases must follow the **2-Tier Context Isolation Protocol**:

- **Tier 1 (Isolated Subagent)**: For multi-agent harnesses supporting subagents (such as Antigravity or Claude Code subagents). The parent session spawns an isolated subagent with a restricted prompt containing only target artifacts and upstream requirements. The subagent receives zero access to conversation history. For reviews, spawn separate subagents for Standards and Spec axes to prevent cross-axis contamination.
- **Tier 2 (Fresh Session / Window)**: Universal protocol for single-agent or manual harnesses (such as Cursor, Aider, or terminal). The user initiates a fresh conversation tab or session with a dedicated prompt for the validation or review phase.

In both tiers, the auditor or reviewer accesses only the artifact and its source requirements, with zero access to authoring deliberations.

## What "requirements" means, per artifact

- **Spec**: Resolved decisions from the map (if a map exists) and the conversation or ticket requesting the spec.
- **Tickets**: The spec from which tickets were split, evaluated against User Stories and Implementation Decisions.
- **Map**: The destination named in the map and settled decisions. (Fog itself is expected and not a defect.)

Read requirements before reading the artifact (`gh issue view <number> --json body`).
Begin the audit from what was requested rather than what was written.

## What to look for

Use these audit angles to evaluate the artifact. Select angles relevant to the target artifact:

- **Contradictions**: Two statements in the artifact that cannot both be true, or a decision that quietly reverses an earlier choice.
- **Traceability gaps**: Upstream requirements that the artifact omits or addresses only partially. Walk requirements one by one and locate each requirement in the artifact.
- **Untestable criteria**: Acceptance criteria or user stories that cannot be converted into an unambiguous verification test.
- **Silent scope**: Behavior committed in the artifact that no upstream requirement requested.
- **Missing paths**: Unhandled errors, skipped failure cases, or constraints stated without an enforcement mechanism.
- **Clarity and precision**: Text violating [writing.md](writing.md) through ambiguous requirements, sentences exceeding 25 words, dense noun clusters, or untestable passive voice.
- **Map-specific**: Settled decisions that merely restate unresolved uncertainty. Fog is expected during planning; flag only unresolved items mislabeled as settled.
- **Ticket-specific**: Horizontal technical slices rather than vertical end-to-end slices, sequencing preferences disguised as blocking dependencies, or incomplete coverage of the parent spec.

## Severity

Assign findings to one of three tiers based on clear operational questions:

- **Blocker**: If this defect remains unresolved, can the implementer build the right thing? If no, it is a Blocker.
- **Warning**: Can the implementer proceed only by guessing at underspecified behavior? If they must guess, it is a Warning.
- **Nit**: Is the artifact correct without this change, but improved by adding it? That is a Nit.

Do not inflate Warnings to appear thorough.
Do not downgrade Blockers to avoid delaying work.
The severity tier dictates whether work proceeds.

## Report

Post audit findings as a comment on the artifact issue (`gh issue comment <number> --body-file <file>`).
Format all report findings, in-place resolutions, and summaries as concise statements adhering to [writing.md](writing.md):

```markdown
## Validation: <artifact type>

<One line: overall read on the artifact's shape and readiness adhering to writing.md.>

### Blockers
- **B-1** [<section>]: <what's wrong, one sentence on why it blocks adhering to writing.md>
- *(or "None")*

### Warnings
- **W-1** [<section>]: <what's underspecified, one sentence on the guess it forces adhering to writing.md>
- *(or "None")*

### Nits
- **N-1** [<section>]: <the improvement, one sentence adhering to writing.md>
- *(or "None")*

### In-place Resolutions
- **R-1** [<section>]: <minor typo, phrasing clarification, or formatting fix patched in issue body adhering to writing.md>
- *(or "None")*

### Traceability
| Requirement | Where it lands | |
| :--- | :--- | :--- |
| <gist> | <section, or "missing"> | ✅ / ⚠️ / ❌ |

**Verdict**: <ready to build from as-is> / <blocked on B-1..N above>
```

A clean pass must still post the full report comment confirming zero defects were found.
A brief thumbs-up does not create a verifiable audit trail.

## Findings and remediation: major handoff vs. minor fast-path

Validators must not rewrite major structural defects, missing requirements, scope creep, or architectural blockers.
Fixing a spec belongs to `spec.md`, fixing tickets to `tickets.md`, and fixing a map to `plan.md`.
Resolving major issues in the owning phase preserves an independent audit rather than introducing a second author.

**Minor findings (fast-path)**: Minor findings meet the threshold if they do not alter architecture, scope, or core decisions (typos, nits, phrasing fixes).
The validator may patch the artifact issue body directly in-place (`gh issue edit <number> --body "<updated-body>"`).
The validator records each in-place fix under `### In-place Resolutions` in the validation comment report.
If zero blockers remain after in-place remediation, the artifact is unblocked.

## Verdict and the label

- **Any remaining Blocker**: Do not apply `ship-it:validated`. Major structural defects or unresolvable blockers route back to the owning phase in a fresh session (Tier 2) or isolated subagent (Tier 1). This ensures the fix is not written by the context that introduced the defect.
- **Zero Blockers**: Apply `ship-it:validated` (`gh issue edit <number> --add-label "ship-it:validated"`). If minor findings were resolved in-place via the fast-path, confirm the updated artifact issue body is saved and documented in the report. Warnings and Nits remain on record in the comment. The user decides whether to address them immediately or carry them forward; they do not block the label.
