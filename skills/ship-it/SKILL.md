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

## Invocation & Harness Configuration

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

This skill executes exactly one phase per invocation.
It identifies the current status of the feature, completes that phase, and reports the next command.
Run the skill again to continue.

## Preflight, Only When Needed

`ship-it` assumes a configured repository: `gh` installed and authenticated, a `github.com` remote, Issues enabled with write access, and required labels present.
Consult [references/preflight.md](references/preflight.md) for setup requirements.
Standard runs skip preflight checks and proceed directly to [Every run](#every-run).

Execute the checklist in [references/preflight.md](references/preflight.md) only when:

- The user explicitly requests preflight (e.g. `ship-it preflight` or `/ship-it preflight`).
- A `gh` command fails with an environmental error (such as auth failure, rate limits, 403/500 errors, or missing labels).

## Every run

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
   Locate the earliest unblocked, unclaimed ticket using the [Orient Discovery Algorithm](#orient-discovery-algorithm).
4. **Implementation in progress or unreviewed diff**:
   Check for an assigned ticket from step 3, a matching branch, or an open PR referencing the slug.
   (Consult [references/implement.md](references/implement.md) and [references/review.md](references/review.md).)

#### Orient Discovery Algorithm

Select the earliest unblocked, unclaimed ticket:

1. Filter out claimed tickets (`assignees` non-empty) and closed tickets (`state: "CLOSED"`).
2. For open, unclaimed tickets, inspect the `## Blocked by` tasklist in each issue body via `gh issue view <number> --json body`. Check native dependency links per the [Markdown Relationship Contract](references/tickets.md#markdown-relationship-contract).
3. Check blocker issue status via `gh issue view <blocker-id> --json state`.
4. A ticket is **unblocked** if it lists no blockers (or "None"), or if every blocker in its `## Blocked by` list has `state: "CLOSED"`.
5. Select the earliest unblocked, unclaimed ticket in sequence.

Read labels directly from the initial query output:

- `ship-it:validated` on a map, spec, or ticket set confirms it passed the adversarial audit in [references/validate.md](references/validate.md).
- `ship-it:reviewed` on a ticket confirms its diff passed independent review in [references/review.md](references/review.md).
- `ship-it:changes-requested` on a map, spec, or ticket confirms unresolved validation blockers or review findings requiring rework.
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
| Spec exists, lacks `ship-it:validated` and `ship-it:changes-requested`, and build spans multiple sessions | Read [references/validate.md](references/validate.md) and audit the spec before splitting tickets. Skip audit only for trivial specs. |
| Spec exists, no tickets exist, and build requires multiple sessions | Read [references/tickets.md](references/tickets.md) and break the spec into vertical tickets. |
| Spec exists and entire build fits in one session | Read [references/implement.md](references/implement.md) and build directly against the spec. |
| Ticket carries `ship-it:changes-requested` (no branch/PR exists) | Read [references/tickets.md](references/tickets.md) and remediate reported ticket breakdown blockers. Resolve findings, update tickets, post a comment, and remove the label. |
| Tickets exist, lack `ship-it:validated` and `ship-it:changes-requested`, and have not started | Read [references/validate.md](references/validate.md) and audit the ticket set. Skip audit only for small, trivial ticket sets. |
| Ticket carries `ship-it:changes-requested` (branch/PR exists) | Read [references/implement.md](references/implement.md). Claim the ticket, execute the rework workflow, commit fixes, post a comment, and remove the label. |
| Tickets exist, lack `ship-it:changes-requested`, and at least one is unblocked and unclaimed | Read [references/implement.md](references/implement.md). Claim and build that ticket in a fresh session per [Context hygiene](#context-hygiene). |
| Ticket is implemented (assigned, open), lacks `ship-it:changes-requested`, and lacks `ship-it:reviewed` | Read [references/review.md](references/review.md) in a fresh session separate from the implementation session. |
| Ticket carries `ship-it:reviewed` | Post resolution comment, close the ticket, and commit reviewed changes. If final ticket, execute [Feature Close-Out Protocol](#feature-close-out-protocol). |
| Review found minor issues (fast-path) | Resolve in-place, re-verify tests, apply `ship-it:reviewed`, and proceed to close-out. |
| Review found major issues | Apply `ship-it:changes-requested`, remove the assignee, and route back to [references/implement.md](references/implement.md) in a fresh session. |
| Single-session spec carries `ship-it:reviewed` with open PR | Report that the specification awaits pull request merge and stop. |
| Single-session spec carries `ship-it:reviewed` without open PR | Instruct opening a pull request referencing `Closes #<spec-id>` and stop. |
| All tickets are closed, spec is open, and open PR exists | Report that all tickets are closed and the feature awaits pull request merge. |
| All tickets are closed, spec is open, and no PR exists | Instruct opening a pull request referencing `Closes #<spec-id>` and stop. |
| All tickets and specifications are closed | Report that the feature is complete and stop. |
| Tickets exist but none are unblocked and unclaimed | Report status for blocked or in-flight tickets and stop. |

### 3. Report and Stop

Conclude each run with a concise summary:

1. State the completed phase.
2. Summarize the actions taken.
3. State the exact command to run next.

Do not chain into the next phase in the same response unless the user explicitly requests the entire loop at once.

### Feature Close-Out Protocol

When the final ticket of a spec is reviewed and closed:

1. Post a completion comment on the parent specification documenting ticket completion (`gh issue comment <spec-id> --body "<text>"`). Prohibit manual issue closure on the parent specification.
2. Open or update the pull request referencing `Closes #<spec-id>` in the description. Merging the pull request automatically closes the parent specification.

## Context Hygiene

- **Plan → Spec → Tickets**: Maintain one continuous conversation when possible. Shared context helps compound design thinking.
- **Implement**: Start a fresh session for each ticket. Tickets are self-contained by design (see [references/tickets.md](references/tickets.md)). Fresh sessions prevent context contamination and authoring bias.
- **Validate and Review**: Enforce the [2-Tier Context Isolation Protocol](references/validate.md#2-tier-context-isolation-protocol). In-context persona simulation within an authoring session is strictly prohibited. An isolated validator or reviewer may remediate minor findings (typos, linter nits, trivial 1–2 line fixes) directly via the fast-path. For major findings, apply `ship-it:changes-requested` and route back to a fresh rework session.
- **Context Size**: Wrap up and hand off work if context grows large before a phase ends. Do not continue with degraded reasoning.

## Reference Index

| File | Read it when |
| :--- | :--- |
| [references/writing.md](references/writing.md) | Authoring or auditing text against clarity, brevity, and formatting rules |
| [references/preflight.md](references/preflight.md) | A `gh` command fails, or the user requests repository preflight |
| [references/plan.md](references/plan.md) | The effort is too large or unclear for a single session |
| [references/spec.md](references/spec.md) | Turning settled requirements into a feature specification |
| [references/validate.md](references/validate.md) | Adversarially auditing a published spec, ticket set, or map |
| [references/tickets.md](references/tickets.md) | Splitting a specification into buildable, vertical tickets |
| [references/implement.md](references/implement.md) | Building a ticket or small spec using domain-aligned verification |
| [references/review.md](references/review.md) | Evaluating a diff against coding standards and specification requirements |
