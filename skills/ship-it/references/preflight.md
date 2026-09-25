# Preflight: verify the repo is set up, only when needed

`ship-it` assumes, by default, that a repo it's asked to work in already has
what it needs: the `gh` CLI installed and authenticated, a `github.com`
remote, and Issues enabled with write access. Normal runs don't check any of
this — they go straight into orienting on the feature and doing the next
phase's work.

Run the checklist below in exactly two situations:

- The user explicitly asks (`/ship-it preflight`, or the equivalent in
  conversation).
- A `gh` call during a normal phase fails in a way that matches one of the
  checks below (auth error, repo/remote not found, permission denied, Issues
  disabled, missing label). Don't guess at the fix or retry blindly — run the
  relevant check, confirm what's actually wrong, and go from there.

## The checklist

Run every check below before reporting anything, and collect every failure
rather than stopping at the first one: a user who fixes one blocker, re-runs,
and immediately hits the next spends more time than a user handed the whole
list up front.

- **`gh` installed**: `command -v gh`. Missing → "Install the GitHub CLI:
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

```bash
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

## GitHub conventions

Every phase follows these for anything it needs to do:

- **Create**: `gh issue create --title "..." --body "..."` (heredoc for
  multi-line bodies). Add `--label "ready-for-agent"` for anything ready for an
  agent to pick up.
- **Read**: `gh issue view <number> --comments`.
- **List / query**: `gh issue list --state open --json number,title,body,labels,comments,assignees` with `--label` filters as needed.
- **Comment**: `gh issue comment <number> --body "..."`.
- **Label**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`.
- **Close**: `gh issue close <number> --comment "..."`.
- **Claim** (assign to self): `gh issue edit <number> --add-assignee @me`.
- **Blocking edge**: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`.
  The blocker id here is its numeric **database id**
  (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`), not the `#number`.
- **Sub-issue / child-of-parent link** (map → decision ticket, or spec → build
  ticket): `gh api --method POST repos/<owner>/<repo>/issues/<parent-number>/sub_issues -F sub_issue_id=<child-db-id>`.
  Same caveat as above: `sub_issue_id` is the child's numeric **database id**,
  not its `#number`. `<parent-number>` is the plain issue number, not a database id.
- The repo shares one number space across issues and PRs: resolve a bare
  `#42` with `gh pr view 42`, falling back to `gh issue view 42`.
- **Feature slug**: every issue for a feature carries a consistent slug in its
  title, e.g. `[auth-rewrite] Spec: ...`. Orient (see `SKILL.md`) finds a
  feature's artifacts by combining a type label with a slug search:
  `gh issue list --label "ship-it:spec" --search "<slug> in:title" --json number,title,labels,assignees,state`.
  The `--json` list template above already selects `assignees`, so no extra
  field is needed to skip a ticket someone else has already claimed.
