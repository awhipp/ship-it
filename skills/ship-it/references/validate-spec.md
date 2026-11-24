# Validate Spec: adversarial audit before slicing

Read a published spec as an outside skeptic.
Verify that the specification is crystal clear on high-level design against the current state of the project.
Try to break the specification before anyone slices tickets or writes code.

## Inputs

Read the requirements, the spec under audit, and prior spec comments first, then verify every named module boundary, shared contract, and system invariant against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`, or its `## Original request` comment via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Original request")) | .body]'` when `#<n>` is the spec or the map adopted in place), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), and both `- **Decision Register**:` and `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body.
  Let the confirmed `Request` govern where it differs from the source issue body or `## Original request` comment, and treat leftover ideas under `## Out of Scope` as descoped.
- **Active code**: Run `git fetch origin <default-branch>`, and inspect `origin/<default-branch>` silently via read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. When `git fetch origin <default-branch>` fails, fall back to local `HEAD` and record a single `### Warnings` entry naming `HEAD` as the ref used.
- **Repository governance**: Inspect the target repository's recorded instruction files (such as contributor or agent instruction files) and Architecture Decision Records (ADRs) or decision logs on `origin/<default-branch>`, falling back to local `HEAD` when fetch fails. Audit these governance files on pass 1, and recheck them on pass 2+ when the spec `Active edit surface` touches governed invariants.
- **Artifact under audit**: The spec body (`gh issue view <spec> --json body --jq .body`).
- **Prior comments**: Spec comments fetched once via `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Spec") or startswith("## Answers") or startswith("## Circuit Breaker Reset")) | .body]'` and filtered in-agent for prior `## Validation: Spec`, `## Answers`, and `## Circuit Breaker Reset` comments.

## Zero-assumption rule

- **Spec altitude**: Restrict Blockers and `Clarifying Questions` to cross-component observable behavior where two implementers reading only the spec could disagree on module boundaries, shared contracts (including public CLI or interface contracts exposed by the feature to users or callers), data models, system invariants, or high-level test seams (including `Reproduction seam` on `fix` specs). Exempt shared cross-slice flags recorded in `- **Decision Register**:` from flag exclusions at spec altitude. Omit slice-local observations (internal functions, caller inventories, file paths, unrecorded external tool or internal CLI flags, or low-level error checklists) or record them only as advisory Warnings without withholding approval.
- **Deferred items**: Exempt `- **Deferred to slicing**:` entries under `## Implementation Decisions` from `Clarifying Questions` and design-gap Blockers. Raise a Blocker only when a deferred entry directly contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code.
- **Architectural choice escalation**: When an unwritten spec-altitude choice has an unambiguous active-code default that does not conflict with stated requirements or settled decisions, record an advisory Warning naming both the inherited default and its active-code anchor (module or symbol), and permit `**Verdict**: Validated`. Reserve withholding `Clarifying Questions` for open spec-altitude choices lacking an unambiguous default or conflicting with stated requirements or settled decisions. Reserve slice-local questions for ticket-set validation or `- **Deferred to slicing**:`.
- **Single-outcome gaps**: Treat unimplemented requirements as work to build rather than drift, raising a factual-drift Blocker only when the spec misstates existing code. Reserve remaining Blockers for contradictions against stated requirements, recorded repository invariants, or settled decisions, or single-outcome cross-component gaps at spec altitude (such as unspecified module boundaries) where requirements and code dictate one resolution. Omit slice-local gaps or record them as advisory Warnings, reserving them for ticket-set validation or `- **Deferred to slicing**:`.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet includes `Delta-audit directive` (`- **Delta audit**:`) or at least one prior non-approved `## Validation: Spec` report exists in the active cycle (running from the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Validated` report, whichever is more recent):
  - **Active edit surface**: Limit the active edit surface to sections and claims cited in `### Blockers` or `### Clarifying Questions` of the latest active-cycle `## Validation: Spec` report, subsequent `## Answers` or `## Circuit Breaker Reset` comments, and rewritten sections covered by a broad rescope in `## Circuit Breaker Reset`. Treat warning-only and uncited sections as untouched prose unless a concrete factual contradiction against active code or source requirements appears.
  - **Deferred items exemption**: Keep `- **Deferred to slicing**:` entries exempt from `Clarifying Questions` and design-gap Blockers unless a deferred entry directly contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code.
  - **Fetch-fallback Warning exception**: Retain any Warning reporting the `git fetch origin <default-branch>` fallback to local `HEAD`, exempting that fallback note from verbatim Warning suppression under [isolation.md](isolation.md#delta-audit-directive).
- **Command-backed Blockers**: Observe output from a read-only command executed in the current pass before raising any Blocker asserting a repository fact (file presence, path, symbol, caller, or git ref) or environment fact (tool version, CLI behavior, or command failure). Cite that observed output in the Blocker finding, because unverified factual claims trigger false-positive rework loops.
- **Zero inference**: Never infer intent, rationalize the author's choice, or edit the spec. Report unambiguous active-code defaults explicitly as advisory Warnings instead of filling gaps silently.
- **Source fidelity**: Verify that the spec honors every requirement and settled decision in the source issue or map body without contradiction.

## What to look for

- **Contradictions**: Check for conflicting claims, reversed decisions, or contradictions against active code, recorded repository invariants, settled repository decisions, stated requirements, or settled map decisions across the spec and `- **Deferred to slicing**:` entries.
- **Codebase alignment**: Check cross-component module boundaries, shared contracts, data models, and system invariants against active code per `Spec altitude` and `Architectural choice escalation` in `## Zero-assumption rule`.
- **Repository governance**: Audit the spec against the target repository's recorded instruction files and Architecture Decision Records (ADRs) or decision logs on pass 1, and on pass 2+ when the `Active edit surface` touches governed invariants. Classify contradictions against recorded invariants or settled decisions as Blockers.
- **Design completeness**: Check cross-component observable behavior across boundaries, shared contracts, data models, and system invariants per `Spec altitude`, `Deferred items`, and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.
- **Repetition and bloat**: Check for cross-section restatement or walls of text violating [writing.md](writing.md) Rule 7, classifying non-conflicting repetition as `Warning`.
- **Traceability**: Check for unrequested behavior or uncovered source requirements per `Deferred items` and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.
- **Verification**: Check high-level test seams across components (plus `Root cause` and `Reproduction seam` on `fix` specs) per `Spec altitude` and `Delta-audit scope (pass 2+)` in `## Zero-assumption rule`.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A spec claim or `- **Deferred to slicing**:` entry contradicts stated requirements, settled map or repository decisions, recorded repository invariants, or active code, conflicts internally, or leaves a qualifying cross-component gap under `## Zero-assumption rule` (including `Root cause` or `Reproduction seam` on `fix` specs). Any Blocker asserting a repository or environment fact cites observed output from a read-only command executed in the current pass per `Command-backed Blockers`, because unverified factual claims trigger false-positive rework loops. | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style polish, optional slice-local observations, qualifying active-code defaults, or belated non-regression notes on untouched prose under `## Zero-assumption rule` and [isolation.md](isolation.md#delta-audit-directive). | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | An open cross-component choice on scope, product behavior, or architecture lacks an unambiguous active-code default or conflicts with stated requirements or settled decisions under `## Zero-assumption rule`. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a qualifying Blocker to avoid delaying work.

## Report

When findings remain after verbatim Warning suppression, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately.
When zero findings remain on pass 2 or later and a prior non-approved `## Validation: Spec` report exists after the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Validated` report, post a two-line `Validated` marker (`## Validation: Spec` and `**Verdict**: Validated`) on the **spec**:

```markdown
## Validation: Spec
**Verdict**: Validated | Changes requested | Questions pending
**Blockers**: <N>, **Reintroduced**: <M>

### Blockers
- **B-1** [<section>]: <defect and why it blocks>

### Warnings
- **W-1** [<section>]: <advisory observation and rationale>

### Clarifying Questions
- **Q-1** [<section>]: <question>
```

- **Populated subsections**: Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
- **Placeholder omission**: Omit `- None` placeholder subsections.
- **Warning-only verdict**: Specify `**Verdict**: Validated` for warning-only reports.
- **Exact header prefix**: Write `**Verdict**:` verbatim on line 2 and `**Blockers**: <N>, **Reintroduced**: <M>` on line 3 for `Changes requested` reports, keeping heading, verdict, and counts within 120 characters including CRLF newlines. Omit line 3 on `Validated` and `Questions pending` reports. Treat `<M>` as optional on pass 1 and default omitted `<M>` to `0`.
- **Inherited defaults**: When reporting an active-code default as a Warning, name both the inherited default and its active-code anchor (module or symbol) in the corresponding `W-<n>` bullet.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Remaining Warnings, no Blocker or Question | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` |
| Pass 1 clean approval (zero findings, no prior non-approved report in cycle) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: None` (skip posting a comment) |
| Pass 2+ clean approval (zero findings remaining after prior non-approved report in cycle) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` (post two-line `Validated` marker) |

A validation cycle runs from the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Validated` report (whichever is more recent).
Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
