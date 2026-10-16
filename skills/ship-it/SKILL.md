---
name: ship-it
description: "Conducts a feature through the full build loop, plan, spec, tickets, implement, review, end to end across as many sessions as it takes, in any GitHub repository. Looks at what already exists for the feature (a map, a spec, tickets, a diff awaiting review) and states the one next step to take. Manual-only workflow: do NOT invoke automatically or unprompted; only activate when explicitly requested by the user via ship-it or /ship-it."
compatibility: Git repository, GitHub issue access (gh CLI), and a cross-platform shell.
metadata:
  disable-model-invocation: "true"
---

# Ship It

Conduct a feature through the full build loop, one phase at a time: **Plan → Spec → Tickets → Implement → Review**

This skill is self-contained and tracks work using GitHub issues.
All reference guides live in this folder and in the files written into the repository.
The skill does not invoke external skills.

## Invocation and Harness Configuration

Run `ship-it` only when the user explicitly requests it (e.g. `ship-it` or `/ship-it`).
Do not invoke this skill automatically.

## Why a Conductor, Not One Pass

Large features require separation of concerns to prevent confirmation bias and enforce objective verification gates.
A single session that authors, implements, and reviews its own work suffers from authoring bias.
The authoring session rationalizes its assumptions, skips verification, and overlooks its own blind spots.

Dividing the build loop into discrete phases establishes explicit verification gates at each handoff:

- **Plan**: Chart decision destinations and resolve architecture forks before writing specs.
- **Spec**: Adversarially audit specifications against user requirements before creating tickets.
- **Tickets**: Validate slice breakdowns before starting implementation.
- **Implement**: Apply domain-aligned verification using test-first Red-Green for code or direct acceptance verification for assets.
- **Review**: Evaluate diffs independently without author rationalizations.

This skill supports two execution modes: **Phase-Bounded Autonomous Loops** and **Step-by-Step mode**.
In phase-bounded autonomous loop mode, the conductor orchestrates child subagents within the active automation boundary until reaching its boundary exit checkpoint.
In step-by-step mode, the conductor executes one phase or ticket at a time, completes that task, and prompts for confirmation before proceeding.

## Phase-Bounded Automation Boundaries

Autonomous execution operates within three discrete automation boundaries.
Each boundary enforces a mandatory pause for human review at its exit gate.
The conductor enforces hard halts at each boundary exit.
Autonomous transitions across boundary gates without explicit developer approval are strictly prohibited:

- **Boundary 1: Mapping (Plan Phase)**:
  - **Boundary entry**: Begins when initiating an unmapped feature or picking up an unresolved map.
  - **Execution scope**: Charts decision destinations, creates decision tickets, and resolves architectural forks.
  - **Child delegation**: Dispatches research, prototype, and task tickets to isolated child subagents without parent conversation context per [references/isolation.md](references/isolation.md#decision-ticket-protocol-tier-1). Pauses immediately for grilling tickets.
  - **Boundary exit halt**: Halts when the map resolves and all decision tickets close. Reports settled decisions and pauses for developer approval before advancing to Boundary 2.
- **Boundary 2: Spec & Tickets (Definition Phase)**:
  - **Boundary entry**: Begins after developer approval of Boundary 1, or when planning is skipped for a well-scoped feature.
  - **Execution scope**: Synthesizes specifications, conducts adversarial audits, slices vertical tickets, and validates ticket sets.
  - **Child delegation**: Dispatches specification validation, ticket slicing, and ticket set validation to isolated child subagents per [references/isolation.md](references/isolation.md).
  - **Boundary exit halt**: Halts after ticket set validation passes carrying `ship-it:validated` and `ready-for-agent` (or after spec validation passes for single-session specs). Reports the validated breakdown and pauses for developer approval before advancing to Boundary 3.
- **Boundary 3: Implementation & Review (Execution Phase)**:
  - **Boundary entry**: Begins after developer approval of Boundary 2, initiating implementation of the ticket frontier (or validated single-session spec).
  - **Execution scope**: Builds slices test-first, verifies diffs via independent review subagents, executes bounded rework up to two retries, and advances the frontier.
  - **Child delegation**: Dispatches implementation, diff review, and remediation to isolated child subagents without parent conversation context per [references/isolation.md](references/isolation.md).
  - **Boundary exit halt**: Halts when the final ticket closes, the completion comment posts on the parent specification, and the pull request opens. Automated pull request merge is strictly prohibited. Pauses for developer review and merge approval.

## Preflight, Only When Needed

`ship-it` assumes a configured repository: `gh` installed and authenticated, a `github.com` remote, Issues enabled with write access, and required labels present.
Consult [references/preflight.md](references/preflight.md) for setup requirements.
Standard runs skip preflight checks and proceed directly to [Every run](#every-run).

Execute the checklist in [references/preflight.md](references/preflight.md) only when:

- The user explicitly requests preflight (e.g. `ship-it preflight` or `/ship-it preflight`).
- A `gh` command fails with an environmental error (such as auth failure, rate limits, 403/500 errors, or missing labels).

## Every run

### 1. Orient: Which Feature, Which Boundary

Determine the feature **slug** first.
The slug is a short, consistent identifier included in every issue title for the feature (e.g. `auth-rewrite`, yielding titles like `[auth-rewrite] Spec: ...`).
If the conversation does not specify the feature, ask the user for the slug directly.

Once you have the slug, query GitHub issues in this order to determine the active boundary and phase:

1. **Map**:
   `gh issue list --label "ship-it:map" --search "<slug> in:title" --state all --json number,title,labels,state`
   (Consult [references/plan.md](references/plan.md).)
2. **Published spec**:
   `gh issue list --label "ship-it:spec" --search "<slug> in:title" --state all --json number,title,labels,state`
   (Consult [references/spec.md](references/spec.md).)
3. **Tickets generated from the spec**:
   `gh issue list --label "ship-it:ticket" --search "<slug> in:title" --state all --json number,title,labels,assignees,state`
   Locate the active frontier ticket using the [Orient Discovery Algorithm](#orient-discovery-algorithm).
4. **Frontier ticket evaluation**:
   Evaluate the active frontier ticket across three states using [3-State Orient Routing](#3-state-orient-routing).
   (Consult [references/implement.md](references/implement.md) and [references/review.md](references/review.md).)

Read labels directly from the initial query output:

- `ship-it:validated` on a map, spec, or ticket set confirms it passed the adversarial audit in [references/validate.md](references/validate.md).
- `ship-it:reviewed` on a ticket confirms its diff passed independent review in [references/review.md](references/review.md).
- `ship-it:changes-requested` on a map, spec, or ticket confirms unresolved validation blockers or review findings requiring rework.
- `ready-for-agent` on an artifact indicates it awaits agent pickup in queue (for initial implementation or for isolated manual validation/review).
- The **absence** of `ship-it:validated` and `ship-it:changes-requested` on a multi-session artifact requires validation next. Never skip validation to jump directly to tickets or implementation.
- The presence of `ship-it:changes-requested` routes directly to the owning remediation phase before validation or review.

If only closed maps exist and no specification exists, treat planning as resolved and route to specification.
If all tickets and specifications are closed, treat the feature as complete.
The furthest active artifact along determines the active phase.
If no artifacts exist, the feature has not started.

#### Active Boundary Detection

Determine the active automation boundary and stopping checkpoint from the query results before presenting mode options:

- **Boundary 1: Mapping (Plan Phase)**:
  - **Condition**: An open map exists, decision tickets remain open, or fog remains in "Not yet specified". If no artifacts exist and the effort is large or ambiguous, Boundary 1 starts with map charting.
  - **Stopping Checkpoint**: Halts when the map resolves and all decision tickets close.
- **Boundary 2: Spec & Tickets (Definition Phase)**:
  - **Condition**: Map decisions are resolved (or planning skipped for well-scoped work) and the specification is drafting or validating; or the specification is validated and tickets are drafting or validating.
  - **Stopping Checkpoint**: Halts after ticket set validation passes carrying `ship-it:validated` and `ready-for-agent` (or after spec validation passes for single-session specs).
- **Boundary 3: Implementation & Review (Execution Phase)**:
  - **Condition**: A validated ticket set (or validated single-session spec) exists and tickets remain unstarted, in-progress, or under review.
  - **Stopping Checkpoint**: Halts when the final ticket closes, the completion comment posts on the parent specification, and the pull request opens.
- **Feature Complete**:
  - **Condition**: All tickets and specifications are closed.
  - **Stopping Checkpoint**: Report completion and stop.

**Orient Error Recovery**: If a `gh` query fails during Orient, do not assume artifacts are missing.
Transient errors include rate limits, 403/500 errors, or network drops.
Do not restart the feature.
Treat the failure as an environmental error and route to [references/preflight.md](references/preflight.md) to diagnose and resolve the issue before re-running Orient.

#### Orient Discovery Algorithm

Isolate evaluation to the lowest-numbered open ticket:

1. **Frontier ticket selection**:
   Filter out closed tickets (`state: "CLOSED"`).
   Sort open tickets ascending by issue number.
   Select the lowest-numbered open ticket as the active **frontier ticket**.
   Isolate evaluation and routing strictly to this single frontier ticket.
2. **Query dependencies**:
   Inspect native issue dependencies for the frontier ticket before reading markdown bodies per the [Dual-Channel Relationship Contract](references/tickets.md#dual-channel-relationship-contract).
   Query native blockers via GitHub CLI (`gh issue view <number> --json blockedBy`).
   Fall back to parsing the markdown `## Blocked by` tasklist from the issue body when native relationships are absent.
3. **Verify blocker status**:
   Inspect blocker issue status via `gh issue view <blocker-id> --json state`.
   A ticket is **unblocked** if it lists no blockers (or "None") or if every blocker has `state: "CLOSED"`.

#### 3-State Orient Routing

Evaluate the active frontier ticket across three deterministic states:

1. **Reviewed**:
   The frontier ticket carries `ship-it:reviewed`.
   Post a resolution comment, close the ticket (`gh issue close <number> --comment "<text>"`), and commit reviewed changes.
   If this is the final ticket for the specification:
   - Execute the [Feature Close-Out Protocol](#feature-close-out-protocol).
   - Conclude Boundary 3 immediately and halt conductor execution.
   - Report the open pull request and pause for human review and merge approval.
   - Automated pull request merge is strictly prohibited.
   If unstarted tickets remain:
   - In phase-bounded autonomous loop mode, execute autonomous frontier progression: locate the next unstarted ticket via the [Orient Discovery Algorithm](#orient-discovery-algorithm) and continue the build loop within Boundary 3.
   - In step-by-step mode, report the closed ticket and stop, or prompt for confirmation before starting the next ticket.
2. **In-Progress**:
   The frontier ticket has an assignee, an active feature branch, or an unreviewed diff.
   If the ticket carries `ship-it:changes-requested`:
   - Under Tier 1 environments, dispatch an isolated remediation subagent per the [Autonomous Rework Protocol](references/isolation.md#autonomous-rework-protocol-tier-1). The conductor permits at most two remediation retries upon review rejection. If review rejection persists after two attempts, alert the developer and halt execution for human intervention.
   - Under Tier 2 environments, execute manual fallback per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2). Claim the ticket and execute rework in a fresh manual session per [references/implement.md](references/implement.md#rework-workflow).
   If the ticket lacks `ship-it:changes-requested` and `ship-it:reviewed`:
   - Under Tier 1 environments, dispatch an isolated review subagent per the [Autonomous Verification Protocol](references/isolation.md#autonomous-verification-protocol-tier-1).
   - Under Tier 2 environments, preserve manual fallback: apply the `ready-for-agent` status label (`gh issue edit <number> --add-label "ready-for-agent"`), output the command for a fresh review session, and stop execution per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2).
3. **Unstarted**:
   The frontier ticket is unassigned and unblocked.
   Claim the ticket (`gh issue edit <number> --add-assignee "@me" --remove-label "ready-for-agent"`).
   - Under Tier 1 environments:
     Dispatch an isolated implementation subagent per the [Autonomous Implementation Protocol](references/isolation.md#autonomous-implementation-protocol-tier-1).
     - In phase-bounded autonomous loop mode, execute continuous phase chaining: ingest the implementation verdict summary, confirm commit generation, and dispatch an isolated review subagent per the [Autonomous Verification Protocol](references/isolation.md#autonomous-verification-protocol-tier-1). Route directly to State 1 (Reviewed) when review approves the diff to close the ticket and advance the frontier autonomously within Boundary 3.
     - In step-by-step mode, present interactive confirmation prompts before dispatching the review subagent or advancing to downstream work.
   - Under Tier 2 environments:
     Preserve manual fallback per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2).
     Build the ticket in a fresh session per [references/implement.md](references/implement.md).
     Apply the `ready-for-agent` status label (`gh issue edit <number> --add-label "ready-for-agent"`), output the command for a fresh review session, and stop.
   If the frontier ticket is blocked by dependencies, report blocker status and halt execution.

### 2. Execution Mode Selection

Inspect the runtime harness dynamically for interactive prompt tools before presenting mode options.
Check for interactive primitives such as `ask_question`, `prompt`, or equivalent tools.

When interactive prompt tools exist:

- Prompt the developer with the active boundary and stopping checkpoint to select the execution mode:
  - **Phase-Bounded Autonomous Loops**: Run autonomously within the active boundary (`<Active Boundary Name>`). Execution proceeds automatically and halts at the boundary exit checkpoint (`<Stopping Checkpoint Description>`).
  - **Step-by-Step mode**: Execute one phase or ticket at a time. The conductor pauses for interactive confirmation before executing each downstream step.
- Honor developer selection for all subsequent actions in this run.

When interactive prompt tools are absent:

- Default conductor execution to step-by-step mode.

### 3. Route to the One Next Step

| Current State | Next Step |
| :--- | :--- |
| Nothing exists; feature is well-scoped for one session | Read [references/spec.md](references/spec.md) and write the spec directly within Boundary 2. Omit the map. |
| Nothing exists; effort is too large or foggy for one session | Read [references/plan.md](references/plan.md) and chart the map within Boundary 1. Use the criteria in `plan.md` to assess scope. |
| Map carries `ship-it:changes-requested` | Read [references/plan.md](references/plan.md) and remediate reported map blockers. Resolve findings, update the map, post a comment, and remove the label. |
| A map exists, lacks `ship-it:changes-requested`, and remains unresolved | Read [references/plan.md](references/plan.md) and resolve decision tickets within Boundary 1. In step-by-step mode, resolve one ticket per session. In autonomous loop mode, resolve decision tickets until all close. |
| Map resolves (all decision tickets closed and fog resolved) | Conclude Boundary 1, close map issue with a summary comment, report settled decisions, and halt for developer approval before entering Boundary 2. |
| Map is resolved and developer approved advancement (or planning skipped), no spec exists | Read [references/spec.md](references/spec.md) and draft the feature specification within Boundary 2. |
| Spec carries `ship-it:changes-requested` | Read [references/spec.md](references/spec.md) and remediate reported spec blockers. Resolve findings, update the spec, post a comment, and remove the label. |
| Spec exists, lacks `ship-it:validated` and `ship-it:changes-requested`, and build spans multiple sessions | Audit the spec per [references/validate.md](references/validate.md) using the [Universal Task Isolation Protocol](references/isolation.md). Skip audit only for trivial specs. |
| Spec carries `ship-it:validated`, no tickets exist, and build requires multiple sessions | Read [references/tickets.md](references/tickets.md) and break the spec into vertical tickets within Boundary 2. |
| Single-session spec carries `ship-it:validated` (or validation skipped for trivial spec), implementation unstarted | Conclude Boundary 2, report the validated specification, and halt for developer approval before entering Boundary 3. |
| Ticket breakdown carries `ship-it:changes-requested` (no branch/PR exists) | Read [references/tickets.md](references/tickets.md) and remediate reported ticket breakdown blockers. Resolve findings, update tickets, post a comment, and remove the label. |
| Tickets exist, lack `ship-it:validated` and `ship-it:changes-requested`, and have not started | Audit the ticket set per [references/validate.md](references/validate.md) using the [Universal Task Isolation Protocol](references/isolation.md). Skip audit only for small, trivial ticket sets. |
| Tickets carry `ship-it:validated` and `ready-for-agent`, implementation unstarted | Conclude Boundary 2, report the validated ticket breakdown, and halt for developer approval before entering Boundary 3. |
| Frontier ticket carries `ship-it:changes-requested` (branch/PR exists) | Under Tier 1, dispatch remediation subagent up to two retries per [references/isolation.md](references/isolation.md). Under Tier 2, execute rework workflow in fresh session per [references/implement.md](references/implement.md). |
| Frontier ticket is Unstarted (unclaimed and unblocked) within Boundary 3 | Under Tier 1, dispatch implementation subagent per [references/isolation.md](references/isolation.md) and chain to review in autonomous loop mode. Under Tier 2, claim and build in fresh session per [references/implement.md](references/implement.md). |
| Frontier ticket is Unstarted but blocked by dependencies | Report blocker status for the frontier ticket and halt execution. |
| Frontier ticket is In-Progress (assigned, open), lacks `ship-it:changes-requested`, and lacks `ship-it:reviewed` | Review the diff per [references/review.md](references/review.md) using the [Universal Task Isolation Protocol](references/isolation.md). |
| Frontier ticket carries `ready-for-agent` in fresh review session | Review the diff directly per [references/review.md](references/review.md). |
| Frontier ticket is Reviewed (carries `ship-it:reviewed`) | Post resolution comment, close the ticket, and commit reviewed changes. In autonomous loop mode, advance to next ticket within Boundary 3. If final ticket, execute [Feature Close-Out Protocol](#feature-close-out-protocol). |
| Review or validation subagent detects minor issues (fast-path) | Resolve in-place, re-verify tests, apply appropriate status label, and proceed. |
| Validation subagent reports major issues (blockers) | Report findings summary to developer and route back to authoring phase in a fresh session. |
| Review subagent reports major issues | Under Tier 1 autonomous loop mode, dispatch remediation subagent up to two retries per [references/isolation.md](references/isolation.md). Under Tier 2, report findings to developer and route back to [references/implement.md](references/implement.md) in a fresh session. |
| Subagent tools absent in authoring session during implementation, validation, or review (Tier 2) | Apply `ready-for-agent` label, output the fresh session command, and pause execution per [Manual Fallback Protocol](references/isolation.md#manual-fallback-protocol-tier-2). |
| Single-session spec carries `ship-it:reviewed` with open PR | Conclude Boundary 3, report that pull request awaits human review and merge approval, and halt. Automated pull request merge is prohibited. |
| Single-session spec carries `ship-it:reviewed` without open PR | Open pull request referencing `Closes #<spec-id>`, conclude Boundary 3, report link, and halt. Automated pull request merge is prohibited. |
| All tickets are closed, spec is open, and open PR exists | Conclude Boundary 3, report that pull request awaits human review and merge approval, and halt. Automated pull request merge is prohibited. |
| All tickets are closed, spec is open, and no PR exists | Open pull request referencing `Closes #<spec-id>`, conclude Boundary 3, report link, and halt. Automated pull request merge is prohibited. |
| All tickets and specifications are closed | Report that the feature is complete and stop. |

### 4. Report and Stop

Conclude each run with a clear report based on the execution mode:

- **Step-by-step mode**:
  1. State the completed phase and active boundary.
  2. Summarize the actions taken.
  3. State the exact command to run next, or present an interactive confirmation prompt before proceeding to downstream work.
  Require developer confirmation before chaining into the next phase.

- **Phase-Bounded Autonomous Loops**:
  Maintain continuous execution within the active automation boundary.
  Enforce hard conductor halts at each boundary exit:
  - **Boundary 1 exit**: Halt when all decision tickets close and the map resolves. Report settled decisions and request developer approval before advancing to Boundary 2.
  - **Boundary 2 exit**: Halt when ticket set validation passes (or spec validation passes for single-session specs). Report the validated artifact and request developer approval before advancing to Boundary 3.
  - **Boundary 3 exit**: Halt when the final ticket closes, the completion comment posts, and the pull request opens. Prohibit automated pull request merge and request developer review.
  Also halt immediately when encountering dependency blockers, unrecoverable errors, or reaching the bounded retry limit on review rejections.

### Feature Close-Out Protocol

When the final ticket of a spec is reviewed and closed:

1. Post a completion comment on the parent specification documenting ticket completion (`gh issue comment <spec-id> --body "<text>"`). Prohibit manual issue closure on the parent specification.
2. Open or update the pull request referencing `Closes #<spec-id>` in the description. Merging the pull request automatically closes the parent specification.
3. Conclude Boundary 3 immediately and halt conductor execution.
4. Prohibit automated pull request merge. Pause execution for developer review and merge approval.

## Context Hygiene

- **Universal Task Isolation**: Enforce task isolation across planning, specification, ticketing, implementation, validation, and review per [references/isolation.md](references/isolation.md). This protocol replaces legacy continuous conversation across Plan, Spec, and Tickets. Under Tier 1 environments, dispatch every self-contained workload (decision tickets, ticket slicing, implementation, validation, and review) to an isolated child subagent with zero parent context. Under Tier 2 environments, execute each phase and ticket in a fresh manual session. Self-contained artifacts prevent context contamination and eliminate authoring bias.
- **Implement**: Under Tier 1 environments, dispatch implementation to isolated child subagents with zero parent context per [references/isolation.md](references/isolation.md). Under Tier 2 environments, start a fresh session for each ticket per [references/tickets.md](references/tickets.md). Self-contained tickets prevent context contamination and authoring bias.
- **Validate and Review**: Enforce the [Universal Task Isolation Protocol](references/isolation.md). In-context persona simulation within an authoring session is strictly prohibited. Spawn isolated child agents autonomously under Tier 1 when subagent tools exist. Apply the `ready-for-agent` status label and pause execution for Tier 2 manual fallback when subagent tools are absent. An isolated validator or reviewer may remediate minor findings directly via the fast-path. Route major findings back to a fresh rework session via `ship-it:changes-requested`.
- **Conductor Context Orchestration**: Keep parent conductor context clean and unbiased. The conductor operates as a lightweight orchestrator without absorbing raw code diffs, bulky transcripts, or implementation rationale.
- **Context Size**: Wrap up and hand off work if context grows large before a phase ends. Do not continue with degraded reasoning.

## Reference Index

| File | Read it when |
| :--- | :--- |
| [references/writing.md](references/writing.md) | Authoring or auditing text against clarity, brevity, and formatting rules |
| [references/preflight.md](references/preflight.md) | A `gh` command fails, or the user requests repository preflight |
| [references/isolation.md](references/isolation.md) | Executing implementation, validation, or review via Tier 1 subagents or Tier 2 manual fallback |
| [references/plan.md](references/plan.md) | The effort is too large or unclear for a single session |
| [references/spec.md](references/spec.md) | Turning settled requirements into a feature specification |
| [references/validate.md](references/validate.md) | Adversarially auditing a published spec, ticket set, or map |
| [references/tickets.md](references/tickets.md) | Splitting a specification into buildable, vertical tickets |
| [references/implement.md](references/implement.md) | Building a ticket or small spec using domain-aligned verification |
| [references/review.md](references/review.md) | Evaluating a diff against coding standards and specification requirements |
