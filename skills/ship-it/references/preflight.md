# Preflight: verify repository setup, only when needed

`ship-it` assumes that the target repository provides necessary tools by default.
Required setup includes an installed and authenticated `gh` CLI, a `github.com` remote, and writable issues.
Standard runs bypass preflight checks to orient on the feature directly.

Execute the checklist below only in two situations:

- The user explicitly requests preflight (`ship-it preflight` or `/ship-it preflight`).
- An issue command during a phase fails with an environmental error.

Environmental errors include authentication failures, missing remotes, permission errors, disabled issues, or missing labels.
Run the checklist to identify the underlying failure before retrying.

## The checklist

Execute every check below before reporting findings.
Collect all failures rather than halting on the first error.
Reporting all failures at once saves user time.

- **`gh` installed**: Run `gh --version`.
  If missing, report: "Install the GitHub CLI: <https://cli.github.com>".
- **GitHub remote**: Verify that `git remote -v` contains a `github.com` URL.
  If missing, report: "`ship-it` tracks specs and tickets as GitHub issues; this repository requires a github.com remote."
- **Authenticated**: Run `gh auth status`.
  If not logged in, report: "Run `gh auth login`."

The remaining checks call the GitHub API and require the initial checks to pass:

- **Issues enabled and writable**: Run `gh repo view --json hasIssuesEnabled,viewerPermission`.
  - If `hasIssuesEnabled` is false, report: "Enable Issues for this repository (Settings → General → Features → Issues)."
  - If `viewerPermission` is not `WRITE`, `MAINTAIN`, or `ADMIN`, report: "You require write access to open issues, or point `ship-it` to a writable fork."
- **Labels exist**: Run `gh label list` and verify against the required label set below.

## Harness & Invocation Configuration

See [Invocation & Harness Configuration](../SKILL.md#invocation-harness-configuration) for the manual-only invocation policy.

## The label set

Every label used across `ship-it` phases appears below.
**Type labels** identify issue types; apply at most one type label per issue.
**Status labels** mark issue states (such as pickable, audited, or reviewed).
Apply any number of status labels alongside the type label.

| Label | Kind | Applied to |
| --- | --- | --- |
| `ship-it:map` | type | Feature map issue ([plan.md](plan.md)) |
| `ship-it:spec` | type | Published spec issue ([spec.md](spec.md)) |
| `ship-it:ticket` | type | Build ticket ([tickets.md](tickets.md)) |
| `ship-it:research` | type | Research decision ticket, child of a map |
| `ship-it:prototype` | type | Prototype decision ticket, child of a map |
| `ship-it:grilling` | type | Grilling decision ticket, child of a map |
| `ship-it:task` | type | Task decision ticket, child of a map |
| `ready-for-agent` | status | Work item ready for agent pickup |
| `ship-it:validated` | status | Spec, ticket set, or map passed adversarial audit ([validate.md](validate.md)) |
| `ship-it:reviewed` | status | Ticket diff passed independent review ([review.md](review.md)) |

## Fix what is fixable, report the rest

Most configuration failures require user intervention.
Prompt the user to install `gh`, log in, add a remote, or adjust repository permissions.
Missing labels are safe to create automatically.
Create missing labels using the specified descriptions and colors:

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

Retry the failed operation after creating missing labels.
Report the failure clearly if all checks pass and errors persist.

## Canonical `gh` CLI Commands

The table below outlines canonical `gh` CLI commands across `ship-it` phases:

| Action | Purpose | `gh` CLI Command |
| --- | --- | --- |
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

Follow these cross-platform rules for all shell commands:

- **Multi-line bodies**: Avoid Bash heredocs or redirection blocks, which fail under Windows PowerShell. Use `--body-file <path>` or `--body "<content>"` with properly escaped strings.
- **Assignee argument quoting**: Always quote `"@me"` when claiming tickets (`gh issue edit <number> --add-assignee "@me"`). Unquoted `@me` acts as an array expression in PowerShell and fails.
- **Single number space**: GitHub issues and pull requests share a single number namespace. Resolve bare issue numbers with `gh pr view <number>`, then fall back to `gh issue view <number>`.
- **Feature slug**: Include a consistent feature slug in all issue titles (e.g., `[auth-rewrite] Spec: ...`).

## Markdown Relationship Contract

Consult the [Markdown Relationship Contract](tickets.md#markdown-relationship-contract) for dependency relationships across repository tiers.
See the [Orient Discovery Algorithm](../SKILL.md#orient-discovery-algorithm) for frontier resolution.
