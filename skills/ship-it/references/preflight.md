# Preflight: verify repository setup, only when needed

`ship-it` assumes an installed and authenticated `gh` CLI, a `github.com` remote, writable GitHub Issues, and the required label set.
Run this checklist only in two situations:

- The user runs `ship-it preflight`.
- A `gh` command fails during a run.

## Checklist

Run every check before reporting findings so the user sees all issues at once:

1. **`gh` version**: Run `gh --version`. Require version `2.94.0` or later for native sub-issue and dependency flags (`--parent`, `--blocked-by`, and JSON fields `subIssues`, `blockedBy`).
2. **GitHub remote**: Run `git remote -v` and confirm a `github.com` remote exists.
3. **Authentication**: Run `gh auth status` and confirm an active login.
4. **Writable issues**: Run `gh repo view --json hasIssuesEnabled,viewerPermission`. Confirm `hasIssuesEnabled` is `true` and `viewerPermission` is `WRITE`, `MAINTAIN`, or `ADMIN`.
5. **Labels**: Run `gh label list --search "ship-it:" --limit 100 --json name` and verify that every label below exists. Create or update any missing labels automatically.

## Label set

Apply at most one type label per issue, plus any applicable status labels:

| Label | Kind | Applied to |
| :--- | :--- | :--- |
| `ship-it:map` | type | Feature map ([plan.md](plan.md)) |
| `ship-it:spec` | type | Feature specification ([spec.md](spec.md)) |
| `ship-it:ticket` | type | Build ticket ([tickets.md](tickets.md)) |
| `ship-it:research` | type | Research decision ticket ([plan.md](plan.md)) |
| `ship-it:prototype` | type | Prototype decision ticket ([plan.md](plan.md)) |
| `ship-it:grilling` | type | Grilling decision ticket ([plan.md](plan.md)) |
| `ship-it:task` | type | Task decision ticket ([plan.md](plan.md)) |
| `ship-it:validated` | status | Spec or ticket that passed validation ([validate.md](validate.md)) |
| `ship-it:reviewed` | status | Ticket diff or full feature PR diff that passed review ([review.md](review.md)) |
| `ship-it:changes-requested` | status | Spec or ticket with unresolved Blockers ([validate.md](validate.md), [review.md](review.md)) |

Create or update labels with these idempotent commands:

```shell
gh label create "ship-it:map" --description "Feature map of open decisions" --color "5319E7" --force
gh label create "ship-it:spec" --description "Published specification" --color "5319E7" --force
gh label create "ship-it:ticket" --description "Vertical build ticket" --color "5319E7" --force
gh label create "ship-it:research" --description "Decision ticket resolved by reading docs or code" --color "1D76DB" --force
gh label create "ship-it:prototype" --description "Decision ticket resolved by a throwaway prototype" --color "1D76DB" --force
gh label create "ship-it:grilling" --description "Decision ticket resolved by asking the user" --color "1D76DB" --force
gh label create "ship-it:task" --description "Decision ticket resolved by concrete setup work" --color "1D76DB" --force
gh label create "ship-it:validated" --description "Passed adversarial validation" --color "0E8A16" --force
gh label create "ship-it:reviewed" --description "Passed independent diff review" --color "0E8A16" --force
gh label create "ship-it:changes-requested" --description "Unresolved validation or review blockers" --color "D93F0B" --force
```

## Canonical `gh` CLI commands

| Action | Command |
| :--- | :--- |
| Query issues by label and slug | `gh issue list --label "<label>" --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,state` |
| View issue and comments | `gh issue view <n> --comments` or `gh issue view <n> --json number,title,body,labels,assignees,state,comments` |
| Create issue | `gh issue create --title "<title>" --body-file <file> --label "<labels>"` |
| Edit issue | `gh issue edit <n> --title "<title>" --body-file <file> --add-label "<label>" --remove-label "<label>"` |
| Comment on issue | `gh issue comment <n> --body-file <file>` or `gh issue comment <n> --body "<text>"` |
| Claim ticket | `gh issue edit <n> --add-assignee "@me"` |
| Unclaim ticket | `gh issue edit <n> --remove-assignee "@me"` |
| Close issue | `gh issue close <n> --comment "<text>"` |
| Link sub-issue or blocker | `gh issue create --parent <parent> --blocked-by <blocker>` or `gh issue edit <n> --add-blocked-by <blocker>` |
| Query dependencies | `gh issue view <n> --json blockedBy,parent,subIssues` |
| Query pull requests | `gh pr list --head "<branch>" --state all --json number,state,url` |
| Create pull request | `gh pr create --base <default-branch> --head <branch> --title "<title>" --body-file <file>` |
| List pull request files | `gh pr diff <pr> --name-only` |
| Get pull request head SHA | `gh pr view <pr> --json headRefOid --jq .headRefOid` |
| Annotate pull request file (sole `gh api` exception) | `gh api "repos/{owner}/{repo}/pulls/<pr>/comments" -f commit_id=<sha> -f path=<file> -f subject_type=file -F body=@<file>` |

## Cross-platform shell conventions

- **Multi-line bodies**: Write multi-line text to a temporary file using a file-writing tool or a single-quoted PowerShell here-string (`@' ... '@`), pass `--body-file <path>` or `-F body=@<path>`, and delete the temporary file immediately after the `gh` command completes. Never use Bash heredocs or double-quoted PowerShell strings (`"..."`), which interpret Markdown backticks as escape characters.
- **PowerShell special characters**: Always quote `"@me"` (`--add-assignee "@me"`) and `"repos/{owner}/{repo}/..."` in `gh api` calls. PowerShell parses unquoted `@me` as a splat expression and unquoted `{owner}` as a script block.
- **Title prefix**: Prefix every issue and pull request title with `[<slug>]`.
