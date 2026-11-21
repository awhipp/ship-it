# Validate Spec: adversarial audit before slicing

Read a published spec as an outside skeptic.
Verify that the specification is crystal clear on high-level design against the current state of the project.
Try to break the specification before anyone slices tickets or writes code.

## Inputs

Read the requirements, the spec under audit, and prior spec comments first, then verify every named module boundary, shared contract, and system invariant against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`; skip reading the request issue body when `<spec-number> == n`), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body, and the active codebase.
- **Artifact under audit**: The spec body (`gh issue view <spec> --json body --jq .body`).
- **Prior comments**: Spec comments fetched once via `gh issue view <spec> --json comments --jq '[.comments[].body]'` and filtered in-agent for prior `## Validation: Spec`, `## Answers`, and `## Circuit Breaker Reset` comments.

## Zero-assumption rule

- **Spec altitude**: Restrict the two-implementer test, Blockers, and `Clarifying Questions` to cross-component observable behavior where two implementers could disagree on module boundaries, shared contracts, data models, system invariants, or high-level test seams. Omit slice-local observations (internal functions, caller inventories, file paths, CLI flags, or low-level error checklists) or record them only as advisory Warnings without withholding approval.
- **Deferred items**: Exempt `- **Deferred to slicing**:` entries under `## Implementation Decisions` from `Clarifying Questions` and design-gap Blockers. Raise a Blocker only when a deferred entry directly contradicts stated requirements, settled map decisions, or active code.
- **Architectural choice escalation**: When an unwritten choice at spec altitude has an unambiguous active-code default that does not conflict with stated requirements or settled decisions, record an advisory Warning naming the inherited default and permit `**Verdict**: Validated`. Reserve withholding `Clarifying Questions` for open spec-altitude choices lacking an unambiguous default or conflicting with stated requirements or settled decisions. Reserve slice-local questions for ticket-set validation or `- **Deferred to slicing**:`.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with stated requirements or settled decisions, or single-outcome cross-component gaps at spec altitude where requirements and code dictate one resolution. Omit slice-local gaps or record them only as advisory Warnings, reserving slice-local gaps for ticket-set validation or `- **Deferred to slicing**:`.
- **Monotonic re-validation (pass 2+)**: Trigger monotonic rules whenever the comment query returns at least one prior `## Validation: Spec` report. Never re-raise items settled via `## Answers`, `## Circuit Breaker Reset`, or spec edits. Also skip `- **Deferred to slicing**:` entries and previously passing items. Restrict new Blockers and `Clarifying Questions` on pass 2 and later to unresolved prior findings, claims added or edited since the prior `## Validation: Spec` report, or concrete factual regressions and contradictions. Record belated non-regression notes on untouched prose at most as advisory Warnings.
- **Zero inference**: Never infer intent, rationalize the author's choice, or edit the spec. Report unambiguous active-code defaults explicitly as advisory Warnings instead of filling gaps silently.
- **Source fidelity**: Verify that the spec honors every requirement and settled decision in the source issue or map body without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, a decision that quietly reverses an earlier one, or a `- **Deferred to slicing**:` entry that directly contradicts stated requirements, settled map decisions, or active code.
- **Codebase alignment**: Check cross-component module boundaries, shared contracts, data models, and system invariants against active code without requiring slice-local caller inventories or symbol lists. Record unambiguous, non-conflicting active-code defaults for unwritten spec-altitude choices as advisory Warnings rather than `Clarifying Questions`.
- **Design completeness**: Check cross-component observable behavior across module boundaries, shared contracts, data models, and system invariants without requiring slice-local internal functions, per-caller touchpoints, CLI flags, or low-level error checklists. Apply the deferred-item exemption and monotonic rules for pass 2 and later from `## Zero-assumption rule`.
- **Repetition and bloat**: Cross-section restatement within the spec, or walls of text violating [writing.md](writing.md) Rule 7. Classify Rule 7 repetition as Warning unless restated text contradicts canonical sources.
- **Traceability**: Unrequested behavior, or a source requirement with no coverage in the spec. Exempt `- **Deferred to slicing**:` entries from design-gap Blockers and `Clarifying Questions`, raising a Blocker only when a deferred entry directly contradicts stated requirements, settled map decisions, or active code. On pass 2 and later, skip requirements verified as covered in prior passes unless edited or regressed.
- **Verification**: Check high-level test seams across components (plus `Root cause` and `Reproduction seam` on `fix` specs) without requiring slice-local error checklists or low-level failure paths, applying monotonic rules on pass 2 and later.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The spec (or a `- **Deferred to slicing**:` entry) directly contradicts stated requirements, settled map decisions, or active code, repeats contracts with conflicting details, or leaves cross-component gaps in module boundaries, shared contracts, data models, system invariants, or high-level test seams (plus `Root cause` and `Reproduction seam` on `fix` specs), subject to the monotonic rules for pass 2 and later. | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style improvements, prose polish, unwritten spec-altitude choices with an unambiguous non-conflicting active-code default (naming the inherited default in the `W-<n>` bullet), optional slice-local observations, or belated non-regression notes on untouched prose during pass 2 and later. | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | An open cross-component choice on scope, product behavior, module boundaries, shared contracts, data models, or system invariants lacks an unambiguous active-code default or conflicts with stated requirements or settled decisions, subject to the deferred-item exemption and monotonic rules for pass 2 and later. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a Blocker to avoid delaying work.

## Report

When findings exist, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately:

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

Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
Never output `- None` placeholder subsections.
Specify `**Verdict**: Validated` for warning-only reports.
When reporting an active-code default as a Warning, name the inherited default in the corresponding `W-<n>` bullet.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Warnings, no Blocker or Question | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` |
| Clean pass (zero findings) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: None` (skip posting a report comment) |

Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
