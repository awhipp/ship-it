# Review: two-axis check of the diff

Review a diff along two independent axes, reported side by side:

- **Standards**: Does the diff follow the repository's coding standards and the ship-it standards below?
- **Spec**: Does the diff faithfully implement the requirements?

A diff can follow standards yet build the wrong behavior, or build the right behavior badly.
Evaluating each axis separately keeps strength on one axis from masking defects on the other.

## Modes

| Mode | Fixed point | Requirements |
| :--- | :--- | :--- |
| Ticket review | The `Fixed point: <sha>` comment on the ticket, or derived via fallback below | The ticket, its parent spec, and every `## Answers` comment on both |
| Final review | `git merge-base origin/<default-branch> HEAD` | The parent spec, every ticket, and every `## Answers` comment |

Return `failed` when the fallback procedure cannot derive a fixed point, the commit does not resolve, or the diff is empty.

## Process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out the feature branch. When the ticket lacks a `Fixed point:` comment, execute this fallback procedure:
   1. Extract commit hashes from the `## Handoff` comment on the ticket. Resolve the parent of the earliest commit using `<earliest-sha>~1`.
   2. When extraction yields no commits, inspect `git log origin/<default-branch>..HEAD` for commits referencing `(#<ticket>)`. Resolve the parent of the earliest match using `<earliest-sha>~1`.
   3. When steps 1 and 2 find no matching commits, and the ticket is the first ticket on the branch, resolve `git merge-base origin/<default-branch> HEAD`.
   4. When a commit resolves, post `Fixed point: <sha>` to the ticket using `gh issue comment <n> --body "Fixed point: <sha>"`.
   5. Use the resolved commit as `<fixed-point>` for `git diff <fixed-point>...HEAD`. Return `failed` when no commit resolves.
   Run `git diff --stat <fixed-point>...HEAD` and `git log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
2. **Check verification evidence**: The handoff comment must show passing tests or the direct checks required by [implement.md](implement.md#2-verify). Missing evidence is a Blocker.
3. **Find standards sources**: Read `CONTRIBUTING.md`, coding standards, style guides, and linter configuration. Skip issues that automated linters catch.
4. **Standards pass**: Report each breach with file and line.
5. **Spec pass**: Audit the diff against the parent spec's cross-cutting architecture and the ticket's low-level design (touchpoints, contracts, state flow, edge cases, and acceptance criteria). Report missing requirements, partial implementations, unapproved architectural inventions, scope creep, and incorrect behavior. Quote the requirement for each finding.

### Standards when the repository has none

Flag duplicated logic, unclear names, unused abstractions, primitive obsession, and changes scattered across many files.

### Ship-it standards for every diff

- **Ticket-named artifacts**: Files named after issue numbers break the [ticket-naming prohibition](implement.md#ticket-naming-prohibition).
- **Ad-hoc test harnesses**: Scripts simulating coverage for non-code changes break the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- **Unclear prose**: Documentation that breaks [writing.md](writing.md).

## Zero-assumption rule

- When judging the diff needs a fact that the requirements do not state, record a Question.
- Never assume undocumented behavior, intent, or edge-case safety.
- An edge case with no test or check is a Question when the requirements are silent, and a Blocker when the requirements cover the edge case.

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

- The branch delivers every User Story and Implementation Decision in the spec.
- No transitional scaffolding, dead code, or leftover migration paths remain.
- Names and patterns stay consistent across tickets.

| Findings | Action | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Create one fix ticket per Blocker (below). | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:reviewed` to the spec. | `approved` |

Create each fix ticket with the title `[<slug>] Ticket: Fix <gist>`, label `ship-it:ticket,ship-it:validated`, and `--parent <spec-id>` ([tickets.md](tickets.md)).
Include `Part of #<spec-id>`, `## Complexity`, `## What to build` (quoting the Blocker), `## Low-level design`, `## Acceptance criteria`, and `## Blocked by` in the ticket body, and delete the temporary `--body-file` payload after creation.
