# Implement: build one ticket, verified

Build exactly what one ticket describes.
The ticket, its parent spec, and their `## Answers` comments are the only requirements.

## Process

### 1. Branch and fixed point

1. Read the branch name from the spec's `## Source` (`<type>/<slug>`).
2. Fetch the target refs (`git fetch origin <default-branch>` and `git fetch origin <branch>` when the branch exists on `origin`). Check out the branch when it exists on `origin`; otherwise create the branch from `origin/<default-branch>` and push the branch with `git push -u origin <branch>`.
3. Unless the ticket already has a `Fixed point:` comment, post one before the first change: `gh issue comment <n> --body "Fixed point: <output of git rev-parse HEAD>"`.

### 2. Verify

Tailor verification to the repository and the change type:

- **Use existing test conventions**: Find the repository's test runner (such as `npm test`, `pytest`, `cargo test`, or `go test`) and test directories before writing code. Follow the existing conventions.
- **Red-Green where tests apply**: Write a test for the next unit of behavior and watch the test fail. Write the minimal code that passes the test. Repeat for each acceptance criterion.
- **Direct checks elsewhere**: For documentation, configuration, assets, or repositories without a runner, verify each acceptance criterion with linting, type checks, builds, CLI checks, or inspection.

#### Ticket-naming prohibition

Never name test or source files after issue numbers (such as `ticket-18.test.js`).
Tests outlive issues.
Organize tests by domain, module, or feature seam (such as `tests/auth.test.ts`).

#### Ad-hoc test harness prohibition

Never invent test runners or string-matching scripts to simulate coverage for non-code changes.
Never write scripts that count words or measure prose; evaluate writing by reading it.

### 3. Check as you go

Run type checks and targeted tests for affected modules throughout.
Before handoff, run the affected package or domain test suite defined in the spec's `## Testing Decisions` (or the full repository suite when fast and self-contained).
Sweep for negative invariants (such as "no callers of the old API remain") after implementation, using targeted search.

### 4. Ask instead of guessing

Never edit acceptance criteria or low-level design contracts, and never reinterpret them.
When the ticket's low-level design or acceptance criteria conflict with active code or leave a design decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

### 5. Commit, push, and hand off

- Stage only the specific files modified for the ticket (`git add <file>...`) so temporary files never enter the commit.
- Commit with the subject `<type>(<slug>): <summary> (#<ticket>)`. Every commit names its ticket; close-out traces files through these subjects.
- Push after every commit.
- Write the handoff comment to a temporary file, post the comment (`gh issue comment <n> --body-file <file>`), delete the temporary file, and return `done`. Leave the ticket assigned and open; the assignee signals that review is next.

```markdown
## Handoff
- **Commits**: <sha list>
- **Verification**: <tests run and results, or each criterion and its direct check>
```

## Rework

When the ticket carries `ship-it:changes-requested`:

1. Read the latest review report on the ticket.
2. Fix every Blocker, and add a test or direct check for each fix.
3. Commit and push per step 5. Keep the existing fixed point.
4. Write a `## Rework` comment explaining the fix and verification evidence for each Blocker to a temporary file, post the comment (`gh issue comment <n> --body-file <file>`), and delete the temporary file.
5. Remove the label (`gh issue edit <n> --remove-label "ship-it:changes-requested"`) and return `done`.

## Close-out

Run after the final review approves the spec.

1. Open the pull request and delete the temporary body file once the command completes:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   The body lists each ticket by title and contains `Closes #<spec>`.
   Add `Closes #<issue>` when `## Source` names a request issue.
   Merging the pull request closes the spec.

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

3. Post a completion comment on the spec with the pull request link (`gh issue comment <spec> --body "<text>"`).
4. Return `done`. Never merge the pull request.
