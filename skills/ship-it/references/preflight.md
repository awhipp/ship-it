# Preflight: verify the repo is set up, only when needed

`ship-it` assumes, by default, that a repo it's asked to work in already has
what it needs: the `gh` CLI installed and authenticated, a `github.com`
remote, and Issues enabled with write access. Normal runs don't check any of
this — they go straight into orienting on the feature and doing the next
phase's work.

Run the checklist below in exactly two situations:

- The user explicitly asks (`ship-it preflight`, `/ship-it preflight`, or the equivalent in
  conversation).
- An issue tool call during a normal phase fails in a way that matches one of the
  checks below (auth error, repo/remote not found, permission denied, Issues
  disabled, missing label). Don't guess at the fix or retry blindly — run the
  relevant check, confirm what's actually wrong, and go from there.

## The checklist

Run every check below before reporting anything, and collect every failure
rather than stopping at the first one: a user who fixes one blocker, re-runs,
and immediately hits the next spends more time than a user handed the whole
list up front.

- **`gh` installed**: `gh --version`. Missing → "Install the GitHub CLI:
  <https://cli.github.com>".
- **GitHub remote**: `git remote -v` includes a `github.com` URL. Missing →
  "`ship-it` tracks specs and tickets as GitHub issues; this repo needs a
  github.com remote."
- **Authenticated**: `gh auth status`. Not logged in → "Run `gh auth login`."

The next two checks need the first three to pass (they call the GitHub API),
so only run them if nothing above failed:

- **Issues enabled and writable**: `gh repo view --json hasIssuesEnabled,viewerPermission`.
  - `hasIssuesEnabled` false → "Enable Issues for this repo (Settings → General
    → Features → Issues)."
  - `viewerPermission` isn't one of `WRITE`, `MAINTAIN`, `ADMIN` → "You need
    write access to open issues here, or point `ship-it` at a fork you can
    write to."
- **Labels exist**: `gh label list`, checked against the full set below.

## Harness & Invocation Configuration

`ship-it` is designed as a manual-only workflow and should not be invoked automatically
by models without explicit user request.

## The label set

Every label `ship-it` uses, across all phases. **Type labels** mark what an
issue _is_ (mutually exclusive — one per issue); **status labels** mark
something orthogonal to type — pickable, audited, reviewed — and any number
of them can sit on one issue alongside its type label.

| Label               | Kind   | Applied to                                                                                               |
| ------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| `ship-it:map`       | type   | the feature map issue (`plan.md`)                                                                        |
| `ship-it:spec`      | type   | a published spec issue (`spec.md`)                                                                       |
| `ship-it:ticket`    | type   | a build ticket (`tickets.md`)                                                                            |
| `ship-it:research`  | type   | a research decision ticket, child of a map                                                               |
| `ship-it:prototype` | type   | a prototype decision ticket, child of a map                                                              |
| `ship-it:grilling`  | type   | a grilling decision ticket, child of a map                                                               |
| `ship-it:task`      | type   | a task decision ticket, child of a map                                                                   |
| `ready-for-agent`   | status | anything pickable by an agent, any type                                                                  |
| `ship-it:validated` | status | a spec, ticket set, or map that passed a fresh-context adversarial audit (`validate.md`), zero blockers  |
| `ship-it:reviewed`  | status | a ticket whose diff passed independent review (`review.md`); required before close-out                   |

## Fix what's fixable, report the rest

Most failures need the user to act (install `gh`, log in, add a remote,
change repo settings) — report those as the checklist above states them.

Missing labels are safe to fix automatically. Create each one missing from
the set above, with a description and a consistent color per kind, then
retry whatever action originally failed rather than just reporting the label
was missing:

```shell
gh label create "ready-for-agent" --description "Ready for an agent to pick up" --color "0E8A16"
gh label create "ship-it:map" --description "Feature map: open decisions for an effort too big or foggy for one session" --color "5319E7"
gh label create "ship-it:spec" --description "Published spec" --color "5319E7"
gh label create "ship-it:ticket" --description "Build ticket, a vertical slice of a spec" --color "5319E7"
gh label create "ship-it:research" --description "Map decision ticket: resolved by reading docs/APIs/code" --color "1D76DB"
gh label create "ship-it:prototype" --description "Map decision ticket: resolved by building a throwaway artifact" --color "1D76DB"
gh label create "ship-it:grilling" --description "Map decision ticket: resolved by asking the user" --color "1D76DB"
gh label create "ship-it:task" --description "Map decision ticket: resolved by doing the work" --color "1D76DB"
gh label create "ship-it:validated" --description "Artifact passed fresh-context adversarial audit (zero blockers)" --color "0E8A16"
gh label create "ship-it:reviewed" --description "Diff passed independent review; ready to close out" --color "0E8A16"
```

If every check passes and the failure that triggered this still doesn't make
sense, say so plainly rather than guessing further.

## Canonical `gh` CLI Commands

The following table summarizes the canonical, cross-platform `gh` CLI commands used across `ship-it` phases:

| Action | Purpose | `gh` CLI Command |
| ------ | ------- | ---------------- |
| Query issues | Search and list issues by state, label, and slug | `gh issue list --label "<label>" --search "<slug> in:title" --json number,title,labels,assignees,state` |
| View issue | Fetch full issue details, metadata, and comments | `gh issue view <number> --comments` or `gh issue view <number> --json number,title,body,labels,assignees,state,comments` |
| Create issue | Create a new map, spec, or ticket | `gh issue create --title "<title>" --body-file <file> --label "<labels>"` |
| Edit issue | Update issue title, body, or labels | `gh issue edit <number> --title "<title>" --body-file <file> --add-label "<label>"` |
| Comment on issue | Add a comment to an existing issue | `gh issue comment <number> --body-file <file>` or `gh issue comment <number> --body "<text>"` |
| Claim ticket | Claim a ticket to prevent concurrent work | `gh issue edit <number> --add-assignee "@me"` |
| Close issue | Close an issue with resolution comment | `gh issue close <number> --comment "<text>"` |
| Link dependency | Link an issue as blocked by another | `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` (or markdown fallback) |
| Link parent/child | Link a ticket to a parent spec or map | `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (or markdown fallback) |

## Cross-Platform Shell Conventions

All shell snippets and automated commands must follow these cross-platform rules:

- **Multi-line bodies**: Do not use Bash heredoc syntax or redirection blocks, as they fail under Windows PowerShell and non-POSIX environments. Use `--body-file <path>` (writing the body to a temporary or artifact file first) or `--body "<content>"` with properly escaped strings.
- **Assignee argument quoting**: Always quote `"@me"` when claiming tickets (`gh issue edit <number> --add-assignee "@me"`). In PowerShell, an unquoted `@me` is treated as an array subexpression and causes an execution error.
- **Single number space**: GitHub issues and pull requests share a single number space within a repository. Resolve a bare `#42` with `gh pr view 42`, falling back to `gh issue view 42`.
- **Feature slug**: Every issue for a feature carries a consistent slug in its title, e.g. `[auth-rewrite] Spec: ...`.

## Markdown Issue Relationship Contract

For universal compatibility across all GitHub repository tiers without relying on preview API access, `ship-it` uses the Markdown Relationship Contract canonicalized in [references/tickets.md](tickets.md). This defines Parent-Child Linkage (`Part of #<spec-id>`), Dependency Edges (`## Blocked by`), and Orient Discovery rules.

Where native GitHub sub-issue or dependency APIs are unavailable, this markdown contract serves as the primary relationship store across all phases.
