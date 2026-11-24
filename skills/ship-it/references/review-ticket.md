# Ticket Review: audit one ticket diff

Audit one ticket's diff along the `Standards` and `Spec` axes defined in [review-core.md](review-core.md).

## Inputs

| Input | Source |
| :--- | :--- |
| Fixed point | The `Fixed point: <sha>` comment on the ticket, or derived via the four-step fallback below |
| Requirements | The ticket body and its spec body (`gh issue view <n> --json body --jq .body`); save the initial read of the ticket body to a temporary file (`<orig>`) when `## Consolidation checklist` is present |
| Prior review reports | Prior `## Review:`, `## Answers`, and `## Circuit Breaker Reset` comments on `<n>` fetched in step 1 |

Return `failed` when the fallback procedure cannot derive a fixed point, the commit does not resolve, or the diff across `<fixed-point>...HEAD` is empty.

## Process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Handoff") or startswith("## Rework") or startswith("Fixed point:") or startswith("## Review:") or startswith("## Answers") or startswith("## Circuit Breaker Reset")) | .body]'`, which returns only `Fixed point:`, `## Handoff`, `## Rework`, `## Review:`, `## Answers`, and `## Circuit Breaker Reset` comments. When the ticket lacks a `Fixed point:` comment, execute this fallback procedure:
   1. Extract commit hashes from the `## Handoff` comment on the ticket. Resolve the parent of the earliest commit using `<earliest-sha>~1`.
   2. When extraction yields no commits, inspect `git --no-pager log origin/<default-branch>..HEAD --format=%s` for commits referencing `(#<ticket>)`. Resolve the parent of the earliest match using `<earliest-sha>~1`.
   3. When steps 1 and 2 find no matching commits, and no commit subject in `git --no-pager log origin/<default-branch>..HEAD --format=%s` references another ticket, resolve `git merge-base origin/<default-branch> HEAD`.
   4. Use the resolved commit as `<fixed-point>` for `git --no-pager diff <fixed-point>...HEAD`. Return `failed` when no commit resolves.
   Anchor the empty-diff `failed` guard on `<fixed-point>...HEAD` rather than `<prev-head-sha>..HEAD`, so pass-2+ runs after `questions` with unchanged `HEAD` audit cleared questions against folded body edits.
   - **Pass 1 diff survey**: Run `git --no-pager diff --stat <fixed-point>...HEAD` and `git --no-pager log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git --no-pager diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
   - **Pass 2+ delta scoping**: When `## Delta-audit directive` applies (via `- **Delta audit**:` in the dispatch packet or prior `## Review: Ticket` reports in the active cycle), extract `<prev-head-sha>` from the `**Audited**:` `<fixed-point>..<prev-head-sha>` line of the latest `## Review: Ticket` report in the active cycle and collect commits from subsequent `## Rework` comments. Inspect newly modified commits and diffs (`git --no-pager log <prev-head-sha>..HEAD --oneline` and `git --no-pager diff <prev-head-sha>..HEAD`, or `## Rework` commit diffs, falling back to `<fixed-point>...HEAD` when neither resolves). When `HEAD` matches `<prev-head-sha>`, inspect folded body edits alongside `<fixed-point>...HEAD` to verify cleared Questions and factual regressions.
2. **Check verification evidence**: Inspect the `## Handoff` and `## Rework` comments fetched in step 1 for passing tests or allowable direct verification checks (including linting, type checks, builds, CLI checks, or manual inspection for non-executable changes). Missing verification is a Blocker.
3. **Run two-axis passes and report**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [review-core.md#two-axis-passes](review-core.md#two-axis-passes), applying [Zero-assumption rule](review-core.md#zero-assumption-rule) (including pass-2+ rules citing [isolation.md](isolation.md#delta-audit-directive)) and [Severity](review-core.md#severity).
   - **Pass 2+ baseline and guidance**: When prior `## Review:` reports exist in the active cycle (pass 2 onward), compare current Blockers only against Blockers cleared in `## Review:` reports posted after the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Approved` report (whichever is more recent) to count `**Reintroduced**: <M>`. Honor all settled guidance from `## Answers` and `## Circuit Breaker Reset`.
   - **Checklist verification**: Save the initial `gh issue view <n> --json body --jq .body` read to `<orig>`, deleting `<orig>` immediately when `## Consolidation checklist` is absent. Verify every unchecked `- [ ]` item plus any newly touched diff regressions against prior `- [x]` items, and report each failed, missed, or regressed item as a `### Spec` Blocker while leaving failed or missed `- [ ]` items unchecked.
   - **Checklist update**: When at least one `- [ ]` item passes verification, copy `<orig>` to a temporary `--body-file` (`<updated>`), toggle only verified passing `- [ ]` items to `- [x]` while keeping all other ticket sections and lines read-only, and inspect `git --no-pager diff --no-index <orig> <updated>` (treating exit code `1` as differences detected). Run one `gh issue edit <n> --body-file <updated>` only when at least one box toggled, and delete `<orig>`, `<updated>`, and any temporary report files immediately after `gh` completes (or before returning when zero boxes toggle).
   - **Report range and posting**: Preserve `**Audited**: <fixed-point>..<head-sha>` across the full ticket range in the `## Review: Ticket #<n>` report per [review-core.md#report](review-core.md#report), even when pass-2+ inspection scoped new diff checks to `<prev-head-sha>..HEAD`. Write the report to a temporary file and post the report on the ticket (`gh issue comment <n> --body-file <file>`). Delete the temporary file immediately and capture the posted comment URL for `Evidence:`.

## Complexity-scaled audit depth

Scale audit depth to the ticket's complexity tier:

| Complexity | Audit depth |
| :--- | :--- |
| `low` | Audit touched files and direct test coverage. |
| `medium` | Audit module test suites and named edge cases. |
| `high` | Audit module boundaries, unaffected callers outside touched files, and cross-cutting invariants. |

## Ticket review outcomes

| Findings | Labels | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Add `ship-it:changes-requested`. Keep the assignee. | `changes-requested`, listing any Questions too, with `Evidence: <comment-url>` |
| Questions, no Blocker | None. | `questions`, with `Evidence: <comment-url>` |
| Nits or nothing | Add `ship-it:reviewed`. | `approved`, with `Evidence: <comment-url>` |

Never add `ship-it:reviewed` or return `approved` while any `- [ ]` item remains unchecked in `## Consolidation checklist`, because every checklist member requires independent verification before approval.
Always post the `## Review: Ticket #<n>` report (including on a clean pass 1 approval) and return its comment URL in `Evidence:` per [isolation.md](isolation.md#return-schema).
Never close the ticket; the conductor closes reviewed tickets.
