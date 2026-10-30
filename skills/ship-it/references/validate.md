# Validate: adversarial audit before implementation

Read a published spec or ticket set as an outside skeptic.
Verify that the specification and tickets are crystal clear on implementation against the current state of the project.
Try to break the artifact before anyone turns the design into code.
Validate every spec and every ticket set without exception.

## Inputs

Read the requirements and the artifact under audit first, then verify every named touchpoint, module boundary, symbol contract, and caller against active code using targeted search.
Ground every check in these inputs:

| Artifact | Requirements | Artifact under audit |
| :--- | :--- | :--- |
| Spec | The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), and the active codebase | The spec body (`gh issue view <spec> --json body --jq .body`) |
| Ticket set | The parent spec body (`gh issue view <spec> --json body --jq .body`) and the active codebase | Every open ticket body (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state open --limit 100 --json number,title,body,labels`) |

## Zero-assumption rule

- Apply the two-implementer test: when two isolated implementers reading the artifact and codebase could make different architectural or low-level design choices, the artifact has a gap.
- When the author or slicer can resolve a gap from existing requirements and the codebase, record a Blocker.
- When resolving a gap requires an unsettled product, scope, or architectural decision from the user, record a Question.
- Never infer intent, fill a gap, or rationalize the author's choice.
- Verify that the artifact honors every requirement and settled decision in the source issue, map body, or parent spec body without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a decision that quietly reverses an earlier one.
- **Codebase alignment**: References to nonexistent modules or symbols, conflicts with existing architecture, or missed touchpoints in active code.
- **Design completeness**: Specs missing cross-cutting context, module boundaries, shared contracts, or invariants; tickets missing concrete `Touchpoints`, actionable slice-local `Design deltas` (including inter-slice transition boundaries when sibling tickets touch the same files or follow `expand → migrate → contract`), or edge-case checks. Flag bare pointer-only `Design deltas` (such as `"Apply rules in Spec § ..."`) as Blockers.
- **Repetition and bloat**: Cross-section restatement within an artifact, verbatim copying of multi-line parent spec contracts into tickets instead of citing `Spec § <section>` and stating slice-local deltas, or walls of text violating [writing.md](writing.md) Rule 7.
- **Traceability**: Unrequested behavior, or a requirement with no coverage.
- **Verification**: Untestable acceptance criteria, unhandled errors, or missing failure paths.
- **Ticket slicing and seams**: Horizontal slices, broken intermediate states between tickets, sequencing preferences disguised as blockers, or tickets exceeding context boundaries. Audit ticket sets against qualitative granularity thresholds and the five slicing anti-patterns (`Docs-Tail`, `Config-Preamble`, `Horizontal Slice`, `Orphaned Scaffolding`, and `Micro-Refactor`). Flag trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Tickets assigning tiers outside `low`, `medium`, or `high`, or rationales failing to justify scope, touched layers, and reasoning depth. When an open ticket omits complexity, apply the fallback default to `high` instead of recording a Blocker.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The artifact is wrong, contradicts a requirement or the codebase, leaves gaps in the high-level or low-level design, uses bare pointer-only `Design deltas`, repeats contracts across sections or from spec to ticket, assigns a mismatched complexity tier, or exhibits a slicing anti-pattern. | Applies `ship-it:changes-requested`. |
| **Question** | A user decision on scope, product behavior, or unsettled architecture is unwritten. | Withholds approval until answered. |
| **Nit** | The artifact is correct but improves with a small wording or formatting fix, or by trimming minor phrasing redundancy. | Fix in place. |

Do not inflate Nits into Questions to appear thorough.
Do not downgrade a Blocker to avoid delaying work.
Never pass an underspecified artifact by fixing only prose Nits.

## Report

When findings or in-place resolutions exist, post the report on the **spec** for both artifact types (`gh issue comment <spec> --body-file <file>`):

```markdown
## Validation: <Spec | Ticket set>

### Blockers
- **B-1** [<section or #ticket>]: <defect and why it blocks>

### Clarifying Questions
- **Q-1** [<section or #ticket>]: <question>

### In-place Resolutions
- **R-1** [<section or #ticket>]: <nit fixed in the issue body>

**Verdict**: Validated | Changes requested | Questions pending
```

Render only subsections that contain findings (`### Blockers`, `### Clarifying Questions`, `### In-place Resolutions`).
Never output `- None` placeholder subsections.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits only | Add `ship-it:validated` to the spec, or to every open ticket for a ticket set. | `approved` after posting the sparse report with `### In-place Resolutions` |
| Clean pass (zero Blockers, Questions, or Nits) | Add `ship-it:validated` to the spec, or to every open ticket for a ticket set. | `approved` with `Evidence: None` (skip posting a report comment) |

Fix Nits directly in the issue body via surgical body edit (`gh issue view <n> --json body --jq .body` to a temporary file, targeted edit preserving untouched sections and tasklists, `gh issue edit <n> --body-file <file>`) and record them under `### In-place Resolutions`.
Never rewrite structure or add missing requirements; those are Blockers.
