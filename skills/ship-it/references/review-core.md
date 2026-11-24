# Review Core: two-axis check of the diff

Review a diff along two independent axes, reported side by side:

- **Standards**: Does the diff follow the repository's coding standards and the ship-it standards below?
- **Spec**: Does the diff faithfully implement the requirements?

A diff can follow standards yet build the wrong behavior, or build the right behavior badly.
Evaluating each axis separately keeps strength on one axis from masking defects on the other.

## Two-axis passes

After executing steps 1 (`Fetch the diff`) and 2 (`Check verification evidence`) in the assigned role file ([review-ticket.md](review-ticket.md) or [review-final.md](review-final.md)), run steps 3 through 5:

3. **Find standards sources**: Read `CONTRIBUTING.md`, coding standards, style guides, and linter configuration. Skip issues that automated linters catch.
4. **Standards pass**: Report each breach with file and line.
5. **Spec pass**: Audit the diff against the spec's cross-cutting architecture and the ticket's low-level design (touchpoints, design deltas, and acceptance criteria). For bug tickets, audit the diff against `## Root cause`, `## Reproduction seam`, and `## Acceptance criteria` instead of `## Low-level design`. Report missing requirements, partial implementations, unapproved architectural inventions, scope creep, and incorrect behavior, quoting the requirement for each finding.

### Standards when the repository has none

Flag duplicated logic, unclear names, unused abstractions, and scattered changes.

### Ship-it standards for every diff

- **Ticket-named artifacts**: Files named after issue numbers break the [ticket-naming prohibition](writing.md#ticket-naming-prohibition).
- **Ad-hoc test harnesses**: Scripts simulating coverage for non-code changes break the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
- **Unclear prose**: Documentation in `skills/ship-it/` or `ship-it` artifacts that breaks [writing.md](writing.md) is a Blocker. Classify prose polish in other repository files as a Nit unless local style guides require more.
- **Transient references**: `Spec § ...` citations, ticket identifiers, or `#<n>` issue references in product code, tests, comments, or docstrings break the [transient-reference prohibition](writing.md#transient-reference-prohibition). Classify violations as Blocker findings unless local standards loaded in step 3 require them.

## Zero-assumption rule

- **Missing facts**: Record a Question when judging the diff requires a fact that the requirements omit. Never assume undocumented behavior, intent, or edge-case safety.
- **Unchecked edge cases**: Classify an unverified edge case as a Question when requirements stay silent, and as a Blocker when requirements cover that edge case.
- **Command-backed Blockers**: Observe command output from read-only git inspection, test runs, or direct CLI checks executed in the current pass before raising any Blocker that asserts a repository fact (file presence, symbol, caller, or code behavior) or environment fact (tool version, CLI flag behavior, or test failure). Cite that observed output in the Blocker finding, because unverified claims cause unnecessary rework cycles.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet attaches `Delta-audit directive` (`- **Delta audit**:`) or at least one prior non-approved review report exists in the active cycle (running from the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Approved` report matching the active report heading, whichever is more recent):
  - **Prior findings and guidance**: Verify clearance of every prior Blocker and Question, and honor settled guidance (`## Answers`, `## Auto-resolved Decisions`, and `## Circuit Breaker Reset`). Count active Blockers that repeat Blockers cleared in the active cycle as `**Reintroduced**: <M>`.
  - **New findings**: Focus new Blockers and `Clarifying Questions` on newly modified commits and diffs since the prior pass, plus concrete factual regressions or contradictions against active code or source requirements.
  - **Unchanged review surface**: Keep belated non-regression notes on unchanged review surface non-blocking by handling those observations as Nits (fixed in place) or omitting them instead of raising Blockers or `Clarifying Questions`.
  - **Report schema**: Keep the existing `## Report` subsections (`### Standards`, `### Spec`, `### Clarifying Questions`, `### In-place Resolutions`) unchanged without adding a `### Warnings` subsection.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The diff is wrong, incomplete, unverified, or breaks a standard. Any Blocker asserting a repository or environment fact cites observed output from read-only git inspection, test runs, or direct CLI checks executed in the current pass per `Command-backed Blockers` in [Zero-assumption rule](#zero-assumption-rule), because unverified claims cause unnecessary rework cycles. | Requests changes. |
| **Question** | A fact needed to judge the diff is unwritten. | Withholds approval until answered. |
| **Nit** | The diff is correct but improves with a typo fix, naming fix, or non-blocking observation on unchanged review surface during pass 2+. | Fix in place, stage modified files explicitly (`git add <file>...`), commit as `<type>(<slug>): <summary> (#<ticket-or-spec>)` with `<type>` taken from the branch prefix before `/`, and push. |

## Report

Post the report on the ticket, or on the spec for a final review:

```markdown
## Review: <Ticket #n | Final>
**Verdict**: Approved | Changes requested | Questions pending
**Blockers**: <N>, **Reintroduced**: <M>
**Audited**: `<fixed-point>..<head-sha>` (<diff stat summary>; <verification summary>)

### Standards
- **S-1** [<file#Lx>]: <finding>

### Spec
- **D-1** [<spec § heading>]: <quoted requirement: divergence>

### Clarifying Questions
- **Q-1**: <question>

### In-place Resolutions
- **R-1** [<file#Lx>]: <nit fixed, commit sha>
```

- **Populated subsections**: Render only subsections that contain findings (`### Standards`, `### Spec`, `### Clarifying Questions`, `### In-place Resolutions`). Omit empty subsections and `- None` placeholders.
- **Clean pass**: When a ticket review or final review has zero findings and zero Nits, output only `## Review: <Ticket #n | Final>`, `**Verdict**: Approved`, the `**Audited**:` proof-of-work line, and any truncation note.
- **Truncation notice**: When the closed-ticket query in final review returns 100 items, embed the warning in [writing.md](writing.md#bounded-search-truncation) as a report note inside `## Review: Final`. Keep the four-line return block in [isolation.md](isolation.md) unchanged.
- **Exact verdict line**: Write `**Verdict**:` verbatim on line 2 immediately under the report heading. On `Changes requested` reports, write `**Blockers**: <N>, **Reintroduced**: <M>` on line 3 directly before `**Audited**:`. Keep the `## Review: Ticket #<n>` or `## Review: Final` heading, verdict line, and line-3 counts within the first 120 characters (`.body[:120]`) including CRLF line endings. Set `<N>` to the total Blocker count across `### Standards` and `### Spec`, excluding `### Clarifying Questions` and `### In-place Resolutions` (in-place Nits). Treat `**Reintroduced**: <M>` as optional on pass 1, and default an omitted `<M>` to `0`. Omit line 3 when the verdict is `Approved` or `Questions pending`. The conductor tracks progress-based breaker state from the `.body[:120]` prefixes of prior review reports after the latest `## Circuit Breaker Reset` or `Clean pass` `**Verdict**: Approved` comment marking a cycle boundary.
