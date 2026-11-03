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
| Spec | The spec's `## Source` (including the body of any referenced request issue `#<n>` via `gh issue view <n> --json body --jq .body`), the linked map body when `Map` is not `None` (`gh issue view <map> --json body --jq .body`), `## Deferred to Slicing` comments on the spec, and the active codebase | The spec body (`gh issue view <spec> --json body --jq .body`) |
| Ticket set | The parent spec body (`gh issue view <spec> --json body --jq .body`), `## Deferred to Slicing` comments on the parent spec, completed closed tickets (`state: "CLOSED"` with `stateReason: "COMPLETED"`), and active code on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs) | Every open ticket body from `gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state all --limit 100 --json number,title,body,labels,state,stateReason` (keeping titles starting with `[<slug>]`) |

Query `## Deferred to Slicing` comments on the spec via `gh issue view <spec> --json comments --jq '[.comments[].body | select(index(({Deferred:1}|keys[])) == 3)]'`.

## Zero-assumption rule

- **Spec altitude**: Restrict the two-implementer test for `Target: spec` to cross-cutting architecture, shared contracts, module boundaries, system invariants, and high-level test seams.
- **Ticket-set altitude**: Reserve checks on low-level design, slice-local helpers, caller edge cases, and low-level agreement between implementers for `Target: ticket-set`.
- **Architectural choice escalation**: Record a Question whenever an unwritten choice on behavior, scope, boundaries, contracts, or state transitions has multiple valid designs. Raise a Question even when active code suggests a plausible default.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with settled decisions, or single-outcome gaps where requirements and code dictate one resolution.
- **Zero inference**: Never infer intent, fill a gap, or rationalize the author's choice.
- **Source fidelity**: Verify that the artifact honors every requirement and settled decision in the source issue, map body, or parent spec body without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a decision that quietly reverses an earlier one.
- **Codebase alignment**: References to nonexistent modules or symbols, conflicts with existing architecture, or missed touchpoints in active code.
- **Design completeness**: Specs missing cross-cutting context, module boundaries, shared contracts, or invariants; tickets missing concrete `Touchpoints`, actionable slice-local `Design deltas` (including inter-slice transition boundaries when sibling tickets touch the same files or follow `expand → migrate → contract`), or edge-case checks. Flag bare pointer-only `Design deltas` (such as `"Apply rules in Spec § ..."`) as Blockers.
- **Repetition and bloat**: Cross-section restatement within an artifact, verbatim copying of multi-line parent spec contracts into tickets instead of citing `Spec § <section>` and stating slice-local deltas, or walls of text violating [writing.md](writing.md) Rule 7.
- **Traceability**: Unrequested behavior, or a requirement with no coverage across open tickets and `COMPLETED` closed tickets. For `Target: spec`, skip items listed in `## Deferred to Slicing` comments on the spec. For `Target: ticket-set`, verify coverage of all deferred items from `## Deferred to Slicing` comments across the ticket set.
- **Verification**: Untestable acceptance criteria, unhandled errors, or missing failure paths.
- **Ticket slicing and seams**: Horizontal slices, broken intermediate states between tickets, sequencing preferences disguised as blockers, or tickets exceeding context boundaries. Audit ticket sets against qualitative granularity thresholds and the five slicing anti-patterns (`Docs-Tail`, `Config-Preamble`, `Horizontal Slice`, `Orphaned Scaffolding`, and `Micro-Refactor`). Flag trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Tickets assigning tiers outside `low`, `medium`, or `high`, or rationales failing to justify scope, touched layers, and reasoning depth. When an open ticket omits complexity, apply the fallback default to `high` instead of recording a Blocker.
- **Bug tickets**: Audit tickets bearing `ship-it:bug` against the bug ticket template ([tickets.md](tickets.md#bug-ticket-template)): `Part of #<spec-id>`, `## Complexity`, `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`, and `## Blocked by`. Verify consistency with the parent spec, and skip low-level design, slicing, and full-spec coverage checks for bug tickets.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | The artifact is wrong, contradicts a requirement or the codebase, leaves gaps in the high-level design, the low-level design, or the root cause and reproduction seam of a bug ticket, uses bare pointer-only `Design deltas`, repeats contracts across sections or from spec to ticket, assigns a mismatched complexity tier, or exhibits a slicing anti-pattern. | Applies `ship-it:changes-requested`. |
| **Question** | A user decision on scope, product behavior, or unsettled architecture is unwritten, or an unwritten choice has multiple valid designs. | Withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a Blocker to avoid delaying work.

## Report

When findings exist, post the report on the **spec** for both artifact types (`gh issue comment <spec> --body-file <file>`):

```markdown
## Validation: <Spec | Ticket set>

### Blockers
- **B-1** [<section or #ticket>]: <defect and why it blocks>

### Clarifying Questions
- **Q-1** [<section or #ticket>]: <question>

**Verdict**: Validated | Changes requested | Questions pending
```

Render only subsections that contain findings (`### Blockers`, `### Clarifying Questions`).
Never output `- None` placeholder subsections.

## Outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to the spec. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Clean pass (zero Blockers or Questions) | Add `ship-it:validated` to the spec, or to every open ticket for a ticket set. | `approved` with `Evidence: None` (skip posting a report comment) |
