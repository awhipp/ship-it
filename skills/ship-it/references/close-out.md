# Close-out: open the pull request

## Initial close-out

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
