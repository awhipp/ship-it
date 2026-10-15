# Review: two-axis check of the diff

Review strictly enforces the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol).
In-context persona simulation is strictly prohibited.

Review diffs along two independent axes, reported side by side without merging or reranking:

- **Standards**: Does the diff follow the repository's documented coding standards?
- **Spec**: Does the diff faithfully implement the ticket or spec requirements?

## Why two axes, not one

A diff can follow standards yet implement the wrong behavior, or implement requirements faithfully while violating coding standards.
Evaluating both axes independently prevents strong performance on one axis from masking critical defects on the other.

## Process

### 1. Pin the fixed point

Diff against the fixed starting point of the ticket: usually the branch point or the commit preceding the ticket.
Run `git diff <fixed-point>...HEAD` using three dots to compare against the merge-base.
Run `git log <fixed-point>..HEAD --oneline` to review the commit list.
Confirm the fixed point resolves and the diff is non-empty before proceeding.
A bad ref must fail immediately here.

### 2. Verify verification evidence

Inspect evidence for the verification strategy required by [references/implement.md](implement.md) before evaluating code against standards and spec:

- **Automated test suites (where applicable)**:
  Inspect commit history (`git log <fixed-point>..HEAD --oneline`) and the issue thread (`gh issue view <number> --comments` or `gh issue view`). Verify that automated tests exist and pass when expected. Confirm that tests verify acceptance criteria. Do not reject diffs solely over missing terminal failure logs when tests and code verify requirements cleanly.

- **Non-automated verification**:
  Confirm that the handoff report or issue thread documents domain-appropriate acceptance criteria verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).

### 3. Identify the spec source

Locate the source specification in this priority order:

1. The ticket or spec issue (`gh issue view <number> --json number,title,body`).
2. Issue references in commit messages (such as `#123` or `Closes #45`).
3. An explicit path or issue number provided by the user.

If no spec exists, ask the user.
If the user confirms no spec exists, skip the Spec pass and record this omission in the report.

### 4. Identify the standards sources

Inspect repository documentation for coding rules: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, style guides, or linter configurations.
Skip issues handled by automated linters.

Enforce these ship-it specific standards across all diffs:

- **Ticket-Named Artifacts**: Test or source files named after tickets rather than domain seams. Rename files per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition).
- **Over-Architected Test Ceremonies**: Ad-hoc harnesses simulating coverage for non-code changes. Verify acceptance criteria directly per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- **Unclear Prose or Dense Phrasing**: Documentation or skills violating [writing.md](writing.md). Rewrite wandering compound sentences, passive phrasing, or dense noun clusters. Evaluate brevity qualitatively without running word-counting scripts.

### 5. Run both passes

**Standards pass**: Evaluate the diff, commit list, and identified standards sources.
Report every breach of documented standards or ship-it prohibitions.
Cite specific files and line numbers.

**Spec pass**: Evaluate the diff and commit list against the spec or ticket.
Report missing requirements, partial implementations, unintended scope creep, or incorrect behavior.
Quote the relevant spec line for each finding.
If no spec exists, skip the Spec pass and record that no spec was provided.

### 6. Report

Present both passes under `## Standards` and `## Spec` headings, unmerged. Format all findings, in-place resolutions, and summaries as concise statements adhering to [writing.md](writing.md):

```markdown
## Standards

<Findings citing file, rule, and hunk, formatted as concise statements following writing.md. Or "None".>

## Spec

<Findings citing spec requirement and implementation divergence, formatted as concise statements following writing.md. Or "None".>

### In-place Resolutions

- **R-1** [<file>#L<lines>]: <Concise description of the fix, rationale, and commit hash following writing.md>
- *(or "None")*

**Summary**: <One-line summary of findings per axis and worst issue within each axis, if any.>
```

When minor findings are remediated via the fast-path, document them under `### In-place Resolutions` detailing patched hunks and rationale.
Close with a one-line summary: total findings per axis plus the worst outstanding issue within each axis.
Do not declare a single overall winner across the two axes; that reranking defeats the two-axis separation.

## Outcome

Route the review into one of three unified outcomes:

- **Major findings or missing verification evidence**: Apply `ship-it:changes-requested` (`gh issue edit <number> --add-label "ship-it:changes-requested"`) and remove the assignee (`gh issue edit <number> --remove-assignee "@me"`). Post findings in an issue comment. Return the ticket to an implementation session for rework.
- **Minor findings or clean pass**: Apply `ship-it:reviewed` (`gh issue edit <number> --add-label "ship-it:reviewed"`). For minor nits or typos, patch files in-place, commit fixes, and document them under `### In-place Resolutions`. Post the review report comment. Close the ticket with a resolution comment (`gh issue close <number> --comment "<text>"`). If this is the final ticket, execute the [Feature Close-Out Protocol](../SKILL.md#feature-close-out-protocol).
- **Single-session specifications**: Apply `ship-it:reviewed` to the spec issue (`gh issue edit <spec-id> --add-label "ship-it:reviewed"`). Post the review report comment while keeping the specification open. Instruct the user to open or update a pull request referencing `Closes #<spec-id>`.
