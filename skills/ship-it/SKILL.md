---
name: ship-it
description: "Conducts one feature through plan, map, spec, tickets, validation, bug triage, implementation, and review of GitHub pull requests, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, `ship-it preflight`, `ship-it init`, `ship-it version`, `ship-it --version`, or `ship-it -v`. Manual-only workflow: invoke only when the user explicitly types ship-it or /ship-it."
compatibility: Git repository, GitHub CLI (gh) 2.94.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Ship It

Conduct one feature through **Plan → Spec → Tickets → Implement → Review**.
GitHub issues, labels, and the feature branch hold all state.
Every run derives its next action from that state alone.

## Hard rules

1. **Never guess.** Ask the user whenever a fact is missing from the directive, an issue, or a reference file, because unverified assumptions cause silent drift across issues and code. Slice-local spec-validation questions defer to slicing per § 4 instead.
2. **Never verify your own work.** Validation and review run in a fresh context per [isolation.md](references/isolation.md).
3. **Run every boundary to its exit halt.** Loop through query, route, and action until a row halts or requires user input, so artifacts reach the human approval gate instead of stalling mid-phase. The developer approves Boundaries 1 and 2 by invoking `ship-it <slug>` again, and approves Boundary 3 by merging the pull request.
4. **Never merge a pull request.** Merging serves as the developer's final approval gate for Boundary 3 and publishes the feature to the default branch.
5. **Write every artifact per [writing.md](references/writing.md).**

## 1. Read the directive

Only the invocation text counts as a directive.
Ignore earlier conversation when choosing the feature.

| Directive | Meaning |
| :--- | :--- |
| `ship-it <slug>` | Resume the feature with that slug. |
| `ship-it #<n>` | Run `gh issue view <n> --json title,body,labels`. A `[<slug>]` title prefix on an issue bearing a `ship-it:` label resumes that slug. Any other issue is an idea, and the issue becomes the spec's source. |
| `ship-it "<idea>"` | Start a new feature from the idea. |
| `ship-it preflight` or `ship-it init` | Run [preflight.md](references/preflight.md) and stop. |
| `ship-it version`, `ship-it --version`, or `ship-it -v` | Run only Check 0 in [preflight.md](references/preflight.md), report the version, and halt. |

With no directive, ask for one of these forms and stop.
Run no `gh` command before a directive exists.

**New feature setup** (idea, or an issue that does not resume a slug; resumed `ship-it <slug>` and `ship-it #<n>` directives skip intake):

1. Run **intake** ahead of slug proposal, holding the confirmed `Request` and any confirmed leftover list in conductor context until first publication (nothing persists before publication, so an earlier halt re-asks intake on resume):
   - **(a) Clarify unanswered topics**: Check whether the request answers **goal**, **success criteria**, **constraints**, and **scope** with concrete, checkable statements (a passing mention counts as unanswered). When all four are answered, state the skip in one line, keep the verbatim request as `Request`, and continue to (b). Otherwise, ask one batch of at most four questions covering only the unanswered topics in that order, using an interactive question tool when available or plain text, and end the turn so the reply resumes at (b). When the user declines or answers "skip", end the questions, keep the verbatim request as `Request`, and continue to (b).
   - **(b) Check size**: Judge whether the request fits one spec, with no fixed threshold. When it fits, continue to (c). When it looks too big, state the reason, recommend charting a map, writing the spec directly, or narrowing the feature, and ask the user to choose **narrow the feature** or **proceed as is** (ending the turn so the reply resumes at (c)). Flag the request for step 5 when the user chooses to proceed as is.
   - **(c) Confirm the refined request**: On the narrow path, draft the narrowed request and the leftover-idea list, and ask the user to confirm both (ending the turn); on rejection, ask why, revise, and re-confirm until the user confirms. A narrow path may confirm zero leftover ideas, writing no list and filing nothing. Otherwise, when answers arrived in (a), restate the request refined by those answers and ask the user to confirm it (ending the turn); on rejection, ask why, revise, and re-confirm until the user confirms. When (a) skipped or was declined and (b) did not narrow, skip restatement and confirmation and keep the verbatim request as `Request`.
2. Propose a kebab-case slug and a Conventional Commits type (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`, `build`, `ci`).
3. Confirm the slug is unused: `gh issue list --search "[<slug>] in:title" --state all --limit 100 --json title`. Check the returned count and emit the warning in [writing.md](references/writing.md#bounded-search-truncation) when 100 results return. Treat the slug as taken when any title starts with `[<slug>]` or when 100 results return, because a truncated search can hide a matching title. Propose another slug when the slug is taken.
4. When starting from `ship-it #<n>`, capture the source issue title and issue number for in-place adoption during initial artifact publication, and format `Request` as `#<n> (<original-title>): <confirmed text>`.
5. Ask the user to confirm the slug and type, and to choose between charting a map first and writing the spec directly.
   Recommend a map when the idea leaves a scope or architecture decision open or when step 1(b) flagged the request.
6. **Post-publication leftover filing**: Immediately after Row 1 publishes the first map or spec (never after Row 4 publishes a spec from a map), and before the next query or any other [plan.md](references/plan.md) or [spec.md](references/spec.md) step, file each idea from the intake-confirmed leftover list held in context (never from the whole `Out of scope` section) via `gh issue create` with a short title, a one- or two-sentence body (`Split from #<n>` when an issue sourced the request), no `ship-it:` labels, and no `[<slug>]` title prefix. When `gh issue create` fails for an idea, report its title, file the remaining leftovers, and continue routing; if the run halts before filing, resume files nothing and reports nothing extra.

When a `ship-it <slug>` directive matches no issue, report that no feature uses the slug, ask for an idea, and stop.

## 2. Query state

Run these queries at the start of every routing pass, skipping the pull request query until a spec names the branch.
Filter results matching title prefix `[<slug>]`.

```shell
gh issue list --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,blockedBy,state,stateReason
gh pr list --head "<branch>" --state all --json number,state,url
```

- **Truncated search**: GitHub search matches the slug's words anywhere in a title, so other features' issues count toward the 100-result limit. When the issue query returns 100 results, emit the warning in [writing.md](references/writing.md#bounded-search-truncation), rerun the query once per label by adding `--label "<label>"` for `ship-it:map`, `ship-it:spec`, `ship-it:ticket`, `ship-it:bug`, `ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, and `ship-it:task`, and merge the reruns by issue number. Halt when any rerun also returns 100, because a truncated set can hide the map or spec and recreate it.
- **Fresh reads after writes**: GitHub search indexes new issues and label changes with a delay. On the pass after an action, re-read each issue that the action created or changed (the dispatch packet's and the returned `Issues:` numbers, plus the conductor's own writes) via `gh issue view <n> --json number,title,labels,assignees,blockedBy,state,stateReason`. Use each read in place of that issue's search entry, and add the issue when the search missed it.
- **In-memory partition**: Partition issues into `map`, `spec`, `ticket`, and `bug` sets by label:
  - `map`: issues bearing `ship-it:map`
  - `spec`: issues bearing `ship-it:spec`
  - `ticket`: issues bearing `ship-it:ticket`
  - `bug`: issues bearing `ship-it:bug`
- **Derived predicates**: Compute these canonical sets from the partitioned issues (and lazy queries below):
  - `ticket_set`: issues bearing `ship-it:ticket`, deduplicated by issue number (used across Rows 5, 6, 8, 9, and 11).
  - `unprepared_bugs`: open issues bearing `ship-it:bug` and lacking `ship-it:ticket` (used in Rows 9 and 10).
  - `frontier_ticket`: the lowest-numbered open issue in `ticket_set` whose blockers are all `CLOSED` (used in Row 11).
  - `unsynced_completed_bugs`: closed issues bearing both `ship-it:bug` and `ship-it:ticket` with `stateReason` `COMPLETED` that have no `Closes #<n>` line in the `OPEN` pull request's body (used in Row 14).
- **Branch name**: Read the branch name from the spec's `## Source` once via `gh issue view <spec> --json body --jq .body`. Retain that branch name across routing passes.
- **Pull requests**: Run the pull request query only once a spec exists. A pull request `state` is `OPEN`, `CLOSED` (closed unmerged), or `MERGED`. Evaluate multiple pull requests for the branch in priority order: `MERGED` > `OPEN` > `CLOSED`.
- **Closing references**: When Rows 1–13 miss, an `OPEN` pull request exists, and a closed issue bears both `ship-it:bug` and `ship-it:ticket` with `stateReason` `COMPLETED`, read the pull request body via `gh pr view <pr> --json body --jq .body` to compute `unsynced_completed_bugs`. Sync close-out writes that `Closes #<n>` line itself, so a finished sync never re-fires Row 14.
- **Query errors**: Treat any failed query as an environment error, and run [preflight.md](references/preflight.md), which reports its findings and halts. Never interpret a failed query as "no artifacts". An authentication, network, or permission failure would otherwise match Row 1 or Row 4 and create duplicate maps or specs.

## Reference index

Load only [isolation.md](references/isolation.md), [writing.md](references/writing.md), and the reference file(s) for the active step. Do NOT load non-active reference files until their row matches. Leaving non-active reference files unloaded keeps the conductor's context lean and prevents rules for other phases from bleeding into the active step. In Tier 1, name subagent-run files (the `Runs in` column of [isolation.md](references/isolation.md#actions)) in the dispatch packet instead of loading them.

| File | Read the file when (Tier 2, or a conductor-run step) |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Running any action |
| [plan.md](references/plan.md) | Rows 1 and 2 (map) |
| [spec.md](references/spec.md) | Rows 1, 4, and 5 |
| [validate-spec.md](references/validate-spec.md) | Row 7 (spec validation) |
| [tickets.md](references/tickets.md) | Rows 6 and 8, Row 11 blocker checks, and Rows 9, 10, and 12 (sections assigned in [isolation.md](references/isolation.md#actions)) |
| [bug-prep.md](references/bug-prep.md) | Row 10 (bug preparation) |
| [validate-tickets.md](references/validate-tickets.md) | Row 9 (ticket-set validation) |
| [implement.md](references/implement.md) | Row 11 Steps 4 (zero handoffs) and 5 (implementation) |
| [rework.md](references/rework.md) | Row 11 Step 3 (ticket rework) |
| [review-core.md](references/review-core.md) | Row 11 Step 4 and Row 12 (shared two-axis review passes and report template) |
| [review-ticket.md](references/review-ticket.md) | Row 11 Step 4 (ticket review, loaded with [review-core.md](references/review-core.md)) |
| [review-final.md](references/review-final.md) | Row 12 (final review, loaded with [review-core.md](references/review-core.md)) |
| [close-out.md](references/close-out.md) | Rows 13 and 14 (initial close-out and bug synchronization) |
| [preflight.md](references/preflight.md) | `ship-it preflight`, `ship-it init`, or `ship-it version` (Check 0 only), or a `gh` command fails |
| [writing.md](references/writing.md) | Every step (prose, shell, and search-truncation rules) |

## 3. Route: the first matching row wins

Execute a continuous **Query → Route → Act** loop.
Complete the matched action, then follow the row's **Transition** column.

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map ([plan.md](references/plan.md)) or draft and publish the spec ([spec.md](references/spec.md)), per the setup choice. | Query state and route again (hits row 2 when charting a map, or row 7 when publishing a spec directly). |
| 2 | Map is open | Resolve the next decision ticket ([plan.md](references/plan.md)). When none remain, close the map. | While open decision tickets remain: query state and route again, or **halt** when every open decision ticket is blocked. When the map closes: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or a pull request for the branch is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), then report the feature complete. | **Stop.** |
| 4 | No spec | Draft and publish the spec ([spec.md](references/spec.md)). | Query state and route again (hits row 7). |
| 5 | Spec has `ship-it:changes-requested` and `ticket_set` is empty | Remediate the spec through direct body updates without posting issue comments ([spec.md](references/spec.md#remediation)), enforcing the circuit breaker (below). | Query state and route again (hits row 7). |
| 6 | Spec has `ship-it:changes-requested` and `ticket_set` is non-empty | Remediate `ticket_set` through direct body updates without posting issue comments ([tickets.md](references/tickets.md#remediation)), enforcing the circuit breaker (below). | Query state and route again (hits row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec ([validate-spec.md](references/validate-spec.md)), enforcing the circuit breaker (below). | Query state and route again (hits row 8 on pass, row 5 on blockers, or row 7 after handling questions). |
| 8 | `ticket_set` is empty | Slice tickets ([tickets.md](references/tickets.md)). | Query state and route again (hits row 9). |
| 9 | An open issue in `ticket_set` lacks `ship-it:validated` and `unprepared_bugs` is empty | Validate `ticket_set` ([validate-tickets.md](references/validate-tickets.md)), enforcing the circuit breaker (below). | On `approved`: **halt (Boundary 2 exit)** when no open ticket has `ship-it:bug`, or **halt** for approval of the bug tickets when an open ticket has `ship-it:bug`. Otherwise: query state and route again (hits row 6 on blockers, or row 9 after handling questions). |
| 10 | `unprepared_bugs` is non-empty | Prepare the lowest-numbered issue in `unprepared_bugs` ([bug-prep.md](references/bug-prep.md)). | Query state and route again (hits row 10 when `unprepared_bugs` remains non-empty, or row 9). |
| 11 | An open issue exists in `ticket_set` | Work `frontier_ticket` (below). | Query state and route again after each frontier step. |
| 12 | Spec lacks `ship-it:reviewed` | Run the final review ([review-final.md](references/review-final.md), [review-core.md](references/review-core.md)), enforcing the circuit breaker (below). | On `approved`: query state and route again (hits row 13). When the review creates fix tickets: **halt** for approval of the fix tickets. Otherwise: query state and route again (hits row 12 after handling questions). |
| 13 | No pull request exists for the branch | Close out in initial mode ([close-out.md](references/close-out.md#initial-close-out)). | **Halt (Boundary 3 exit).** |
| 14 | An `OPEN` pull request exists and `unsynced_completed_bugs` is non-empty | Close out in sync mode for the lowest-numbered issue in `unsynced_completed_bugs` ([close-out.md](references/close-out.md#synchronization)). | Query state and route again (hits row 14 when `unsynced_completed_bugs` remains non-empty, or row 15). |
| 15 | A pull request is `OPEN` or `CLOSED` | `OPEN`: report that the pull request awaits human merge. `CLOSED`: report that the pull request closed without merging, and prompt the user to reopen it. On confirmation, run `gh pr reopen <pr>` and query state and route again. When declined, report the feature abandoned and stop. | Query state and route again on reopen (hits row 15 in `OPEN` state); otherwise **stop**. |

- **On-demand comment reads**: Rows 5–7, 9, 11, and 12 read issue comments on demand for circuit-breaker checks, handoff counts, and remediation reports.
- **Tier 2 fresh-session halts**: In Tier 2, Rows 7, 9, 11 (Step 4), and 12 halt for a fresh session per [isolation.md](references/isolation.md) whenever validation or review is not the session's first action.

**Bug tickets after final review**: Bug tickets prepared after the final review run ticket-set validation (Row 9) and ticket review (Row 11) but no repeat final review, because the spec keeps `ship-it:reviewed`. Merging the pull request is the final gate.

**Fix tickets after final review**: Final review creates fix tickets already labeled `ship-it:validated`, so they skip Row 9. The user's approval at the Row 12 halt stands in for ticket-set validation, and ticket review (Row 11) plus the next final review still audit the fixes.

**Frontier ticket** (`frontier_ticket` in § 2): Resolve each open ticket's blockers per [tickets.md](references/tickets.md#relationships), running `gh issue view <n> --json body --jq .body` to read its `## Blocked by` tasklist when `blockedBy` is empty.
Apply the first matching step:

1. No open ticket is unblocked: report each open ticket with its open blockers and **halt**.
2. Has `ship-it:reviewed`: close the ticket (`gh issue close <n> --comment "<summary>"`), then query state and route again.
3. Has `ship-it:changes-requested`: enforce the `Review` circuit breaker (below) before dispatching rework ([rework.md](references/rework.md)), then query state and route again.
4. Has an assignee: fetch comment prefixes via `gh issue view <n> --json comments --jq '[.comments[].body[:120]]'` and count array elements starting with `## Handoff` in-agent. When the count is at least one, enforce the `Review` circuit breaker (below) before dispatching review ([review-ticket.md](references/review-ticket.md), [review-core.md](references/review-core.md)), then query state and route again. When the handoff count is zero, re-dispatch implementation ([implement.md](references/implement.md)), then query state and route again.
5. Otherwise: claim the ticket (`gh issue edit <n> --add-assignee "@me"`), dispatch implementation ([implement.md](references/implement.md)), then query state and route again.

**Circuit Breaker protocol**: Rows 5–7, 9, 11 (Steps 3 and 4), and 12 enforce the three-retry limit with one shared query:

```shell
gh issue view <issue> --json comments --jq '[.comments[].body[:120]]'
```

Comments bearing `## Circuit Breaker Reset` originate solely from user replies.
Enforce the active breaker in sequence before running the row or step action:

- **Count check**: Run the query above on the breaker's **Verdict issue**, reusing the array already fetched in Row 11 Step 4 when checking `Review` there. In-agent, count the elements after the last `## Circuit Breaker Reset` (or all elements when no reset exists) that start with the breaker's **Report heading** and carry `**Verdict**: Changes requested` or `**Verdict**: Questions pending`. For `## Validation: Spec` (Rows 5 and 7), also count those reports across the whole array as the total. A reset on `<spec>` restarts every breaker counted there.
- **Threshold halt**: The breaker trips at three or more counted reports since the latest reset (`>= 3`), checked before executing the row or step action or on short-circuit from § 4. A tripped `## Validation: Spec` breaker (Rows 5 and 7) with six or more total reports takes the **Spec-validation override**, and every other trip takes the **Standard halt**. Reaching six total reports never trips a breaker by itself, which preserves Option 2's three-pass cycle.
- **Standard halt**: Tell the user in plain language which breaker tripped (`Review`, `Validation`, or `Final review`), which `<issue>` holds the count, and that only the user's reply, posted as `## Circuit Breaker Reset` on `<issue>`, resets that breaker. When § 4 short-circuited on cross-cutting `Questions`, read the latest `## Validation: Spec` report (`gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Spec")) | .body] | last'`, where an empty result means no report exists), and present its unresolved findings with those `Questions`. Ask the user for guidance using an interactive question tool when available, or in plain text before ending the turn.
- **Reset and fold**: After a standard halt, post the user's reply as a `## Circuit Breaker Reset` comment on `<issue>` via temporary `--body-file`, deleting the temporary file immediately. Fold settled guidance into the breaker's **Guidance-folding target**, then query state and route again.
- **Spec-validation override**: Read the latest `## Validation: Spec` report with the query in **Standard halt**. State `<spec>`, the total count of non-approved reports, the unresolved `Blockers` and `Questions`, and Option 1's Row 9 caveat. Present three options using an interactive question tool when available, or in plain text before ending the turn:
  1. **Proceed to slicing as-is**: Post a `## Validation Override` comment on `<spec>` via temporary `--body-file`, deleting the temporary file immediately, to record the user's waiver under Hard rule 2 (not conductor self-verification) and list the unresolved `Blockers` and `Questions`. Leave the spec body as-is without adding waived findings to `- **Deferred to slicing**:`, remove `ship-it:changes-requested` when present, add `ship-it:validated`, and query state and route again (advancing to Row 8). Slicing and ticket-set validation never read `## Validation Override`, so waived contradictions or cross-cutting gaps can resurface in Row 9.
  2. **Reset with revised guidance**: Collect the user's revised guidance, prompting for it when missing. Post it as `## Circuit Breaker Reset` on `<spec>` via temporary `--body-file`, deleting the temporary file immediately. Fold settled guidance into `<spec>`, then query state and route again to start the next three-pass cycle.
  3. **Stop and rescope**: Halt without adding `ship-it:validated` or posting a reset or override comment.
- **Override isolation**: Use the `## Validation Override` heading so `.body[:120]` prefix checks keep override comments separate from `## Validation: Spec` and `## Circuit Breaker Reset`.

| Breaker | Verdict issue | Report heading | Guidance-folding target |
| :--- | :--- | :--- | :--- |
| **Review** (Row 11, Steps 3–4) | `<n>` | `## Review: Ticket` | Ticket body (and spec body when shared contracts change) via surgical edit |
| **Validation** (Rows 5–7 and 9) | `<spec>` | `## Validation: Spec` (Rows 5 and 7) or `## Validation: Ticket set` (Rows 6 and 9) | Spec body or open ticket bodies via surgical edit |
| **Final review** (Row 12) | `<spec>` | `## Review: Final` | Spec body, or open fix-ticket acceptance criteria, via surgical edit |

## 4. Dispatch and verdicts

Run every action per [isolation.md](references/isolation.md) (including the subagent dispatch packet and prohibitions in [Tier 1: dispatch packet](references/isolation.md#tier-1-dispatch-packet)).
Dispatch at most one leaf subagent at a time.
Await the subagent's four-line return block before resuming the routing loop.

- **Conductor action completes** ([plan.md](references/plan.md), [spec.md](references/spec.md), or [tickets.md](references/tickets.md#remediation)): Follow the row's **Transition** column.
- **Subagent returns `failed` or no valid [return block](references/isolation.md#return-schema)**: **Halt** and report the error, the issue, and the step, so a crashed subagent never passes as a success.
- **Subagent returns `Questions` other than `None`** (on `questions` or `changes-requested`):
  - **Triage spec validation questions**: When `validate` runs with `Target: spec`, triage every question before prompting the user:
    - Append stray slice-local questions on implementation, touchpoints, or error paths strictly to `- **Deferred to slicing**: <detail>` under `## Implementation Decisions` in `<spec>`.
    - Apply that surgical edit via `gh issue edit <spec> --body-file <file>`, deleting the temporary file immediately.
    - Leave other spec sections untouched, skip user prompts for deferred items, and post no comment.
    - When zero cross-cutting questions remain, query state and route again. Row 5 or Row 7 enforces the § 3 circuit breaker on the next pass.
    - Deferral-only passes still count toward the breaker, which bounds a validator that keeps raising slice-local questions.
    - When cross-cutting questions remain, run the § 3 `Count check` on `<spec>` before prompting for `## Answers`.
    - At three or more post-reset reports (`>= 3`), short-circuit into the § 3 `Threshold halt`, which selects the `Standard halt` or the `Spec-validation override`. Present unresolved findings and cross-cutting `Questions` together alongside reset or override choices.
  - **Prompt and record replies**: For `Target: spec` validation below three post-reset reports, prompt the user only for cross-cutting questions on scope, product behavior, or high-level architecture. For all other subagent runs, ask the user every question (using an interactive question tool when available, or in plain text before ending the turn). Post the reply as a `## Answers` comment on the target issue (`<spec>` for slicing, validation, and final review; the ticket or bug issue otherwise).
  - **Fold settled answers**: For implementation questions, delegate folding answers to the next implementation subagent. For decision-ticket, slicing, bug-preparation, validation, ticket-review, or final-review questions, fold settled answers into the map, decision ticket, spec, bug issue, or ticket body via surgical body edit (`gh issue edit <n> --body-file <file>`, deleting the temporary file immediately), or into fix-ticket acceptance criteria. Halt when Row 12 created fix tickets; otherwise query state and route again.
- **Subagent returns any other packet**: Follow the row's **Transition** column (halt on Boundary 2 exit or bug-ticket approval at row 9, fix-ticket approval at row 12, or Boundary 3 exit at row 13, and otherwise query state and route again).

## 5. Report at every halt

State the boundary and link each changed issue by title.
When the halt asks the user a question, end with that question, because the reply resumes routing in the current session.
Otherwise, end with exactly one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 15 with an `OPEN` pull request | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3 | `Feature complete.` Print no command. |
| Row 15 with a `CLOSED` pull request | Report that `<pr-url>` closed unmerged and prompt to reopen. When declined, report feature abandoned. Print no command. |
| Row 9 with open `ship-it:bug` tickets | Review the bug tickets and run `ship-it <slug>` to begin implementation. |
| Row 2 or Row 11 Step 1 with all open tickets blocked | Break or close the blocker cycle on the reported tickets before re-running `ship-it <slug>`. |
| Any other halt | `ship-it <slug>` |

## Boundaries

| Boundary | Rows | Exit halt |
| :--- | :--- | :--- |
| 1. Mapping | 1 (map), 2 | Map closed with all decisions resolved |
| 2. Definition | 1 (spec), 4–9 | Ticket set validated |
| 3. Execution | 10–15 | Pull request opened and annotated; also halts when the final review creates fix tickets or bug tickets await approval |
