# Final Review: audit the complete feature branch

Run after every ticket closes, auditing the whole feature branch diff along the `Standards` and `Spec` axes defined in [review-core.md](review-core.md).

## Inputs

| Input | Source |
| :--- | :--- |
| Fixed point | `git merge-base origin/<default-branch> HEAD` |
| Requirements | The spec body (`gh issue view <spec> --json body --jq .body`) and every closed ticket body (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,body,stateReason`). Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping results whose title starts with `[<slug>]` and whose `stateReason` is `COMPLETED`, with zero comment reads. |
| Prior review reports | Prior `## Review: Final` and `## Circuit Breaker Reset` comments on `<spec>` (`gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Review: Final") or startswith("## Circuit Breaker Reset")) | .body]'`), keeping zero comment reads on closed tickets |

Return `failed` when the merge-base commit does not resolve or the diff is empty.

## Process

1. **Fetch the diff**: Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out the feature branch. Resolve `<fixed-point>` via `git merge-base origin/<default-branch> HEAD`. Run `git --no-pager diff --stat <fixed-point>...HEAD` and `git --no-pager log <fixed-point>..HEAD --oneline` first to survey changed files, then inspect `git --no-pager diff <fixed-point>...HEAD` (scoping per path or skipping generated lockfiles when large).
2. **Check verification evidence**: Run or verify the test suite and direct checks specified in the spec's `## Testing Decisions` and ticket `## Acceptance criteria` directly against the branch without reading ticket comments. Missing verification is a Blocker.
3. **Run two-axis passes and cross-ticket checks**: Execute steps 3 through 5 (`Find standards sources`, `Standards pass`, and `Spec pass`) in [review-core.md#two-axis-passes](review-core.md#two-axis-passes), apply the [Zero-assumption rule](review-core.md#zero-assumption-rule) and [Severity](review-core.md#severity) table, and check across tickets:
   - The branch delivers every `Scope and Behaviors` item and `Implementation Decisions` item in the spec.
   - No transitional scaffolding, dead code, or leftover migration paths remain.
   - Names and patterns stay consistent across tickets.
4. **Post the report**: Fetch `Prior review reports` on `<spec>` once via the query in `## Inputs` while keeping zero comment reads on closed tickets. When prior `## Review: Final` reports exist (pass 2 onward), compare current Blockers only against cleared Blockers from `## Review: Final` reports posted after the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Approved` report (whichever is more recent) to count `**Reintroduced**: <M>`. Continue honoring all settled guidance. Post the `## Review: Final` report on the spec per [review-core.md#report](review-core.md#report).

## Final review

| Findings | Action | Return verdict |
| :--- | :--- | :--- |
| Any Blocker | Create one fix ticket per Blocker (below). | `changes-requested`, listing any Questions too |
| Questions, no Blocker | None. | `questions` |
| Nits or nothing | Add `ship-it:reviewed` to the spec. | `approved` |

Follow this procedure with the template below:

- **Creation flags**: Create each fix ticket with title `[<slug>] Ticket: Fix <gist>` and labels `ship-it:ticket,ship-it:validated`, then link it with `gh issue edit <n> --parent <spec-id>`, adding one `--add-blocked-by <blocker-id>` per blocker, ignoring errors on unsupported tiers.
- **Payload file**: Write the ticket body using a temporary payload file.
- **Settled answers**: Carry settled guidance that the conductor folded into the spec body into the acceptance criteria of fix tickets.
- **Blockers**: List blockers under `## Blocked by` as `- [ ] Blocked by #<blocker-id>` when blockers exist.
- **Cleanup**: Delete the temporary `--body-file` payload after creation.

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
