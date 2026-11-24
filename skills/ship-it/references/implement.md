# Implement: build, rework, and close out

## Implement

Build exactly what one ticket describes.
The ticket body, its spec body (`gh issue view <n> --json body --jq .body`), and settled `## Answers` are the only requirements.

### Process

#### 1. Branch and settled decisions

1. Fetch the target refs (`git fetch origin <default-branch>` and `git fetch origin <branch>` when the branch exists on `origin`). Check out the branch when it exists on `origin`; otherwise create it from `origin/<default-branch>` and push it with `git push -u origin <branch>`.
2. Fetch the ticket's `## Answers` comments once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Answers")) | .body]'`. Fold settled decisions from the latest one into the ticket body via surgical body edit before modifying code. When a decision alters a shared contract, update the spec body too.

Only `review` toggles `## Consolidation checklist` checkboxes, after independent verification. Leave every box as it is (`- [ ]` stays `- [ ]`) in every edit.

#### 2. Verify

Tailor verification to the change type:

- **Reproduce defects first**: For `fix` feature types or `ship-it:bug` tickets, run the reproduction seam (spec `## Testing seams` or bug `## Reproduction seam`) to confirm failure before modifying code.
- **Red-Green**: Write a failing test first for each acceptance criterion where tests apply.
- **Direct checks elsewhere**: For docs, configuration, assets, or repositories without a runner, verify each criterion with linting, type checks, builds, CLI checks, or inspection.
- **Scope**: Run the suites for touched modules, test the edge cases the ticket names, and sweep callers outside the touched files when a signature or shared contract changes.

#### 3. Check as you go

Before handoff, run the full scope above.
When `## Consolidation checklist` is present, implement and verify every item in full.
Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition) and [transient-reference prohibition](writing.md#transient-reference-prohibition) across source, tests, comments, and docstrings, and sweep for negative invariants and transient references with targeted search.

#### 4. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design, root causes, or reproduction seams.
When any of them conflict with active code or leave a design decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

#### 5. Commit, push, and hand off

- Stage only the files modified for the ticket (`git add <file>...`).
- Commit with the subject `<type>(<slug>): <summary> (#<ticket>)`, taking `<type>` from the branch prefix before `/`. Push after every commit.
- Post the handoff (`gh issue comment <n> --body-file <file>`), delete the temporary file, and return `done`, leaving the ticket assigned and open:

```markdown
## Handoff
- **Commits**: <sha list>
- **Verification**: <tests run and results, or each criterion and checklist item with its direct check>
```

## Rework

Resolve every Blocker in the latest review of a ticket carrying `ship-it:changes-requested`.
Follow [Implement](#implement), with these differences:

1. Check out `<branch>`, then read the latest `## Review:` report and any `## Answers` posted after it. Fold settled decisions as in Implement step 1.
2. Fix every Blocker and sweep every unchecked checklist item, adding a test or direct check for each. A Blocker is also a trigger for [Ask instead of guessing](#4-ask-instead-of-guessing).
3. Commit and push as in Implement, then post a `## Rework` comment:

```markdown
## Rework
- **Commits**: <sha list>
- **Fixes**: <each Blocker and swept item, fix summary, and check result>
```

4. Remove the label and restore the assignee (`gh issue edit <n> --remove-label "ship-it:changes-requested" --add-assignee "@me"`). Return `done`.

## Close-out

### Initial close-out

Fetch `<default-branch>` and `<branch>` from origin, check out `<branch>`, and run these steps after final review approves:

1. Read the spec body and closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`). Check the count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`. Open the pull request from a temporary body file, then delete it:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   - **Closing references**: List each closed ticket with `stateReason` `COMPLETED` by title and include `Closes #<spec>` (plus `Closes #<issue>` when `## Source` names a request issue other than the spec).
   - **Addendum bugs**: Append `### Addendum Bugs` listing each completed bug ticket as `- #<n> (<title>) - Closes #<n>`.
   - **Truncation notice**: At 100 items, embed the [writing.md](writing.md#bounded-search-truncation) warning in the body.

2. Annotate every changed file with one file-level review comment, deleting each temporary `<annotation-file>` after posting:

   ```shell
   gh pr diff <pr> --name-only
   gh pr view <pr> --json headRefOid --jq .headRefOid
   git merge-base origin/<default-branch> HEAD
   git --no-pager log --format=%s <merge-base>..HEAD -- <file>
   gh api "repos/{owner}/{repo}/pulls/<pr>/comments" -f commit_id=<head-sha> -f path=<file> -f subject_type=file -F body=@<annotation-file>
   ```

   Take ticket numbers from commit subjects. Annotation form:

   ```markdown
   **Change**: <what changed, one sentence>
   **Why**: <rationale, one sentence>
   **Traces to**: #<ticket>, Spec § <section heading>
   ```

3. Return `done` with `Evidence: None`. Never merge the pull request.
