# Verify: audit a spec, ticket set, ticket, or feature branch

## Shared rules

- **Read-only**: Never edit the artifact under audit, except the checklist toggles named below.
- **Zero assumption**: Record a Question when judging needs a fact the requirements omit. Never infer intent or assume edge-case safety.
- **Command-backed Blockers**: Before raising a Blocker on a repository or environment fact, run a read-only command this pass and cite its output.
- **Pass 1 is complete**: Map every spec behaviour, Decision Register entry, and Deferred entry to the artifact.
- **Delta-only when directed**: Under the [delta-audit directive](isolation.md#delta-audit-directive), raise nothing outside its scope.
- **Altitude is a finding class**: `Target: spec` forbids low-level detail (file paths, internal functions, slice flags absent from `## Decision Register`; public contracts and `Reproduction seam` commands exempt). Altitude violations on either target are Blockers, including missing low-level detail under `Target: ticket-set` (no exact touchpoints, bare pointer-only `Design deltas`, criteria that are not self-contained).
- **Prose**: Local style guides override [Core Rules](writing.md#core-rules); other breaches are validation Warnings and review Nits. Ambiguity, contradictions, [Universal Testing Standards](writing.md#universal-testing-standards), [shell conventions](writing.md#shell-conventions), and [bounded-search truncation](writing.md#bounded-search-truncation) are Blockers.
- **Reports**: Render populated subsections only, each finding `**<B|W|Q|S|D>-<n>** [<anchor>]: <text>`. Post the report and return its URL in `Evidence:` ([isolation.md](isolation.md#return-schema)). Clean pass-1 validation posts nothing (`Evidence: None`); clean pass 2+ posts only `## Validation: <Spec|Ticket set>` and `**Verdict**: Validated`.

### Severity and outcomes

| Severity | Test | Effect |
| :--- | :--- | :--- |
| **Blocker** | Wrong, incomplete, unverified, or contradicts requirements, settled decisions, invariants, or active code. | Verdict `changes-requested` (plus Questions). Add `ship-it:changes-requested` to `<spec>` or the reviewed ticket. |
| **Question** | Needed fact is unwritten with no unambiguous code or spec default. | Verdict `questions` when no Blocker. No label. |
| **Warning** | Non-overridden Core Rules breach, harmless repetition, unambiguous inherited default (name default and anchor), or belated note on unchanged surface. Validation only. | Advisory. |
| **Nit** | Non-overridden Core Rules breach, typo, or naming fix on a correct diff. Review only. | Report only. |

Warnings, Nits, or nothing: verdict `approved`, adding `ship-it:validated` (validation) or `ship-it:reviewed` (review).
`Target: ticket-set` labels: add `ship-it:validated` to open tickets without Blockers or Questions, remove `ship-it:validated` from cited tickets, and put `ship-it:changes-requested` on `<spec>`.
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
- **Report**: `## Validation: Ticket set` in the spec format on `<spec>`, tagging each bullet `[#<n>, ...]` with affected open tickets.

## Target: ticket

Audit one ticket's diff. Return `failed` when the packet's fixed point is missing or unresolvable, or `<fixed-point>...HEAD` is empty.

1. Fetch and check out `<branch>`, surveying `git --no-pager diff --stat <fixed-point>...HEAD`. On pass 2+, inspect `<prev-head-sha>..HEAD` (latest `**Audited**:`) or `## Rework` commits, else `<fixed-point>..HEAD`; when `HEAD` is unchanged, check folded edits against `<fixed-point>..HEAD`.
2. Check verification evidence in `## Handoff` and `## Rework`. Missing evidence is a Blocker.
3. Run [diff axes](#diff-axes), touched-module suites, named edge cases, and external caller sweeps when a signature or shared contract changes.
4. Verify all `- [ ]` items and any `- [x]` regression in `## Consolidation checklist` (failures are `### Spec` Blockers); never approve with unchecked items. Toggle verified items once via `gh issue edit <n> --body-file <file>`.
5. Post `## Review: Ticket #<n>` on the ticket, including on a clean pass 1.

## Target: final

Audit the feature diff after every ticket closes. The fixed point is `git merge-base origin/<default-branch> HEAD`. Read no comments on closed tickets. Return `failed` when the merge-base does not resolve or the diff is empty.

1. Fetch and check out `<branch>`, and survey `git --no-pager diff --stat <merge-base>...HEAD`. On full runs, inspect `<merge-base>..HEAD`. On delta-audit runs, read `<prev-head-sha>` from the latest `## Review: Final` `**Audited**:` line and inspect `<prev-head-sha>..HEAD`, else `<merge-base>..HEAD` when no prior report exists. When `HEAD` is unchanged, check folded edits against `<merge-base>..HEAD`.
2. Run the spec's `## Testing seams` and closed tickets' criteria; missing verification is a Blocker. On delta-audit runs, re-run only changed checks, prior failures, and criteria of tickets closed since the latest `## Review: Final` report (all closed tickets when none exists).
3. Run [diff axes](#diff-axes), checking across tickets for every observable behaviour and Decision Register entry without dead code or inconsistent names. On delta-audit runs, also verify newly closed tickets, raising only uncleared prior findings, defects in the delta or those tickets, and cross-ticket regressions.
4. Post `## Review: Final` on `<spec>` with `**Audited**:` spanning the full `<merge-base>..<head-sha>` range, adding `ship-it:reviewed` on `<spec>` when approved.
5. On Blockers, create one fix ticket per Blocker, list in `Issues:`, and link via `gh issue edit <n> --parent <spec-id>` (ignore errors). Title: `[<slug>] Ticket: Fix <gist>`; labels: `ship-it:ticket,ship-it:validated`. Follow [ticket template](tickets.md#ticket-template): `## Slice goal` quotes the Blocker and cites `Spec §`; settled guidance enters criteria.
   Human approval at the fix-ticket halt satisfies Invariant-3 non-author validation for fix tickets carrying `ship-it:validated`.

### Diff axes

- **Standards**: Read `CONTRIBUTING.md`, style guides, and linter config (skip what linters catch). Local guides override [Core Rules](writing.md#core-rules); other diff breaches are Nits. Flag ticket-numbered files, ad-hoc harnesses, and transient references as [Universal Testing Standards](writing.md#universal-testing-standards) Blockers.
- **Spec**: Audit against cross-cutting spec design and ticket `## Low-level design` plus `## Acceptance criteria` (bugs: `## Root cause`, `## Reproduction seam`, `## Acceptance criteria`). Quote the requirement per divergence.

Review report: `## Review: <Ticket #n | Final>`, `**Verdict**: Approved | Changes requested | Questions pending`, ``**Audited**: `<fixed-point>..<head-sha>` (<diff stat>; <verification summary>)``, then `### Standards` (S-n, `[<file#Lx>]`), `### Spec` (D-n, `[<spec § heading>]`), `### Clarifying Questions` (Q-n). Clean passes keep only the first three lines; `**Audited**:` always spans the full range.

## Gate control

Conductor only on gate rows; verification roles skip this section.

### Ship-it State

Only the conductor writes one `## Ship-it State` comment on `<spec>`. No routing, count, handoff, cross-check, fixed-point, or state decision reads a report.

- **Lookup**: `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Ship-it State")) | {url, body}] | last'`. Read the whole body.
- **Contents**: Two tables. Gate rows: `spec-validation`, `ticket-set-validation`, `final-review` (columns: `Passes`, `Non-approved`, `Last verdict`). Ticket rows: one per `#<n>` (columns: `Fixed point`, `Handed off` (`yes`|`no`), `Passes`, `Non-approved`, `Last verdict`). Counts start at 0; `Last verdict` starts at `none`, else verdict plus `Evidence:` URL.
- **Writes**: Create via `gh issue comment`, edit via `gh api -X PATCH repos/{owner}/{repo}/issues/comments/<id> -F body=@<file>` (`<id>` ends `url`), and delete the temp file. Update only when:
  - **Verdict passes cross-check**: `Passes` + 1 and set `Last verdict`; `changes-requested`/`questions` adds 1 to `Non-approved`. `approved` zeroes both per gate, starting the next cycle at pass 1.
  - **Ticket handed off**: Before `implement` lacking `Fixed point`, record sha from `git ls-remote origin refs/heads/<branch>` (else `git rev-parse origin/<default-branch>`). Set `Handed off` to `yes` on `implement` `done`.
  - **Human gate reset** (cap halt choice 1): `Non-approved` becomes 0; `Passes` stays so later passes stay delta-only.
- **Missing comment**: Create with zero counts and report at next halt. A ticket under review lacking `Fixed point` halts and asks.
- **Labels win**: A gate carrying its approval label is closed regardless of counts.

### Two-pass cap

Pass 1 is a full audit unless `final-review` runs with an `OPEN` pull request for the branch; that run and pass 2+ carry the delta-audit directive.
Rows 5–7, 9, 11 (Steps 3–4), and 12 check `Non-approved` first; at 2, run the cap halt. Both `changes-requested` and `questions` count.

Before a verification dispatch:
- Read `Passes` and record `C_pre` via `gh issue view <issue> --json comments --jq '.comments | length'` on the Verdict issue (`<n>` for review, `<spec>` else).
- Pass the [delta audit](isolation.md#delta-audit-directive) and fixed point per [Tier 1](isolation.md#tier-1-dispatch-packet) and [Tier 2](isolation.md#tier-2); omit on non-verification roles.

### Cap halt

Name the gate and issue, link `Last verdict`, list unresolved findings and `Questions`, and offer exactly three choices (interactive tool if available, else plain text before ending the turn):

1. **Reply with guidance**: Post `## Answers` on the gate issue, fold into target bodies (spec, open tickets, ticket and spec on contract changes, or open fix-ticket criteria), strip `ship-it:validated` from edited open tickets and open direct dependency neighbors, then re-query and route.
2. **Apply approval label manually**: Only waiver (`ship-it:validated` on `<spec>` or all open `ticket_set` tickets; `ship-it:reviewed` on `<n>` or `<spec>`). Route again once applied.
3. **Stop**: End the run without changing labels.

### Verdict cross-check

Run before question triage or routing on every non-`failed` `validate`, `review`, or `final-review` return.

1. **Fetch** `gh issue view <issue> --json labels,comments --jq '{labels: [.labels[].name], comments: [.comments[].url]}'` on the Verdict issue.
2. **Return fields**: Reject `approved` with non-`None` `Questions:` and unknown verdicts (e.g. `done`). Allow `Evidence: None` only on pass-1 `validate` `approved` (`Passes` 0 before dispatch). Otherwise `comments[C_pre:]` must contain a comment whose `url` equals `Evidence:`, so stale reports fail.
3. **Labels**: Approval label is `ship-it:validated` (spec, ticket-set) or `ship-it:reviewed` (ticket, final). `approved` needs that label without `ship-it:changes-requested`; `changes-requested` needs `ship-it:changes-requested` without that label; `questions` needs neither. Exceptions:
   - **Ticket-set**: `approved` needs `validated` on all open `ticket_set` tickets (`gh issue view <t> --json labels`, bypassing search lag). `changes-requested` needs `changes-requested` on `<spec>`; `questions` needs `<spec>` without that label and an open ticket lacking `validated`.
   - **Final `changes-requested`**: `<spec>` lacks `reviewed`, and `Issues:` names a new ticket absent from pre-dispatch `ticket_set`; `gh issue view <fix> --json state,labels,title` shows `OPEN`, `ship-it:ticket`, `ship-it:validated`, and `[<slug>]` prefix.
4. **Mismatch halt**: Route auth/network `gh` errors to `SKILL.md` § 2 `Errors`. On any failed check (including unresolved fix-ticket IDs), halt as `failed` reporting expected vs. observed verdict, labels, issue, and step. When all checks pass, update Ship-it State.

### Question triage after verification

- **Cap reached**: When the verdict brought `Non-approved` to 2, run the cap halt with the remaining questions instead of prompting for `## Answers`.
