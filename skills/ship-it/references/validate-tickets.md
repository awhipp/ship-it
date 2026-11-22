# Validate Tickets: adversarial audit before execution

Read a published ticket set as an outside skeptic.
Verify that the tickets are crystal clear on low-level implementation against the parent specification and the current state of the project.
Try to break the ticket set before anyone turns the slices into code.

## Inputs

Read the requirements and the ticket set under audit first, then verify every named touchpoint, module boundary, symbol contract, and caller against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The parent spec body (`gh issue view <spec> --json body --jq .body`), `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body, completed closed tickets (`state: "CLOSED"` with `stateReason: "COMPLETED"`), and active code on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs).
- **Artifact under audit**: Every open ticket body from `gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state all --limit 100 --json number,title,body,labels,state,stateReason`. Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`, and record any truncation warning under `### Warnings`.

## Zero-assumption rule

- **Ticket-set altitude**: Audit low-level design, slice-local helpers, caller edge cases, and low-level agreement between implementers across the open tickets.
- **Architectural choice escalation**: Record a Question whenever an unwritten choice at ticket-set altitude has multiple valid designs, even when active code suggests a plausible default.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with the parent spec or settled decisions, or single-outcome gaps at ticket-set altitude where requirements and code dictate one resolution.
- **Zero inference**: Never infer intent, fill a gap, or rationalize the author's choice.
- **Source fidelity**: Verify that the ticket set honors every requirement and settled decision in the parent spec body without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a ticket decision that quietly reverses the parent spec or an earlier slice.
- **Codebase alignment**: Check every named file, symbol signature, and caller touchpoint in active code.
- **Design completeness**: Check that every ticket defines concrete `Touchpoints`, actionable slice-local `Design deltas` (including inter-slice boundaries when sibling tickets touch the same files or follow `expand → migrate → contract`), and caller edge-case checks. Flag bare pointer-only `Design deltas` (such as `"Apply rules in Spec § ..."`) as Blockers.
- **Repetition and bloat**: Cross-section restatement within a ticket, verbatim copying of multi-line parent spec contracts into tickets instead of citing `Spec § <section>` and stating slice-local deltas, or walls of text violating [writing.md](writing.md) Rule 7. Classify Rule 7 repetition as Warning unless restated text contradicts canonical sources.
- **Traceability**: Unrequested behavior, or a requirement (including all `- **Deferred to slicing**:` items from the spec body) with no coverage across open tickets and `COMPLETED` closed tickets.
- **Verification**: Check every acceptance criterion, unhandled error, and low-level failure path across the tickets.
- **Ticket slicing and seams**: Horizontal slices, broken intermediate states between tickets, sequencing preferences disguised as blockers, or tickets exceeding context boundaries. Audit ticket sets against qualitative granularity thresholds and the five slicing anti-patterns (`Docs-Tail`, `Config-Preamble`, `Horizontal Slice`, `Orphaned Scaffolding`, and `Micro-Refactor`). Flag trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Tickets assigning tiers outside `low`, `medium`, or `high`, tiers that contradict the [Complexity taxonomy](tickets.md#complexity-taxonomy), or rationales failing to justify scope, touched layers, and reasoning depth. When an open ticket omits complexity, apply the fallback default to `high` instead of recording a Blocker.
- **Bug tickets**: Audit tickets bearing `ship-it:bug` against the bug ticket template ([bug-prep.md](bug-prep.md#bug-ticket-template)): `Part of #<spec-id>`, `## Complexity`, `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`, and `## Blocked by`. Verify consistency with the parent spec, and skip low-level design, slicing, and full-spec coverage checks for bug tickets.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A ticket contradicts a requirement or active code, repeats contracts with conflicting details, leaves gaps in low-level design, slice-local touchpoints, caller edge cases, or the root cause and reproduction seam of a bug ticket, uses bare pointer-only `Design deltas`, assigns a tier that contradicts the [Complexity taxonomy](tickets.md#complexity-taxonomy), or exhibits a slicing anti-pattern. | Applies `ship-it:changes-requested`. |
| **Warning** | Non-conflicting repetition, style improvements, or prose polish. | Advisory; applies `ship-it:validated` and permits progression without revalidation. |
| **Question** | An unwritten choice on low-level design, slice-local touchpoints, or caller edge cases has multiple valid designs. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a Blocker to avoid delaying work.

## Report

When findings exist, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately:

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

Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
Never output `- None` placeholder subsections.
Specify `**Verdict**: Validated` for warning-only reports.
Write the `**Verdict**:` line verbatim on line 2, directly under the heading, because the conductor's circuit breaker reads verdicts from each comment's first 120 characters.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Warnings (including `--limit 100` truncation), no Blocker or Question | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: <comment-url>` |
| Clean pass (zero findings) | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: None` (skip posting a report comment) |

When a `--limit 100` query returns 100 items with zero other findings, post the `**Verdict**: Validated` report containing `### Warnings` with the warning in [writing.md](writing.md#bounded-search-truncation) and return `Evidence: <comment-url>` instead of `Evidence: None`.
Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
