---
name: ship-it
description: "Conducts one feature through plan, map, spec, tickets, validation, bug triage, implementation, and review of GitHub pull requests, using GitHub issues as the only state. Requires a directive: `ship-it [slug]`, `ship-it #[issue]`, `ship-it \"[idea]\"`, `ship-it preflight`, `ship-it init`, `ship-it version`, `ship-it --version`, or `ship-it -v`. Manual-only workflow: invoke only when the user explicitly types ship-it or /ship-it."
compatibility: Git repository, GitHub CLI (gh) 2.16.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Ship It

Conduct one feature through **Plan → Spec → Tickets → Implement → Review**.
GitHub issues, labels, and the feature branch hold all state.
Every run derives its next action from that state alone.

## Hard rules

1. **Never guess.** Ask the user whenever a fact on scope, observable product behavior, or irreversible architecture is missing from the directive, an issue, or a reference file, because unverified assumptions cause silent drift across issues and code. Slice-local spec-validation questions defer to slicing per § 4, and reversible slice-local defaults auto-resolve via `## Auto-resolved Decisions` during slicing, ticket-set remediation ([tickets.md](references/tickets.md)), and triage of ticket-set validation questions (§ 4).
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
6. **Post-publication leftover filing**: Immediately after Row 1 publishes the first map or spec (never after Row 4 publishes a spec from a map), and before the next query or any other [plan.md](references/plan.md) or [plan.md](references/plan.md#spec) step, file each idea from the intake-confirmed leftover list held in context (never from the whole `Out of scope` section) via `gh issue create` with a short title, a one- or two-sentence body (`Split from #<n>` when an issue sourced the request), no `ship-it:` labels, and no `[<slug>]` title prefix. When `gh issue create` fails for an idea, report its title, file the remaining leftovers, and continue routing; if the run halts before filing, resume files nothing and reports nothing extra.

When a `ship-it <slug>` directive matches no issue, report that no feature uses the slug, ask for an idea, and stop.

## 2. Query state

Run these queries at the start of every routing pass, skipping the pull request query until a spec names the branch.
Filter results matching title prefix `[<slug>]`.

```shell
gh issue list --search "[<slug>] in:title" --state all --limit 100 --json number,title,labels,assignees,state,stateReason
gh pr list --head "<branch>" --state all --json number,state,url
```

- **Truncated search**: GitHub search matches the slug's words anywhere in a title, so other features' issues count toward the 100-result limit. When the issue query returns 100 results, emit the warning in [writing.md](references/writing.md#bounded-search-truncation), rerun the query once per label by adding `--label "<label>"` for `ship-it:map`, `ship-it:spec`, `ship-it:ticket`, `ship-it:bug`, `ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, and `ship-it:task`, and merge the reruns by issue number. Halt when any rerun also returns 100, because a truncated set can hide the map or spec and recreate it.
- **Fresh reads after writes**: GitHub search indexes new issues and label changes with a delay. On the pass after an action, re-read each issue that the action created or changed (the dispatch packet's and the returned `Issues:` numbers, plus the conductor's own writes) via `gh issue view <n> --json number,title,labels,assignees,state,stateReason`. Use each read in place of that issue's search entry, and add the issue when the search missed it.
- **In-memory partition**: Partition issues into `map`, `spec`, `ticket`, and `bug` sets by label:
  - `map`: issues bearing `ship-it:map`
  - `spec`: issues bearing `ship-it:spec`
  - `ticket`: issues bearing `ship-it:ticket`
  - `bug`: issues bearing `ship-it:bug`
- **Derived predicates**: Compute these canonical sets from the partitioned issues (and lazy queries below):
  - `ticket_set`: issues bearing `ship-it:ticket`, deduplicated by issue number (used across Rows 5, 6, 8, 9, and 11).
  - `unprepared_bugs`: open issues bearing `ship-it:bug` and lacking `ship-it:ticket` (used in Rows 9 and 10).
  - `frontier_ticket`: the lowest-numbered open issue in `ticket_set` whose blockers are all `CLOSED` (used in Row 11).
- **Branch name**: Read the branch name from the spec's `## Source` once via `gh issue view <spec> --json body --jq .body`. Retain that branch name across routing passes.
- **Pull requests**: Run the pull request query only once a spec exists. A pull request `state` is `OPEN`, `CLOSED` (closed unmerged), or `MERGED`. Evaluate multiple pull requests for the branch in priority order: `MERGED` > `OPEN` > `CLOSED`.
- **Query errors**: Treat any failed query as an environment error, and run [preflight.md](references/preflight.md), which reports its findings and halts. Never interpret a failed query as "no artifacts". An authentication, network, or permission failure would otherwise match Row 1 or Row 4 and create duplicate maps or specs. When a conductor GitHub write fails with a transient GraphQL, HTTP 5xx, or timeout error instead of a failed query, inspect target state and retry once per [writing.md](references/writing.md#cross-platform-shell-conventions) before routing to [preflight.md](references/preflight.md).

## Reference index

Load only [isolation.md](references/isolation.md), [writing.md](references/writing.md), and the reference file(s) for the active step. Do NOT load non-active reference files until their row matches. Leaving non-active reference files unloaded keeps the conductor's context lean and prevents rules for other phases from bleeding into the active step. In Tier 1, name subagent-run files (the `Runs in` column of [isolation.md](references/isolation.md#actions)) in the dispatch packet instead of loading them.

| File | Read the file when (Tier 2, or a conductor-run step) |
| :--- | :--- |
| [isolation.md](references/isolation.md) | Running any action |
| [plan.md](references/plan.md) | Rows 1 and 2 (map) |
| [plan.md](references/plan.md#spec) | Rows 1, 4, and 5 |
| [verify.md](references/verify.md#target-spec) | Row 7 (spec validation) |
| [tickets.md](references/tickets.md) | Rows 6 and 8, Row 11 blocker checks, and Rows 9, 10, and 12 (sections assigned in [isolation.md](references/isolation.md#actions)) |
| [tickets.md](references/tickets.md#bug-preparation) | Row 10 (bug preparation) |
| [verify.md](references/verify.md#target-ticket-set) | Row 9 (ticket-set validation) |
| [implement.md](references/implement.md#implement) | Row 11 Steps 4 (zero handoffs) and 5 (implementation) |
| [implement.md](references/implement.md#rework) | Row 11 Step 3 (ticket rework) |
| [verify.md](references/verify.md#target-ticket) | Row 11 Step 4 (ticket review, with `#shared-rules`: two-axis review passes and report template) |
| [verify.md](references/verify.md#target-final) | Row 12 (final review, with `#shared-rules`) |
| [implement.md](references/implement.md#close-out) | Row 13 (close-out) |
| [preflight.md](references/preflight.md) | `ship-it preflight`, `ship-it init`, or `ship-it version` (Check 0 only), or a `gh` command fails |
| [writing.md](references/writing.md) | Every step (prose, shell, and search-truncation rules) |

## 3. Route: the first matching row wins

Execute a continuous **Query → Route → Act** loop.
Complete the matched action, then follow the row's **Transition** column.

| # | State | Action | Transition |
| :-- | :--- | :--- | :--- |
| 1 | No map and no spec | Chart the map ([plan.md](references/plan.md)) or draft and publish the spec ([plan.md](references/plan.md#spec)), per the setup choice. | Query state and route again (hits row 2 when charting a map, or row 7 when publishing a spec directly). |
| 2 | Map is open | Resolve the next decision ticket ([plan.md](references/plan.md)). When none remain, close the map. | While open decision tickets remain: query state and route again, or **halt** when every open decision ticket is blocked. When the map closes: **halt (Boundary 1 exit)**. |
| 3 | Spec is closed, or a pull request for the branch is `MERGED` | Close the spec when open (`gh issue close <spec> --comment "Merged in <pr-url>"`), then report the feature complete. | **Stop.** |
| 4 | No spec | Draft and publish the spec ([plan.md](references/plan.md#spec)). | Query state and route again (hits row 7). |
| 5 | Spec has `ship-it:changes-requested` and `ticket_set` is empty | Remediate the spec through direct body updates without posting issue comments ([plan.md](references/plan.md#spec-remediation)), applying the two-pass cap (below). | Query state and route again (hits row 7). |
| 6 | Spec has `ship-it:changes-requested` and `ticket_set` is non-empty | Remediate `ticket_set` through direct body updates ([tickets.md](references/tickets.md#remediation)), posting at most `## Auto-resolved Decisions` on `<spec>` (never `## Answers` or ticket comments), and applying the two-pass cap (below). | Query state and route again (hits row 9). |
| 7 | Spec lacks `ship-it:validated` | Validate the spec ([verify.md](references/verify.md#target-spec)), applying the two-pass cap (below). | Query state and route again (hits row 8 on pass, row 5 on blockers, or row 7 after handling questions). |
| 8 | `ticket_set` is empty | Slice tickets ([tickets.md](references/tickets.md)). | Query state and route again (hits row 9). |
| 9 | An open issue in `ticket_set` lacks `ship-it:validated` and `unprepared_bugs` is empty | Apply the two-pass cap (below), run the mechanical pre-validation gate (below), then validate `ticket_set` ([verify.md](references/verify.md#target-ticket-set)). | On `approved`: **halt (Boundary 2 exit)** when no open ticket has `ship-it:bug`, or **halt** for approval of the bug tickets when an open ticket has `ship-it:bug`. Otherwise: query state and route again (hits row 6 on blockers, or row 9 after handling questions). |
| 10 | `unprepared_bugs` is non-empty | Prepare the lowest-numbered issue in `unprepared_bugs` ([tickets.md](references/tickets.md#bug-preparation)). | Query state and route again (hits row 10 when `unprepared_bugs` remains non-empty, or row 9). |
| 11 | An open issue exists in `ticket_set` | Work `frontier_ticket` (below). | Query state and route again after each frontier step. |
| 12 | Spec lacks `ship-it:reviewed` | Run the final review ([verify.md](references/verify.md#target-final), [verify.md](references/verify.md#shared-rules)), applying the two-pass cap (below). | On `approved`: query state and route again (hits row 13). When the review creates fix tickets: **halt** for approval of the fix tickets. Otherwise: query state and route again (hits row 12 after handling questions). |
| 13 | No pull request exists for the branch | Close out ([implement.md](references/implement.md#initial-close-out)). | **Halt (Boundary 3 exit).** |
| 14 | A pull request is `OPEN` or `CLOSED` | `OPEN`: report that the pull request awaits human merge. `CLOSED`: report that the pull request closed without merging. | **Stop.** |

- **Tier 2 fresh-session halts**: In Tier 2, Rows 7, 9, 11 (Step 4), and 12 halt for a fresh session per [isolation.md](references/isolation.md) whenever validation or review is not the session's first action.

**Frontier ticket** (`frontier_ticket` in § 2): Resolve each open ticket's blockers from its `## Blocked by` tasklist per [tickets.md](references/tickets.md#relationships), reading bodies via `gh issue list`/`gh issue view <n> --json body --jq .body` as needed.
Apply the first matching step:

1. No open ticket is unblocked: report each open ticket with its open blockers and **halt**.
2. Has `ship-it:reviewed`: close the ticket (`gh issue close <n> --comment "<summary>"`), then query state and route again.
3. Has `ship-it:changes-requested`: apply the two-pass cap to the ticket's review gate (below) before dispatching rework ([implement.md](references/implement.md#rework)), then query state and route again.
4. Has an assignee: read the ticket's row in the `## Ship-it State` comment. When `Handed off` is `yes`, apply the two-pass cap to the ticket's review gate (below), then dispatch review ([verify.md](references/verify.md#target-ticket), [verify.md](references/verify.md#shared-rules)) with the row's `Fixed point`, then query state and route again. Otherwise, re-dispatch implementation ([implement.md](references/implement.md#implement)), then query state and route again.
5. Otherwise: claim the ticket (`gh issue edit <n> --add-assignee "@me"`), record its fixed point per **Ship-it State**, dispatch implementation ([implement.md](references/implement.md#implement)), then query state and route again.

**Mechanical pre-validation gate** (Row 9): Run inside Row 9 before dispatching `validate` (`Target: ticket-set`) across every path entering Row 9 (Row 8 slicing, Row 6 remediation, Row 10 bug preparation, `§ 3` `Reset and fold`, and `§ 4` `Fold settled answers`):

```shell
gh issue list --search "[<slug>] in:title" --state open --limit 100 --json number,title,body,labels
gh issue view <n> --json number,title,body,labels
```

- **Batch query and reconciliation**: Run the `gh issue list` query above, check `--limit 100` truncation per `§ 2`, and reconcile with fresh `gh issue view` reads for issues returned or edited by the preceding action.
- **In-agent filter**: Retain ONLY open issues whose title starts with `[<slug>]` or whose number was returned or edited by the preceding action while excluding `ship-it:spec`, `ship-it:map`, decision-ticket labels (`ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, `ship-it:task`), and unprepared `ship-it:bug` (lacking `ship-it:ticket`).
- **Direct repairs**: Repair these five mechanical defect classes without dispatching a subagent (writing temporary `--body-file` payloads and deleting them immediately):
  1. Missing or malformed `[<slug>] ` title prefix (`gh issue edit <n> --title ...`).
  2. Missing `ship-it:ticket` label (`gh issue edit <n> --add-label "ship-it:ticket"`).
  3. Missing `Part of #<spec>` header.
  4. Non-canonical `## Blocked by` tasklists (normalize to `- [ ] Blocked by #<id>` or `None (can start immediately).`, automatically stripping self-links and duplicate blocker entries).
  5. Valid under-tiered `## Complexity` declarations below non-overlapping source-file bands excluding test files per [tickets.md](references/tickets.md#complexity-taxonomy) (`low` = 1–2, `medium` = 3–5, `high` = 6+): upgrade the tier and update the adjacent rationale sentence to state the touched source-file count. Keep higher tiers justified by non-file dimensions, skip source-file checks on `ship-it:bug` tickets, and defer missing or invalid non-`low`/`medium`/`high` `## Complexity` headers to [verify.md](references/verify.md#target-ticket-set).
- **Label invalidation and cycle halt**: Strip `ship-it:validated` (`gh issue edit <n> --remove-label "ship-it:validated"`) when present from any ticket edited by the gate and its open direct dependency neighbors (per [tickets.md](references/tickets.md#relationships)). Halt and ask the user when the open blocker graph contains a multi-ticket semantic dependency cycle.

**Ship-it State**: One `## Ship-it State` comment on `<spec>` holds the counts that route every gate. The conductor alone writes it, and it never reads a report heading or header text.

- **Lookup**: `gh issue view <spec> --json comments --jq '[.comments[] | select(.body | startswith("## Ship-it State")) | {url, body}] | last'`. This exact heading match is the only one in the skill. Read the whole body.
- **Contents**:

  ```markdown
  ## Ship-it State
  | Gate | Passes | Non-approved | Last verdict |
  | :--- | :--- | :--- | :--- |
  | spec-validation | 0 | 0 | none |
  | ticket-set-validation | 0 | 0 | none |
  | final-review | 0 | 0 | none |

  | Ticket | Fixed point | Handed off | Passes | Non-approved | Last verdict |
  | :--- | :--- | :--- | :--- | :--- | :--- |
  | #<n> | <sha> | no | 0 | 0 | none |
  ```

  `Last verdict` is the verdict plus its `Evidence:` URL. A ticket's row counts its review gate.
- **Writes**: Create the comment with `gh issue comment`, and edit it in place afterwards (`gh api -X PATCH repos/{owner}/{repo}/issues/comments/<id> -F body=@<file>`, with `<id>` the number ending its `url`), deleting the temporary file immediately. It changes only when:
  - **A verdict passes the § 4 cross-check**: `Passes` + 1 and `Last verdict` set. A `changes-requested` or `questions` verdict also adds 1 to `Non-approved`. An `approved` verdict closes the gate instance and zeroes both counts, so the next instance starts at pass 1.
  - **A ticket is handed off**: Before dispatching `implement` for a ticket without a `Fixed point`, record the sha from `git ls-remote origin refs/heads/<branch>`, or from `git rev-parse origin/<default-branch>` when the branch is not on `origin`. When `implement` returns `done`, set `Handed off` to `yes`.
  - **A human resets a gate** (halt choice 1 below): `Non-approved` becomes 0 and `Passes` stays, so passes after a reset stay delta-only.
- **Missing comment**: Create it with zero counts and report that in the next halt. A ticket under review with no `Fixed point` halts and asks.
- **Labels win**: A gate whose approval label is present is closed, whatever the counts say. A stale count cannot approve anything.

**Two-pass cap**: Pass 1 is the only full audit, and every later pass carries the Delta-audit directive. Rows 5–7, 9, 11 (Steps 3 and 4), and 12 check the cap before acting. When the gate's `Non-approved` is 2, **halt**. Every non-approved verdict counts, `changes-requested` and `questions` alike. The § 4 question prompt gives way to this halt when the verdict brought `Non-approved` to 2.

**Cap halt**: Name the gate and its issue, link the `Last verdict` report, list its unresolved findings and any remaining `Questions`, and offer exactly three choices (ask with an interactive question tool when available, or in plain text before ending the turn):

1. **Reply with guidance**: Post the reply as `## Answers` on the gate's issue via temporary `--body-file`, deleting it immediately. Fold it into the gate's folding target, strip `ship-it:validated` when present from edited open tickets and their open direct dependency neighbors (per [tickets.md](references/tickets.md#relationships)), reset the gate's `Non-approved` to 0, then query state and route again.
2. **Apply the approval label by hand**: The only waiver. Waiver labels are below. Route again once applied.
3. **Stop**: End the run without changing labels.

| Gate | Rows | Verdict issue | Folding target | Waiver label |
| :--- | :--- | :--- | :--- | :--- |
| spec-validation | 5, 7 | `<spec>` | Spec body | `ship-it:validated` on `<spec>` |
| ticket-set-validation | 6, 9 | `<spec>` | Open ticket bodies | `ship-it:validated` on every open ticket in `ticket_set` |
| ticket review (per ticket) | 11 (Steps 3–4) | `<n>` | Ticket body (and spec body when shared contracts change) | `ship-it:reviewed` on `<n>` |
| final-review | 12 | `<spec>` | Spec body, or open fix-ticket acceptance criteria | `ship-it:reviewed` on `<spec>` |

## 4. Dispatch and verdicts

Run every action per [isolation.md](references/isolation.md) (including the subagent dispatch packet and prohibitions in [Tier 1: dispatch packet](references/isolation.md#tier-1-dispatch-packet)).
Dispatch at most one leaf subagent at a time.
Await the subagent's four-line return block before resuming the routing loop.

Before any verification pass (`validate`, `review`, or `final-review`), read the gate's `Passes` from the `## Ship-it State` comment and record the pre-dispatch comment count `C_pre` with `gh issue view <issue> --json comments --jq '.comments | length'` on the active `Verdict issue`.
Copy the [Delta-audit directive](references/isolation.md#delta-audit-directive) block verbatim into `- **Delta audit**:` of verification packets in Tier 1 when `Passes` is at least 1, omitting it on pass 1 and on non-verification roles. A pass after a reset keeps it. For `review`, also pass the ticket's `Fixed point` in `- **Fixed point**:`.
Apply the directive directly on first-action verification runs at pass 2 or later in Tier 2.

- **Conductor action completes** ([plan.md](references/plan.md), [plan.md](references/plan.md#spec), or [tickets.md](references/tickets.md#remediation)): Follow the row's **Transition** column.
- **Subagent returns `failed` or no valid [return block](references/isolation.md#return-schema)**: **Halt** and report the error, the issue, and the step, so a crashed subagent never passes as a success.
- **Verdict cross-check** (strictly before `Subagent returns Questions other than None` and `Subagent returns any other packet`): Verify every non-`failed` return from `validate`, `review`, or `final-review` against fresh GitHub state before triaging questions or routing:
  - **Verdict issue query**: Fetch labels and comments on the active `Verdict issue` (`<spec>` for `validate` and `final-review`, or `<n>` for `review`) once with single-quoted `--jq` syntax and zero inner quotes:

    ```shell
    gh issue view <issue> --json labels,comments --jq '{labels: [.labels[].name], comments: [.comments[].url]}'
    ```

  - **Report and return-field check**: Verify return fields and newly posted report comments before checking labels:
    - Reject `approved` returns with `Questions:` other than `None` and reject unrecognized verdicts (such as `done`).
    - Allow `Evidence: None` strictly when `validate` (`Target: spec` or `Target: ticket-set`) returns `approved` on pass 1 (`Passes` is 0 before dispatch), and reject `Evidence: None` on every other verification return.
    - Whenever `Evidence:` is not `None` inspect `comments[C_pre:]` in-agent so stale reports predating the pass fail verification, and confirm `comments[C_pre:]` includes a comment whose `url` equals `Evidence:`.
  - **`validate` (`Target: spec`) labels**: Require `ship-it:validated` without `ship-it:changes-requested` on `<spec>` for `approved`, `ship-it:changes-requested` without `ship-it:validated` for `changes-requested`, and absence of both labels for `questions`.
  - **`validate` (`Target: ticket-set`) labels**: Require `ship-it:changes-requested` on `<spec>` for `changes-requested`. For `approved` and `questions`, confirm `<spec>` lacks `ship-it:changes-requested` and inspect each open ticket `<t>` in `ticket_set` directly via `gh issue view <t> --json labels --jq '[.labels[].name]'` to bypass search-index lag. Require `ship-it:validated` on every open ticket in `ticket_set` for `approved`, and require at least one open ticket in `ticket_set` lacking `ship-it:validated` for `questions`.
  - **`review` labels**: Require `ship-it:reviewed` without `ship-it:changes-requested` on `<n>` for `approved`, `ship-it:changes-requested` without `ship-it:reviewed` for `changes-requested`, and absence of both labels for `questions`.
  - **`final-review` labels and fix tickets**: Require `ship-it:reviewed` on `<spec>` for `approved`, and confirm `<spec>` lacks `ship-it:reviewed` for `questions` and `changes-requested`. On `changes-requested`, verify that `Issues:` includes at least one newly created open fix ticket absent from pre-dispatch `ticket_set` via `gh issue view <fix> --json number,state,labels,title --jq '{number, state, labels: [.labels[].name], title}'`, confirming `state` equals `OPEN`, `labels` includes `ship-it:ticket` and `ship-it:validated`, and `title` starts with `[<slug>]`.
  - **Mismatch halt**: Treat missing or unresolved fix-ticket numbers as a mismatch, and route authentication or network `gh` errors to § 2 `Query errors`. When any report, `Evidence:`, `Questions:`, label, or fix-ticket check fails, halt immediately as a `failed` return reporting expected versus observed verdict, expected versus observed labels, the affected issue number, and the active step. When every check passes, update the `## Ship-it State` comment per § 3.
- **Subagent returns `Questions` other than `None`** (on `questions` or `changes-requested`):
  - **Combined-finding ordering**: Resolve `Questions` before Row 5, Row 6, or Row 11 Step 3 remediation whenever a report carries both Blockers and Questions so that report counts once.
  - **Triage spec validation questions**: When `validate` runs with `Target: spec`, append stray slice-local questions on implementation, touchpoints, or error paths strictly to `- **Deferred to slicing**: <detail>` under `## Implementation Decisions` in `<spec>` via `gh issue edit <spec> --body-file <file>`, deleting the temporary file immediately. Leave other spec sections untouched, skip user prompts for deferred items, and post no comment. When zero cross-cutting questions remain, query state and route again (deferral-only passes still count toward the cap).
  - **Auto-resolve ticket-set validation questions**: When `validate` runs with `Target: ticket-set`, resolve reversible slice-local `Questions` into open ticket bodies via surgical `--body-file` edit, post one `## Auto-resolved Decisions` comment on `<spec>` using the bullet format in [tickets.md](references/tickets.md#3-publish-in-dependency-order), strip `ship-it:validated` when present from edited tickets and open direct dependency neighbors (per [tickets.md](references/tickets.md#relationships)), and delete temporary files immediately. When zero irreversible questions on scope, observable product behavior, or irreversible architecture remain, query state and route again.
  - **Cap halt before prompting**: When the verdict brought the gate's `Non-approved` to 2, run the § 3 cap halt and present the remaining questions alongside the unresolved findings instead of prompting for `## Answers`.
  - **Prompt and record replies**: When below the cap (or when `slice`, `decide`, `prepare-bug`, `implement`, or `rework` asks questions), batch-prompt the user once for all remaining questions using an interactive question tool when available, or in plain text before ending the turn. Post the reply as a `## Answers` comment on the target issue (`<spec>` for slicing, validation, and final review; the ticket or bug issue otherwise) via temporary `--body-file`, deleting the temporary file immediately.
  - **Fold settled answers**: For implementation questions, delegate folding answers to the next implementation subagent. For decision-ticket, slicing, bug-preparation, validation, ticket-review, or final-review questions, fold settled answers into the map, decision ticket, spec, bug issue, or open ticket bodies via surgical body edit (`gh issue edit <n> --body-file <file>`, deleting the temporary file immediately), or into fix-ticket acceptance criteria. Strip `ship-it:validated` when present from edited open tickets and their open direct dependency neighbors (per [tickets.md](references/tickets.md#relationships)). Halt when Row 12 created fix tickets; otherwise query state and route again.
- **Subagent returns any other packet**: Follow the row's **Transition** column (halt on Boundary 2 exit or bug-ticket approval at row 9, fix-ticket approval at row 12, or Boundary 3 exit at row 13, and otherwise query state and route again).

## 5. Report at every halt

State the boundary and link each changed issue by title.
When the halt asks the user a question, end with that question, because the reply resumes routing in the current session.
Otherwise, end with exactly one next step:

| Halt | Next step |
| :--- | :--- |
| Boundary 3 exit, or row 14 with an `OPEN` pull request | `Merge <pr-url> to complete the feature. No further ship-it run is needed.` |
| Row 3 | `Feature complete.` Print no command. |
| Row 14 with a `CLOSED` pull request | Report that `<pr-url>` closed unmerged. Print no command. |
| Row 9 with open `ship-it:bug` tickets | Review the bug tickets and run `ship-it <slug>` to begin implementation. |
| Row 2 or Row 11 Step 1 with all open tickets blocked | Break or close the blocker cycle on the reported tickets before re-running `ship-it <slug>`. |
| Any other halt | `ship-it <slug>` |

## Boundaries

| Boundary | Rows | Exit halt |
| :--- | :--- | :--- |
| 1. Mapping | 1 (map), 2 | Map closed with all decisions resolved |
| 2. Definition | 1 (spec), 4–9 | Ticket set validated |
| 3. Execution | 10–14 | Pull request opened and annotated; also halts when the final review creates fix tickets or bug tickets await approval |
