# Validate: adversarial audit before anyone builds on this

Read a published spec or ticket set as an outside skeptic.
Verify that the specification and tickets are crystal clear on implementation against the current state of the project.
Try to break the artifact before anyone turns the design into code.
Validate every spec and every ticket set without exception.

## Inputs

Read the requirements and inspect the active codebase before reading the artifact under audit.
Ground every check in these inputs:

| Artifact | Requirements | Artifact under audit |
| :--- | :--- | :--- |
| Spec | The spec's `## Source`, the linked map's "Decisions so far", every `## Answers` comment on the spec, and the active codebase | The spec body |
| Ticket set | The parent spec, every `## Answers` comment on the spec, and the active codebase | Every open ticket (`gh issue view <n> --json title,body`) |

## Zero-assumption rule

- Apply the two-implementer test: when two isolated implementers reading the artifact and codebase could make different architectural or low-level design choices, the artifact has a gap.
- When the author or slicer can resolve a gap from existing requirements and the codebase, record a Blocker.
- When resolving a gap requires an unsettled product, scope, or architectural decision from the user, record a Question.
- Never infer intent, fill a gap, or rationalize the author's choice.
- Treat answers as requirements: an artifact that contradicts an answer has a Blocker.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a decision that quietly reverses an earlier one.
- **Codebase alignment**: References to nonexistent modules or symbols, conflicts with existing architecture, or missed touchpoints in active code.
- **Design completeness**: Specs missing cross-cutting context, module boundaries, shared contracts, or invariants; tickets missing concrete touchpoints, symbol contracts, state flow, or edge cases.
- **Traceability**: Unrequested behavior, or a requirement with no coverage.
- **Verification**: Untestable acceptance criteria, unhandled errors, or missing failure paths.
- **Ticket slicing and seams**: Horizontal slices, broken intermediate states between tickets, sequencing preferences disguised as blockers, or tickets exceeding context boundaries. Audit ticket sets against qualitative granularity thresholds and the catalog of slicing anti-patterns. Flag trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Open tickets lacking a `## Complexity` section, tickets assigning invalid tiers, or rationales failing to justify scope, touched layers, and reasoning depth.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The artifact is wrong, contradicts a requirement or the codebase, or leaves gaps in the high-level or low-level design. Missing complexity declarations, mismatched complexity levels, and slicing anti-patterns constitute Blockers. | Applies `ship-it:changes-requested`. |
| **Question** | A user decision on scope, product behavior, or unsettled architecture is unwritten. | Withholds approval until answered. |
| **Nit** | The artifact is correct but improves with a small wording or formatting fix. | Fix in place. |

Always treat missing complexity declarations, mismatched complexity levels, and slicing anti-patterns as Blockers.
Do not inflate Nits into Questions to appear thorough.
Do not downgrade a Blocker to avoid delaying work.
Never pass an underspecified artifact by fixing only prose Nits.

## Report

Post the report on the **spec** for both artifact types (`gh issue comment <spec> --body-file <file>`):

```markdown
## Validation: <Spec | Ticket set>

### Blockers
- **B-1** [<section or #ticket>]: <defect and why it blocks> (or "None")

### Clarifying Questions
- **Q-1** [<section or #ticket>]: <question> (or "None")

### In-place Resolutions
- **R-1** [<section or #ticket>]: <nit fixed in the issue body> (or "None")

**Verdict**: Validated | Changes requested | Questions pending
```

Post the report on every pass, including clean passes.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:validated` to the spec, or to every open ticket for a ticket set. | `approved` |

Fix Nits directly in the issue body and record them under `### In-place Resolutions`.
Never rewrite structure or add missing requirements; those are Blockers.
