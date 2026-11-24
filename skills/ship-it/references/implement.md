# Implement: build, rework, and close out

## Implement

Build exactly what one ticket describes.
Requirements come only from the ticket body, spec body (`gh issue view <n> --json body --jq .body`), and settled `## Answers`.

### Process

#### 1. Branch and settled decisions

1. Fetch `origin/<default-branch>` and `origin/<branch>` (when on `origin`); check out `<branch>` if on `origin`, else create it from `origin/<default-branch>` and push (`git push -u origin <branch>`).
2. Fetch `## Answers` once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Answers")) | .body]'`. Fold settled decisions from the latest comment into the ticket body by surgical edit before coding (and the spec body on shared-contract changes).

Only `review` toggles `## Consolidation checklist` boxes after verification; keep every `- [ ]` untouched.

#### 2. Verify

Tailor verification to the change type:

- **Reproduce defects first**: For `fix` features or `ship-it:bug`, run the reproduction seam (spec `## Testing seams` or bug `## Reproduction seam`) to confirm failure first.
- **Red-Green**: Write a failing test first for each testable criterion.
- **Direct checks elsewhere**: For docs, config, assets, or runnerless repos, verify each criterion with linters, type checks, builds, CLI checks, or inspection.
- **Scope**: Run touched-module suites, named edge cases, and external caller sweeps on signature or contract changes.

#### 3. Check as you go

Before handoff, run the full scope and complete every `## Consolidation checklist` item.
Follow [ticket-naming](writing.md#ticket-naming-prohibition) and [transient-reference](writing.md#transient-reference-prohibition) prohibitions across code, tests, comments, docstrings, and docs, and sweep for negative invariants and transient references with targeted search.

#### 4. Ask instead of guessing

Never edit or reinterpret criteria, low-level design, root causes, or reproduction seams.
When any conflict with active code or leave a decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

#### 5. Commit, push, and hand off

- Stage only ticket files (`git add <file>...`).
- Commit as `<type>(<slug>): <summary> (#<ticket>)` (`<type>` = branch prefix before `/`), and push every commit.
- Post `## Handoff` (`gh issue comment <n> --body-file <file>`), delete the temp file, and return `done`, leaving the ticket assigned and open:

```markdown
## Handoff
- **Commits**: <sha list>
- **Verification**: <test results, or each criterion and checklist item with its direct check>
```

## Rework

Resolve every Blocker in the latest review of a `ship-it:changes-requested` ticket per [Implement](#implement), except:

1. Check out `<branch>`; read the latest `## Review:` report and later `## Answers`, folding them as in Implement step 1.
2. Fix every Blocker and sweep every unchecked checklist item, with a test or direct check. A Blocker also triggers [Ask instead of guessing](#4-ask-instead-of-guessing).
3. Commit and push as in Implement, then post `## Rework`:

```markdown
## Rework
- **Commits**: <sha list>
- **Fixes**: <each Blocker and swept item, fix, and check result>
```

4. Run `gh issue edit <n> --remove-label "ship-it:changes-requested" --add-assignee "@me"` and return `done`.

## Close-out

### Initial close-out

Fetch `<default-branch>` and `<branch>` from origin, check out `<branch>`, and run after final review approves:

1. Read the spec body and closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`). Check count per [writing.md](writing.md#bounded-search-truncation), keeping `[<slug>]`-prefixed issues. Write the body to a temp file, open the pull request, then delete the file:

   ```shell
   gh pr create --base <default-branch> --head <branch> --title "[<slug>] <spec gist>" --body-file <file>
   ```

   - **Closing references**: Main closing list: `Closes #<n>` (with title) for each `stateReason: COMPLETED` non-bug ticket, plus `Closes #<spec>` and distinct `Closes #<source>` (`## Source`). When `COMPLETED` `ship-it:bug` tickets exist, append `### Addendum Bugs` listing each as `- #<n> (<title>) - Closes #<n>`.
   - **Repository checklist**: Inspect target-repository guidance documents (such as instruction files, contributing guides, or pull request templates) for pull request checklist requirements and satisfy them dynamically against `origin/<default-branch>..HEAD` without hardcoding repository-specific metrics.
   - **Truncation notice**: At 100 items, embed the [writing.md](writing.md#bounded-search-truncation) warning in the body.

2. Annotate every changed file with one file-level review comment, deleting each temp `<annotation-file>` after posting:

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

### Pull request sync

Edit only the `OPEN` pull request body. Never match tickets from commit messages, post file-level comments, or merge:

1. Fetch `origin/<default-branch>` and `origin/<branch>`, and check out `<branch>`.
2. Query `gh pr list --head "<branch>" --state open --json number,body,url`. When no `OPEN` pull request exists, return `failed` with `Evidence: None`.
3. Query closed tickets (`gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state closed --limit 100 --json number,title,labels,stateReason`), checking truncation per [writing.md](writing.md#bounded-search-truncation). Select `[<slug>]`-prefixed `stateReason: COMPLETED` tickets lacking `Closes #<n>` (not followed by another digit) in the pull request body (`unsynced_tickets`). When `unsynced_tickets` is empty, return `failed` with `Evidence: None`.
4. Preserve all other body text. Append missing `Closes #<n>` for each unsynced ticket: `ship-it:bug` as `- #<n> (<title>) - Closes #<n>` under `### Addendum Bugs` (created when absent), non-bug in the main closing list. Discover and satisfy target-repository guidance checklist items (instruction files, contributing guides, PR templates) against `origin/<default-branch>..HEAD`. Embed the truncation warning at 100 results.
5. Write the updated body to a temp file, run `gh pr edit <pr> --body-file <file>`, delete the file, and return `done`.
