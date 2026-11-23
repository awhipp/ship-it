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

- When judging the diff needs a fact that the requirements do not state, record a Question.
- Never assume undocumented behavior, intent, or edge-case safety.
- An edge case with no test or check is a Question when the requirements are silent, and a Blocker when the requirements cover the edge case.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The diff is wrong, incomplete, unverified, or breaks a standard. | Requests changes. |
| **Question** | A fact needed to judge the diff is unwritten. | Withholds approval until answered. |
| **Nit** | The diff is correct but improves with a typo or naming fix. | Fix in place, stage modified files explicitly (`git add <file>...`), commit as `<type>(<slug>): <summary> (#<ticket-or-spec>)` with `<type>` taken from the branch prefix before `/`, and push. |

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
