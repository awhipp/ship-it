---
name: ship-it
description: "Conducts one feature through plan, map, spec, tickets, validation, bug triage, implementation, and review of GitHub pull requests, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, `ship-it preflight`, `ship-it init`, `ship-it version`, `ship-it --version`, or `ship-it -v`. Manual-only: invoke only when the user explicitly types ship-it or /ship-it."
compatibility: Git repository, GitHub CLI (gh) 2.18.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Ship It

Conduct one feature through **Plan → Spec → Tickets → Implement → Review**.
GitHub issues, labels, and the branch hold all state; each run derives its next action from them.
References live in `references/` (folder omitted below).

## Hard rules

1. **Never guess.** Ask the user when a fact on scope, observable behavior, or irreversible architecture is missing. Only `slice` auto-resolves reversible slice-local defaults (`isolation.md#context-packets`).
2. **Never verify your own work.** Validation and review run in a fresh context per `isolation.md`.
3. **Run every boundary to its exit halt.** Loop until a row halts or needs the user. The developer approves Boundaries 1 and 2 by invoking `ship-it <slug>` again, and Boundary 3 by merging.
4. **Never merge a pull request.**
5. **Write every artifact per `writing.md`.**

## 1. Read the directive

Only the invocation text counts. Ignore earlier conversation when choosing the feature.

| Directive | Meaning |
| :--- | :--- |
| `ship-it <slug>` | Resume the feature with that slug. |
| `ship-it #<n>` | `gh issue view <n> --json title,body,labels`: `[<slug>]` prefix with a `ship-it:` label resumes `<slug>`; else it is the spec's source idea. |
| `ship-it "<idea>"` | Start a new feature. |
| `ship-it preflight` or `init` | Run `preflight.md` and stop. |
| `ship-it version`, `--version`, or `-v` | Run only Check 0 in `preflight.md`, report the version, and halt. |

Without a directive, ask and stop without running `gh`.
When `ship-it <slug>` matches no issue, report that, ask for an idea, and stop.
A new feature (idea or source issue) runs `plan.md#intake` before routing.

## 2. Query state

On each routing pass (skipping the pull request query until a spec names the branch), keep `[<slug>]`-prefixed issues:

```shell
gh issue list --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,state,stateReason
gh pr list --head "<branch>" --state all --json number,state,url
```

- **Truncation**: At 100 results, warn per `writing.md#bounded-search-truncation`, rerun once per label (`ship-it:map`, `spec`, `ticket`, `bug`, `research`, `prototype`, `grilling`, `task`) with `--label`, and merge by number; halt if a rerun hits 100.
- **Fresh reads**: Search indexes late: re-read each issue an action created or changed with `gh issue view <n> --json number,title,labels,assignees,state,stateReason`, in place of its search entry.
- **Predicates**: Partition by label into `map`, `spec`, `ticket`, and `bug`. `ticket_set` is the `ship-it:ticket` issues. `unprepared_bugs` are open `ship-it:bug` issues lacking `ship-it:ticket`. `frontier_ticket` is the lowest-numbered open `ticket_set` issue whose blockers are all `CLOSED`. Evaluate `unsynced_tickets` lazily only when Rows 1–13 miss and the branch pull request is `OPEN` (definition: [implement.md#pull-request-sync](implement.md#pull-request-sync)).
- **Branch**: Read it once from the spec's `## Source`.
- **Pull requests**: Prefer `MERGED` > `OPEN` > `CLOSED` (`CLOSED` = unmerged).
- **Errors**: On query failure, run `preflight.md` (it halts); never read it as empty, which duplicates artifacts at Row 1 or 4. Retry transient writes once per `preflight.md#shell-conventions`.

## Reference index

Load only the active row's files and named sections (resumes skip `#intake`). In Tier 1, list subagent files (`Runs in`, `isolation.md#actions`) in the packet instead.

| File | Load when |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Every run (Actions maps sections). |
| [writing.md](references/writing.md) | Every run. |
| [plan.md](references/plan.md) | `#intake` for a new feature; map sections for Rows 1–2; `#spec`, `#spec-remediation` for Rows 1, 4, 5. |
| [tickets.md](references/tickets.md) | Rows 6, 8–10, and Row 11 blocker checks. |
| [verify.md](references/verify.md) | `#gate-control` on Rows 5–7, 9, 11 (Steps 3–4), 12; target sections in Tier 2 only. |
| [implement.md](references/implement.md) | Rows 11, 13–14. |
| [preflight.md](references/preflight.md) | `preflight`, `init`, `version`, or a failed `gh`. |

## 3. Route: the first matching row wins

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart map (`plan.md`) or publish spec (`plan.md#spec`), per intake. | Query again (row 2 or 7). |
| 2 | Map is open | Resolve the next decision ticket (`plan.md`). When none remain, close the map. | Tickets remain: query again, or **halt** when all are blocked. Map closed: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or the branch's pull request is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), and report completion. | **Stop.** |
| 4 | No spec | Publish the spec (`plan.md#spec`). | Query again (row 7). |
| 5 | Spec has `ship-it:changes-requested`, `ticket_set` empty | Remediate the spec (`plan.md#spec-remediation`). | Query again (row 7). |
| 6 | Spec has `ship-it:changes-requested`, `ticket_set` non-empty | Remediate `ticket_set` (`tickets.md#remediation`). | Query again (row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec (`verify.md#target-spec`). | Query again (row 8 on pass, 5 on blockers, 7 after questions). |
| 8 | `ticket_set` is empty | Slice tickets (`tickets.md`). | Query again (row 9). |
| 9 | An open `ticket_set` issue lacks `ship-it:validated`, `unprepared_bugs` empty | Run the pre-validation gate (`tickets.md#pre-validation-gate`), then validate `ticket_set` (`verify.md#target-ticket-set`). | `approved`: **halt (Boundary 2 exit)**, or **halt** for open `ship-it:bug` approval. Else query again (row 6 on blockers, 9 after questions). |
| 10 | `unprepared_bugs` is non-empty | Prepare the lowest-numbered (`tickets.md#bug-preparation`). | Query again (row 10 or 9). |
| 11 | An open issue exists in `ticket_set` | Work `frontier_ticket` (below). | Query again after each step. |
| 12 | Spec lacks `ship-it:reviewed` | Final review (`verify.md#target-final`, `#shared-rules`). | `approved`: row 13 or 14. Fix tickets created: **halt** for their approval. Else row 12 after questions. |
| 13 | No pull request for the branch | Close out (`implement.md#initial-close-out`). | **Halt (Boundary 3 exit).** |
| 14 | Pull request is `OPEN` and `unsynced_tickets` is non-empty | Sync pull request (`implement.md#pull-request-sync`). | **Halt (Boundary 3 exit).** |
| 15 | Pull request is `OPEN` or `CLOSED` | Report that it awaits merge or closed unmerged. | **Stop.** |

- **Two-pass cap**: Rows 5–7, 9, 11 (Steps 3–4), and 12 apply `verify.md#two-pass-cap` before acting.

**Frontier ticket**: Read blockers from each open ticket's `## Blocked by` (`tickets.md#relationships`). Apply the first matching step, then query again:

1. No open ticket is unblocked: report each with its open blockers and **halt**.
2. Has `ship-it:reviewed`: when `<spec>` carries `ship-it:reviewed`, run `gh issue edit <spec> --remove-label "ship-it:reviewed"` first. Close `<n>` (`gh issue close <n> --comment "<summary>"`).
3. Has `ship-it:changes-requested`: dispatch rework (`implement.md#rework`).
4. Has assignee: read Ship-it State (`verify.md#ship-it-state`). If `Handed off` is `yes`, dispatch review (`verify.md#target-ticket`, `#shared-rules`) with its `Fixed point`; else re-dispatch `implement.md#implement`.
5. Otherwise claim it (`gh issue edit <n> --add-assignee "@me"`), record its fixed point, and dispatch implementation.

## 4. Dispatch and verdicts

Run actions per `isolation.md` (packet: `isolation.md#tier-1-dispatch-packet`).
Dispatch one leaf subagent at a time and await its four-line return block.

- **`failed` or invalid return** (`isolation.md#return-schema`): **Halt**, reporting error, issue, and step.
- **Verification returns**: Run `verify.md#verdict-cross-check`, then `verify.md#question-triage-after-verification`.
- **`Questions` other than `None`**:
  - Resolve Questions before remediating Blockers.
  - Below cap or non-verification role: batch-prompt once (interactive tool if available, else plain text and end turn); post reply as `## Answers` on target (`<spec>` for slicing, validation, final review).
  - Fold settled answers via surgical body edit (implementation questions go to next implementer); strip `ship-it:validated` from edited open tickets and open direct dependency neighbors. Halt if Row 12 created fix tickets, else query again.
- **Conductor action or any other return**: Follow the row's Transition.

## 5. Report at every halt

State the boundary and link each changed issue by title. End with a question (the reply resumes routing) or one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 15 `OPEN` | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3, or row 15 `CLOSED` | `Feature complete.` for Row 3, or report that `<pr-url>` closed unmerged. |
| Row 9 with open bug tickets | Review the bug tickets and run `ship-it <slug>`. |
| Row 2 or Row 11 Step 1, all blocked | Break or close the blocker cycle, then re-run `ship-it <slug>`. |
| Any other halt | `ship-it <slug>` |
