# Preflight: verify the repo is set up, only when needed

`ship-it` assumes, by default, that a repo it's asked to work in already has
what it needs: the `gh` CLI (or GitHub MCP) installed and authenticated, a `github.com`
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

### Claude Code Configuration

To disable automatic model invocation in Claude Code while maintaining schema conformance,
configure `.claude/config.json` with `skillOverrides`:

```json
{
  "skillOverrides": {
    "ship-it": {
      "disableModelInvocation": true
    }
  }
}
```

This represents the zero-deviation configuration approach. Environments requiring
file-level overrides may specify `disable-model-invocation: true` directly at the root
of `SKILL.md` frontmatter, though this trades off strict validation conformance against
open agent skill schemas (e.g. `agentskills.io`).

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

## Tool Translation Table

`ship-it` abstracts all issue tracker interactions into 9 logical operations.
This central translation table maps each logical operation to both its `gh` CLI
invocation and its GitHub MCP (`mcp__github__*`) equivalent. Phase reference guides
call these logical operations directly.

| Logical Operation | Purpose | `gh` CLI Command | GitHub MCP Tool (`mcp__github__*`) |
| ----------------- | ------- | ---------------- | ----------------------------------- |
| `QueryArtifact` | Search and list issues by state, label, and slug | `gh issue list --label "<label>" --search "<slug> in:title" --json number,title,labels,assignees,state` | `mcp__github__search_issues` (`query: "repo:<owner>/<repo> label:<label> <slug> in:title state:open"`) or `mcp__github__list_issues` |
| `ReadIssue` | Fetch full issue details, metadata, and comments | `gh issue view <number> --comments` or `gh issue view <number> --json number,title,body,labels,assignees,state,comments` | `mcp__github__get_issue` and `mcp__github__get_issue_comments` |
| `CreateIssue` | Create a new map, spec, or ticket | `gh issue create --title "<title>" --body-file <file> --label "<labels>"` | `mcp__github__create_issue` (`owner`, `repo`, `title`, `body`, `labels`) |
| `UpdateIssue` | Update issue title, body, or labels | `gh issue edit <number> --title "<title>" --body-file <file> --add-label "<label>"` | `mcp__github__update_issue` (`owner`, `repo`, `issue_number`, `title`, `body`, `labels`) |
| `CommentIssue` | Add a comment to an existing issue | `gh issue comment <number> --body-file <file>` or `gh issue comment <number> --body "<text>"` | `mcp__github__add_issue_comment` (`owner`, `repo`, `issue_number`, `body`) |
| `AssignSelf` | Claim a ticket to prevent concurrent work | `gh issue edit <number> --add-assignee "@me"` | `mcp__github__add_assignees` or `mcp__github__update_issue` (`assignees: ["<user>"]`) |
| `CloseIssue` | Close an issue with resolution comment | `gh issue close <number> --comment "<text>"` | `mcp__github__update_issue` (`state: "closed"`) and `mcp__github__add_issue_comment` |
| `LinkDependency` | Link an issue as blocked by another | `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>` (or markdown fallback) | `mcp__github__update_issue` updating body with `## Blocked by` tasklist |
| `LinkParentChild` | Link a ticket to a parent spec or map | `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (or markdown fallback) | `mcp__github__create_issue` / `mcp__github__update_issue` setting `Part of #<spec-id>` |

## Cross-Platform Shell Conventions

All shell snippets and automated commands must follow these cross-platform rules:

- **Multi-line bodies**: Do not use Bash heredoc syntax or redirection blocks, as they fail under Windows PowerShell and non-POSIX environments. Use `--body-file <path>` (writing the body to a temporary or artifact file first) or `--body "<content>"` with properly escaped strings.
- **Assignee argument quoting**: Always quote `"@me"` when claiming tickets (`gh issue edit <number> --add-assignee "@me"`). In PowerShell, an unquoted `@me` is treated as an array subexpression and causes an execution error.
- **Single number space**: GitHub issues and pull requests share a single number space within a repository. Resolve a bare `#42` with `gh pr view 42`, falling back to `gh issue view 42`.
- **Feature slug**: Every issue for a feature carries a consistent slug in its title, e.g. `[auth-rewrite] Spec: ...`.

## Markdown Issue Relationship Contract

Native GitHub sub-issue and issue-dependency APIs (`dependencies/blocked_by` and `sub_issues`) require specific API previews and repository feature access. For universal compatibility across all GitHub repository tiers, tools, and MCP servers without API restrictions, `ship-it` defines the following markdown fallback contract:

1. **Parent-Child Linkage (`LinkParentChild`)**:
   - Child tickets record their parent association by including `Part of #<spec-id>` at the beginning of their body.
   - The parent spec body remains **immutable** once tickets are created; child tickets link up to the spec, avoiding race conditions or churn on the parent issue body.
2. **Dependency Edges (`LinkDependency`)**:
   - Tickets declare blockers in a designated markdown section:
     ```markdown
     ## Blocked by

     - [ ] Blocked by #<blocker-id>
     ```
   - When a blocker issue closes, its tasklist item can be checked (`- [x] Blocked by #<blocker-id>`).
3. **Orient Discovery & Unblocking**:
   - The Orient phase queries all tickets for a slug via `QueryArtifact` (`gh issue list --label "ship-it:ticket" --search "<slug> in:title"`).
   - A ticket is considered unblocked when all issues listed under its `## Blocked by` section are in the `closed` state.
