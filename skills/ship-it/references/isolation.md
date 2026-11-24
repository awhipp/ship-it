# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates without absorbing raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: An execution-capable subagent tool (shell and file writes) exists. Disable context inheritance when configurable; pick a subagent that runs `gh` and `git`, not a read-only one.
- **Tier 2**: No execution-capable subagent tool exists, or the harness only forks sessions.

Both tiers keep GitHub issues, comments, labels, and branch commits as the sole state.

## Actions

| Action | Reference | Runs in |
| :--- | :--- | :--- |
| Chart map, resolve grilling ticket | [plan.md](plan.md) | Conductor (needs the user) |
| Draft spec, remediate spec | [plan.md](plan.md#spec) | Conductor (needs the user) |
| Remediate ticket set | [tickets.md#remediation](tickets.md#remediation) | Conductor (needs the user) |
| Resolve research, prototype, or task ticket | [plan.md#ticket-types](plan.md#ticket-types), [plan.md#subagent-execution](plan.md#subagent-execution) | Subagent: `decide` |
| Slice tickets | [tickets.md](tickets.md) | Subagent: `slice` |
| Prepare bug | [tickets.md](tickets.md#bug-preparation) | Subagent: `prepare-bug` |
| Implement ticket | [implement.md](implement.md#implement) | Subagent: `implement` |
| Rework ticket | [implement.md](implement.md#rework) | Subagent: `rework` |
| Validate spec or ticket set | [verify.md](verify.md#target-spec) (`Target: spec`), [verify.md](verify.md#target-ticket-set) with [granularity](tickets.md#granularity-thresholds), and [anti-patterns](tickets.md#slicing-anti-patterns) (`Target: ticket-set`) | Subagent: `validate` |
| Review ticket | [verify.md](verify.md#target-ticket), [verify.md](verify.md#shared-rules) (`Target: ticket`) | Subagent: `review` |
| Final review | [verify.md](verify.md#target-final), [verify.md](verify.md#shared-rules) (`Target: final`) | Subagent: `final-review` |
| Close out | [implement.md#initial-close-out](implement.md#initial-close-out) | Subagent: `close-out` |
| Sync pull request | [implement.md#pull-request-sync](implement.md#pull-request-sync) | Subagent: `close-out` |

## Context packets

A packet holds only:

- The artifact under work and its parent (table below).
- The Decision Register (`## Decision Register` on the spec, or `## Decisions so far` on the map for `decide`).
- Settled answers: `## Answers` on the target issue, and `## Auto-resolved Decisions` on the spec.
- The repository at the named ref.
- When triggered by [Delta-audit directive](#delta-audit-directive) (`Passes` >= 1, or `final-review` with an `OPEN` branch pull request), the directive and prior reports.

A packet never holds conversation history, conductor summaries of intent, prior-phase prose beyond named artifacts, or `## Ship-it State`.
A role reads nothing outside its packet.

| Role | Artifact under work | Parent |
| :--- | :--- | :--- |
| `decide` | Decision ticket | Map |
| `slice` | Tickets it creates | Spec |
| `prepare-bug` | Bug issue | Spec |
| `validate` | Spec, or open tickets | `## Source` request and map, or spec and completed closed tickets |
| `implement`, `rework` | Ticket (`rework`: plus latest `## Review:`) | Spec |
| `review` | Diff from the fixed point, plus `## Handoff` and `## Rework` | Ticket and spec |
| `final-review` | Branch diff from the merge-base | Spec and completed closed tickets |
| `close-out` | Feature branch (and `OPEN` pull request during sync) | Spec and closed tickets |

Roles return missing requirements as Questions, except `slice`, which auto-resolves reversible slice-local defaults (ticket bodies and `## Auto-resolved Decisions`) and escalates scope, observable behavior, or irreversible architecture.

## Tier 1: dispatch packet

Launch a fresh, unforked subagent per [Context packets](#context-packets), forbidding `SKILL.md`, routing queries, or subagents.
Pass only:

- **Role** and **Target** (`spec` | `ticket-set` for `validate`; `ticket` for `review`; `final` for `final-review`).
- **Reference**: Assigned reference file(s) and section anchors, plus [writing.md](writing.md). Treat links to other reference files as citations.
- **Issues**: Target issue number and parent spec or map number.
- **Slug** and **Default branch** (read once via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`).
- **Branch**: Every role except `decide` and `slice`.
- **Fixed point**: Ticket's starting commit from `## Ship-it State`, for `review` only.
- **Delta audit**: Copy [Delta-audit directive](#delta-audit-directive) verbatim when `Passes` >= 1 (resets included) or `final-review` runs with an `OPEN` branch pull request; omit otherwise.
- **Return block**: [Return schema](#return-schema) block, copied verbatim.

## Delta-audit directive

Copy verbatim into Tier 1 packets, or apply directly in Tier 2, when `Passes` >= 1 or `final-review` has an `OPEN` branch pull request:

```text
Delta-audit directive:
1. Read the prior reports for this gate and the control comments (`## Answers` and `## Auto-resolved Decisions`) from GitHub.
2. Verify clearance of every prior Blocker and Question.
3. Restrict new Blockers and `Clarifying Questions` to three classes: uncleared prior findings, defects in text or diffs modified since the prior pass, and factual regressions or contradictions against active code or source requirements.
4. Keep prior Warnings and belated non-regression notes on unchanged surface non-blocking by recording those findings as advisory Warnings in validation gates, or by classifying those findings as Nits or omitting those notes in review gates. Suppress verbatim repeated Warnings.
5. Honor all prior settled decisions.
```

## Return schema

Every subagent returns this exact block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report, or None>
```

`slice` lists created tickets in `Issues:` and returns its `## Auto-resolved Decisions` comment URL in `Evidence:` when posted.
Actions posting no report return `Evidence: None`.
The conductor reads only this block.

## Tier 2

Run actions in the current session, except validation or review may run only as the session's first action.
When the next routing row is validation or review after another action, halt and print `ship-it <slug>` for a fresh session.

Apply [Delta-audit directive](#delta-audit-directive) directly on first-action verification when `Passes` >= 1 in `## Ship-it State` or `final-review` runs with an `OPEN` branch pull request; omit otherwise, and read `review`'s fixed point from `## Ship-it State`.
