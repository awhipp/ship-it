# Final Review: audit the complete feature branch

Run after every ticket closes, auditing the whole feature branch diff along the `Standards` and `Spec` axes defined in [review-core.md](review-core.md).

## Inputs

| Input | Source |
| :--- | :--- |
| Fixed point | `git merge-base origin/<default-branch> HEAD` |
| Requirements | The spec body (`gh issue view <spec> --json body --jq .body`) and every closed ticket body (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,body,stateReason`). Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping results whose title starts with `[<slug>]` and whose `stateReason` is `COMPLETED`, with zero comment reads. |
| Prior review reports | Prior `## Review: Final`, `## Answers`, `## Auto-resolved Decisions`, and `## Circuit Breaker Reset` comments on `<spec>` (`gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Review: Final") or startswith("## Answers") or startswith("## Auto-resolved Decisions") or startswith("## Circuit Breaker Reset")) | .body]'`) fetched in step 1, keeping zero comment reads on closed tickets |

Return `failed` when the merge-base commit (`<fixed-point>`) does not resolve or the branch diff across `<fixed-point>...HEAD` is empty.

## Process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`. Resolve `<fixed-point>` via `git merge-base origin/<default-branch> HEAD`.
   - **Empty-diff guard**: Anchor the empty-diff `failed` guard on `<fixed-point>...HEAD` rather than `<prev-head-sha>..HEAD`, so pass-2+ runs after `questions` with unchanged `HEAD` audit cleared questions against folded body edits.
   - **Prior reports and guidance**: Fetch `Prior review reports` on `<spec>` once here via the query in `## Inputs`, keeping zero comment reads on closed tickets. Loading those comments before diff inspection provides `<prev-head-sha>`, prior findings, and settled control comments (`## Answers`, `## Auto-resolved Decisions`, and `## Circuit Breaker Reset`).
   - **Pass 1 diff survey**: Run `git --no-pager diff --stat <fixed-point>...HEAD` and `git --no-pager log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git --no-pager diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
   - **Pass 2+ delta scoping**: When `## Delta-audit directive` applies (via `- **Delta audit**:` in the dispatch packet or prior `## Review: Final` reports in the active cycle), extract `<prev-head-sha>` from the `**Audited**:` `<fixed-point>..<prev-head-sha>` line of the latest `## Review: Final` report in the active cycle. Survey commits added since `<prev-head-sha>` via `git --no-pager log <prev-head-sha>..HEAD --oneline` and `git --no-pager diff --stat <prev-head-sha>..HEAD`, then inspect `git --no-pager diff <prev-head-sha>..HEAD` (falling back to `<fixed-point>...HEAD` when `<prev-head-sha>` is missing, and checking `<fixed-point>...HEAD` where needed for cleared findings, closed fix tickets marked `COMPLETED`, settled control comments, or cross-ticket regressions and contradictions). When `HEAD` matches `<prev-head-sha>`, inspect folded body edits alongside `<fixed-point>...HEAD` to audit cleared Questions and factual regressions.
2. **Check verification evidence**: Run or verify the test suite and direct checks specified in the spec's `## Testing Decisions` and closed ticket `## Acceptance criteria` directly against the branch without reading comments on closed tickets. Missing verification is a Blocker. On pass 2+, focus verification re-runs on changes since `<prev-head-sha>`, acceptance criteria of delivered fix tickets, and previously failing checks unless new commits touch cross-cutting invariants.
3. **Run two-axis passes and cross-ticket checks**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [review-core.md#two-axis-passes](review-core.md#two-axis-passes), apply the [Zero-assumption rule](review-core.md#zero-assumption-rule) (including pass-2+ rules citing [isolation.md](isolation.md#delta-audit-directive)) and [Severity](review-core.md#severity) table, and check across tickets:
   - The branch delivers every `Scope and Behaviors` item and `Implementation Decisions` item in the spec.
   - No transitional scaffolding, dead code, or leftover migration paths remain.
   - Names and patterns stay consistent across tickets.
   - On pass 2+ (`## Delta-audit directive`), verify clearance of every prior Blocker, prior Question, and closed fix ticket marked `COMPLETED` in `Requirements`, and honor settled `## Answers`, `## Auto-resolved Decisions`, and `## Circuit Breaker Reset` comments on `<spec>`. Restrict new Blockers and `Clarifying Questions` to uncleared findings, commits added since `<prev-head-sha>`, defects in delivered fix tickets, or concrete cross-ticket regressions and contradictions. Keep non-regression notes on unchanged surface non-blocking as Nits (fixed in place) or omitted.
4. **Post the report**: Reuse the `Prior review reports` fetched in step 1 without re-querying `<spec>` or reading comments on closed tickets.
   - **Pass 2+ baseline and guidance**: When prior `## Review: Final` reports exist in the active cycle (pass 2 onward), compare current Blockers only against Blockers cleared in `## Review: Final` reports posted after the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Approved` report (whichever is more recent) to count `**Reintroduced**: <M>`. Continue honoring all settled guidance.
   - **Report range and posting**: Preserve `**Audited**: <fixed-point>..<head-sha>` across the full branch range in the `## Review: Final` report per [review-core.md#report](review-core.md#report), even when pass-2+ inspection scoped new diff checks to `<prev-head-sha>..HEAD`. Write the report to a temporary file and post the report on `<spec>` (`gh issue comment <spec> --body-file <file>`). Delete the temporary file immediately and capture the posted comment URL for `Evidence:`.

## Final review

| Findings | Action | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Create one fix ticket per Blocker (below). | `changes-requested`, listing any Questions too, with created fix-ticket numbers (`#<n>, ...`) in `Issues:` and `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Nits or nothing | Add `ship-it:reviewed` to the spec. | `approved`, with `Evidence: <comment-url>` |

Follow this procedure with the template below:

- **Creation flags**: Create each fix ticket with title `[<slug>] Ticket: Fix <gist>` and labels `ship-it:ticket,ship-it:validated`, then link it with `gh issue edit <n> --parent <spec-id>`, adding one `--add-blocked-by <blocker-id>` per blocker, ignoring errors on unsupported tiers.
- **Payload file**: Write the ticket body using a temporary payload file.
- **Settled answers**: Carry settled guidance that the conductor folded into the spec body into the acceptance criteria of fix tickets.
- **Blockers**: List blockers under `## Blocked by` as `- [ ] Blocked by #<blocker-id>` when blockers exist.
- **Cleanup**: Delete the temporary `--body-file` payload after creation.
- **Return block**: Always post `## Review: Final` on `<spec>` and return its comment URL in `Evidence:` across `approved`, `changes-requested`, and `questions` per [isolation.md](isolation.md#return-schema). On `changes-requested`, populate `Issues:` with every newly created fix-ticket number (`#<n>, ...`).

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level.>

## Slice goal

<Quote the Blocker and cite Spec § <section>.>

## Low-level design

- **Touchpoints**: Name the exact files, modules, and symbols to create, modify, or remove.
- **Design deltas**: Specify concrete symbol signatures, step numbers, state flow, and failure handling.

## Acceptance criteria

- [ ] <Single-sentence imperative check adhering to writing.md>

## Blocked by

None (can start immediately).
```
