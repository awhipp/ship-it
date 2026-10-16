# Review: two-axis check of the diff

Review a diff along two independent axes, reported side by side:

- **Standards**: Does the diff follow the repository's coding standards and the ship-it standards below?
- **Spec**: Does the diff faithfully implement the requirements?

A diff can follow standards yet build the wrong behavior, or build the right behavior badly.
Evaluating each axis separately keeps strength on one axis from masking defects on the other.

## Modes

| Mode | Fixed point | Requirements |
| :--- | :--- | :--- |
| Ticket review | The `Fixed point: <sha>` comment on the ticket | The ticket, its parent spec, and every `## Answers` comment on both |
| Final review | `git merge-base origin/<base> HEAD`, with `<base>` from the spec's `## Source` (default branch when absent) | The parent spec, every ticket, and every `## Answers` comment |

Return `failed` when the fixed point is missing or does not resolve, or when the diff is empty.

## Process

1. **Fetch the diff**: Run `git fetch origin`, check out the feature branch, then run `git diff <fixed-point>...HEAD` and `git log <fixed-point>..HEAD --oneline`.
2. **Check verification evidence**: The handoff comment must show passing tests or the direct checks required by [implement.md](implement.md#2-verify). Missing evidence is a Blocker.
3. **Find standards sources**: Read `CONTRIBUTING.md`, coding standards, style guides, and linter configuration. Skip issues that automated linters catch.
4. **Standards pass**: Report each breach with file and line.
5. **Spec pass**: Report missing requirements, partial implementations, scope creep, and incorrect behavior. Quote the requirement for each finding.

### Standards when the repository has none

Flag duplicated logic, unclear names, unused abstractions, primitive obsession, and changes scattered across many files.

### Ship-it standards for every diff

- **Ticket-named artifacts**: Files named after issue numbers break the [ticket-naming prohibition](implement.md#ticket-naming-prohibition).
- **Ad-hoc test harnesses**: Scripts simulating coverage for non-code changes break the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- **Unclear prose**: Documentation that breaks [writing.md](writing.md).

## Zero-assumption rule

- When judging the diff needs a fact that the requirements do not state, record a Question.
- Never assume undocumented behavior, intent, or edge-case safety.
- An edge case with no test or check is a Question when the requirements are silent, and a Blocker when the requirements cover it.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The diff is wrong, incomplete, unverified, or breaks a standard. | Requests changes. |
| **Question** | A fact needed to judge the diff is unwritten. | Withholds approval until answered. |
| **Nit** | The diff is correct but improves with a typo or naming fix. | Fix in place, commit as `<type>(<slug>): <summary> (#<ticket-or-spec>)`, and push. |

## Report

Post the report on the ticket, or on the spec for a final review:

```markdown
## Review: <Ticket #n | Final>

### Standards
- <file#Lx: finding> (or "None")

### Spec
- <quoted requirement: divergence> (or "None")

### Clarifying Questions
- **Q-1**: <question> (or "None")

### In-place Resolutions
- **R-1** [<file#Lx>]: <nit fixed, commit sha> (or "None")

**Verdict**: Approved | Changes requested | Questions pending
```

The `**Verdict**:` line is exact; the conductor counts `Changes requested` verdicts to enforce the retry limit.

## Ticket review outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested`. Keep the assignee. | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:reviewed`. | `approved` |

Never close the ticket; the conductor closes reviewed tickets.

## Final review

Run after every ticket closes, against the whole feature branch.
Apply the same passes, then check across tickets:

- Every User Story and Implementation Decision in the spec is delivered.
- No transitional scaffolding, dead code, or leftover migration paths remain.
- Names and patterns stay consistent across tickets.

| Findings | Action | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Create one fix ticket per Blocker (below). | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:reviewed` to the spec. | `approved` |

Create each fix ticket per [tickets.md](tickets.md) with the title `[<slug>] Ticket: Fix <gist>`.
Label each fix ticket `ship-it:ticket,ship-it:validated`.
Quote the Blocker in `## What to build`.
