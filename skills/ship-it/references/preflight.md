# Preflight: verify repository setup, only when needed

`ship-it` assumes an installed and authenticated `gh` CLI, a `github.com` remote, writable GitHub Issues, and the required label set.
Run this checklist only in two situations:

- The user runs `ship-it preflight` or `ship-it init`.
- A `gh` command fails during a run.

## Checklist

Run every check before reporting findings so the user sees all issues at once:

0. **Skill version**: Read `skills/ship-it/version.json` to report the installed version and release date. Query the latest upstream release with `gh api repos/awhipp/ship-it/releases/latest --jq '{tag: .tag_name, date: .published_at}'`. On network or API failure, report local version details and continue the checklist.
1. **`gh` version**: Run `gh --version`. Require version `2.94.0` or later for native sub-issue and dependency flags (`--parent`, `--blocked-by`, and JSON fields `subIssues`, `blockedBy`).
2. **GitHub remote**: Run `git remote -v` and confirm a `github.com` remote exists.
3. **Authentication**: Run `gh auth status` and confirm an active login.
4. **Writable issues**: Run `gh repo view --json hasIssuesEnabled,viewerPermission`. Confirm `hasIssuesEnabled` is `true` and `viewerPermission` is `WRITE`, `MAINTAIN`, or `ADMIN`.
5. **Labels**: Run `gh label list --search "ship-it:" --limit 100 --json name`. Inspect the returned array count and emit the warning in [writing.md](writing.md#bounded-search-truncation) when 100 labels return before checking missing labels. Verify that every label below exists, and create or update any missing labels automatically.

## Label set

Apply at most one type label per issue, plus any applicable status and provenance labels:

| Label | Kind | Applied to |
| :--- | :--- | :--- |
| `ship-it:map` | type | Feature map ([plan.md](plan.md)) |
| `ship-it:spec` | type | Feature specification ([spec.md](spec.md)) |
| `ship-it:ticket` | type | Build ticket ([tickets.md](tickets.md)) |
| `ship-it:bug` | provenance | Addendum defect ticket ([tickets.md](tickets.md#bug-preparation)) |
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
gh label create "ship-it:bug" --description "Addendum defect ticket" --color "D73A4A" --force
gh label create "ship-it:research" --description "Decision ticket resolved by reading docs or code" --color "1D76DB" --force
gh label create "ship-it:prototype" --description "Decision ticket resolved by a throwaway prototype" --color "1D76DB" --force
gh label create "ship-it:grilling" --description "Decision ticket resolved by asking the user" --color "1D76DB" --force
gh label create "ship-it:task" --description "Decision ticket resolved by concrete setup work" --color "1D76DB" --force
gh label create "ship-it:validated" --description "Passed adversarial validation" --color "0E8A16" --force
gh label create "ship-it:reviewed" --description "Passed independent diff review" --color "0E8A16" --force
gh label create "ship-it:changes-requested" --description "Unresolved validation or review blockers" --color "D93F0B" --force
```
