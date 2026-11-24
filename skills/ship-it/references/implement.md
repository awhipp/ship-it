# Implement: build, rework, and close out

## Implement

Build exactly what one ticket describes.
The ticket body and its spec body (`gh issue view <n> --json body --jq .body`) are the only requirements.

### Process

#### 1. Branch and fixed point

1. Fetch the target refs (`git fetch origin <default-branch>` and `git fetch origin <branch>` when the branch exists on `origin`). Check out the branch when it exists on `origin`; otherwise create the branch from `origin/<default-branch>` and push the branch with `git push -u origin <branch>`.
2. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[].body]'`, and check the returned array in-agent for an existing `Fixed point:` comment. When no `Fixed point:` comment exists, post the comment before the first change on a best-effort basis: `gh issue comment <n> --body "Fixed point: <output of git rev-parse HEAD>"`. Proceed with implementation when an enterprise policy blocks the comment, as ticket-tagged commits (`(#<ticket>)`) allow review to derive the fixed point from Git history.
3. Inspect the comment array fetched in step 2 in-agent for the latest `## Answers` or `## Circuit Breaker Reset` comment, and fold settled decisions into the ticket body via surgical body edit before modifying code. Preserve `## Consolidation checklist` checkboxes unchecked (`- [ ]`) during edits, because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review. When a decision alters a shared contract in the spec, update both the ticket body and the spec body.

#### 2. Verify

Tailor verification to the repository, change type, and complexity tier:

- **Use existing test conventions**: Run the repository's existing test runner and the test seams named in the spec and ticket before writing code.
- **Reproduce defects first**: For `fix` feature types or `ship-it:bug` tickets, execute the reproduction seam in the spec's `## Testing Decisions` or the bug ticket's `## Reproduction seam` to confirm failure before modifying code.
- **Red-Green where tests apply**: Write a failing test first for each acceptance criterion where tests apply.
- **Direct checks elsewhere**: For documentation, configuration, assets, or repositories without a runner, verify each acceptance criterion with linting, type checks, builds, CLI checks, or inspection.

##### Complexity tiers

Scale verification scope to the complexity tier recorded on the ticket:

| Complexity | Scope |
| :--- | :--- |
| `low` | Restrict tests and direct checks to touched files. |
| `medium` | Execute domain module suites and test named edge cases. |
| `high` | Run broad test suites, audit cross-cutting invariants, and sweep callers outside touched files. |

#### 3. Check as you go

Run type checks and targeted tests throughout development.
Before handoff, execute the full verification scope required by the ticket's complexity tier.
When `## Consolidation checklist` is present, implement and verify every `- [ ]` item in full while leaving every checkbox unchecked (`- [ ]`), because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.

Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition) and [transient-reference prohibition](writing.md#transient-reference-prohibition) across source files, tests, comments, and docstrings.
Sweep for negative invariants (such as "no callers of the old API remain") and transient references after implementation, using targeted search.

#### 4. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design contracts, root causes, or reproduction seams, and preserve every `## Consolidation checklist` checkbox as `- [ ]`.
Silent contract edits bypass validation, and only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.
When the ticket's `## Consolidation checklist`, low-level design, root cause, reproduction seam, or acceptance criteria conflict with active code or leave a design decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

#### 5. Commit, push, and hand off

- Stage only the specific files modified for the ticket (`git add <file>...`) so temporary files never enter the commit.
- Derive the commit `<type>` from the branch prefix before `/`. Commit with the subject `<type>(<slug>): <summary> (#<ticket>)`. Every commit names its ticket; close-out traces files through these subjects.
- Push after every commit.
- Write the handoff comment to a temporary file, recording verification results for every acceptance criterion and every `## Consolidation checklist` item (when present). Post the comment (`gh issue comment <n> --body-file <file>`), delete the temporary file, and return `done`, leaving the ticket assigned and open so the assignee signals that review is next.

```markdown
## Handoff
- **Commits**: <sha list>
- **Verification**: <tests run and results, or each criterion and ## Consolidation checklist item with its direct check>
```

## Rework

Resolve every Blocker reported in the latest review of a ticket carrying `ship-it:changes-requested`.
Requirements are the same as for [Implement](#implement).

### Rework process

#### 1. Branch and review findings

1. Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`.
2. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Review:") or startswith("## Answers") or startswith("## Circuit Breaker Reset")) | .body]'`, and filter the returned array in-agent for the latest `## Review:` report and any subsequent `## Answers` or `## Circuit Breaker Reset` comments posted after that review.
3. Fold settled decisions from `## Answers` and `## Circuit Breaker Reset` into the ticket body (and the spec body when shared contracts change) via surgical body edit before modifying code. Preserve `## Consolidation checklist` items and existing `- [ ]` and `- [x]` states during edits (leaving any newly added items `- [ ]`), because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.

#### 2. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design contracts, root causes, or reproduction seams, and preserve every existing checkbox state in `## Consolidation checklist` without toggling `- [ ]` to `- [x]`.
A review Blocker is also a trigger for the [Ask steps in Implement](#4-ask-instead-of-guessing), which apply unchanged: silent contract edits bypass validation and only `review` toggles checkboxes.

#### 3. Fix and verify

Fix every Blocker from the latest review report, sweep and verify every remaining unchecked `- [ ]` item in `## Consolidation checklist` (when present), and add a test or direct check for each fix and swept item.
Leave all `## Consolidation checklist` checkboxes unchanged without toggling `- [ ]` to `- [x]`, because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.
Scale verification scope per the [complexity tiers](#complexity-tiers).

Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition) and [transient-reference prohibition](writing.md#transient-reference-prohibition) across source files, tests, comments, and docstrings.
Sweep for negative invariants and transient references after applying fixes, using targeted search.

#### 4. Commit, push, and hand off

- Keep the existing `Fixed point:` on the ticket unchanged.
- Stage only the specific files modified for the ticket (`git add <file>...`) so temporary files never enter the commit.
- Derive the commit `<type>` from the branch prefix before `/`. Commit with the subject `<type>(<slug>): <summary> (#<ticket>)`, and push after every commit.
- Write a `## Rework` comment explaining the fix and verification evidence for each Blocker and swept `## Consolidation checklist` item (when present) to a temporary file, post the comment (`gh issue comment <n> --body-file <file>`), and delete the temporary file:

```markdown
## Rework
- **Commits**: <sha list>
- **Fixes**: <each Blocker ID and swept ## Consolidation checklist item, fix summary, and test or direct check result>
```

- Remove `ship-it:changes-requested` and restore the assignee (`gh issue edit <n> --remove-label "ship-it:changes-requested" --add-assignee "@me"`). Return `done`.

## Close-out

### Initial close-out

Fetch the target refs (`git fetch origin <default-branch> <branch>`), check out `<branch>`, and run these steps after the final review approves the spec:

1. Read the spec body (`gh issue view <spec> --json body --jq .body`) and closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`). Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`. Open the pull request using a temporary body file, then delete that file once the command completes:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   - **Closing references**: List each closed ticket with `stateReason` `COMPLETED` by title and include `Closes #<spec>` (plus `Closes #<issue>` when `## Source` names a request issue and `<spec-number> != <issue>`) so merging the pull request closes the spec.
   - **Addendum bugs**: When closed `ship-it:bug` tickets with `stateReason` `COMPLETED` exist, append an `### Addendum Bugs` section listing each completed bug ticket as `- #<n> (<title>) - Closes #<n>`.
   - **Truncation notice**: When the closed-ticket query returns 100 items, embed the warning in [writing.md](writing.md#bounded-search-truncation) as a note inside the pull request body. Keep the four-line return block (`Evidence: None`) in [isolation.md](isolation.md) unchanged.

2. Annotate every changed file with one file-level review comment, deleting each temporary `<annotation-file>` after posting:

   ```shell
   gh pr diff <pr> --name-only
   gh pr view <pr> --json headRefOid --jq .headRefOid
   git merge-base origin/<default-branch> HEAD
   git --no-pager log --format=%s <merge-base>..HEAD -- <file>
   gh api "repos/{owner}/{repo}/pulls/<pr>/comments" -f commit_id=<head-sha> -f path=<file> -f subject_type=file -F body=@<annotation-file>
   ```

   Take ticket numbers from the commit subjects for each file.
   Write each annotation in this form:

   ```markdown
   **Change**: <what changed, one sentence>
   **Why**: <rationale, one sentence>
   **Traces to**: #<ticket>, Spec § <section heading>
   ```

3. Return `done`. Never merge the pull request.
