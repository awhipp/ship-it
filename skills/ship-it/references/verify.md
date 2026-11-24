# Verify: audit a spec, ticket set, ticket, or feature branch

## Shared rules

- **Read-only**: Never edit the artifact under audit, except the Nit fixes and checklist toggles named below.
- **Zero assumption**: Record a Question when judging needs a fact the requirements omit. Never infer intent, fill a gap, or assume edge-case safety.- **Command-backed Blockers**: Before raising a Blocker that asserts a repository fact (file, path, symbol, caller, git ref) or environment fact (tool version, CLI behaviour, test failure), run a read-only command in this pass and cite its output.
- **Pass 1 is complete**: Map every spec behaviour, Decision Register entry, and Deferred entry to the artifact.
- **Pass 2+ is delta-only**: Apply [isolation.md](isolation.md#delta-audit-directive) when the packet carries it. Verify every prior Blocker and Question cleared, honor `## Answers` and `## Auto-resolved Decisions`, and raise nothing else beyond defects in changed surface and factual regressions.
- **Altitude is a finding class**:
  - Under `Target: spec`, low-level detail is a Blocker: file paths, internal functions, or slice-local flags not registered in `## Decision Register`. Public interface contracts and the `Reproduction seam` command are exempt.
  - Under `Target: ticket-set`, missing low-level detail is a Blocker: no exact touchpoints, bare pointer-only `Design deltas`, or acceptance criteria that are not self-contained.
  - `Not applicable, because <reason>.` counts as content.
- **Prose**: Ship-it text that breaks [writing.md](writing.md) is a Blocker, except non-conflicting restatement, which stays a Warning.
- **Truncation**: Record the [writing.md](writing.md#bounded-search-truncation) warning in the report when a `--limit 100` query returns 100 items.
- **Reports**: Render only populated subsections. Post the report as a comment and return its URL in `Evidence:` per [isolation.md](isolation.md#return-schema). A clean pass 1 validation posts nothing (`Evidence: None`). A clean pass 2+ validation posts only `## Validation: <Spec|Ticket set>` and `**Verdict**: Validated`.

### Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | Wrong, incomplete, unverified, or contradicts a requirement, settled decision, invariant, or active code. | Requests changes. |
| **Question** | A needed fact is unwritten and has no unambiguous active-code or spec-implied default. | Withholds approval. |
| **Warning** | Non-conflicting repetition, polish, an unambiguous inherited default (name default and anchor), or a belated note on unchanged surface. Validation only. | Advisory. |
| **Nit** | A typo or naming fix on a correct diff. Review only. | Fix in place, stage files explicitly, commit `<type>(<slug>): <summary> (#<ticket-or-spec>)` (`<type>` from the branch prefix), and push. |

### Outcomes

| Findings | Labels | Verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` (spec, or ticket under review). | `changes-requested`, listing Questions too |
| Questions, no Blocker | None. | `questions` |
| Warnings, Nits, or nothing | Add `ship-it:validated` (validation) or `ship-it:reviewed` (review). | `approved` |

`Target: ticket-set` applies the label per ticket: add `ship-it:validated` to every open ticket with no Blocker or Question, and remove it from any ticket cited with one. On a Blocker, `ship-it:changes-requested` goes on `<spec>`.
The conductor closes reviewed tickets.

### Diff axes (review targets)

Audit a diff along two axes:

- **Standards**: Read `CONTRIBUTING.md`, style guides, and linter configuration, skipping what linters catch. Report breaches with file and line. Always flag ticket-numbered files ([prohibition](writing.md#ticket-naming-prohibition)), ad-hoc test harnesses ([prohibition](writing.md#ad-hoc-test-harness-prohibition)), and transient references in code ([prohibition](writing.md#transient-reference-prohibition)) as Blockers.
- **Spec**: Audit against the spec's cross-cutting design and the ticket's `## Low-level design` and `## Acceptance criteria` (bug tickets: `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`). Quote the requirement for each divergence.

Missing verification evidence is a Blocker.
Report format:

```markdown
## Review: <Ticket #n | Final>
**Verdict**: Approved | Changes requested | Questions pending
**Audited**: `<fixed-point>..<head-sha>` (<diff stat>; <verification summary>)

### Standards
- **S-1** [<file#Lx>]: <finding>

### Spec
- **D-1** [<spec § heading>]: <quoted requirement: divergence>

### Clarifying Questions
- **Q-1**: <question>

### In-place Resolutions
- **R-1** [<file#Lx>]: <nit, commit sha>
```

A clean pass keeps only the first three lines. `**Audited**:` always spans the full range.

## Target: spec

- **Inputs**: The spec, its `## Source` request (or `## Original request` comment), the linked map, prior `## Validation: Spec` and `## Answers` comments, `origin/<default-branch>` after fetching it (fall back to local `HEAD` with one Warning), and the repository's instruction files and ADRs.
- **Checks**: Contradictions with requirements, settled decisions, invariants, or active code. Boundaries, contracts, and invariants against active code. Source fidelity, traceability, test seams, and altitude.
- **Spec altitude**: Raise Blockers and Questions only where two implementers could disagree on a cross-component boundary, contract, or invariant. Exempt `## Deferred to slicing` unless an entry contradicts requirements, settled decisions, invariants, or code.
- **Unimplemented requirements**: Treat them as work to build. Raise a Blocker only when the spec misstates existing code.
- **Pass 2+**: Limit the edit surface to sections cited in the latest report and later `## Answers`.- **Report**: `## Validation: Spec`, `**Verdict**: Validated | Changes requested | Questions pending`, then `### Blockers` (B-n), `### Warnings` (W-n), `### Clarifying Questions` (Q-n), each bullet tagged `[<section>]`. Post it on `<spec>`.

## Target: ticket-set


- **Inputs**: The spec, its Decision Register and Deferred entries, every `[<slug>]` ticket, prior `## Validation: Ticket set`, `## Answers`, and `## Auto-resolved Decisions` comments, active code on `<branch>` or `origin/<default-branch>`, and the repository's instruction files and ADRs.
- **Checks**:
  - Contradictions, and every named file, symbol, and caller against active code.
  - Design completeness: concrete `Touchpoints`, actionable `Design deltas` including sibling-ticket boundaries, and caller edge cases.
  - Altitude: each spec-owned contract cited by `Spec §`, not restated.
  - Traceability: on pass 1, map every spec behaviour, Decision Register entry, and Deferred entry to an open or `COMPLETED` ticket, and flag unrequested or out-of-scope work.
  - Slicing against [Granularity](tickets.md#granularity-thresholds) and [Slicing anti-patterns](tickets.md#slicing-anti-patterns), with anti-patterns as Blockers.
  - Tiers against the [taxonomy](tickets.md#complexity-taxonomy), with a missing tier defaulting to `high`. Bug tickets follow the [bug template](tickets.md#bug-preparation) and skip design, slicing, and tier checks.
  - Consolidation checklists: require a complete one before `## Blocked by` on a feature ticket whose criteria quantify over an unnamed enumerable set, and forbid it on bug tickets. Raise a pre-checked `- [x]` Blocker only when no `ship-it:reviewed`, `ship-it:changes-requested`, or prior `## Review: Ticket` report exists.
- **Pass 2+**: Deep-audit only unvalidated open tickets and their open direct dependency neighbors per [Relationships](tickets.md#relationships). Downgrade belated notes on untouched `ship-it:validated` tickets to Warnings. Keep the truncation Warning.
- **Report**: `## Validation: Ticket set` with the spec's format on `<spec>`. Tag every bullet `[#<n>, ...]` with each affected open ticket, never a bare tag.

## Target: ticket

Audit one ticket's diff.

- **Inputs**: The ticket body, its spec, the packet's fixed point, and the ticket's `## Handoff`, `## Rework`, `## Review:`, and `## Answers` comments. Return `failed` when the fixed point is missing or unresolvable, or `<fixed-point>...HEAD` is empty.
- **Process**:
  1. Fetch and check out `<branch>`, and survey `git --no-pager diff --stat <fixed-point>...HEAD`. On pass 2+, inspect `<prev-head-sha>..HEAD` (from the latest `**Audited**:` line) or the `## Rework` commits, and fall back to the full range. When `HEAD` is unchanged, check folded body edits against the full range.
  2. Check verification evidence in `## Handoff` and `## Rework`.
  3. Run the [diff axes](#diff-axes-review-targets). Scale depth to `## Complexity`: `low` touched files and direct tests, `medium` plus module suites and named edge cases, `high` plus boundaries, outside callers, and invariants.
  4. Checklist: verify every `- [ ]` item and any regression of `- [x]` items in `## Consolidation checklist`, and report each failure as a `### Spec` Blocker. Toggle only verified items with one surgical `gh issue edit <n> --body-file <file>`.
- **Outcome**: Use [Outcomes](#outcomes). Never approve while any checklist item is unchecked. Post `## Review: Ticket #<n>` on the ticket, including on a clean pass 1.

## Target: final

Audit the whole feature diff after every ticket closes.

- **Inputs**: `git merge-base origin/<default-branch> HEAD` as the fixed point, the spec, every closed `COMPLETED` `[<slug>]` ticket body (read no comments on closed tickets), and prior `## Review: Final`, `## Answers`, and `## Auto-resolved Decisions` comments on `<spec>`. Return `failed` when the merge-base does not resolve or the diff is empty.
- **Process**:
  1. Fetch and check out `<branch>`, then survey and inspect the diff as for `Target: ticket`, using `## Review: Final` for `<prev-head-sha>`.
  2. Run the spec's `## Testing seams` and the closed tickets' criteria. Missing verification is a Blocker. On pass 2+, re-run only changed checks, fix-ticket criteria, and prior failures.
  3. Run the [diff axes](#diff-axes-review-targets), and check across tickets: the branch delivers every observable behaviour and Decision Register entry, no scaffolding or dead code remains, and names stay consistent. On pass 2+, also verify closed fix tickets and raise only uncleared findings, new commits, fix-ticket defects, and cross-ticket regressions.
  4. Post `## Review: Final` on `<spec>`.
- **Outcome**: Use [Outcomes](#outcomes) with `ship-it:reviewed` on `<spec>`. On Blockers, create one fix ticket per Blocker and list them in `Issues:`. Titles read `[<slug>] Ticket: Fix <gist>`, labels `ship-it:ticket,ship-it:validated`. Link with `gh issue edit <n> --parent <spec-id>`, ignoring errors. Use the [ticket template](tickets.md#ticket-template): `## Slice goal` quotes the Blocker and cites `Spec §`, and settled guidance goes into the criteria.
