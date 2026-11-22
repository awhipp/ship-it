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

- **Spec altitude**: Restrict the two-implementer test, Blockers, and `Clarifying Questions` to cross-component observable behavior where two implementers could disagree on module boundaries, shared contracts (including public CLI contracts), data models, system invariants, or high-level test seams. Omit slice-local observations (internal functions, caller inventories, file paths, internal or slice-local CLI flags, or low-level error checklists) or record them only as advisory Warnings without withholding approval.
- **Deferred items**: Exempt `- **Deferred to slicing**:` entries under `## Implementation Decisions` from `Clarifying Questions` and design-gap Blockers. Raise a Blocker only when a deferred entry directly contradicts stated requirements, settled map decisions, or active code.
- **Architectural choice escalation**: When an unwritten spec-altitude choice has an unambiguous active-code default that does not conflict with stated requirements or settled decisions, record an advisory Warning naming both the inherited default and its active-code anchor (module or symbol), and permit `**Verdict**: Validated`. Reserve withholding `Clarifying Questions` for open spec-altitude choices lacking an unambiguous default or conflicting with stated requirements or settled decisions. Reserve slice-local questions for ticket-set validation or `- **Deferred to slicing**:`.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with stated requirements or settled decisions, or single-outcome cross-component gaps at spec altitude where requirements and code dictate one resolution. Omit slice-local gaps or record them as advisory Warnings, reserving them for ticket-set validation or `- **Deferred to slicing**:`.
- **Monotonic re-validation (pass 2+)**: Trigger monotonic rules whenever the comment query returns at least one prior `## Validation: Spec` report:
   - **Active edit surface**: Treat sections and claims cited in `### Blockers` or `### Clarifying Questions` of prior `## Validation: Spec` reports, or in `## Answers` or `## Circuit Breaker Reset` comments, as the active edit surface. Leave warning-only and uncited sections as untouched prose unless a concrete factual contradiction against active code or source requirements appears. A broad rescope recorded via `## Circuit Breaker Reset` lifts monotonic shielding on rewritten sections covered by that reset.
   - **Excluded items**: Never re-raise previously passing items or items settled via `## Answers`, `## Circuit Breaker Reset`, or spec edits. Keep `- **Deferred to slicing**:` entries exempt from `Clarifying Questions` and design-gap Blockers unless directly contradicting stated requirements, settled map decisions, or active code.
   - **Allowed Blockers and Questions**: Restrict new Blockers and `Clarifying Questions` on pass 2 and later to unresolved prior findings, claims on the active edit surface (including rewritten sections covered by a broad rescope under `## Circuit Breaker Reset`), or concrete factual regressions and contradictions.
   - **Untouched prose**: Record belated non-regression notes on untouched prose at most as advisory Warnings.
- **Zero inference**: Never infer intent, rationalize the author's choice, or edit the spec. Report unambiguous active-code defaults explicitly as advisory Warnings instead of filling gaps silently.
- **Source fidelity**: Verify that the spec honors every requirement and settled decision in the source issue or map body without contradiction.

## What to look for

- **Contradictions**: Check for conflicting claims, reversed decisions, or contradictions against active code, stated requirements, or settled map decisions across the spec and `- **Deferred to slicing**:` entries.
- **Codebase alignment**: Check cross-component module boundaries, shared contracts, data models, and system invariants against active code per `Spec altitude` and `Architectural choice escalation` in `## Zero-assumption rule`.
- **Design completeness**: Check cross-component observable behavior across boundaries, shared contracts, data models, and system invariants per `Spec altitude`, `Deferred items`, and `Monotonic re-validation (pass 2+)` in `## Zero-assumption rule`.
- **Repetition and bloat**: Check for cross-section restatement or walls of text violating [writing.md](writing.md) Rule 7, classifying non-conflicting repetition as `Warning`.
- **Traceability**: Check for unrequested behavior or uncovered source requirements per `Deferred items` and `Monotonic re-validation (pass 2+)` in `## Zero-assumption rule`.
- **Verification**: Check high-level test seams across components (plus `Root cause` and `Reproduction seam` on `fix` specs) per `Spec altitude` and `Monotonic re-validation (pass 2+)` in `## Zero-assumption rule`.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A spec claim or `- **Deferred to slicing**:` entry contradicts stated requirements, settled map decisions, or active code, conflicts internally, or leaves a qualifying cross-component gap under `## Zero-assumption rule` (including `Root cause` or `Reproduction seam` on `fix` specs). | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style polish, optional slice-local observations, qualifying active-code defaults, or belated non-regression notes on untouched prose under `## Zero-assumption rule`. | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | An open cross-component choice on scope, product behavior, or architecture lacks an unambiguous active-code default or conflicts with stated requirements or settled decisions under `## Zero-assumption rule`. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a qualifying Blocker to avoid delaying work.

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

- **Populated subsections**: Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
- **Placeholder omission**: Omit `- None` placeholder subsections.
- **Warning-only verdict**: Specify `**Verdict**: Validated` for warning-only reports.
- **Inherited defaults**: When reporting an active-code default as a Warning, name both the inherited default and its active-code anchor (module or symbol) in the corresponding `W-<n>` bullet.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Warnings, no Blocker or Question | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` |
| Clean pass (zero findings) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: None` (skip posting a report comment) |

Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
