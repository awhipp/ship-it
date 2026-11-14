---
name: ship-it
description: "Conducts one feature through plan, spec, tickets, implement, and review, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, `ship-it preflight`, `ship-it init`, `ship-it version`, `ship-it --version`, or `ship-it -v`. Manual-only workflow: invoke only when the user explicitly types ship-it or /ship-it."
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
| `ship-it preflight` or `ship-it init` | Run [preflight.md](references/preflight.md) and stop. |
| `ship-it version`, `ship-it --version`, or `ship-it -v` | Read `skills/ship-it/version.json` to report the installed version and release date. Query the latest upstream release via `gh api repos/awhipp/ship-it/releases/latest --jq '{tag: .tag_name, date: .published_at}'`. Fall back to local version details on network or API failure. Halt immediately after reporting the version. |

With no directive, ask for one of these forms and stop.
Run no `gh` command before a directive exists.

**New feature setup** (idea, or an issue without a `[<slug>]` prefix):

1. Propose a kebab-case slug and a Conventional Commits type (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`, `build`, `ci`).
2. Confirm the slug is unused: `gh issue list --search "[<slug>] in:title" --state all --limit 100 --json title`. Check the returned count and emit the warning in [writing.md](references/writing.md#bounded-search-truncation) when 100 results return. Treat the slug as taken when any title starts with `[<slug>]`. Propose another slug when the slug is taken.
3. When starting from `ship-it #<n>`, capture the source issue title and issue number for in-place adoption during initial artifact publication.
4. Ask the user to confirm the slug and type, and to choose between charting a map first and writing the spec directly.
   Recommend a map when the idea leaves a scope or architecture decision open.

When a `ship-it <slug>` directive matches no issue, report that no feature uses the slug, ask for an idea, and stop.

## 2. Query state

Run these queries at the start of every routing pass.
Check the issue query count and emit the warning in [writing.md](references/writing.md#bounded-search-truncation) when 100 results return.
Filter results matching title prefix `[<slug>]`.

```shell
gh issue list --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,blockedBy,state,stateReason
gh pr list --head "<branch>" --state all --json number,state,url
```

- **In-memory partition**: Partition issues into `map`, `spec`, `ticket`, and `bug` sets by label:
  - `map`: issues bearing `ship-it:map`
  - `spec`: issues bearing `ship-it:spec`
  - `ticket`: issues bearing `ship-it:ticket`
  - `bug`: issues bearing `ship-it:bug`
- **Ticket and bug sets**: Treat issues bearing `ship-it:ticket` as the ticket set across Rows 5, 6, 8, 9, and 11, deduplicated by issue number. Partition issues bearing `ship-it:bug` and lacking `ship-it:ticket` as unprepared bug issues for Row 10.
- **Branch name**: Read the branch name from the spec's `## Source` once via `gh issue view <spec> --json body --jq .body`. Retain that branch name across routing passes.
- **Pull requests**: Run the pull request query only once a spec exists. A pull request `state` is `OPEN`, `CLOSED` (closed unmerged), or `MERGED`. Evaluate multiple pull requests for the branch in priority order: `MERGED` > `OPEN` > `CLOSED`.
- **Closing references**: When Rows 1–13 miss, an `OPEN` pull request exists, and a closed issue bears both `ship-it:bug` and `ship-it:ticket` with `stateReason` `COMPLETED`, query closing references via `gh pr view <pr> --json closingIssuesReferences --jq '[.closingIssuesReferences[].number]'`.
- **Query errors**: Treat any failed query as an environment error and run [preflight.md](references/preflight.md). Never interpret a failed query as "no artifacts".

## 3. Route: the first matching row wins

Execute a continuous **Query → Route → Act** loop.
Complete the matched action, then follow the row's **Transition** column.

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map ([plan.md](references/plan.md)) or draft and publish the spec ([spec.md](references/spec.md)), per the setup choice. | Query state and route again (hits row 2 when charting a map, or row 7 when publishing a spec directly). |
| 2 | Map is open | Resolve the next decision ticket ([plan.md](references/plan.md)). When none remain, close the map. | While open decision tickets remain: query state and route again. When the map closes: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or a pull request for the branch is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), then report the feature complete. | **Stop.** |
| 4 | No spec | Draft and publish the spec ([spec.md](references/spec.md)). | Query state and route again (hits row 7). |
| 5 | Spec has `ship-it:changes-requested` and no tickets | Remediate the spec through direct body updates without posting issue comments ([spec.md](references/spec.md#remediation)), enforcing the loop guard (below). | At three or more retries: **halt** for user guidance. Otherwise: query state and route again (hits row 7). |
| 6 | Spec has `ship-it:changes-requested` and tickets exist | Remediate the ticket set through direct body updates without posting issue comments ([tickets.md](references/tickets.md#remediation)), enforcing the loop guard (below). | At three or more retries: **halt** for user guidance. Otherwise: query state and route again (hits row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec ([validate.md](references/validate.md)), enforcing the loop guard (below) when re-entering after a non-approved pass. | At three or more retries: **halt** for user guidance. Otherwise: query state and route again (hits row 8 on pass, row 5 on blockers, or row 7 after handling questions) (Tier 2: halt for fresh session per [isolation.md](references/isolation.md)). |
| 8 | No tickets | Slice tickets ([tickets.md](references/tickets.md)). | Query state and route again (hits row 9). |
| 9 | An open ticket lacks `ship-it:validated` and no open issue has `ship-it:bug` lacking `ship-it:ticket` | Validate the ticket set ([validate.md](references/validate.md)), enforcing the loop guard (below) when re-entering after a non-approved pass. | At three or more retries: **halt** for user guidance. On `approved`: **halt (Boundary 2 exit)** when no open ticket has `ship-it:bug`, or **halt** for approval of the bug tickets when an open ticket has `ship-it:bug`. Otherwise: query state and route again (hits row 6 on blockers, or row 9 after handling questions) (Tier 2: halt for fresh session per [isolation.md](references/isolation.md)). |
| 10 | An open issue has `ship-it:bug` and lacks `ship-it:ticket` | Prepare the lowest-numbered open bug issue ([tickets.md](references/tickets.md#bug-preparation)). | Query state and route again (hits row 10 when unprepared bugs remain, or row 9). |
| 11 | An open ticket exists | Work the frontier ticket (below). | Query state and route again after each frontier step. |
| 12 | Spec lacks `ship-it:reviewed` | Run the final review ([review.md](references/review.md#final-review)), enforcing the loop guard (below) when re-entering after a non-approved pass. | At three or more retries: **halt** for user guidance. On `approved`: query state and route again (hits row 13). When the review creates fix tickets: **halt** for approval of the fix tickets. Otherwise: query state and route again (hits row 12 after handling questions) (Tier 2: halt for fresh session per [isolation.md](references/isolation.md)). |
| 13 | No pull request exists for the branch | Close out in initial mode ([implement.md](references/implement.md#close-out)). | **Halt (Boundary 3 exit).** |
| 14 | An open pull request exists and a closed issue bearing both `ship-it:bug` and `ship-it:ticket` with `stateReason` `COMPLETED` is absent from the pull request's closing references | Close out in sync mode for the lowest-numbered such ticket ([implement.md](references/implement.md#synchronization)). | Query state and route again (hits row 14 when unsynchronized bug tickets remain, or row 15). |
| 15 | A pull request is `OPEN` or `CLOSED` | `OPEN`: report that the pull request awaits human merge. `CLOSED`: report that the pull request closed without merging, and prompt the user to reopen it. On confirmation, run `gh pr reopen <pr>` and query state and route again. When declined, report the feature abandoned and stop. | Query state and route again on reopen (hits row 15 in `OPEN` state); otherwise **stop**. |

**Bug tickets after final review**: Bug tickets prepared after the final review receive ticket review only. Merging the pull request is the final gate.

**Frontier ticket**: the lowest-numbered open ticket whose blockers are all closed ([tickets.md](references/tickets.md#relationships)).
Check open tickets in ascending number order against the closed ticket set from § 2.
Inspect native blockers in-memory from the batch query's `blockedBy` field, falling back to the `## Blocked by` tasklist when native relationships are empty.
Stop at the first unblocked ticket.
Apply the first matching step:

1. No open ticket is unblocked: report each open ticket with its open blockers and **halt**.
2. Has `ship-it:reviewed`: close the ticket (`gh issue close <n> --comment "<summary>"`), then query state and route again.
3. Has `ship-it:changes-requested`: enforce the `Review` loop guard (below) before dispatching rework. Below three retries, dispatch rework, then query state and route again.
4. Has an assignee: count handoff comments via `gh issue view <n> --json comments --jq '[.comments[].body | select(index(({Handoff:1}|keys[])) == 3)] | length'`. When the count is at least one, enforce the `Review` loop guard (below) when re-entering after a non-approved review or rework pass; below three retries, dispatch review, then query state and route again. When the handoff count is zero, re-dispatch implementation, then query state and route again.
5. Otherwise: claim the ticket (`gh issue edit <n> --add-assignee "@me"`), dispatch implementation, then query state and route again.

**Loop-guard queries**: Rows 5–7, 9, 11 (Steps 3 and 4), and 12 enforce the three-retry limit with one shared query skeleton:

```shell
gh issue view <issue> --json comments --jq '[.comments[].body] | ([to_entries[] | select(.value | index(({Loop:1}|keys[])) == 3 and index(({Guard:1}|keys[])) == 8 and index(({Reset:1}|keys[])) == 14) | .key] | last) as $rst | (if $rst == null then . else .[($rst + 1):] end) | (([42,42]|implode) + ({Verdict:1}|keys[]) + ([42,42,58,32]|implode)) as $v | [.[] | select(<heading-filter> and any(split(([10]|implode))[]; startswith($v + ({Changes:1}|keys[]) + ([32]|implode) + ({requested:1}|keys[])) or startswith($v + ({Questions:1}|keys[]) + ([32]|implode) + ({pending:1}|keys[]))))] | length'
```

Comments bearing `## Loop Guard Reset` originate exclusively from user responses at the three-retry threshold.
Skip the query when the guard's skip rules apply.
Otherwise run the query above with the guard's `<issue>` and `<heading-filter>`.
At three or more non-approved reports (`>= 3`), halt before executing the step or row action and ask the user for guidance (using an interactive question tool when available, or in plain text before ending the turn).
Post the reply as a `## Loop Guard Reset` comment on `<issue>`, fold settled guidance into the guard's folding target, then query state and route again.

| Guard | Target issue | Heading filter | Skip rules | Guidance-folding target |
| :--- | :--- | :--- | :--- | :--- |
| **Review** (Row 11, Steps 3–4) | `<n>` | `index(({Review:1}|keys[])) == 3` | Initial review right after Step 5, or in-session `## Loop Guard Reset` before a subsequent non-approved report | Ticket body (and spec body when shared contracts change) via surgical edit |
| **Validation** (Rows 5–7 and 9) | `<spec>` | `index(({Validation:1}|keys[])) == 3 and index(({<phase>:1}|keys[])) == 15` (`Spec` for Rows 5 and 7; `Ticket` for Rows 6 and 9) | Initial entry right after Row 1, 4, or 8, right after clearing Row 5 or Row 6, or in-session `## Loop Guard Reset` before a subsequent non-approved report | Spec body or open ticket bodies via surgical edit |
| **Final review** (Row 12) | `<spec>` | `index(({Review:1}|keys[])) == 3 and index(({Final:1}|keys[])) == 11` | Initial entry right after closing the final ticket in Row 11, or in-session `## Loop Guard Reset` before a subsequent non-approved report | Spec body via surgical edit, or pass to `final-review` subagent to update acceptance criteria on fix tickets |

## 4. Dispatch and verdicts

Run every action per [isolation.md](references/isolation.md).
Dispatch at most one leaf subagent at a time.
Await the subagent's four-line return block before resuming the routing loop.
Forbid subagents from loading `skills/ship-it/SKILL.md`, running routing queries, or spawning subagents.

- **Conductor action completes** ([plan.md](references/plan.md), [spec.md](references/spec.md), or [tickets.md](references/tickets.md#remediation)): Follow the row's **Transition** column.
- **Subagent returns `failed`**: **Halt** and report the error, the issue, and the step.
- **Subagent returns `Questions` other than `None`** (on `questions` or `changes-requested`):
  - **Triage spec validation questions**: When `validate` runs with `Target: spec`, triage each question before prompting the user. Append slice-local implementation, touchpoint, or low-level error-path questions directly to `- **Deferred to slicing**: <detail>` under `## Implementation Decisions` in the spec body via surgical edit (`gh issue edit <spec> --body-file <file>`, deleting the temporary file immediately) without prompting the user or posting a comment. When every question is deferred to slicing and zero cross-cutting questions remain, skip user prompting and comment posting, then query state and route again (the pre-dispatch loop guard on Row 5 or Row 7 halts on the next pass if this report reached three non-approved passes).
  - **Prompt and record replies**: For `Target: spec` validation with cross-cutting scope, product behavior, or high-level architecture questions, prompt the user only for those cross-cutting questions. For all other subagent runs, ask the user every question (using an interactive question tool when available, or in plain text before ending the turn). Post the reply as a `## Answers` comment on the target issue (`<spec>` for validation and final review; the ticket or bug issue otherwise).
  - **Fold settled answers**: For implementation questions, delegate folding answers to the next implementation subagent. For bug-preparation, validation, ticket-review, or final-review questions, fold settled answers into the map, spec, bug issue, or ticket body via surgical body edit (`gh issue edit <n> --body-file <file>`, deleting the temporary file immediately), or into fix-ticket acceptance criteria. Halt when Row 12 created fix tickets; otherwise query state and route again.
- **Subagent returns any other packet**: Follow the row's **Transition** column (halt on Boundary 2 exit or bug-ticket approval at row 9, fix-ticket approval at row 12, or Boundary 3 exit at row 13, and otherwise query state and route again).

## 5. Report at every halt

State the boundary and link each changed issue by title.
End with exactly one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 15 with an `OPEN` pull request | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3 | `Feature complete.` Print no command. |
| Row 15 with a `CLOSED` pull request | Report that `<pr-url>` closed unmerged and prompt to reopen. When declined, report feature abandoned. Print no command. |
| Row 9 with open `ship-it:bug` tickets | Review the bug tickets and run `ship-it <slug>` to begin implementation. |
| Any other halt | `ship-it <slug>` |

## Boundaries

| Boundary | Rows | Exit halt |
| :--- | :--- | :--- |
| 1. Mapping | 1 (map), 2 | Map closed with all decisions resolved |
| 2. Definition | 1 (spec), 4–9 | Ticket set validated |
| 3. Execution | 10–15 | Pull request opened and annotated; also halts when the final review creates fix tickets or bug tickets await approval |

## Reference index

Load only [isolation.md](references/isolation.md), [writing.md](references/writing.md), and the reference file for the active step.

| File | Read the file when |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Running any action |
| [plan.md](references/plan.md) | Rows 1 and 2 (map) |
| [spec.md](references/spec.md) | Rows 1, 4, and 5 |
| [tickets.md](references/tickets.md) | Rows 6, 8, and 10, and blocker checks |
| [validate.md](references/validate.md) | Rows 7 and 9 |
| [implement.md](references/implement.md) | Rows 11, 13, and 14 (implementation, rework, close-out, and synchronization) |
| [review.md](references/review.md) | Rows 11 and 12 (ticket review and final review) |
| [preflight.md](references/preflight.md) | `ship-it preflight` or `ship-it init`, or a `gh` command fails |
| [writing.md](references/writing.md) | Writing any artifact |
