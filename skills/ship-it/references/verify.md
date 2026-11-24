# Verify: audit a spec, ticket set, ticket, or feature branch

## Shared rules

- **Read-only**: Never edit the artifact under audit, except the checklist toggles named below.
- **Zero assumption**: Record a Question when judging needs a fact the requirements omit. Never infer intent or assume edge-case safety.
- **Command-backed Blockers**: Before raising a Blocker that asserts a repository fact (file, path, symbol, caller, git ref) or environment fact (tool version, CLI behaviour, test failure), run a read-only command in this pass and cite its output.
- **Pass 1 is complete**: Map every spec behaviour, Decision Register entry, and Deferred entry to the artifact.
- **Pass 2+ is delta-only**: Apply the packet's [delta-audit directive](isolation.md#delta-audit-directive) and raise nothing outside it.
- **Altitude is a finding class**: Under `Target: spec`, low-level detail is a Blocker (file paths, internal functions, slice-local flags not registered in `## Decision Register`; public interface contracts and the `Reproduction seam` command are exempt). Under `Target: ticket-set`, missing low-level detail is a Blocker (no exact touchpoints, bare pointer-only `Design deltas`, criteria that are not self-contained). `Not applicable, because <reason>.` counts as content.
- **Prose**: Local writing guides override [Core Rules](writing.md#core-rules); non-overridden breaches are validation Warnings and review Nits. Ambiguity, contradictions, altitude defects, [Universal Testing Standards](writing.md#universal-testing-standards), [shell conventions](writing.md#shell-conventions), and [bounded-search truncation](writing.md#bounded-search-truncation) are Blockers.
- **Reports**: Render only populated subsections, each finding as `**<B|W|Q|S|D>-<n>** [<anchor>]: <text>`. Post the report as a comment and return its URL in `Evidence:` per [isolation.md](isolation.md#return-schema). A clean pass 1 validation posts nothing (`Evidence: None`). A clean pass 2+ validation posts only `## Validation: <Spec|Ticket set>` and `**Verdict**: Validated`.

### Severity and outcomes

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | Wrong, incomplete, unverified, or contradicts a requirement, settled decision, invariant, or active code. | Verdict `changes-requested` (list Questions too). Add `ship-it:changes-requested` to the spec, or the ticket under review. |
| **Question** | A needed fact is unwritten and has no unambiguous active-code or spec-implied default. | Verdict `questions` when no Blocker. No label. |
| **Warning** | Non-overridden Core Rules breach, non-conflicting repetition, an unambiguous inherited default (name default and anchor), or a belated note on unchanged surface. Validation only. | Advisory. |
| **Nit** | Non-overridden Core Rules breach, typo, or naming fix on a correct diff. Review only. | Report only. |

Warnings, Nits, or nothing: verdict `approved`, adding `ship-it:validated` (validation) or `ship-it:reviewed` (review).
`Target: ticket-set` labels per ticket: add `ship-it:validated` to every open ticket with no Blocker or Question, and remove it from any ticket cited with one. `ship-it:changes-requested` goes on `<spec>`.
The conductor closes reviewed tickets.

## Target: spec

- **Checks**: Contradictions with requirements, settled decisions, invariants, or active code on `origin/<default-branch>` (fetch it, and fall back to local `HEAD` with one Warning). Boundaries and contracts against active code and the repository's instruction files and ADRs. Source fidelity, traceability, test seams, and altitude.
- **Spec altitude**: Raise Blockers and Questions only where two implementers could disagree on a cross-component boundary, contract, or invariant. Exempt `## Deferred to slicing` unless an entry contradicts requirements, settled decisions, invariants, or code.
- **Unimplemented requirements**: Treat them as work to build. Raise a Blocker only when the spec misstates existing code.
- **Pass 2+**: Limit the edit surface to sections cited in the latest report and later `## Answers`.
- **Report**: `## Validation: Spec`, `**Verdict**: Validated | Changes requested | Questions pending`, then `### Blockers`, `### Warnings`, `### Clarifying Questions`, on `<spec>`.

## Target: ticket-set

- **Checks**:
  - Contradictions, and every named file, symbol, and caller against active code on `<branch>` or `origin/<default-branch>`.
  - Design completeness: concrete `Touchpoints`, actionable `Design deltas` including sibling-ticket boundaries, and caller edge cases.
  - Altitude: each spec-owned contract cited by `Spec §`, not restated.
  - Traceability: on pass 1, map every spec behaviour, Decision Register entry, and Deferred entry to an open or `COMPLETED` ticket, and flag unrequested work.
  - Slicing against [Granularity](tickets.md#granularity-thresholds) and [Slicing anti-patterns](tickets.md#slicing-anti-patterns), anti-patterns being Blockers.
  - Bug tickets follow the [bug template](tickets.md#bug-preparation) and skip design and slicing checks.
  - Consolidation checklists: required on a feature ticket whose criteria quantify over an unnamed enumerable set, forbidden on bug tickets. A pre-checked `- [x]` item is a Blocker only when no `ship-it:reviewed`, `ship-it:changes-requested`, or prior `## Review: Ticket` report exists.
- **Pass 2+**: Deep-audit only unvalidated open tickets and their open direct dependency neighbors per [Relationships](tickets.md#relationships). Downgrade belated notes on untouched `ship-it:validated` tickets to Warnings.
- **Report**: `## Validation: Ticket set` in the spec format, on `<spec>`, tagging every bullet `[#<n>, ...]` with each affected open ticket.

## Target: ticket

Audit one ticket's diff. Return `failed` when the packet's fixed point is missing or unresolvable, or `<fixed-point>...HEAD` is empty.

1. Fetch and check out `<branch>`, and survey `git --no-pager diff --stat <fixed-point>...HEAD`. On pass 2+, inspect `<prev-head-sha>..HEAD` (from the latest `**Audited**:` line) or the `## Rework` commits, falling back to the full range. When `HEAD` is unchanged, check folded body edits against the full range.
2. Check verification evidence in `## Handoff` and `## Rework`. Missing evidence is a Blocker.
3. Run the [diff axes](#diff-axes). Run the suites for touched modules, test the edge cases the ticket names, and sweep callers outside the touched files when a signature or shared contract changes.
4. Verify every `- [ ]` item and any regression of `- [x]` items in `## Consolidation checklist`, reporting each failure as a `### Spec` Blocker, and never approve while an item is unchecked. Toggle only verified items with one surgical `gh issue edit <n> --body-file <file>`.
5. Post `## Review: Ticket #<n>` on the ticket, including on a clean pass 1.

## Target: final

Audit the whole feature diff after every ticket closes. The fixed point is `git merge-base origin/<default-branch> HEAD`. Read no comments on closed tickets. Return `failed` when the merge-base does not resolve or the diff is empty.

1. Fetch and check out `<branch>`, then survey and inspect the diff as for `Target: ticket`, using `## Review: Final` for `<prev-head-sha>`.
2. Run the spec's `## Testing seams` and the closed tickets' criteria. Missing verification is a Blocker. On pass 2+, re-run only changed checks, fix-ticket criteria, and prior failures.
3. Run the [diff axes](#diff-axes), and check across tickets: the branch delivers every observable behaviour and Decision Register entry, no scaffolding or dead code remains, and names stay consistent. On pass 2+, also verify closed fix tickets and raise only uncleared findings, new commits, fix-ticket defects, and cross-ticket regressions.
4. Post `## Review: Final` on `<spec>`, with `ship-it:reviewed` on `<spec>` when approved.
5. On Blockers, create one fix ticket per Blocker, list them in `Issues:`, and link each with `gh issue edit <n> --parent <spec-id>`, ignoring errors. Titles read `[<slug>] Ticket: Fix <gist>`, labels `ship-it:ticket,ship-it:validated`. Use the [ticket template](tickets.md#ticket-template): `## Slice goal` quotes the Blocker and cites `Spec §`, and settled guidance goes into the criteria.
   Human approval at the fix-ticket halt fulfills the non-author validation check under Invariant 3 for fix tickets carrying `ship-it:validated`.

### Diff axes

- **Standards**: Read `CONTRIBUTING.md`, style guides, and linter configuration, skipping what linters catch. Local style guides override [Core Rules](writing.md#core-rules); non-overridden diff breaches are Nits. Always flag ticket-numbered files ([prohibition](writing.md#ticket-naming-prohibition)), ad-hoc test harnesses ([prohibition](writing.md#ad-hoc-test-harness-prohibition)), and transient references in code ([prohibition](writing.md#transient-reference-prohibition)) as Universal Testing Standards Blockers.
- **Spec**: Audit against the spec's cross-cutting design and the ticket's `## Low-level design` and `## Acceptance criteria` (bug tickets: `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`). Quote the requirement for each divergence.

Review report: `## Review: <Ticket #n | Final>`, `**Verdict**: Approved | Changes requested | Questions pending`, ``**Audited**: `<fixed-point>..<head-sha>` (<diff stat>; <verification summary>)``, then `### Standards` (S-n, `[<file#Lx>]`), `### Spec` (D-n, `[<spec § heading>]`), and `### Clarifying Questions` (Q-n). A clean pass keeps only the first three lines, and `**Audited**:` always spans the full range.

## Gate control

Conductor only, read on gate rows. Verification roles skip this section.

### Ship-it State

Only the conductor writes one `## Ship-it State` comment on `<spec>`. No routing, count, handoff, cross-check, or fixed-point decision reads a report.

- **Lookup**: `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Ship-it State")) | {url, body}] | last'`. Read the whole body.
- **Contents**: Two markdown tables. The gate table has rows `spec-validation`, `ticket-set-validation`, and `final-review`, with columns `Passes`, `Non-approved`, and `Last verdict`. The ticket table has one row per `#<n>` for its review gate, with columns `Fixed point`, `Handed off` (`yes` or `no`), `Passes`, `Non-approved`, and `Last verdict`. Counts start at 0 and `Last verdict` at `none`, else it holds the verdict plus its `Evidence:` URL.
- **Writes**: Create it with `gh issue comment`, then edit in place (`gh api -X PATCH repos/{owner}/{repo}/issues/comments/<id> -F body=@<file>`, `<id>` the number ending its `url`) and delete the temporary file. It changes only when:
  - **A verdict passes the cross-check**: `Passes` + 1 and `Last verdict` set. A `changes-requested` or `questions` verdict also adds 1 to `Non-approved`. An `approved` verdict zeroes both, so the next instance starts at pass 1.
  - **A ticket is handed off**: Before dispatching `implement` for a ticket without a `Fixed point`, record the sha from `git ls-remote origin refs/heads/<branch>` (or `git rev-parse origin/<default-branch>` when the branch is not on `origin`). Set `Handed off` to `yes` when `implement` returns `done`.
  - **A human resets a gate** (cap halt choice 1): `Non-approved` becomes 0 and `Passes` stays, so later passes stay delta-only.
- **Missing comment**: Create it with zero counts and report that at the next halt. A ticket under review with no `Fixed point` halts and asks.
- **Labels win**: A gate whose approval label is present is closed, whatever the counts say.

### Two-pass cap

Pass 1 is the only full audit. Later passes carry the delta-audit directive.
Before acting, Rows 5–7, 9, 11 (Steps 3 and 4), and 12 check the gate's `Non-approved`. At 2, run the cap halt. Every non-approved verdict counts, `changes-requested` and `questions` alike.

Before a verification dispatch:
- Read the gate's `Passes`, and record `C_pre` with `gh issue view <issue> --json comments --jq '.comments | length'` on the Verdict issue (`<n>` for ticket review, `<spec>` for every other gate).
- In Tier 1, copy the [delta-audit directive](isolation.md#delta-audit-directive) verbatim into `- **Delta audit**:` when `Passes` is at least 1 (a pass after a reset included), and omit it on pass 1 and non-verification roles. For `review`, also pass `- **Fixed point**:`. In Tier 2, apply the directive directly at pass 2 or later.

### Cap halt

Name the gate and its issue, link the `Last verdict` report, list unresolved findings and remaining `Questions`, and offer exactly three choices (interactive question tool when available, else plain text before ending the turn):

1. **Reply with guidance**: Post the reply as `## Answers` on the gate's issue. Fold it into the gate's target body (spec body, open ticket bodies, the ticket and its spec when shared contracts change, or open fix-ticket criteria), strip `ship-it:validated` from edited open tickets and their open direct dependency neighbors, reset `Non-approved` to 0, then query and route again.
2. **Apply the approval label by hand**: The only waiver (`ship-it:validated` on `<spec>`, on every open `ticket_set` ticket, or `ship-it:reviewed` on `<n>` or `<spec>`, per gate). Route again once applied.
3. **Stop**: End the run without changing labels.

### Verdict cross-check

Run before triaging questions or routing, on every non-`failed` return from `validate`, `review`, or `final-review`.

1. **Fetch** `gh issue view <issue> --json labels,comments --jq '{labels: [.labels[].name], comments: [.comments[].url]}'` on the Verdict issue.
2. **Return fields**: Reject `approved` with `Questions:` other than `None`, and reject unrecognized verdicts (such as `done`). Allow `Evidence: None` only for a pass 1 `validate` `approved` (`Passes` 0 before dispatch). Otherwise `comments[C_pre:]` must contain a comment whose `url` equals `Evidence:`, so stale reports fail.
3. **Labels**: The approval label is `ship-it:validated` (spec, ticket-set) or `ship-it:reviewed` (ticket, final). `approved` needs the approval label and no `ship-it:changes-requested`. `changes-requested` needs `ship-it:changes-requested` and no approval label. `questions` needs neither. Exceptions:
   - **Ticket-set**: `approved` needs every open `ticket_set` ticket to carry `validated`, read directly with `gh issue view <t> --json labels --jq '[.labels[].name]'` to bypass search-index lag. `changes-requested` needs `<spec>` to carry `changes-requested`. `questions` needs `<spec>` without it and an open ticket without `validated`.
   - **Final `changes-requested`**: `<spec>` lacks `reviewed`, and `Issues:` names a new ticket absent from the pre-dispatch `ticket_set`. `gh issue view <fix> --json state,labels,title` must show `OPEN`, labels `ship-it:ticket` and `ship-it:validated`, and a `[<slug>]` title prefix.
4. **Mismatch halt**: Route authentication or network `gh` errors to `SKILL.md` § 2 `Errors`. On any failed check, including an unresolved fix-ticket number, halt as a `failed` return reporting expected versus observed verdict and labels, the issue number, and the step. When every check passes, update Ship-it State.

### Question triage after verification

- **Cap reached**: When the verdict brought `Non-approved` to 2, run the cap halt with the remaining questions instead of prompting for `## Answers`.
