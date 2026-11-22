# Ticket Review: audit one ticket diff

Audit one ticket's diff along the `Standards` and `Spec` axes defined in [review-core.md](review-core.md).

## Inputs

| Input | Source |
| :--- | :--- |
| Fixed point | The `Fixed point: <sha>` comment on the ticket, or derived via the four-step fallback below |
| Requirements | The ticket body and its spec body (`gh issue view <n> --json body --jq .body`) |

Return `failed` when the fallback procedure cannot derive a fixed point, the commit does not resolve, or the diff is empty.

## Process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out the feature branch. Fetch the ticket comments via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Handoff") or startswith("## Rework") or startswith("Fixed point:")) | .body]'`, which returns only the `Fixed point:`, `## Handoff`, and `## Rework` comments. When the ticket lacks a `Fixed point:` comment, execute this fallback procedure:
   1. Extract commit hashes from the `## Handoff` comment on the ticket. Resolve the parent of the earliest commit using `<earliest-sha>~1`.
   2. When extraction yields no commits, inspect `git log origin/<default-branch>..HEAD` for commits referencing `(#<ticket>)`. Resolve the parent of the earliest match using `<earliest-sha>~1`.
   3. When steps 1 and 2 find no matching commits, and the ticket is the first ticket on the branch, resolve `git merge-base origin/<default-branch> HEAD`.
   4. Use the resolved commit as `<fixed-point>` for `git diff <fixed-point>...HEAD`. Return `failed` when no commit resolves.
   Run `git diff --stat <fixed-point>...HEAD` and `git log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
2. **Check verification evidence**: Inspect the `## Handoff` and `## Rework` comments fetched in step 1 for passing tests or allowable direct verification checks (including linting, type checks, builds, CLI checks, or manual inspection for non-executable changes). Missing verification is a Blocker.
3. **Run two-axis passes and report**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [review-core.md#two-axis-passes](review-core.md#two-axis-passes), apply the [Zero-assumption rule](review-core.md#zero-assumption-rule) and [Severity](review-core.md#severity) table, and post the `## Review: Ticket #<n>` report on the ticket per [review-core.md#report](review-core.md#report).

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
| Any Blocker | Add `ship-it:changes-requested`. Keep the assignee. | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:reviewed`. | `approved` |

Never close the ticket; the conductor closes reviewed tickets.
