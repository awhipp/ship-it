# Preflight: verify repository setup, only when needed

`ship-it` assumes an installed and authenticated `gh` CLI, a `github.com` remote, writable GitHub Issues, and the required label set.
Run this checklist only in three situations:

- The user runs `ship-it preflight` or `ship-it init`.
- A `gh` command or shell command fails during a run.
- The user runs a version directive from `SKILL.md` § 1, which runs Check 0 only.

## Checklist

Run every check, then report all findings at once and halt:

0. **Skill version**: Read `version.json` in the skill directory to report the installed `version`, `released` date, and `minGhVersion`. Query the latest upstream release with `gh api repos/awhipp/ship-it/releases/latest --jq '{tag: .tag_name, date: .published_at}'`. On network or API failure, report the local version details instead.
1. **`gh` version**: Run `gh --version`. Require `gh` at or above the `minGhVersion` value read from `version.json` in Check 0 for every `gh` flag and JSON field the skill requires. Native-link flags are not required.
2. **GitHub remote**: Run `git remote -v` and confirm a `github.com` remote exists.
3. **Authentication**: Run `gh auth status` and confirm an active login.
4. **Writable issues**: Run `gh repo view --json hasIssuesEnabled,viewerPermission`. Confirm `hasIssuesEnabled` is `true` and `viewerPermission` is `WRITE`, `MAINTAIN`, or `ADMIN`.
5. **Labels**: Run `gh label list --search "ship-it:" --limit 100 --json name`. Inspect the returned array count and emit the warning in [writing.md](writing.md#bounded-search-truncation) when 100 labels return before checking missing labels. Verify that every label below exists, and run the matching command below only for each missing label, so customized existing labels keep their colors and descriptions.
6. **PowerShell session**: Read `$PSVersionTable` in the current session shell only, spawning no other shell. When `$PSVersionTable` is undefined, report nothing. When `PSEdition` is not `Core` or `PSVersion` is below 7.4, add an advisory finding that names the migration to `pwsh` 7.4 or later.

## Shell conventions

- **Shell floor**: Run commands in POSIX shells or `pwsh` 7.4 or later on Windows. Windows PowerShell 5.1 is unsupported.
- **Multi-line text**: Prefer a file-writing tool or a single-quoted PowerShell here-string (`@' ... '@`) over Bash heredocs or double-quoted PowerShell strings, so Markdown backticks stay literal.
- **Surgical body edits**: Fetch the body (`gh issue view <n> --json body --jq .body`) to a temporary file, edit only the target section, inspect `git --no-pager diff --no-index` (exit code `1` means differences, not failure), then run `gh issue edit <n> --body-file <path>` and delete the file.
- **PowerShell quoting**: Quote `"@me"` and `"repos/{owner}/{repo}/..."`, because PowerShell parses them as a splat and a script block.
- **Explicit-path search**: Give every `rg`, `grep`, or `find` an explicit path. Reserve pathless `grep` for pipeline filters. Unpathed `find` on Windows invokes `find.exe`.
- **Non-interactive runs**: Pass flags such as `--yes` and set `GIT_TERMINAL_PROMPT=0` (`$env:GIT_TERMINAL_PROMPT = '0'` in `pwsh`). Redirect `< /dev/null` in POSIX shells or pipe `$null | <cmd>` in `pwsh` when a command might read standard input.
- **No pagers**: Use `git --no-pager` or `--json --jq`. Otherwise set `GIT_PAGER=cat` or `GH_PAGER=cat` (`$env:` form in `pwsh`).
- **Transient write retry**: When a `gh` write fails with a GraphQL, HTTP 5xx, or timeout error, read the target back first (`gh issue view <n> --json title,body,labels,state,comments`, `gh issue list --state open --limit 100 --json number,title`, or `gh pr list --head "<branch>" --state all --json number,state,url`). Retry once only when the mutation is absent, and keep the temporary `--body-file` until then. A subagent returns `failed` on a repeated error.

## Label set

Apply at most one type label per issue, plus any applicable status and provenance labels:

| Label | Kind | Applied to |
| :--- | :--- | :--- |
| `ship-it:map` | type | Feature map ([plan.md](plan.md)) |
| `ship-it:spec` | type | Feature specification ([plan.md](plan.md#spec)) |
| `ship-it:ticket` | type | Build ticket ([tickets.md](tickets.md)) |
| `ship-it:bug` | provenance | Addendum defect ticket ([tickets.md](tickets.md#bug-preparation)) |
| `ship-it:research` | type | Research decision ticket ([plan.md](plan.md)) |
| `ship-it:prototype` | type | Prototype decision ticket ([plan.md](plan.md)) |
| `ship-it:grilling` | type | Grilling decision ticket ([plan.md](plan.md)) |
| `ship-it:task` | type | Task decision ticket ([plan.md](plan.md)) |
| `ship-it:validated` | status | Spec or ticket that passed validation ([verify.md](verify.md#target-spec), [verify.md](verify.md#target-ticket-set)) |
| `ship-it:reviewed` | status | Ticket diff or full feature PR diff that passed review ([verify.md](verify.md#target-ticket), [verify.md](verify.md#target-final)) |
| `ship-it:changes-requested` | status | Spec or ticket with unresolved Blockers ([verify.md](verify.md#target-spec), [verify.md](verify.md#target-ticket-set), [verify.md](verify.md#target-ticket)) |

Create each missing label with its idempotent command:

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
