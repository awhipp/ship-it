---
name: ship-it
description: "Conducts one feature through plan, map, spec, tickets, validation, bug triage, implementation, and review of GitHub pull requests, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, `ship-it preflight`, `ship-it init`, `ship-it version`, `ship-it --version`, or `ship-it -v`. Manual-only: invoke only when the user explicitly types ship-it or /ship-it."
compatibility: Git repository, GitHub CLI (gh) 2.18.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Ship It

Conduct one feature through **Plan → Spec → Tickets → Implement → Review**.
GitHub issues, labels, and the feature branch hold all state, and every run derives its next action from them.
References live in `references/`, and names below omit the folder.

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
| `ship-it #<n>` | Run `gh issue view <n> --json title,body,labels`. A `[<slug>]` title prefix with a `ship-it:` label resumes that slug. Any other issue is an idea and the spec's source. |
| `ship-it "<idea>"` | Start a new feature. |
| `ship-it preflight` or `init` | Run `preflight.md` and stop. |
| `ship-it version`, `--version`, or `-v` | Run only Check 0 in `preflight.md`, report the version, and halt. |

With no directive, ask for one and stop. Run no `gh` command before a directive exists.
When `ship-it <slug>` matches no issue, report that, ask for an idea, and stop.
A new feature (an idea, or an issue that does not resume a slug) runs `plan.md#intake` before routing.

## 2. Query state

On every routing pass, skipping the pull request query until a spec names the branch, keep issues whose title starts with `[<slug>]`:

```shell
gh issue list --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,state,stateReason
gh pr list --head "<branch>" --state all --json number,state,url
```

- **Truncation**: At 100 results, warn per `writing.md#bounded-search-truncation`, rerun once per label (`ship-it:map`, `spec`, `ticket`, `bug`, `research`, `prototype`, `grilling`, `task`) with `--label`, and merge by number. Halt when a rerun also returns 100.
- **Fresh reads**: Search indexes late: re-read each issue an action created or changed with `gh issue view <n> --json number,title,labels,assignees,state,stateReason`, in place of its search entry.
- **Predicates**: Partition by label into `map`, `spec`, `ticket`, and `bug`. `ticket_set` is the `ship-it:ticket` issues. `unprepared_bugs` are open `ship-it:bug` issues lacking `ship-it:ticket`. `frontier_ticket` is the lowest-numbered open `ticket_set` issue whose blockers are all `CLOSED`.
- **Branch**: Read it once from the spec's `## Source`.
- **Pull requests**: States: `OPEN`, `CLOSED` (unmerged), `MERGED`. With several, prefer `MERGED` > `OPEN` > `CLOSED`.
- **Errors**: A failed query is an environment error: run `preflight.md`, which reports and halts. Never read it as "no artifacts", which duplicates artifacts at Row 1 or 4. Retry a transient write failure once per `preflight.md#shell-conventions`.

## Reference index

Load only the active row's files and the sections it names, so a resume never reads `#intake`. In Tier 1, name subagent-run files (`Runs in` in `isolation.md#actions`) in the dispatch packet instead of loading them.

| File | Load when |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Every run (its Actions table names each action's sections). |
| [writing.md](references/writing.md) | Every run. |
| [plan.md](references/plan.md) | `#intake` for a new feature; map sections for Rows 1–2; `#spec`, `#spec-remediation` for Rows 1, 4, 5. |
| [tickets.md](references/tickets.md) | Rows 6, 8–10, and Row 11 blocker checks. |
| [verify.md](references/verify.md) | `#gate-control` on Rows 5–7, 9, 11 (Steps 3–4), 12; target sections only when the conductor runs them (Tier 2). |
| [implement.md](references/implement.md) | Rows 11 and 13. |
| [preflight.md](references/preflight.md) | `preflight`, `init`, `version`, or a failed `gh`. |

## 3. Route: the first matching row wins

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map (`plan.md`) or publish the spec (`plan.md#spec`), per the intake choice. | Query again (row 2 or 7). |
| 2 | Map is open | Resolve the next decision ticket (`plan.md`). When none remain, close the map. | Tickets remain: query again, or **halt** when all are blocked. Map closed: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or the branch's pull request is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), and report completion. | **Stop.** |
| 4 | No spec | Publish the spec (`plan.md#spec`). | Query again (row 7). |
| 5 | Spec has `ship-it:changes-requested`, `ticket_set` empty | Remediate the spec (`plan.md#spec-remediation`). | Query again (row 7). |
| 6 | Spec has `ship-it:changes-requested`, `ticket_set` non-empty | Remediate `ticket_set` (`tickets.md#remediation`). | Query again (row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec (`verify.md#target-spec`). | Query again (row 8 on pass, 5 on blockers, 7 after questions). |
| 8 | `ticket_set` is empty | Slice tickets (`tickets.md`). | Query again (row 9). |
| 9 | An open `ticket_set` issue lacks `ship-it:validated`, `unprepared_bugs` empty | Run the pre-validation gate (`tickets.md#pre-validation-gate`), then validate `ticket_set` (`verify.md#target-ticket-set`). | `approved`: **halt (Boundary 2 exit)**, or **halt** for bug-ticket approval when an open ticket has `ship-it:bug`. Else query again (row 6 on blockers, 9 after questions). |
| 10 | `unprepared_bugs` is non-empty | Prepare the lowest-numbered (`tickets.md#bug-preparation`). | Query again (row 10 or 9). |
| 11 | An open issue exists in `ticket_set` | Work `frontier_ticket` (below). | Query again after each step. |
| 12 | Spec lacks `ship-it:reviewed` | Final review (`verify.md#target-final`, `#shared-rules`). | `approved`: row 13. Fix tickets created: **halt** for their approval. Else row 12 after questions. |
| 13 | No pull request for the branch | Close out (`implement.md#initial-close-out`). | **Halt (Boundary 3 exit).** |
| 14 | The pull request is `OPEN` or `CLOSED` | Report that it awaits merge or closed unmerged. | **Stop.** |

- **Two-pass cap**: Rows 5–7, 9, 11 (Steps 3–4), and 12 apply `verify.md#two-pass-cap` before acting.

**Frontier ticket**: Read blockers from each open ticket's `## Blocked by` (`tickets.md#relationships`). Apply the first matching step, then query again:

1. No open ticket is unblocked: report each with its open blockers and **halt**.
2. Has `ship-it:reviewed`: close it (`gh issue close <n> --comment "<summary>"`).
3. Has `ship-it:changes-requested`: dispatch rework (`implement.md#rework`).
4. Has an assignee: read its row in Ship-it State (`verify.md#ship-it-state`). When `Handed off` is `yes`, dispatch review (`verify.md#target-ticket`, `#shared-rules`) with the row's `Fixed point`. Otherwise re-dispatch implementation (`implement.md#implement`).
5. Otherwise claim it (`gh issue edit <n> --add-assignee "@me"`), record its fixed point, and dispatch implementation.

## 4. Dispatch and verdicts

Run every action per `isolation.md` (packet: `isolation.md#tier-1-dispatch-packet`).
Dispatch one leaf subagent at a time and await its four-line return block.

- **`failed`, or no valid return block** (`isolation.md#return-schema`): **Halt**, reporting the error, issue, and step.
- **Verification returns**: Run `verify.md#verdict-cross-check` first, then triage questions per `verify.md#question-triage-after-verification`.
- **`Questions` other than `None`**:
  - Resolve Questions before remediating a report that also holds Blockers.
  - Below the cap, or from a non-verification role, batch-prompt once (interactive tool when available, else plain text, ending the turn) and post the reply as `## Answers` on the target issue (`<spec>` for slicing, validation, and final review).
  - Fold settled answers into the artifact by surgical body edit (implementation questions go to the next implementer), and strip `ship-it:validated` from edited open tickets and their open direct dependency neighbors. Halt when Row 12 created fix tickets, otherwise query again.
- **Conductor action or any other return**: Follow the row's Transition.

## 5. Report at every halt

State the boundary and link each changed issue by title. When the halt asks a question, end with it, because the reply resumes routing. Otherwise end with exactly one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 14 `OPEN` | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3, or row 14 `CLOSED` | `Feature complete.` for Row 3, or report that `<pr-url>` closed unmerged. |
| Row 9 with open bug tickets | Review the bug tickets and run `ship-it <slug>`. |
| Row 2 or Row 11 Step 1, all blocked | Break or close the blocker cycle, then re-run `ship-it <slug>`. |
| Any other halt | `ship-it <slug>` |
