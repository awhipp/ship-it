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

This skill supports two execution modes: **autonomous loop mode** and **step-by-step mode**.
In autonomous loop mode, the conductor orchestrates child subagents across implementation, review, and frontier progression until completing the specification.
In step-by-step mode, the conductor executes one phase per invocation, completes that phase, and reports the next command or prompts for confirmation.

## Preflight, Only When Needed

`ship-it` assumes a configured repository: `gh` installed and authenticated, a `github.com` remote, Issues enabled with write access, and required labels present.
Consult [references/preflight.md](references/preflight.md) for setup requirements.
Standard runs skip preflight checks and proceed directly to [Every run](#every-run).

Execute the checklist in [references/preflight.md](references/preflight.md) only when:

- The user explicitly requests preflight (e.g. `ship-it preflight` or `/ship-it preflight`).
- A `gh` command fails with an environmental error (such as auth failure, rate limits, 403/500 errors, or missing labels).

## Every run

### Execution Mode Selection

Inspect the runtime harness dynamically for interactive prompt tools before prompting developers.
Check for interactive primitives such as `ask_question`, `prompt`, or equivalent tools.

When interactive prompt tools exist:

- Prompt the developer to select the execution mode:
  - **Autonomous loop mode**: Orchestrate isolated child subagents across implementation, review, and frontier progression until completing the specification.
  - **Step-by-step mode**: Execute one phase at a time and request interactive confirmation before executing downstream work.
- When running in step-by-step mode, present interactive confirmation prompts before executing downstream work.

When interactive prompt tools are absent:

- Default conductor execution to step-by-step mode.

### 1. Orient: Which Feature, Which Phase

Determine the feature **slug** first.
The slug is a short, consistent identifier included in every issue title for the feature (e.g. `auth-rewrite`, yielding titles like `[auth-rewrite] Spec: ...`).
If the conversation does not specify the feature, ask the user for the slug directly.

Once you have the slug, query GitHub issues in this order and select the state furthest along:

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
   If this is the final ticket for the spec, execute the [Feature Close-Out Protocol](#feature-close-out-protocol).
   - In autonomous loop mode, execute autonomous frontier progression: locate the next unstarted ticket via the [Orient Discovery Algorithm](#orient-discovery-algorithm) and continue the build loop.
   - In step-by-step mode, report the closed ticket and stop, or prompt for confirmation before starting the next ticket.
2. **In-Progress**:
   The frontier ticket has an assignee, an active feature branch, or an unreviewed diff.
   If the ticket carries `ship-it:changes-requested`:
   - Under Tier 1 environments, dispatch an isolated remediation subagent per the [Autonomous Rework Protocol](references/isolation.md#autonomous-rework-protocol-tier-1). The conductor permits at most two remediation retries upon review rejection. If review rejection persists after two attempts, alert the developer and halt execution.
   - Under Tier 2 environments, execute manual fallback per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2). Claim the ticket and execute rework in a fresh manual session per [references/implement.md](references/implement.md#rework-workflow).
   If the ticket lacks `ship-it:changes-requested` and `ship-it:reviewed`:
   - Under Tier 1 environments, dispatch an isolated review subagent per the [Autonomous Verification Protocol](references/isolation.md#autonomous-verification-protocol-tier-1).
   - Under Tier 2 environments, preserve manual fallback: apply the `ready-for-agent` status label (`gh issue edit <number> --add-label "ready-for-agent"`), output the command for a fresh review session, and stop execution per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2).
3. **Unstarted**:
   The frontier ticket is unassigned and unblocked.
   Claim the ticket (`gh issue edit <number> --add-assignee "@me" --remove-label "ready-for-agent"`).
   - Under Tier 1 environments:
     Dispatch an isolated implementation subagent per the [Autonomous Implementation Protocol](references/isolation.md#autonomous-implementation-protocol-tier-1).
     - In autonomous loop mode, execute continuous phase chaining: ingest the implementation verdict summary, confirm commit generation, and dispatch an isolated review subagent per the [Autonomous Verification Protocol](references/isolation.md#autonomous-verification-protocol-tier-1). Route directly to State 1 (Reviewed) when review approves the diff to close the ticket and advance the frontier autonomously.
     - In step-by-step mode, present interactive confirmation prompts before dispatching the review subagent or advancing to downstream work.
   - Under Tier 2 environments:
     Preserve manual fallback per [references/isolation.md](references/isolation.md#manual-fallback-protocol-tier-2).
     Build the ticket in a fresh session per [references/implement.md](references/implement.md).
     Apply the `ready-for-agent` status label (`gh issue edit <number> --add-label "ready-for-agent"`), output the command for a fresh review session, and stop.
   If the frontier ticket is blocked by dependencies, report blocker status and stop.

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

**Orient Error Recovery**: If a `gh` query fails during Orient, do not assume artifacts are missing.
Transient errors include rate limits, 403/500 errors, or network drops.
Do not restart the feature.
Treat the failure as an environmental error and route to [references/preflight.md](references/preflight.md) to diagnose and resolve the issue before re-running Orient.

### 2. Route to the One Next Step

| Current State | Next Step |
| :--- | :--- |
| Nothing exists; feature is well-scoped for one session | Read [references/spec.md](references/spec.md) and write the spec directly. Omit the map. |
| Nothing exists; effort is too large or foggy for one session | Read [references/plan.md](references/plan.md) and chart the map. Use the criteria in `plan.md` to assess scope. |
| Map carries `ship-it:changes-requested` | Read [references/plan.md](references/plan.md) and remediate reported map blockers. Resolve findings, update the map, post a comment, and remove the label. |
| A map exists, lacks `ship-it:changes-requested`, and remains unresolved | Read [references/plan.md](references/plan.md) and resolve the next decision on the map. Resolve one ticket per session. |
| Map is resolved (or planning skipped) and no spec exists | Read [references/spec.md](references/spec.md) and draft the feature specification. |
| Spec carries `ship-it:changes-requested` | Read [references/spec.md](references/spec.md) and remediate reported spec blockers. Resolve findings, update the spec, post a comment, and remove the label. |
| Spec exists, lacks `ship-it:validated` and `ship-it:changes-requested`, and build spans multiple sessions | Audit the spec per [references/validate.md](references/validate.md) using the [2-Tier Context Isolation Protocol](references/isolation.md). Skip audit only for trivial specs. |
| Spec exists, no tickets exist, and build requires multiple sessions | Read [references/tickets.md](references/tickets.md) and break the spec into vertical tickets. |
| Spec exists and entire build fits in one session | Read [references/implement.md](references/implement.md) and build directly against the spec. |
| Ticket breakdown carries `ship-it:changes-requested` (no branch/PR exists) | Read [references/tickets.md](references/tickets.md) and remediate reported ticket breakdown blockers. Resolve findings, update tickets, post a comment, and remove the label. |
| Tickets exist, lack `ship-it:validated` and `ship-it:changes-requested`, and have not started | Audit the ticket set per [references/validate.md](references/validate.md) using the [2-Tier Context Isolation Protocol](references/isolation.md). Skip audit only for small, trivial ticket sets. |
| Frontier ticket carries `ship-it:changes-requested` (branch/PR exists) | Under Tier 1, dispatch remediation subagent up to two retries per [references/isolation.md](references/isolation.md). Under Tier 2, execute rework workflow in fresh session per [references/implement.md](references/implement.md). |
| Frontier ticket is Unstarted (unclaimed and unblocked) | Under Tier 1, dispatch implementation subagent per [references/isolation.md](references/isolation.md) and chain to review in autonomous loop mode. Under Tier 2, claim and build in fresh session per [references/implement.md](references/implement.md). |
| Frontier ticket is Unstarted but blocked by dependencies | Report blocker status for the frontier ticket and stop. |
| Frontier ticket is In-Progress (assigned, open), lacks `ship-it:changes-requested`, and lacks `ship-it:reviewed` | Review the diff per [references/review.md](references/review.md) using the [2-Tier Context Isolation Protocol](references/isolation.md). |
| Frontier ticket carries `ready-for-agent` in fresh review session | Review the diff directly per [references/review.md](references/review.md). |
| Frontier ticket is Reviewed (carries `ship-it:reviewed`) | Post resolution comment, close the ticket, and commit reviewed changes. In autonomous loop mode, advance to next ticket. If final ticket, execute [Feature Close-Out Protocol](#feature-close-out-protocol). |
| Review or validation subagent detects minor issues (fast-path) | Resolve in-place, re-verify tests, apply appropriate status label, and proceed. |
| Validation subagent reports major issues (blockers) | Report findings summary to developer and route back to authoring phase in a fresh session. |
| Review subagent reports major issues | Under Tier 1 autonomous loop mode, dispatch remediation subagent up to two retries per [references/isolation.md](references/isolation.md). Under Tier 2, report findings to developer and route back to [references/implement.md](references/implement.md) in a fresh session. |
| Subagent tools absent in authoring session during implementation, validation, or review (Tier 2) | Apply `ready-for-agent` label, output the fresh session command, and pause execution per [Manual Fallback Protocol](references/isolation.md#manual-fallback-protocol-tier-2). |
| Single-session spec carries `ship-it:reviewed` with open PR | Report that the specification awaits pull request merge and stop. |
| Single-session spec carries `ship-it:reviewed` without open PR | Instruct opening a pull request referencing `Closes #<spec-id>` and stop. |
| All tickets are closed, spec is open, and open PR exists | Report that all tickets are closed and the feature awaits pull request merge. |
| All tickets are closed, spec is open, and no PR exists | Instruct opening a pull request referencing `Closes #<spec-id>` and stop. |
| All tickets and specifications are closed | Report that the feature is complete and stop. |

### 3. Report and Stop

Conclude each run with a clear report based on the execution mode:

- **Step-by-step mode**:
  1. State the completed phase.
  2. Summarize the actions taken.
  3. State the exact command to run next, or present an interactive confirmation prompt before proceeding to downstream work.
  Require developer confirmation before chaining into the next phase.

- **Autonomous loop mode**:
  Maintain continuous execution across implementation, review, and ticket progression.
  Conclude and report when completing the specification, encountering dependency blockers, or reaching bounded retry limits on review rejections.

### Feature Close-Out Protocol

When the final ticket of a spec is reviewed and closed:

1. Post a completion comment on the parent specification documenting ticket completion (`gh issue comment <spec-id> --body "<text>"`). Prohibit manual issue closure on the parent specification.
2. Open or update the pull request referencing `Closes #<spec-id>` in the description. Merging the pull request automatically closes the parent specification.

## Context Hygiene

- **Plan → Spec → Tickets**: Maintain one continuous conversation when possible. Shared context helps compound design thinking.
- **Implement**: Under Tier 1 environments, dispatch implementation to isolated child subagents with zero parent conversation context per [references/isolation.md](references/isolation.md). Under Tier 2 environments, start a fresh session for each ticket per [references/tickets.md](references/tickets.md). Self-contained tickets prevent context contamination and authoring bias.
- **Validate and Review**: Enforce the [2-Tier Context Isolation Protocol](references/isolation.md). In-context persona simulation within an authoring session is strictly prohibited. Spawn isolated child agents autonomously under Tier 1 when subagent tools exist. Apply the `ready-for-agent` status label and pause execution for Tier 2 manual fallback when subagent tools are absent. An isolated validator or reviewer may remediate minor findings directly via the fast-path. Route major findings back to a fresh rework session via `ship-it:changes-requested`.
- **Conductor Context Orchestration**: Keep parent conductor context clean and unbiased. The conductor orchestrates subagent lifecycle transitions, evaluates verdicts, and tracks frontier progression without absorbing raw code diffs or implementation rationale.
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
