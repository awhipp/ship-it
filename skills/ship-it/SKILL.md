---
name: ship-it
description: "Conducts one feature through plan, spec, tickets, implement, and review, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, or `ship-it preflight`. Manual-only workflow: invoke only when the user explicitly types ship-it or /ship-it."
compatibility: Git repository, GitHub CLI (gh) 2.94.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Ship It

Conduct one feature through **Plan → Spec → Tickets → Implement → Review**.
GitHub issues, labels, and the feature branch hold all state.
Every run derives its next action from that state alone.

## Hard rules

1. **Never guess.** If a fact is not written in the directive, an issue, or a reference file, ask the user.
2. **Never verify your own work.** Validation and review run in a fresh context per [isolation.md](references/isolation.md).
3. **Run every boundary to its exit halt.** Keep looping through query, route, and action until the routing table specifies a halt or an action requires user input. After Boundaries 1 and 2, the developer approves by invoking `ship-it <slug>` again. After Boundary 3, the developer approves by merging the pull request.
4. **Never merge a pull request.**
5. **Write every artifact per [writing.md](references/writing.md).**

## 1. Read the directive

Only the invocation text counts as a directive.
Ignore earlier conversation when choosing the feature.

| Directive | Meaning |
| :--- | :--- |
| `ship-it <slug>` | Resume the feature with that slug. |
| `ship-it #<n>` | Run `gh issue view <n> --json title,body`. A `[<slug>]` title prefix resumes that slug. Any other issue is an idea, and the issue becomes the spec's source. |
| `ship-it "<idea>"` | Start a new feature from the idea. |
| `ship-it preflight` | Run [preflight.md](references/preflight.md) and stop. |

With no directive, ask for one of these four forms and stop.
Run no `gh` command before a directive exists.

**New feature setup** (idea, or an issue without a `[<slug>]` prefix):

1. Propose a kebab-case slug and a Conventional Commits type (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`, `build`, `ci`).
2. Confirm the slug is unused: `gh issue list --search "[<slug>] in:title" --state all --limit 100 --json title`. Treat the slug as taken when any title starts with `[<slug>]`. Propose another slug when the slug is taken.
3. Ask the user to confirm the slug and type, and to choose between charting a map first and writing the spec directly.
   Recommend a map when the idea leaves a scope or architecture decision open.

When a `ship-it <slug>` directive matches no issue, report that no feature uses the slug, ask for an idea, and stop.

## 2. Query state

Run these queries at the start of every routing pass.
Keep only results whose title starts with `[<slug>]`.

```shell
gh issue list --label "ship-it:map" --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,state
gh issue list --label "ship-it:spec" --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,state
gh issue list --label "ship-it:ticket" --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,state
gh pr list --head "<branch>" --state all --json number,state,url
```

Run the pull request query only once a spec exists.
Read the branch name from the spec's `## Source` once via `gh issue view <spec> --json body --jq .body` and retain that branch name across routing passes.
A pull request `state` is `OPEN`, `CLOSED` (closed unmerged), or `MERGED`.
A failed query is an environment error: run [preflight.md](references/preflight.md).
Never read a failed query as "no artifacts".

## 3. Route: the first matching row wins

Execute a continuous **Query → Route → Act** loop.
Complete the matched action, then follow the row's **Transition** column.

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map ([plan.md](references/plan.md)) or draft and publish the spec ([spec.md](references/spec.md)), per the setup choice. | Query state and route again (hits row 2 or row 7). |
| 2 | Map is open | Resolve the next decision ticket ([plan.md](references/plan.md)). When none remain, close the map. | While open decision tickets remain: query state and route again. When the map closes: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or a pull request for the branch is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), then report the feature complete. | **Stop.** |
| 4 | No spec | Draft and publish the spec ([spec.md](references/spec.md)). | Query state and route again (hits row 7). |
| 5 | Spec has `ship-it:changes-requested` and no tickets | Remediate the spec ([spec.md](references/spec.md#remediation)). | Query state and route again (hits row 7). |
| 6 | Spec has `ship-it:changes-requested` and tickets exist | Remediate the ticket set ([tickets.md](references/tickets.md#remediation)). | Query state and route again (hits row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec ([validate.md](references/validate.md)). | Query state and route again (hits row 8 on pass, or row 5 on blockers). |
| 8 | No tickets | Slice tickets ([tickets.md](references/tickets.md)). | Query state and route again (hits row 9). |
| 9 | An open ticket lacks `ship-it:validated` | Validate the ticket set ([validate.md](references/validate.md)). | On `approved`: **halt (Boundary 2 exit)**. Otherwise: query state and route again (hits row 6 on blockers). |
| 10 | An open ticket exists | Work the frontier ticket (below). | Query state and route again after each frontier step. |
| 11 | Spec lacks `ship-it:reviewed` | Run the final review ([review.md](references/review.md#final-review)). | On `approved`: query state and route again (hits row 12). When the review creates fix tickets: **halt** for approval of the fix tickets. |
| 12 | No pull request exists for the branch | Close out ([implement.md](references/implement.md#close-out)). | **Halt (Boundary 3 exit).** |
| 13 | A pull request is `OPEN` or `CLOSED` | `OPEN`: report that the pull request awaits human merge. `CLOSED`: report that the pull request closed without merging, and ask the user whether to reopen the pull request. | **Stop.** |

**Frontier ticket**: the lowest-numbered open ticket whose blockers are all closed ([tickets.md](references/tickets.md#relationships)).
Check open tickets in ascending number order against the closed ticket set from § 2 and stop at the first unblocked ticket.
Apply the first matching step:

1. No open ticket is unblocked: report each open ticket with its open blockers and **halt**.
2. Has `ship-it:reviewed`: close the ticket (`gh issue close <n> --comment "<summary>"`), then query state and route again.
3. Has `ship-it:changes-requested`: count the `**Verdict**: Changes requested` review comments posted after the latest `## Answers` comment on the ticket (or since creation when none exists) via `gh issue view <n> --json comments`. At three or more retries, ask the user for rework guidance (using an interactive question tool when one exists; otherwise ask in plain text and end the turn). Post the reply as a `## Answers` comment on the ticket, fold the guidance or clarified constraints into the ticket body (and parent specification body when shared contracts change) via surgical body edit (`gh issue edit <n> --body-file <file>`), then query state and route again. Below three retries, dispatch rework, then query state and route again.
4. Has an assignee: dispatch review, then query state and route again.
5. Otherwise: claim the ticket (`gh issue edit <n> --add-assignee "@me"`), dispatch implementation, then query state and route again.

## 4. Dispatch and verdicts

Run every action per [isolation.md](references/isolation.md):

- **Conductor action completes** ([plan.md](references/plan.md), [spec.md](references/spec.md), or [tickets.md](references/tickets.md#remediation)): Follow the row's **Transition** column.
- **Subagent returns `failed`**: **Halt** and report the error, the issue, and the step.
- **Subagent returns `Questions` other than `None`** (on `questions` or `changes-requested`): Ask the user every question. Use an interactive question tool when one exists; otherwise ask in plain text and end the turn. Post the replies as a `## Answers` comment on the issue holding the questions. Fold every settled answer—including clarifications confirming existing behavior—into the target map, specification, or ticket body (and both the ticket and parent specification bodies when a ticket answer alters a shared contract) via surgical body edit (`gh issue edit <n> --body-file <file>`), then query state and route again.
- **Subagent returns any other packet**: Follow the row's **Transition** column (halt on Boundary 2 exit at row 9, fix-ticket approval at row 11, or Boundary 3 exit at row 12; otherwise query state and route again).

## 5. Report at every halt

State the boundary and link each changed issue by title.
End with exactly one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 13 with an `OPEN` pull request | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3 | `Feature complete.` Print no command. |
| Row 13 with a `CLOSED` pull request | The question to the user. Print no command. |
| Any other halt | `ship-it <slug>` |

## Boundaries

| Boundary | Rows | Exit halt |
| :--- | :--- | :--- |
| 1. Mapping | 1 (map), 2 | Map closed with all decisions resolved |
| 2. Definition | 1 (spec), 4–9 | Ticket set validated |
| 3. Execution | 10–13 | Pull request opened and annotated; also halts when the final review creates fix tickets |

## Reference index

Load only the reference file for the active step plus [writing.md](references/writing.md).

| File | Read the file when |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Running any action |
| [plan.md](references/plan.md) | Rows 1 and 2 (map) |
| [spec.md](references/spec.md) | Rows 1, 4, and 5 |
| [tickets.md](references/tickets.md) | Rows 6 and 8, and blocker checks |
| [validate.md](references/validate.md) | Rows 7 and 9 |
| [implement.md](references/implement.md) | Implementation, rework, and close-out |
| [review.md](references/review.md) | Ticket review and final review |
| [preflight.md](references/preflight.md) | `ship-it preflight`, or a `gh` command fails |
| [writing.md](references/writing.md) | Writing any artifact |
