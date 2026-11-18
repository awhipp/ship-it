# Validate Spec: adversarial audit before slicing

Read a published spec as an outside skeptic.
Verify that the specification is crystal clear on high-level design against the current state of the project.
Try to break the specification before anyone slices tickets or writes code.

## Inputs

Read the requirements and the spec under audit first, then verify every named module boundary, shared contract, and system invariant against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`; skip reading the request issue body when `<spec-number> == n`), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body, and the active codebase.
- **Artifact under audit**: The spec body (`gh issue view <spec> --json body --jq .body`).

## Zero-assumption rule

- **Spec altitude**: Restrict the two-implementer test to cross-cutting architecture, shared contracts, module boundaries, system invariants, and high-level test seams.
- **Architectural choice escalation**: Record a Question whenever an unwritten choice at spec altitude has multiple valid designs, even when active code suggests a plausible default. Restrict Questions to spec altitude, product behavior, and scope; reserve slice-local questions for ticket-set validation or `- **Deferred to slicing**:`.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with settled decisions, or single-outcome gaps at spec altitude where requirements and code dictate one resolution. Reserve slice-local gaps for ticket-set validation or `- **Deferred to slicing**:`.
- **Zero inference**: Never infer intent, fill a gap, or rationalize the author's choice.
- **Source fidelity**: Verify that the spec honors every requirement and settled decision in the source issue or map body without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a decision that quietly reverses an earlier one.
- **Codebase alignment**: Check high-level module alignment and shared contracts against active code without requiring exhaustive caller lists or slice-local symbol inventories.
- **Design completeness**: Check cross-cutting context, module boundaries, shared contracts, and system invariants without requiring slice-local helpers, per-caller touchpoints, or low-level error checklists.
- **Repetition and bloat**: Cross-section restatement within the spec, or walls of text violating [writing.md](writing.md) Rule 7. Classify Rule 7 repetition as Warning unless restated text contradicts canonical sources.
- **Traceability**: Unrequested behavior, or a source requirement with no coverage in the spec. Skip items listed under `- **Deferred to slicing**:` in the spec body.
- **Verification**: Check high-level test seams (plus `Root cause` and `Reproduction seam` on `fix` specs) without requiring slice-local error checklists or low-level failure paths.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The spec contradicts a requirement or active code, repeats contracts with conflicting details, or leaves gaps in high-level design, module boundaries, shared contracts, system invariants, or high-level test seams (plus `Root cause` and `Reproduction seam` on `fix` specs). | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style improvements, or prose polish. | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | A user decision on scope, product behavior, or cross-cutting architecture is unwritten, or a high-level design choice has multiple valid designs. | Withholds approval until answered. |

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

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Warnings, no Blocker or Question | Add `ship-it:validated` to the spec. | `approved` with `Evidence: <comment-url>` |
| Clean pass (zero findings) | Add `ship-it:validated` to the spec. | `approved` with `Evidence: None` (skip posting a report comment) |

Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
