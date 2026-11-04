# Implement: build one ticket, verified

Build exactly what one ticket describes.
The ticket body and its spec body (`gh issue view <n> --json body --jq .body`) are the only requirements.

## Process

### 1. Branch and fixed point

1. Read the branch name from the spec's `## Source` (`<type>/<slug>`).
2. Fetch the target refs (`git fetch origin <default-branch>` and `git fetch origin <branch>` when the branch exists on `origin`). Check out the branch when it exists on `origin`; otherwise create the branch from `origin/<default-branch>` and push the branch with `git push -u origin <branch>`.
3. Check for an existing `Fixed point:` comment via `gh issue view <n> --json comments --jq '[.comments[].body | select(index(({Fixed:1}|keys[])) == 0 and index(({point:1}|keys[])) == 6)] | last // empty'`. When no `Fixed point:` comment exists, post the comment before the first change on a best-effort basis: `gh issue comment <n> --body "Fixed point: <output of git rev-parse HEAD>"`. Proceed with implementation when an enterprise policy blocks the comment, as ticket-tagged commits (`(#<ticket>)`) allow review to derive the fixed point from Git history.
4. Fold settled answers before modifying code. Query `## Answers` comments via `gh issue view <n> --json comments --jq '[.comments[].body | select(index(({Answers:1}|keys[])) == 3)] | last // empty'`. Fold settled decisions into the ticket body via surgical body edit. When an answer alters a shared contract in the spec, update both the ticket body and the spec body.

### 2. Verify

Tailor verification to the repository, change type, and complexity tier:

- **Use existing test conventions**: Find the repository's test runner (such as `npm test`, `pytest`, `cargo test`, or `go test`) and test directories before writing code. Follow the existing conventions.
- **Reproduce defects first**: For `fix` feature types or `ship-it:bug` tickets, execute the reproduction seam in the spec's `## Testing Decisions` or the bug ticket's `## Reproduction seam` to confirm failure before modifying code.
- **Red-Green where tests apply**: Write a test for the next unit of behavior and watch the test fail. Write the minimal code that passes the test. Repeat for each acceptance criterion.
- **Direct checks elsewhere**: For documentation, configuration, assets, or repositories without a runner, verify each acceptance criterion with linting, type checks, builds, CLI checks, or inspection.

#### Complexity tiers

Scale verification scope to the complexity tier recorded on the ticket:

| Complexity | Scope |
| :--- | :--- |
| `low` | Restrict tests and direct checks to touched files. |
| `medium` | Execute domain module suites and test named edge cases. |
| `high` | Run broad test suites, audit cross-cutting invariants, and sweep callers outside touched files. |

#### Universal testing standards

Follow the universal testing standards defined in [writing.md](writing.md):

- Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition). Organize tests by domain, module, or feature seam rather than issue numbers.
- Follow the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition). Never invent test runners or string-matching scripts to simulate coverage for non-code changes.

### 3. Check as you go

Run type checks and targeted tests throughout development.
Before handoff, execute the full verification scope required by the ticket's complexity tier.
Sweep for negative invariants (such as "no callers of the old API remain") after implementation, using targeted search.

### 4. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design contracts, root causes, or reproduction seams.
When the ticket's low-level design, root cause, reproduction seam, or acceptance criteria conflict with active code or leave a design decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

### 5. Commit, push, and hand off

- Stage only the specific files modified for the ticket (`git add <file>...`) so temporary files never enter the commit.
- Derive the commit `<type>` from the branch prefix before `/`. Commit with the subject `<type>(<slug>): <summary> (#<ticket>)`. Every commit names its ticket; close-out traces files through these subjects.
- Push after every commit.
- Write the handoff comment to a temporary file, post the comment (`gh issue comment <n> --body-file <file>`), delete the temporary file, and return `done`. Leave the ticket assigned and open; the assignee signals that review is next.

```markdown
## Handoff
- **Commits**: <sha list>
- **Verification**: <tests run and results, or each criterion and its direct check>
```

## Rework

When the ticket carries `ship-it:changes-requested`:

1. Read the latest review report (plus any subsequent `## Answers` comment posted after that review) on the ticket via `gh issue view <n> --json comments --jq '[.comments[].body | select(index(({Review:1,Answers:1}|keys[])) == 3)] | (if (last | index(({Answers:1}|keys[])) == 3) then .[-2:] else [last] end)[]'`. Fold settled decisions from `## Answers` into the ticket body (and spec body when shared contracts change) via surgical body edit before modifying code.
2. Fix every Blocker, and add a test or direct check for each fix.
3. Commit and push per step 5. Keep the existing fixed point.
4. Write a `## Rework` comment explaining the fix and verification evidence for each Blocker to a temporary file, post the comment (`gh issue comment <n> --body-file <file>`), and delete the temporary file.
5. Remove the label (`gh issue edit <n> --remove-label "ship-it:changes-requested"`) and return `done`.

## Close-out

When `Mode` is `sync`, skip directly to [Synchronization](#synchronization).
When `Mode` is `initial`, fetch the target refs (`git fetch origin <default-branch> <branch>`), check out `<branch>`, and run these steps after the final review approves the spec:

1. Read the spec body (`gh issue view <spec> --json body --jq .body`) and closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`, keeping titles starting with `[<slug>]`). Open the pull request and delete the temporary body file once the command completes:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   List each closed ticket by title and include `Closes #<spec>` (plus `Closes #<issue>` when `## Source` names a request issue and `<spec-number> != <issue>`) so merging the pull request closes the spec.
   When closed `ship-it:bug` tickets with `stateReason` `COMPLETED` exist, append an `### Addendum Bugs` section listing each completed bug ticket as `- #<n> (<title>) - Closes #<n>`.

2. Annotate every changed file with one file-level review comment, deleting each temporary `<annotation-file>` after posting:

   ```shell
   gh pr diff <pr> --name-only
   gh pr view <pr> --json headRefOid --jq .headRefOid
   git merge-base origin/<default-branch> HEAD
   git log --format=%s <merge-base>..HEAD -- <file>
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

### Synchronization

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
   git log -F --grep="(#<bug-ticket>)" origin/<default-branch>..HEAD --name-only --format=
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
