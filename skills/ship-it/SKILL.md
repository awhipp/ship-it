---
name: ship-it
description: "Conducts one feature through plan, spec, tickets, implement, and review, using GitHub issues as the only state. Requires a directive: `ship-it <slug>`, `ship-it #<issue>`, `ship-it \"<idea>\"`, or `ship-it preflight`. Manual-only workflow: do NOT invoke automatically or unprompted; only activate when the user explicitly types ship-it or /ship-it."
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
3. **Run every boundary to its exit halt.** Keep looping through query, route, and action until the routing table specifies a halt or an action requires user input. The next invocation after a boundary exit is the developer's approval.
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
2. Confirm the slug is unused: `gh issue list --search "<slug> in:title" --state all --json title`. Treat the slug as taken when any title starts with `[<slug>]`. Propose another slug if taken.
3. Ask the user to confirm the slug and type, and to choose between charting a map first and writing the spec directly.
   Recommend a map when the idea leaves a scope or architecture decision open.

When a `ship-it <slug>` directive matches no issue, report that no feature uses the slug, ask for an idea, and stop.

## 2. Query state

Run these queries at the start of every routing pass.
Keep only results whose title starts with `[<slug>]`.

```shell
gh issue list --label "ship-it:map" --search "<slug> in:title" --state all --json number,title,labels,state
gh issue list --label "ship-it:spec" --search "<slug> in:title" --state all --json number,title,body,labels,state
gh issue list --label "ship-it:ticket" --search "<slug> in:title" --state all --json number,title,labels,assignees,state
gh pr list --head "<branch>" --state all --json number,state,url
```

Run the pull request query only once a spec exists; the branch comes from the spec's `## Source`.
A failed query is an environment error: run [preflight.md](references/preflight.md).
Never read a failed query as "no artifacts".

## 3. Route: the first matching row wins

Execute a continuous **Query → Route → Act** loop.
Complete the matched action, then follow the row's **Transition** column immediately.
Never treat an intermediate artifact (such as a newly published spec or freshly sliced tickets) as a stopping point.

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map ([plan.md](references/plan.md)) or draft and publish the spec ([spec.md](references/spec.md)), per the setup choice. | Query state and route again (hits row 2 or row 7). |
| 2 | Map is open | Resolve the next decision ticket ([plan.md](references/plan.md)). When none remain, close the map. | While open decision tickets remain: query state and route again. When the map closes: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed | Report the feature complete. | **Stop.** |
| 4 | No spec | Draft and publish the spec ([spec.md](references/spec.md)). | Query state and route again (hits row 7). |
| 5 | Spec has `ship-it:changes-requested` and no tickets | Remediate the spec ([spec.md](references/spec.md#remediation)). | Query state and route again (hits row 7). |
| 6 | Spec has `ship-it:changes-requested` and tickets exist | Remediate the ticket set ([tickets.md](references/tickets.md#remediation)). | Query state and route again (hits row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec ([validate.md](references/validate.md)). | Query state and route again (hits row 8 on pass, or row 5 on blockers). |
| 8 | No tickets | Slice tickets ([tickets.md](references/tickets.md)). | Query state and route again (hits row 9). |
| 9 | An open ticket lacks `ship-it:validated` | Validate the ticket set ([validate.md](references/validate.md)). | On `approved`: **halt (Boundary 2 exit)**. Otherwise: query state and route again (hits row 6 on blockers). |
| 10 | An open ticket exists | Work the frontier ticket (below). | Query state and route again after each frontier step. |
| 11 | Spec lacks `ship-it:reviewed` | Run the final review ([review.md](references/review.md#final-review)). | On `approved`: query state and route again (hits row 12). When the review creates fix tickets: **halt** for approval of the fix tickets. |
| 12 | No open pull request | Close out ([implement.md](references/implement.md#close-out)). | **Halt (Boundary 3 exit).** |
| 13 | A pull request is open | Report that the pull request awaits human review and merge. | **Stop.** |

**Frontier ticket**: the lowest-numbered open ticket.
Apply the first matching step:

1. Any blocker is open ([tickets.md](references/tickets.md#relationships)): report the blocker and **halt**.
2. Has `ship-it:reviewed`: close the ticket (`gh issue close <n> --comment "<summary>"`), then query state and route again.
3. Has `ship-it:changes-requested`: count the `**Verdict**: Changes requested` review comments on the ticket. **Halt** at three; otherwise dispatch rework, then query state and route again.
4. Has an assignee: dispatch review, then query state and route again.
5. Otherwise: create the branch named in `## Source` if missing, claim the ticket (`gh issue edit <n> --add-assignee "@me"`), dispatch implementation, then query state and route again.

## 4. Dispatch and verdicts

Run every action per [isolation.md](references/isolation.md):

- **Conductor action completes** ([plan.md](references/plan.md), [spec.md](references/spec.md), or [tickets.md](references/tickets.md#remediation)): Follow the row's **Transition** column immediately. Query state and route again in the same turn after publishing or remediating a spec or ticket set.
- **Subagent returns `failed`**: **Halt** and report the error, the issue, and the step.
- **Subagent returns `Questions` other than `None`** (on `questions` or `changes-requested`): Ask the user every question. Use an interactive question tool when one exists; otherwise ask in plain text and end the turn. Post the replies as a `## Answers` comment on the issue holding the questions, then query state and route again.
- **Subagent returns any other packet**: Follow the row's **Transition** column (halt on Boundary 2 exit at row 9, fix-ticket approval at row 11, or Boundary 3 exit at row 12; otherwise query state and route again).

## 5. Report at every halt

State the boundary and link each changed issue by title.
Print the exact next command: `ship-it <slug>`.

## Boundaries

| Boundary | Rows | Exit halt |
| :--- | :--- | :--- |
| 1. Mapping | 1 (map), 2 | Map closed with all decisions resolved |
| 2. Definition | 1 (spec), 4–9 | Ticket set validated |
| 3. Execution | 10–13 | Pull request opened and annotated; also halts when the final review creates fix tickets |

## Reference index

| File | Read it when |
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
