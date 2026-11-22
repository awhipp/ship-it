# Close-out: open and synchronize the pull request

Route by the dispatch packet `Mode` field:

- Run [## Initial close-out](#initial-close-out) when `Mode` is `initial`.
- Skip directly to [## Synchronization](#synchronization) when `Mode` is `sync`.

## Initial close-out

When `Mode` is `initial`, fetch the target refs (`git fetch origin <default-branch> <branch>`), check out `<branch>`, and run these steps after the final review approves the spec:

1. Read the spec body (`gh issue view <spec> --json body --jq .body`) and closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`). Check the returned count per [writing.md](writing.md#bounded-search-truncation) before keeping titles starting with `[<slug>]`. Open the pull request using a temporary body file, then delete that file once the command completes:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   - **Closing references**: List each closed ticket by title and include `Closes #<spec>` (plus `Closes #<issue>` when `## Source` names a request issue and `<spec-number> != <issue>`) so merging the pull request closes the spec.
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

## Synchronization

Run when `Mode` is `sync` for a closed `ship-it:bug` ticket absent from the open pull request's closing references.
Fetch the target refs (`git fetch origin <default-branch> <branch>`), check out `<branch>`, and resolve `<pr>` via `gh pr list --head "<branch>" --state open --json number --jq '.[0].number'`.

1. Update the pull request description:

   Read the pull request body (`gh pr view <pr> --json body --jq .body`) and the bug ticket title (`gh issue view <bug-ticket> --json title --jq .title`).
   Return `failed` when the pull request body already contains `Closes #<bug-ticket>`.
   Append `### Addendum Bugs` when the heading is absent, and append `- #<bug-ticket> (<bug-title>) - Closes #<bug-ticket>` under that heading.

   Write the updated description to a temporary file, update the pull request, and delete the temporary file once the command completes:

   ```shell
   gh pr edit <pr> --body-file <file>
   ```

2. Annotate the files touched by the bug ticket's commits:

   ```shell
   gh pr diff <pr> --name-only
   git --no-pager log -F --grep="(#<bug-ticket>)" origin/<default-branch>..HEAD --name-only --format=
   gh pr view <pr> --json headRefOid --jq .headRefOid
   gh api "repos/{owner}/{repo}/pulls/<pr>/comments" -f commit_id=<head-sha> -f path=<file> -f subject_type=file -F body=@<annotation-file>
   ```

   Return `failed` when no commit matches.
   Annotate each unique matched file still present in `gh pr diff <pr> --name-only` with one file-level review comment, deleting each temporary `<annotation-file>` after posting:

   ```markdown
   **Change**: <what changed, one sentence>
   **Why**: <rationale, one sentence>
   **Traces to**: #<bug-ticket>
   ```

3. Return `done`. Never merge the pull request.
