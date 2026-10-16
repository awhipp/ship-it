# Validate: adversarial audit before anyone builds on this

Read a published spec or ticket set as an outside skeptic.
Try to break the artifact before anyone turns it into code.
Every spec and every ticket set is validated; there is no skip.

## Inputs

Read requirements before the artifact.
Read nothing beyond these inputs:

| Artifact | Requirements | Artifact under audit |
| :--- | :--- | :--- |
| Spec | The spec's `## Source`, the linked map's "Decisions so far", and every `## Answers` comment on the spec | The spec body |
| Ticket set | The parent spec and every `## Answers` comment on the spec | Every open ticket (`gh issue view <n> --json title,body`) |

## Zero-assumption rule

- When judging the artifact needs a fact that the inputs do not state, record a Question.
- Never infer intent, fill a gap, or rationalize the author's choice.
- Treat answers as requirements: an artifact that contradicts an answer has a Blocker.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a decision that quietly reverses an earlier one.
- **Traceability**: Unrequested behavior, or a requirement with no coverage.
- **Verification**: Untestable acceptance criteria, unhandled errors, or missing failure paths.
- **Ticket slicing**: Horizontal slices, sequencing preferences disguised as blockers, or tickets too large for one fresh context.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The artifact is wrong, or contradicts a requirement or an answer. | Applies `ship-it:changes-requested`. |
| **Question** | A fact needed to build the right thing is unwritten. | Withholds approval until answered. |
| **Nit** | The artifact is correct but improves with a small wording or formatting fix. | Fix in place. |

Do not inflate Nits into Questions to appear thorough.
Do not downgrade a Blocker to avoid delaying work.

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
