# Verify: audit a spec, ticket set, ticket, or feature branch

## Shared rules

Review a diff along two independent axes, reported side by side:

- **Standards**: Does the diff follow the repository's coding standards and the ship-it standards below?
- **Spec**: Does the diff faithfully implement the requirements?

A diff can follow standards yet build the wrong behavior, or build the right behavior badly.
Evaluating each axis separately keeps strength on one axis from masking defects on the other.

### Two-axis passes

After executing steps 1 (`Fetch the diff`) and 2 (`Check verification evidence`) in the assigned Target section ([Target: ticket](#target-ticket) or [Target: final](#target-final)), run steps 3 through 5:

3. **Find standards sources**: Read `CONTRIBUTING.md`, coding standards, style guides, and linter configuration. Skip issues that automated linters catch.
4. **Standards pass**: Report each breach with file and line.
5. **Spec pass**: Audit the diff against the spec's cross-cutting architecture and the ticket's low-level design (touchpoints, design deltas, and acceptance criteria). For bug tickets, audit the diff against `## Root cause`, `## Reproduction seam`, and `## Acceptance criteria` instead of `## Low-level design`. Report missing requirements, partial implementations, unapproved architectural inventions, scope creep, and incorrect behavior, quoting the requirement for each finding.

#### Standards when the repository has none

Flag duplicated logic, unclear names, unused abstractions, and scattered changes.

#### Ship-it standards for every diff

- **Ticket-named artifacts**: Files named after issue numbers break the [ticket-naming prohibition](writing.md#ticket-naming-prohibition).
- **Ad-hoc test harnesses**: Scripts simulating coverage for non-code changes break the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
- **Unclear prose**: Documentation in `skills/ship-it/` or `ship-it` artifacts that breaks [writing.md](writing.md) is a Blocker. Classify prose polish in other repository files as a Nit unless local style guides require more.
- **Transient references**: `Spec § ...` citations, ticket identifiers, or `#<n>` issue references in product code, tests, comments, or docstrings break the [transient-reference prohibition](writing.md#transient-reference-prohibition). Classify violations as Blocker findings unless local standards loaded in step 3 require them.

### Zero-assumption rule

- **Missing facts**: Record a Question when judging the diff requires a fact that the requirements omit. Never assume undocumented behavior, intent, or edge-case safety.
- **Unchecked edge cases**: Classify an unverified edge case as a Question when requirements stay silent, and as a Blocker when requirements cover that edge case.
- **Command-backed Blockers**: Observe command output from read-only git inspection, test runs, or direct CLI checks executed in the current pass before raising any Blocker that asserts a repository fact (file presence, symbol, caller, or code behavior) or environment fact (tool version, CLI flag behavior, or test failure). Cite that observed output in the Blocker finding, because unverified claims cause unnecessary rework cycles.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet attaches `Delta-audit directive` (`- **Delta audit**:`):
  - **Prior findings and guidance**: Verify clearance of every prior Blocker and Question, and honor settled guidance (`## Answers` and `## Auto-resolved Decisions`).
  - **New findings**: Focus new Blockers and `Clarifying Questions` on newly modified commits and diffs since the prior pass, plus concrete factual regressions or contradictions against active code or source requirements.
  - **Unchanged review surface**: Keep belated non-regression notes on unchanged review surface non-blocking by handling those observations as Nits (fixed in place) or omitting them instead of raising Blockers or `Clarifying Questions`.
  - **Report schema**: Keep the existing `## Report` subsections (`### Standards`, `### Spec`, `### Clarifying Questions`, `### In-place Resolutions`) unchanged without adding a `### Warnings` subsection.

### Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The diff is wrong, incomplete, unverified, or breaks a standard. Any Blocker asserting a repository or environment fact cites observed output from read-only git inspection, test runs, or direct CLI checks executed in the current pass per `Command-backed Blockers` in [Zero-assumption rule](#zero-assumption-rule), because unverified claims cause unnecessary rework cycles. | Requests changes. |
| **Question** | A fact needed to judge the diff is unwritten. | Withholds approval until answered. |
| **Nit** | The diff is correct but improves with a typo fix, naming fix, or non-blocking observation on unchanged review surface during pass 2+. | Fix in place, stage modified files explicitly (`git add <file>...`), commit as `<type>(<slug>): <summary> (#<ticket-or-spec>)` with `<type>` taken from the branch prefix before `/`, and push. |

### Report

Post the report on the ticket, or on the spec for a final review:

```markdown
## Review: <Ticket #n | Final>
**Verdict**: Approved | Changes requested | Questions pending
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

### Validation rules for spec and ticket-set targets

These rules apply to both `Target: spec` and `Target: ticket-set`:

- **Command-backed Blockers**: Observe output from a read-only command executed in the current pass before raising any Blocker asserting a repository fact (file presence, path, symbol, caller, or git ref) or environment fact (tool version, CLI behavior, or command failure). Cite that observed output in the Blocker finding, because unverified factual claims trigger false-positive rework loops.
- **Populated subsections**: Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
- **Placeholder omission**: Omit `- None` placeholder subsections.
- **Warning-only verdict**: Specify `**Verdict**: Validated` for warning-only reports.

Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.

## Target: spec

Read a published spec as an outside skeptic.
Verify that the specification is crystal clear on high-level design against the current state of the project.
Try to break the specification before anyone slices tickets or writes code.

### Spec inputs

Read the requirements, the spec under audit, and prior spec comments first, then verify every named module boundary, shared contract, and system invariant against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`, or its `## Original request` comment via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Original request")) | .body]'` when `#<n>` is the spec or the map adopted in place), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), and both `- **Decision Register**:` and `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body.
  Let the confirmed `Request` govern where it differs from the source issue body or `## Original request` comment, and treat leftover ideas under `## Out of Scope` as descoped.
- **Active code**: Run `git fetch origin <default-branch>`, and inspect `origin/<default-branch>` silently via read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. When `git fetch origin <default-branch>` fails, fall back to local `HEAD` and record a single `### Warnings` entry naming `HEAD` as the ref used.
- **Repository governance**: Inspect the target repository's recorded instruction files (such as contributor or agent instruction files) and Architecture Decision Records (ADRs) or decision logs on `origin/<default-branch>`, falling back to local `HEAD` when fetch fails. Audit these governance files on pass 1, and recheck them on pass 2+ when the spec `Active edit surface` touches governed invariants.
- **Artifact under audit**: The spec body (`gh issue view <spec> --json body --jq .body`).
- **Prior comments**: Spec comments fetched once via `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Spec") or startswith("## Answers")) | .body]'` and filtered in-agent for prior `## Validation: Spec` and `## Answers` comments.

### Spec zero-assumption rule

- **Spec altitude**: Restrict Blockers and `Clarifying Questions` to cross-component observable behavior where two implementers reading only the spec could disagree on module boundaries, shared contracts (including public CLI or interface contracts exposed by the feature to users or callers), data models, system invariants, or high-level test seams (including `Reproduction seam` on `fix` specs). Exempt shared cross-slice flags recorded in `- **Decision Register**:` from flag exclusions at spec altitude. Omit slice-local observations (internal functions, caller inventories, file paths, unrecorded external tool or internal CLI flags, or low-level error checklists) or record them only as advisory Warnings without withholding approval.
- **Deferred items**: Exempt `- **Deferred to slicing**:` entries under `## Implementation Decisions` from `Clarifying Questions` and design-gap Blockers. Raise a Blocker only when a deferred entry directly contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code.
- **Architectural choice escalation**: When an unwritten spec-altitude choice has an unambiguous active-code default that does not conflict with stated requirements or settled decisions, record an advisory Warning naming both the inherited default and its active-code anchor (module or symbol), and permit `**Verdict**: Validated`. Reserve withholding `Clarifying Questions` for open spec-altitude choices lacking an unambiguous default or conflicting with stated requirements or settled decisions. Reserve slice-local questions for ticket-set validation or `- **Deferred to slicing**:`.
- **Single-outcome gaps**: Treat unimplemented requirements as work to build rather than drift, raising a factual-drift Blocker only when the spec misstates existing code. Reserve remaining Blockers for contradictions against stated requirements, recorded repository invariants, or settled decisions, or single-outcome cross-component gaps at spec altitude (such as unspecified module boundaries) where requirements and code dictate one resolution. Omit slice-local gaps or record them as advisory Warnings, reserving them for ticket-set validation or `- **Deferred to slicing**:`.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet includes `Delta-audit directive` (`- **Delta audit**:`):
  - **Active edit surface**: Limit the active edit surface to sections and claims cited in `### Blockers` or `### Clarifying Questions` of the latest `## Validation: Spec` report and in subsequent `## Answers` comments. Treat warning-only and uncited sections as untouched prose unless a concrete factual contradiction against active code or source requirements appears.
  - **Deferred items exemption**: Keep `- **Deferred to slicing**:` entries exempt from `Clarifying Questions` and design-gap Blockers unless a deferred entry directly contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code.
  - **Fetch-fallback Warning exception**: Retain any Warning reporting the `git fetch origin <default-branch>` fallback to local `HEAD`, exempting that fallback note from verbatim Warning suppression under [isolation.md](isolation.md#delta-audit-directive).
- **Zero inference**: Never infer intent, rationalize the author's choice, or edit the spec. Report unambiguous active-code defaults explicitly as advisory Warnings instead of filling gaps silently.
- **Source fidelity**: Verify that the spec honors every requirement and settled decision in the source issue or map body without contradiction.

### Spec checks

- **Contradictions**: Check for conflicting claims, reversed decisions, or contradictions against active code, recorded repository invariants, settled repository decisions, stated requirements, or settled map decisions across the spec and `- **Deferred to slicing**:` entries.
- **Codebase alignment**: Check cross-component module boundaries, shared contracts, data models, and system invariants against active code per `Spec altitude` and `Architectural choice escalation` in `## Zero-assumption rule`.
- **Repository governance**: Audit the spec against the target repository's recorded instruction files and Architecture Decision Records (ADRs) or decision logs on pass 1, and on pass 2+ when the `Active edit surface` touches governed invariants. Classify contradictions against recorded invariants or settled decisions as Blockers.
- **Design completeness**: Check cross-component observable behavior across boundaries, shared contracts, data models, and system invariants per `Spec altitude`, `Deferred items`, and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.
- **Repetition and bloat**: Check for cross-section restatement or walls of text violating [writing.md](writing.md) Rule 7, classifying non-conflicting repetition as `Warning`.
- **Traceability**: Check for unrequested behavior or uncovered source requirements per `Deferred items` and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.
- **Verification**: Check high-level test seams across components (plus `Root cause` and `Reproduction seam` on `fix` specs) per `Spec altitude` and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.

### Spec severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A spec claim or `- **Deferred to slicing**:` entry contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code, conflicts internally, or leaves a qualifying cross-component gap under `## Zero-assumption rule` (including `Root cause` or `Reproduction seam` on `fix` specs). Any Blocker asserting a repository or environment fact cites observed output from a read-only command executed in the current pass per `Command-backed Blockers`, because unverified factual claims trigger false-positive rework loops. | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style polish, optional slice-local observations, qualifying active-code defaults, or belated non-regression notes on untouched prose under `## Zero-assumption rule` and [isolation.md](isolation.md#delta-audit-directive). | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | An open cross-component choice on scope, product behavior, or architecture lacks an unambiguous active-code default or conflicts with stated requirements or settled decisions under `## Zero-assumption rule`. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a qualifying Blocker to avoid delaying work.

### Spec report

When findings remain after verbatim Warning suppression, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately.
When zero findings remain on a pass carrying the Delta-audit directive, post a two-line `Validated` marker (`## Validation: Spec` and `**Verdict**: Validated`) on the **spec**:

```markdown
## Validation: Spec
**Verdict**: Validated | Changes requested | Questions pending

### Blockers
- **B-1** [<section>]: <defect and why it blocks>

### Warnings
- **W-1** [<section>]: <advisory observation and rationale>

### Clarifying Questions
- **Q-1** [<section>]: <question>
```

- **Inherited defaults**: When reporting an active-code default as a Warning, name both the inherited default and its active-code anchor (module or symbol) in the corresponding `W-<n>` bullet.

### Spec outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Remaining Warnings, no Blocker or Question | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` |
| Pass 1 clean approval (zero findings, no Delta-audit directive) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: None` (skip posting a comment) |
| Pass 2+ clean approval (zero findings on a pass carrying the Delta-audit directive) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` (post two-line `Validated` marker) |

## Target: ticket-set

Read a published ticket set as an outside skeptic.
Verify that the tickets are crystal clear on low-level implementation against the parent specification and the current state of the project.
Try to break the ticket set before anyone turns the slices into code.

### Ticket-set inputs

Read the requirements, the ticket set under audit, and prior spec comments first, then verify every named touchpoint, module boundary, symbol contract, and caller against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The parent spec body (`gh issue view <spec> --json body --jq .body`), `- **Decision Register**:` and `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body, completed closed tickets (`state: "CLOSED"` with `stateReason: "COMPLETED"`), and active code on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs).
- **Repository governance**: Inspect the target repository's recorded instruction files (such as contributor or agent instruction files) and Architecture Decision Records (ADRs) or decision logs via read-only git commands on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs). Audit these governance files on pass 1, and recheck them on pass 2+ when unvalidated or neighbor tickets under `Scoped deep audit` touch governed invariants.
- **Artifact under audit**: Every open ticket body from `gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state all --limit 100 --json number,title,body,labels,state,stateReason`. Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`, and record any truncation warning under `### Warnings`.
- **Prior comments**: Spec comments fetched from pass 1 onward via `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Ticket set") or startswith("## Answers") or startswith("## Auto-resolved Decisions")) | .body]'`.

### Ticket-set zero-assumption rule

- **Ticket-set altitude**: Audit low-level design, slice-local helpers, caller edge cases, and low-level agreement between implementers across the open tickets.
- **Architectural choice escalation**: When an unwritten choice at ticket-set altitude has an unambiguous active-code or spec-implied default (including `- **Decision Register**:` entries) that does not conflict with stated requirements or settled decisions, record an advisory Warning naming both the inherited default and its active-code or spec anchor, and permit `ship-it:validated`. Record a Question only when an unwritten choice lacks an unambiguous default or settled `## Auto-resolved Decisions` entry and admits multiple valid designs, or conflicts with stated requirements or settled decisions.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with the parent spec, recorded repository invariants, or settled decisions (including `## Auto-resolved Decisions` and `## Answers`), or single-outcome gaps at ticket-set altitude where requirements and code dictate one resolution.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet includes `Delta-audit directive` (`- **Delta audit**:`):
  - **Scoped deep audit**: Scope remaining deep audits to unvalidated open tickets (lacking `ship-it:validated`) and their open direct dependency neighbors (computed from `## Blocked by` tasklists per [tickets.md](tickets.md#relationships)).
  - **Untouched validated tickets**: Leave untouched `ship-it:validated` tickets outside `Scoped deep audit` exempt from deep re-audits, and downgrade belated non-regression notes on untouched `ship-it:validated` tickets to advisory Warnings without revoking `ship-it:validated`.
  - **Truncation Warning exception**: Retain the `--limit 100` truncation warning in [writing.md](writing.md#bounded-search-truncation) whenever a query returns 100 results, exempting that warning from verbatim Warning suppression under [isolation.md](isolation.md#delta-audit-directive).
- **Zero inference**: Never infer intent, fill a gap, or edit ticket bodies. Report unambiguous active-code or spec-implied defaults as advisory Warnings instead of filling gaps silently, and honor settled choices in `## Auto-resolved Decisions` and `## Answers`.
- **Source fidelity**: Verify that the ticket set honors every requirement and settled decision in the parent spec body, `## Answers`, and `## Auto-resolved Decisions` without contradiction.

### Ticket-set checks

- **Contradictions**: Two statements that cannot both be true, or a ticket decision that quietly reverses the parent spec, recorded repository invariants, settled repository decisions, an earlier slice, or settled `## Auto-resolved Decisions` or `## Answers` entries.
- **Codebase alignment**: Check every named file, symbol signature, and caller touchpoint in active code.
- **Repository governance**: Audit the ticket set against the target repository's recorded instruction files and Architecture Decision Records (ADRs) or decision logs on pass 1, and on pass 2+ when unvalidated or neighbor tickets under `Scoped deep audit` touch governed invariants. Classify contradictions against recorded invariants or settled decisions as Blockers.
- **Design completeness**: Check that every ticket defines concrete `Touchpoints`, actionable slice-local `Design deltas` (including inter-slice boundaries when sibling tickets touch the same files or follow `expand → migrate → contract`), and caller edge-case checks. Flag bare pointer-only `Design deltas` (such as `"Apply rules in Spec § ..."`) as Blockers.
- **Repetition and bloat**: Enforce section-scoped precedence per [writing.md](writing.md#application-across-artifacts): allow self-contained verification inside `## Acceptance criteria` while preserving Rule 6 controlled vocabulary, and flag cross-section restatement inside `## Slice goal` or verbatim multi-line copying of spec-owned contracts inside `## Low-level design` instead of citing `Spec § <section>`. Classify non-conflicting repetition under Rule 7 as Warning unless restated text contradicts canonical sources. Exempt valid `## Consolidation checklist` sections from bloat and repetition warnings under Rule 7.
- **Traceability**: On pass 1 (excluding standalone `ship-it:bug` audits exempted under `Bug tickets`), map every `## Scope and Behaviors` item, every `- **Decision Register**:` entry, and every `- **Deferred to slicing**:` entry in `<spec>` to at least one open ticket or `COMPLETED` closed ticket. Verify `## Out of Scope` boundaries across the ticket set, and flag unrequested behavior, out-of-scope additions, or unmapped spec items as Blockers. On pass 2+, restrict new traceability Blockers to `Delta-audit scope (pass 2+)` and regressions introduced since the prior pass.
- **Verification**: Check every acceptance criterion, unhandled error, and low-level failure path across the tickets.
- **Consolidation checklists**: Require `## Consolidation checklist` strictly between `## Acceptance criteria` and `## Blocked by` whenever a feature ticket's `## Acceptance criteria` quantify over an enumerable source set (`every`, `all`, or `each` without naming every member inside `## Acceptance criteria`), listing every member from active code and the spec. Raise a Blocker when a qualifying feature ticket omits, misplaces, or leaves incomplete `## Consolidation checklist`, or when any `ship-it:bug` ticket includes `## Consolidation checklist`. Treat feature tickets bearing `ship-it:reviewed` or `ship-it:changes-requested` as post-review; when `- [x]` appears inside `## Consolidation checklist` on a feature ticket lacking both labels, run `gh issue view <n> --json comments --jq '[.comments[].body | select(startswith("## Review: Ticket"))] | length'` and raise a command-backed Blocker for pre-checked boxes only when a prior `## Review: Ticket` report is absent.
- **Ticket slicing and seams**: Audit ticket sets against [Granularity thresholds](tickets.md#granularity-thresholds) and the five [Slicing anti-patterns](tickets.md#slicing-anti-patterns) (`Docs-Tail`, `Config-Preamble`, `Horizontal Slice`, `Orphaned Scaffolding`, and `Micro-Refactor`), enforcing that anti-patterns outrank size-driven splits and complexity tiers never trigger splits unless the Upper Bound breaks and every resulting slice keeps a testable vertical seam. Flag slicing anti-patterns, broken intermediate states, or trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Tickets assigning tiers outside `low`, `medium`, or `high`, tiers below the non-overlapping source-file bands excluding test files in [Complexity taxonomy](tickets.md#complexity-taxonomy) (preserving higher tiers justified by non-file dimensions), or rationales failing to justify scope, touched layers, and source-file or reasoning depth. Skip source-file band checks on `ship-it:bug` tickets, which omit `## Low-level design`. When an open ticket omits complexity, apply the fallback default to `high` instead of recording a Blocker.
- **Bug tickets**: Audit tickets bearing `ship-it:bug` against the bug ticket template ([tickets.md](tickets.md#bug-ticket-template)): `Part of #<spec-id>`, `## Complexity`, `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`, and `## Blocked by`. Verify consistency with the parent spec (including `## Out of Scope` boundaries), and skip low-level design, slicing, source-file band, and full-spec coverage checks for bug tickets.

### Ticket-set severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A ticket contradicts a requirement, settled repository or spec decision, recorded repository invariant, or active code, repeats contracts with conflicting details, introduces unrequested or `## Out of Scope` work, leaves an unmapped pass-1 spec item or gaps in low-level design, slice-local touchpoints, caller edge cases, or the root cause and reproduction seam of a bug ticket, uses bare pointer-only `Design deltas`, omits, misplaces, or leaves incomplete `## Consolidation checklist` on a qualifying feature ticket, pre-checks `- [x]` boxes inside `## Consolidation checklist` on a pre-review feature ticket (lacking `ship-it:reviewed`, `ship-it:changes-requested`, and any prior `## Review: Ticket` report per `Consolidation checklists`), attaches `## Consolidation checklist` to a `ship-it:bug` ticket, assigns a tier below its source-file band or contradicting the [Complexity taxonomy](tickets.md#complexity-taxonomy) (excluding source-file band checks on `ship-it:bug` tickets), or exhibits a slicing anti-pattern (excluding belated non-regression notes on untouched `ship-it:validated` tickets on pass 2+). Any Blocker asserting a repository or environment fact requires cited output from a read-only command executed in the current pass per `Command-backed Blockers`, because unverified factual claims trigger false-positive rework loops. | Applies `ship-it:changes-requested` to `<spec>` and revokes `ship-it:validated` on cited open tickets. |
| **Warning** | Non-conflicting repetition under Rule 7 (excluding valid `## Consolidation checklist` sections), style polish, unambiguous active-code or spec-implied defaults (including `- **Decision Register**:` entries) naming default and anchor, or belated non-regression notes on untouched `ship-it:validated` tickets on pass 2+ per [isolation.md](isolation.md#delta-audit-directive). | Advisory; permits `ship-it:validated` on open tickets lacking Blockers or Questions and permits progression without revalidation. |
| **Question** | An unwritten choice lacking an unambiguous active-code or spec-implied default and settled `## Auto-resolved Decisions` entry has multiple valid designs. | Revokes or withholds `ship-it:validated` on cited open tickets and withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a Blocker to avoid delaying work.

### Ticket-set report

When findings remain after verbatim Warning suppression, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately.
When zero findings remain on a pass carrying the Delta-audit directive (including after verbatim Warning suppression, with zero truncation warning), post a two-line `Validated` marker (`## Validation: Ticket set` and `**Verdict**: Validated`) on the **spec**:

```markdown
## Validation: Ticket set
**Verdict**: Validated | Changes requested | Questions pending

### Blockers
- **B-1** [#<ticket>]: <defect and why it blocks>

### Warnings
- **W-1** [#<ticket>]: <advisory observation and rationale>

### Clarifying Questions
- **Q-1** [#<ticket>]: <question>
```

- **Ticket citations**: Cite affected open ticket numbers (`[#<ticket>]` or `[#<n>, ...]`) on every `B-<n>`, `W-<n>`, and `Q-<n>` bullet. For ticket-set-wide findings, cite all affected open ticket numbers `[#<n>, ...]` rather than an issue-free tag so clean-ticket labeling never marks unresolved tickets `ship-it:validated`.
- **Inherited defaults**: When reporting an active-code or spec-implied default as a Warning, name both the inherited default and its active-code or spec anchor in the corresponding `W-<n>` bullet.

### Ticket-set outcomes

On every pass, add `ship-it:validated` to every open ticket with zero Blockers and zero Questions (retaining the label when already present on untouched clean tickets), and remove `ship-it:validated` when present from any open ticket cited with a Blocker or Question (including pass 2 onward regressions).

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to `<spec>`; update per-ticket `ship-it:validated`. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | Update per-ticket `ship-it:validated` only. | `questions`, with `Evidence: <comment-url>` |
| Remaining Warnings (including `--limit 100` truncation), no Blocker or Question | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: <comment-url>` |
| Pass 1 clean approval (zero findings, zero truncation warning, no Delta-audit directive) | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: None` (skip posting a comment) |
| Pass 2+ clean approval (zero findings on a pass carrying the Delta-audit directive, zero truncation warning) | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: <comment-url>` (post two-line `Validated` marker) |

## Target: ticket

Audit one ticket's diff along the `Standards` and `Spec` axes defined in [Shared rules](#shared-rules).

### Ticket inputs

| Input | Source |
| :--- | :--- |
| Fixed point | The `Fixed point` field of the dispatch packet |
| Requirements | The ticket body and its spec body (`gh issue view <n> --json body --jq .body`); save the initial read of the ticket body to a temporary file (`<orig>`) when `## Consolidation checklist` is present |
| Prior review reports | Prior `## Review:` and `## Answers` comments on `<n>` fetched in step 1 |

Return `failed` when the fixed point is missing, does not resolve, or the diff across `<fixed-point>...HEAD` is empty.

### Ticket process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Handoff") or startswith("## Rework") or startswith("## Review:") or startswith("## Answers")) | .body]'`.
   Anchor the empty-diff `failed` guard on `<fixed-point>...HEAD` rather than `<prev-head-sha>..HEAD`, so pass-2+ runs after `questions` with unchanged `HEAD` audit cleared questions against folded body edits.
   - **Pass 1 diff survey**: Run `git --no-pager diff --stat <fixed-point>...HEAD` and `git --no-pager log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git --no-pager diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
   - **Pass 2+ delta scoping**: When `## Delta-audit directive` applies (via `- **Delta audit**:` in the dispatch packet), extract `<prev-head-sha>` from the `**Audited**:` `<fixed-point>..<prev-head-sha>` line of the latest `## Review: Ticket` report and collect commits from subsequent `## Rework` comments. Inspect newly modified commits and diffs (`git --no-pager log <prev-head-sha>..HEAD --oneline` and `git --no-pager diff <prev-head-sha>..HEAD`, or `## Rework` commit diffs, falling back to `<fixed-point>...HEAD` when neither resolves). When `HEAD` matches `<prev-head-sha>`, inspect folded body edits alongside `<fixed-point>...HEAD` to verify cleared Questions and factual regressions.
2. **Check verification evidence**: Inspect the `## Handoff` and `## Rework` comments fetched in step 1 for passing tests or allowable direct verification checks (including linting, type checks, builds, CLI checks, or manual inspection for non-executable changes). Missing verification is a Blocker.
3. **Run two-axis passes and report**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [Shared rules: two axis passes](#two-axis-passes), applying [Zero-assumption rule](#zero-assumption-rule) (including pass-2+ rules citing [isolation.md](isolation.md#delta-audit-directive)) and [Severity](#severity).
   - **Pass 2+ guidance**: Honor all settled guidance from `## Answers`.
   - **Checklist verification**: Save the initial `gh issue view <n> --json body --jq .body` read to `<orig>`, deleting `<orig>` immediately when `## Consolidation checklist` is absent. Verify every unchecked `- [ ]` item plus any newly touched diff regressions against prior `- [x]` items, and report each failed, missed, or regressed item as a `### Spec` Blocker while leaving failed or missed `- [ ]` items unchecked.
   - **Checklist update**: When at least one `- [ ]` item passes verification, copy `<orig>` to a temporary `--body-file` (`<updated>`), toggle only verified passing `- [ ]` items to `- [x]` while keeping all other ticket sections and lines read-only, and inspect `git --no-pager diff --no-index <orig> <updated>` (treating exit code `1` as differences detected). Run one `gh issue edit <n> --body-file <updated>` only when at least one box toggled, and delete `<orig>`, `<updated>`, and any temporary report files immediately after `gh` completes (or before returning when zero boxes toggle).
   - **Report range and posting**: Preserve `**Audited**: <fixed-point>..<head-sha>` across the full ticket range in the `## Review: Ticket #<n>` report per [Shared rules: report](#report), even when pass-2+ inspection scoped new diff checks to `<prev-head-sha>..HEAD`. Write the report to a temporary file and post the report on the ticket (`gh issue comment <n> --body-file <file>`). Delete the temporary file immediately and capture the posted comment URL for `Evidence:`.

### Complexity-scaled audit depth

Scale audit depth to the ticket's complexity tier:

| Complexity | Audit depth |
| :--- | :--- |
| `low` | Audit touched files and direct test coverage. |
| `medium` | Audit module test suites and named edge cases. |
| `high` | Audit module boundaries, unaffected callers outside touched files, and cross-cutting invariants. |

### Ticket review outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested`. Keep the assignee. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Nits or nothing | Add `ship-it:reviewed`. | `approved`, with `Evidence: <comment-url>` |

Never add `ship-it:reviewed` or return `approved` while any `- [ ]` item remains unchecked in `## Consolidation checklist`, because every checklist member requires independent verification before approval.
Always post the `## Review: Ticket #<n>` report (including on a clean pass 1 approval) and return its comment URL in `Evidence:` per [isolation.md](isolation.md#return-schema).
Never close the ticket; the conductor closes reviewed tickets.

## Target: final

Run after every ticket closes, auditing the whole feature branch diff along the `Standards` and `Spec` axes defined in [Shared rules](#shared-rules).

### Final inputs

| Input | Source |
| :--- | :--- |
| Fixed point | `git merge-base origin/<default-branch> HEAD` |
| Requirements | The spec body (`gh issue view <spec> --json body --jq .body`) and every closed ticket body (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,body,stateReason`). Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping results whose title starts with `[<slug>]` and whose `stateReason` is `COMPLETED`, with zero comment reads. |
| Prior review reports | Prior `## Review: Final`, `## Answers`, and `## Auto-resolved Decisions` comments on `<spec>` (`gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Review: Final") or startswith("## Answers") or startswith("## Auto-resolved Decisions")) | .body]'`) fetched in step 1, keeping zero comment reads on closed tickets |

Return `failed` when the merge-base commit (`<fixed-point>`) does not resolve or the branch diff across `<fixed-point>...HEAD` is empty.

### Final process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`. Resolve `<fixed-point>` via `git merge-base origin/<default-branch> HEAD`.
   - **Empty-diff guard**: Anchor the empty-diff `failed` guard on `<fixed-point>...HEAD` rather than `<prev-head-sha>..HEAD`, so pass-2+ runs after `questions` with unchanged `HEAD` audit cleared questions against folded body edits.
   - **Prior reports and guidance**: Fetch `Prior review reports` on `<spec>` once here via the query in `## Inputs`, keeping zero comment reads on closed tickets. Loading those comments before diff inspection provides `<prev-head-sha>`, prior findings, and settled control comments (`## Answers` and `## Auto-resolved Decisions`).
   - **Pass 1 diff survey**: Run `git --no-pager diff --stat <fixed-point>...HEAD` and `git --no-pager log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git --no-pager diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
   - **Pass 2+ delta scoping**: When `## Delta-audit directive` applies (via `- **Delta audit**:` in the dispatch packet), extract `<prev-head-sha>` from the `**Audited**:` `<fixed-point>..<prev-head-sha>` line of the latest `## Review: Final` report. Survey commits added since `<prev-head-sha>` via `git --no-pager log <prev-head-sha>..HEAD --oneline` and `git --no-pager diff --stat <prev-head-sha>..HEAD`, then inspect `git --no-pager diff <prev-head-sha>..HEAD` (falling back to `<fixed-point>...HEAD` when `<prev-head-sha>` is missing, and checking `<fixed-point>...HEAD` where needed for cleared findings, closed fix tickets marked `COMPLETED`, settled control comments, or cross-ticket regressions and contradictions). When `HEAD` matches `<prev-head-sha>`, inspect folded body edits alongside `<fixed-point>...HEAD` to audit cleared Questions and factual regressions.
2. **Check verification evidence**: Run or verify the test suite and direct checks specified in the spec's `## Testing Decisions` and closed ticket `## Acceptance criteria` directly against the branch without reading comments on closed tickets. Missing verification is a Blocker. On pass 2+, focus verification re-runs on changes since `<prev-head-sha>`, acceptance criteria of delivered fix tickets, and previously failing checks unless new commits touch cross-cutting invariants.
3. **Run two-axis passes and cross-ticket checks**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [Shared rules: two axis passes](#two-axis-passes), apply the [Zero-assumption rule](#zero-assumption-rule) (including pass-2+ rules citing [isolation.md](isolation.md#delta-audit-directive)) and [Severity](#severity) table, and check across tickets:
   - The branch delivers every `Scope and Behaviors` item and `Implementation Decisions` item in the spec.
   - No transitional scaffolding, dead code, or leftover migration paths remain.
   - Names and patterns stay consistent across tickets.
   - On pass 2+ (`## Delta-audit directive`), verify clearance of every prior Blocker, prior Question, and closed fix ticket marked `COMPLETED` in `Requirements`, and honor settled `## Answers` and `## Auto-resolved Decisions` comments on `<spec>`. Restrict new Blockers and `Clarifying Questions` to uncleared findings, commits added since `<prev-head-sha>`, defects in delivered fix tickets, or concrete cross-ticket regressions and contradictions. Keep non-regression notes on unchanged surface non-blocking as Nits (fixed in place) or omitted.
4. **Post the report**: Reuse the `Prior review reports` fetched in step 1 without re-querying `<spec>` or reading comments on closed tickets.
    - **Pass 2+ guidance**: Honor all settled guidance.
   - **Report range and posting**: Preserve `**Audited**: <fixed-point>..<head-sha>` across the full branch range in the `## Review: Final` report per [Shared rules: report](#report), even when pass-2+ inspection scoped new diff checks to `<prev-head-sha>..HEAD`. Write the report to a temporary file and post the report on `<spec>` (`gh issue comment <spec> --body-file <file>`). Delete the temporary file immediately and capture the posted comment URL for `Evidence:`.

### Final review

| Findings | Action | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Create one fix ticket per Blocker (below). | `changes-requested`, listing any Questions too, with created fix-ticket numbers (`#<n>, ...`) in `Issues:` and `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Nits or nothing | Add `ship-it:reviewed` to the spec. | `approved`, with `Evidence: <comment-url>` |

Follow this procedure with the template below:

- **Creation flags**: Create each fix ticket with title `[<slug>] Ticket: Fix <gist>` and labels `ship-it:ticket,ship-it:validated` (fix tickets skip ticket-set validation, and the user's approval at the halt stands in for it), then link it with `gh issue edit <n> --parent <spec-id>`, adding one `--add-blocked-by <blocker-id>` per blocker, optionally, ignoring errors.
- **Payload file**: Write the ticket body using a temporary payload file.
- **Settled answers**: Carry settled guidance that the conductor folded into the spec body into the acceptance criteria of fix tickets.
- **Blockers**: List blockers under `## Blocked by` as `- [ ] Blocked by #<blocker-id>` when blockers exist.
- **Cleanup**: Delete the temporary `--body-file` payload after creation.
- **Return block**: Always post `## Review: Final` on `<spec>` and return its comment URL in `Evidence:` across `approved`, `changes-requested`, and `questions` per [isolation.md](isolation.md#return-schema). On `changes-requested`, populate `Issues:` with every newly created fix-ticket number (`#<n>, ...`).

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level.>

## Slice goal

<Quote the Blocker and cite Spec § <section>.>

## Low-level design

- **Touchpoints**: Name the exact files, modules, and symbols to create, modify, or remove.
- **Design deltas**: Specify concrete symbol signatures, step numbers, state flow, and failure handling.

## Acceptance criteria

- [ ] <Single-sentence imperative check adhering to writing.md>

## Blocked by

None (can start immediately).
```
