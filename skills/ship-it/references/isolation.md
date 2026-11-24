# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates without absorbing raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: An execution-capable subagent dispatch tool with shell execution and file-writing capabilities exists. Disable context inheritance when configurable, and select a subagent that can run `gh` and `git` rather than a read-only one.
- **Tier 2**: No execution-capable subagent dispatch tool exists, or the harness supports only full-context session forking.

Across both tiers, GitHub issues, comments, labels, and branch commits are the sole state across passes and halts.

## Actions

| Action | Reference | Runs in |
| :--- | :--- | :--- |
| Chart map, resolve grilling ticket | [plan.md](plan.md) | Conductor (needs the user) |
| Draft spec, remediate spec | [plan.md](plan.md#spec) | Conductor (needs the user) |
| Remediate ticket set | [tickets.md#remediation](tickets.md#remediation) | Conductor (needs the user) |
| Resolve research, prototype, or task ticket | [plan.md#ticket-types](plan.md#ticket-types), [plan.md#subagent-execution](plan.md#subagent-execution) | Subagent: `decide` |
| Slice tickets | [tickets.md](tickets.md) | Subagent: `slice` |
| Prepare bug | [tickets.md](tickets.md#bug-preparation), [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) | Subagent: `prepare-bug` |
| Implement ticket | [implement.md](implement.md#implement) | Subagent: `implement` |
| Rework ticket | [implement.md](implement.md#rework) | Subagent: `rework` |
| Validate spec or ticket set | [verify.md](verify.md#target-spec) (`Target: spec`), [verify.md](verify.md#target-ticket-set) with [tickets.md#granularity-thresholds](tickets.md#granularity-thresholds), [tickets.md#slicing-anti-patterns](tickets.md#slicing-anti-patterns), and [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) (`Target: ticket-set`) | Subagent: `validate` |
| Review ticket | [verify.md](verify.md#target-ticket), [verify.md](verify.md#shared-rules) (`Target: ticket`) | Subagent: `review` |
| Final review | [verify.md](verify.md#target-final), [verify.md](verify.md#shared-rules) (`Target: final`), [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) | Subagent: `final-review` |
| Close out | [implement.md#initial-close-out](implement.md#initial-close-out) | Subagent: `close-out` |

## Context packets

A packet holds only these items:

- The artifact under work and its parent (table below).
- The Decision Register: the spec's `## Decision Register`, or the map's `## Decisions so far` for `decide`.
- Settled answers: `## Answers` on the issue the conductor posted them to, and `## Auto-resolved Decisions` on the spec.
- The repository at the named ref.
- On pass 2+, the delta-audit directive and the gate's prior reports.

A packet never holds conversation history, conductor summaries of intent, prior-phase prose beyond the named artifacts, or the `## Ship-it State` comment.
A role reads nothing outside its packet.

| Role | Artifact under work | Parent | Complexity |
| :--- | :--- | :--- | :--- |
| `decide` | Decision ticket | Map | `low` for research, `medium` for prototypes and tasks |
| `slice` | Tickets it creates | Spec | `high` |
| `prepare-bug` | Bug issue | Spec | `medium` |
| `validate` | Spec, or open tickets | `## Source` request and map, or spec and completed closed tickets | `medium` for `spec`, `high` for `ticket-set` |
| `implement`, `rework` | Ticket (`rework`: plus latest `## Review:`) | Spec | Ticket `## Complexity`, else `high` |
| `review` | Diff from the fixed point, plus `## Handoff` and `## Rework` | Ticket and spec | Ticket `## Complexity`, else `high` |
| `final-review` | Branch diff from the merge-base | Spec and completed closed tickets | `high` |
| `close-out` | Feature branch | Spec and closed tickets | `low` |

A role that finds a requirement missing returns it as a Question, except `slice`, which may auto-resolve reversible slice-local defaults into ticket bodies and `## Auto-resolved Decisions` on the spec, escalating only scope, observable product behavior, or irreversible architecture choices.

## Tier 1: dispatch packet

Launch a fresh, unforked subagent per [Context packets](#context-packets) for every action, and forbid it from loading `SKILL.md`, running routing queries, or spawning subagents.
Pass only these fields:

- **Role**, **Complexity**, and **Target** (`spec` | `ticket-set` for `validate`; `ticket` for `review`; `final` for `final-review`).
- **Reference**: The assigned reference file(s) and section anchors, plus [writing.md](writing.md). Treat links to other reference files as citations.
- **Issues**: The target issue number and the parent spec or map number.
- **Slug** and **Default branch** (read once via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`).
- **Branch**: For every role except `decide` and `slice`.
- **Fixed point**: The ticket's starting commit from the `## Ship-it State` comment, for `review` only.
- **Delta audit**: The [Delta-audit directive](#delta-audit-directive) block, copied verbatim, when the gate's `Passes` is at least 1 (a pass after a reset included). Omit it on pass 1 and on non-verification roles.
- **Return block**: The [Return schema](#return-schema) block, copied verbatim.

### Complexity directives

Include the matching directive in the subagent dispatch prompt:

- **`low`**: `Complexity: low. Expect a localized change. Check each requirement in the assigned issues.`
- **`medium`**: `Complexity: medium. Check each requirement and edge case the assigned issues name.`
- **`high`**: `Complexity: high. Check each requirement, edge case, and invariant against active code, including callers outside the named touchpoints.`

When the dispatch tool accepts a reasoning-effort setting, set the setting to the same level.

## Delta-audit directive

Copy the directive block below verbatim into pass-2+ verification packets in Tier 1, or apply the directive directly on pass-2+ verification runs in Tier 2:

```text
Delta-audit directive (pass 2+):
1. Read the prior reports for this gate and the control comments (`## Answers` and `## Auto-resolved Decisions`) from GitHub.
2. Verify clearance of every prior Blocker and Question.
3. Restrict new Blockers and `Clarifying Questions` to three classes: uncleared prior findings, defects in text or diffs modified since the prior pass, and factual regressions or contradictions against active code or source requirements.
4. Keep prior Warnings and belated non-regression notes on unchanged surface non-blocking by recording those findings as advisory Warnings in validation gates, or by classifying those findings as Nits or omitting those notes in review gates. Suppress verbatim repeated Warnings.
5. Honor all prior settled decisions.
```

## Return schema

Every subagent returns exactly this block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report, or None>
```

`slice` lists all created tickets in `Issues:` and returns its `## Auto-resolved Decisions` comment URL in `Evidence:` when posted.
Actions that post no report comment return `Evidence: None`.
The conductor reads only this block.

## Tier 2

Run every action in the current session, with one exception.
A session may validate or review only as the session's first action.
When the next routing row is validation or review after any other action, halt and print `ship-it <slug>` for a fresh session.

Apply [Delta-audit directive](#delta-audit-directive) directly whenever a first-action verification run executes at pass 2 or later (the gate's `Passes` in the `## Ship-it State` comment is at least 1), and read the `review` fixed point from that comment.
