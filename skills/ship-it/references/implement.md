# Implement: build one ticket, verified

Build exactly what one ticket describes.
The ticket body and its spec body (`gh issue view <n> --json body --jq .body`) are the only requirements.

## Process

### 1. Branch and fixed point

1. Read the branch name from the spec's `## Source` (`<type>/<slug>`).
2. Fetch the target refs (`git fetch origin <default-branch>` and `git fetch origin <branch>` when the branch exists on `origin`). Check out the branch when it exists on `origin`; otherwise create the branch from `origin/<default-branch>` and push the branch with `git push -u origin <branch>`.
3. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[].body]'`, and check the returned array in-agent for an existing `Fixed point:` comment. When no `Fixed point:` comment exists, post the comment before the first change on a best-effort basis: `gh issue comment <n> --body "Fixed point: <output of git rev-parse HEAD>"`. Proceed with implementation when an enterprise policy blocks the comment, as ticket-tagged commits (`(#<ticket>)`) allow review to derive the fixed point from Git history.
4. Inspect the comment array fetched in step 3 in-agent for the latest `## Answers` or `## Circuit Breaker Reset` comment, and fold settled decisions into the ticket body via surgical body edit before modifying code. When a decision alters a shared contract in the spec, update both the ticket body and the spec body.

### 2. Verify

Tailor verification to the repository, change type, and complexity tier:

- **Use existing test conventions**: Run the repository's existing test runner and the test seams named in the spec and ticket before writing code.
- **Reproduce defects first**: For `fix` feature types or `ship-it:bug` tickets, execute the reproduction seam in the spec's `## Testing Decisions` or the bug ticket's `## Reproduction seam` to confirm failure before modifying code.
- **Red-Green where tests apply**: Write a failing test first for each acceptance criterion where tests apply.
- **Direct checks elsewhere**: For documentation, configuration, assets, or repositories without a runner, verify each acceptance criterion with linting, type checks, builds, CLI checks, or inspection.

#### Complexity tiers

Scale verification scope to the complexity tier recorded on the ticket:

| Complexity | Scope |
| :--- | :--- |
| `low` | Restrict tests and direct checks to touched files. |
| `medium` | Execute domain module suites and test named edge cases. |
| `high` | Run broad test suites, audit cross-cutting invariants, and sweep callers outside touched files. |

### 3. Check as you go

Run type checks and targeted tests throughout development.
Before handoff, execute the full verification scope required by the ticket's complexity tier.
Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition) and [transient-reference prohibition](writing.md#transient-reference-prohibition) across source files, tests, comments, and docstrings.
Sweep for negative invariants (such as "no callers of the old API remain") and transient references after implementation, using targeted search.

### 4. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design contracts, root causes, or reproduction seams.
Silent contract edits bypass validation and hide design drift from review.
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
