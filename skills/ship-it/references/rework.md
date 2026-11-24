# Rework: resolve ticket review blockers

Resolve every Blocker reported in the latest review of a ticket carrying `ship-it:changes-requested`.
The ticket body and its spec body (`gh issue view <n> --json body --jq .body`) are the only requirements.

## Process

### 1. Branch and review findings

1. Fetch the target refs (`git fetch origin <default-branch> <branch>`) and check out `<branch>`.
2. Fetch the ticket comments once via `gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Review:") or startswith("## Answers") or startswith("## Circuit Breaker Reset")) | .body]'`, and filter the returned array in-agent for the latest `## Review:` report and any subsequent `## Answers` or `## Circuit Breaker Reset` comments posted after that review.
3. Fold settled decisions from `## Answers` and `## Circuit Breaker Reset` into the ticket body (and the spec body when shared contracts change) via surgical body edit before modifying code. Preserve `## Consolidation checklist` items and existing `- [ ]` and `- [x]` states during edits (leaving any newly added items `- [ ]`), because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.

### 2. Ask instead of guessing

Never edit or reinterpret acceptance criteria, low-level design contracts, root causes, or reproduction seams, and preserve every existing checkbox state in `## Consolidation checklist` without toggling `- [ ]` to `- [x]`.
Silent contract edits bypass validation, and only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.
When a review Blocker, `## Consolidation checklist` item, low-level design contract, root cause, reproduction seam, or acceptance criterion conflicts with active code or leaves a design decision unwritten:

1. Post the question on the ticket.
2. Push any commits, and discard uncommitted work.
3. Unassign yourself: `gh issue edit <n> --remove-assignee "@me"`.
4. Return `questions`.

### 3. Fix and verify

Fix every Blocker from the latest review report, sweep and verify every remaining unchecked `- [ ]` item in `## Consolidation checklist` (when present), and add a test or direct check for each fix and swept item.
Leave all `## Consolidation checklist` checkboxes unchanged without toggling `- [ ]` to `- [x]`, because only `review` toggles checkboxes after independent verification so unverified self-checkoffs never bypass review.
Scale verification scope to the complexity tier recorded on the ticket:

| Complexity | Scope |
| :--- | :--- |
| `low` | Restrict tests and direct checks to touched files. |
| `medium` | Execute domain module suites and test named edge cases. |
| `high` | Run broad test suites, audit cross-cutting invariants, and sweep callers outside touched files. |

Follow the [ticket-naming prohibition](writing.md#ticket-naming-prohibition) and [transient-reference prohibition](writing.md#transient-reference-prohibition) across source files, tests, comments, and docstrings.
Sweep for negative invariants and transient references after applying fixes, using targeted search.

### 4. Commit, push, and hand off

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
