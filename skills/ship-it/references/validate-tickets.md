# Validate Tickets: adversarial audit before execution

Read a published ticket set as an outside skeptic.
Verify that the tickets are crystal clear on low-level implementation against the parent specification and the current state of the project.
Try to break the ticket set before anyone turns the slices into code.

## Inputs

Read the requirements, the ticket set under audit, and prior spec comments first, then verify every named touchpoint, module boundary, symbol contract, and caller against active code using targeted search.
Ground every check in these inputs:

- **Requirements**: The parent spec body (`gh issue view <spec> --json body --jq .body`), `- **Decision Register**:` and `- **Deferred to slicing**:` entries under `## Implementation Decisions` in the spec body, completed closed tickets (`state: "CLOSED"` with `stateReason: "COMPLETED"`), and active code on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs).
- **Repository governance**: Inspect the target repository's recorded instruction files (such as contributor or agent instruction files) and Architecture Decision Records (ADRs) or decision logs via read-only git commands on `<branch>` when present on `origin` (or `origin/<default-branch>` otherwise, after fetching those target refs). Audit these governance files on pass 1, and recheck them on pass 2+ when unvalidated or neighbor tickets under `Scoped deep audit` touch governed invariants.
- **Artifact under audit**: Every open ticket body from `gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state all --limit 100 --json number,title,body,labels,blockedBy,state,stateReason`. Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`, and record any truncation warning under `### Warnings`.
- **Prior comments**: Spec comments fetched from pass 1 onward via `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Ticket set") or startswith("## Answers") or startswith("## Circuit Breaker Reset") or startswith("## Auto-resolved Decisions")) | .body]'`.

## Zero-assumption rule

- **Ticket-set altitude**: Audit low-level design, slice-local helpers, caller edge cases, and low-level agreement between implementers across the open tickets.
- **Architectural choice escalation**: When an unwritten choice at ticket-set altitude has an unambiguous active-code or spec-implied default (including `- **Decision Register**:` entries) that does not conflict with stated requirements or settled decisions, record an advisory Warning naming both the inherited default and its active-code or spec anchor, and permit `ship-it:validated`. Record a Question only when an unwritten choice lacks an unambiguous default or settled `## Auto-resolved Decisions` entry and admits multiple valid designs, or conflicts with stated requirements or settled decisions.
- **Single-outcome gaps**: Reserve Blocker for factual drift against active code, contradictions with the parent spec, recorded repository invariants, or settled decisions (including `## Auto-resolved Decisions`, `## Answers`, and `## Circuit Breaker Reset`), or single-outcome gaps at ticket-set altitude where requirements and code dictate one resolution.
- **Delta-audit scope (pass 2+)**: Apply [isolation.md](isolation.md#delta-audit-directive) whenever the dispatch packet includes `Delta-audit directive` (`- **Delta audit**:`) or at least one prior non-approved `## Validation: Ticket set` report exists in the active cycle (running from the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Validated` report, whichever is more recent):
  - **Scoped deep audit**: Scope remaining deep audits to unvalidated open tickets (lacking `ship-it:validated`) and their open direct dependency neighbors (`blockedBy` or `blocks`, falling back to `## Blocked by` tasklists per [tickets.md](tickets.md#relationships) when native `blockedBy` is empty).
  - **Untouched validated tickets**: Leave untouched `ship-it:validated` tickets outside `Scoped deep audit` exempt from deep re-audits, and downgrade belated non-regression notes on untouched `ship-it:validated` tickets to advisory Warnings without revoking `ship-it:validated`.
  - **Truncation Warning exception**: Retain the `--limit 100` truncation warning in [writing.md](writing.md#bounded-search-truncation) whenever a query returns 100 results, exempting that warning from verbatim Warning suppression under [isolation.md](isolation.md#delta-audit-directive).
- **Command-backed Blockers**: Observe output from a read-only command executed in the current pass before raising any Blocker asserting a repository fact (file presence, path, symbol, caller, or git ref) or environment fact (tool version, CLI behavior, or command failure). Cite that observed output in the Blocker finding, because unverified factual claims trigger false-positive rework loops.
- **Zero inference**: Never infer intent, fill a gap, or edit ticket bodies. Report unambiguous active-code or spec-implied defaults as advisory Warnings instead of filling gaps silently, and honor settled choices in `## Auto-resolved Decisions`, `## Answers`, and `## Circuit Breaker Reset`.
- **Source fidelity**: Verify that the ticket set honors every requirement and settled decision in the parent spec body, `## Answers`, `## Circuit Breaker Reset`, and `## Auto-resolved Decisions` without contradiction.

## What to look for

- **Contradictions**: Two statements that cannot both be true, or a ticket decision that quietly reverses the parent spec, recorded repository invariants, settled repository decisions, an earlier slice, or settled `## Auto-resolved Decisions`, `## Answers`, or `## Circuit Breaker Reset` entries.
- **Codebase alignment**: Check every named file, symbol signature, and caller touchpoint in active code.
- **Repository governance**: Audit the ticket set against the target repository's recorded instruction files and Architecture Decision Records (ADRs) or decision logs on pass 1, and on pass 2+ when unvalidated or neighbor tickets under `Scoped deep audit` touch governed invariants. Classify contradictions against recorded invariants or settled decisions as Blockers.
- **Design completeness**: Check that every ticket defines concrete `Touchpoints`, actionable slice-local `Design deltas` (including inter-slice boundaries when sibling tickets touch the same files or follow `expand → migrate → contract`), and caller edge-case checks. Flag bare pointer-only `Design deltas` (such as `"Apply rules in Spec § ..."`) as Blockers.
- **Repetition and bloat**: Enforce section-scoped precedence per [writing.md](writing.md#application-across-artifacts): allow self-contained verification inside `## Acceptance criteria` while preserving Rule 6 controlled vocabulary, and flag cross-section restatement inside `## Slice goal` or verbatim multi-line copying of spec-owned contracts inside `## Low-level design` instead of citing `Spec § <section>`. Classify non-conflicting repetition under Rule 7 as Warning unless restated text contradicts canonical sources. Exempt valid `## Consolidation checklist` sections from bloat and repetition warnings under Rule 7.
- **Traceability**: On pass 1 (excluding standalone `ship-it:bug` audits exempted under `Bug tickets`), map every `## Scope and Behaviors` item, every `- **Decision Register**:` entry, and every `- **Deferred to slicing**:` entry in `<spec>` to at least one open ticket or `COMPLETED` closed ticket. Verify `## Out of Scope` boundaries across the ticket set, and flag unrequested behavior, out-of-scope additions, or unmapped spec items as Blockers. On pass 2+, restrict new traceability Blockers to `Delta-audit scope (pass 2+)` and regressions introduced since the prior pass.
- **Verification**: Check every acceptance criterion, unhandled error, and low-level failure path across the tickets.
- **Consolidation checklists**: Require `## Consolidation checklist` strictly between `## Acceptance criteria` and `## Blocked by` whenever a feature ticket's `## Acceptance criteria` quantify over an enumerable source set (`every`, `all`, or `each` without naming every member inside `## Acceptance criteria`), listing every member from active code and the spec. Raise a Blocker when a qualifying feature ticket omits, misplaces, or leaves incomplete `## Consolidation checklist`, or when any `ship-it:bug` ticket includes `## Consolidation checklist`. Treat feature tickets bearing `ship-it:reviewed` or `ship-it:changes-requested` as post-review; when `- [x]` appears inside `## Consolidation checklist` on a feature ticket lacking both labels, run `gh issue view <n> --json comments --jq '[.comments[].body[:120]]'` and raise a command-backed Blocker for pre-checked boxes only when a prior `## Review: Ticket` report is absent.
- **Ticket slicing and seams**: Audit ticket sets against [Granularity thresholds](tickets.md#granularity-thresholds) and the five [Slicing anti-patterns](tickets.md#slicing-anti-patterns) (`Docs-Tail`, `Config-Preamble`, `Horizontal Slice`, `Orphaned Scaffolding`, and `Micro-Refactor`), enforcing that anti-patterns outrank size-driven splits and complexity tiers never trigger splits unless the Upper Bound breaks and every resulting slice keeps a testable vertical seam. Flag slicing anti-patterns, broken intermediate states, or trivial standalone tickets lacking executable verification seams as Blockers requiring consolidation.
- **Complexity declarations**: Tickets assigning tiers outside `low`, `medium`, or `high`, tiers below the non-overlapping source-file bands excluding test files in [Complexity taxonomy](tickets.md#complexity-taxonomy) (preserving higher tiers justified by non-file dimensions), or rationales failing to justify scope, touched layers, and source-file or reasoning depth. Skip source-file band checks on `ship-it:bug` tickets, which omit `## Low-level design`. When an open ticket omits complexity, apply the fallback default to `high` instead of recording a Blocker.
- **Bug tickets**: Audit tickets bearing `ship-it:bug` against the bug ticket template ([bug-prep.md](bug-prep.md#bug-ticket-template)): `Part of #<spec-id>`, `## Complexity`, `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`, and `## Blocked by`. Verify consistency with the parent spec (including `## Out of Scope` boundaries), and skip low-level design, slicing, source-file band, and full-spec coverage checks for bug tickets.

## Severity

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | A ticket contradicts a requirement, settled repository or spec decision, recorded repository invariant, or active code, repeats contracts with conflicting details, introduces unrequested or `## Out of Scope` work, leaves an unmapped pass-1 spec item or gaps in low-level design, slice-local touchpoints, caller edge cases, or the root cause and reproduction seam of a bug ticket, uses bare pointer-only `Design deltas`, omits, misplaces, or leaves incomplete `## Consolidation checklist` on a qualifying feature ticket, pre-checks `- [x]` boxes inside `## Consolidation checklist` on a pre-review feature ticket (lacking `ship-it:reviewed`, `ship-it:changes-requested`, and any prior `## Review: Ticket` report per `Consolidation checklists`), attaches `## Consolidation checklist` to a `ship-it:bug` ticket, assigns a tier below its source-file band or contradicting the [Complexity taxonomy](tickets.md#complexity-taxonomy) (excluding source-file band checks on `ship-it:bug` tickets), or exhibits a slicing anti-pattern (excluding belated non-regression notes on untouched `ship-it:validated` tickets on pass 2+). Any Blocker asserting a repository or environment fact requires cited output from a read-only command executed in the current pass per `Command-backed Blockers`, because unverified factual claims trigger false-positive rework loops. | Applies `ship-it:changes-requested` to `<spec>` and revokes `ship-it:validated` on cited open tickets. |
| **Warning** | Non-conflicting repetition under Rule 7 (excluding valid `## Consolidation checklist` sections), style polish, unambiguous active-code or spec-implied defaults (including `- **Decision Register**:` entries) naming default and anchor, or belated non-regression notes on untouched `ship-it:validated` tickets on pass 2+ per [isolation.md](isolation.md#delta-audit-directive). | Advisory; permits `ship-it:validated` on open tickets lacking Blockers or Questions and permits progression without revalidation. |
| **Question** | An unwritten choice lacking an unambiguous active-code or spec-implied default and settled `## Auto-resolved Decisions` entry has multiple valid designs. | Revokes or withholds `ship-it:validated` on cited open tickets and withholds approval until answered. |

Validation is strictly read-only on issue bodies.
Do not downgrade a Blocker to avoid delaying work.

## Report

When findings remain after verbatim Warning suppression, post the report on the **spec** (`gh issue comment <spec> --body-file <file>`), deleting the temporary file immediately.
When zero findings remain on pass 2 onward (including after verbatim Warning suppression, with zero truncation warning) and a prior non-approved `## Validation: Ticket set` report exists in the current cycle, post a two-line `Validated` marker (`## Validation: Ticket set` and `**Verdict**: Validated`) on the **spec**:

```markdown
## Validation: Ticket set
**Verdict**: Validated | Changes requested | Questions pending
**Blockers**: <N>, **Reintroduced**: <M>

### Blockers
- **B-1** [#<ticket>]: <defect and why it blocks>

### Warnings
- **W-1** [#<ticket>]: <advisory observation and rationale>

### Clarifying Questions
- **Q-1** [#<ticket>]: <question>
```

- **Ticket citations**: Cite affected open ticket numbers (`[#<ticket>]` or `[#<n>, ...]`) on every `B-<n>`, `W-<n>`, and `Q-<n>` bullet. For ticket-set-wide findings, cite all affected open ticket numbers `[#<n>, ...]` rather than an issue-free tag so clean-ticket labeling never marks unresolved tickets `ship-it:validated`.
- **Populated subsections**: Render only subsections that contain findings (`### Blockers`, `### Warnings`, `### Clarifying Questions`).
- **Placeholder omission**: Omit `- None` placeholder subsections.
- **Warning-only verdict**: Specify `**Verdict**: Validated` for warning-only reports.
- **Exact header prefix**: Write `**Verdict**:` verbatim on line 2 and `**Blockers**: <N>, **Reintroduced**: <M>` on line 3 for `Changes requested` reports, keeping heading, verdict, and counts within 120 characters including CRLF newlines. Omit line 3 on `Validated` and `Questions pending` reports. Treat `<M>` as optional on pass 1 and default omitted `<M>` to `0`.
- **Inherited defaults**: When reporting an active-code or spec-implied default as a Warning, name both the inherited default and its active-code or spec anchor in the corresponding `W-<n>` bullet.

## Outcomes

On every pass, add `ship-it:validated` to every open ticket with zero Blockers and zero Questions (retaining the label when already present on untouched clean tickets), and remove `ship-it:validated` when present from any open ticket cited with a Blocker or Question (including pass 2 onward regressions).

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested` to `<spec>`; update per-ticket `ship-it:validated`. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | Update per-ticket `ship-it:validated` only. | `questions`, with `Evidence: <comment-url>` |
| Remaining Warnings (including `--limit 100` truncation), no Blocker or Question | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: <comment-url>` |
| Pass 1 clean approval (zero findings, zero truncation warning, no prior non-approved report in cycle) | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: None` (skip posting a comment) |
| Pass 2+ clean approval (zero findings remaining after prior non-approved report in cycle, zero truncation warning) | Add `ship-it:validated` to every open ticket in the ticket set. | `approved` with `Evidence: <comment-url>` (post two-line `Validated` marker) |

A validation cycle runs from the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Validated` report (whichever is more recent).
Preserve the four-line return block in [isolation.md](isolation.md) by recording warnings exclusively inside report comments linked via `Evidence: <comment-url>`.
