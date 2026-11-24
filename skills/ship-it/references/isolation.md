# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates without absorbing raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: An execution-capable subagent dispatch tool with shell execution and file-writing capabilities exists. Disable context inheritance when configurable. Select an execution-capable subagent rather than a read-only exploration subagent so the subagent can run `gh` and `git` commands.
- **Tier 2**: No execution-capable subagent dispatch tool exists, or the harness supports only full-context session forking.

In Tier 1, launch a fresh, unforked subagent without inherited conversation history for every verification pass (`validate`, `review`, `final-review`) and every non-verification role.
Across both tiers, use GitHub issues, comments, labels, and branch commits as the sole state across passes instead of tracking subagent handles, resume prompts, or in-memory conductor state.

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

## Tier 1: dispatch packet

Pass only these fields to the subagent:

- **Role**: One of the subagent roles above.
- **Target**: `spec` | `ticket-set`, for `validate`; `ticket`, for `review`; `final`, for `final-review`.
- **Complexity**: `low` | `medium` | `high`.
- **Reference**: The assigned reference file(s) to follow, plus [writing.md](writing.md). Load only the assigned reference file(s) and `writing.md`; treat links to other reference files as citations rather than files to load. When an assignment names a section anchor, follow only that section of the file.
- **Issues**: The target issue number and the parent spec or map number.
- **Slug**: The feature slug.
- **Default branch**: The default branch name (such as `main`), read once via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
- **Branch**: The feature branch, for `prepare-bug`, `validate`, `implement`, `rework`, `review`, `final-review`, and `close-out`.
- **Delta audit**: The [Delta-audit directive](#delta-audit-directive) block, copied verbatim, when `SKILL.md` § 3 `Count check` finds at least one prior non-approved report matching the active `Report heading` in the current cycle (because subagents never load `isolation.md`). Omit `- **Delta audit**:` on pass 1 and on non-verification roles.
- **Return block**: The [Return schema](#return-schema) block, copied verbatim, because subagents never load `isolation.md`.

Launch a fresh, unforked subagent for every verification pass (`validate`, `review`, `final-review`) and every non-verification role.
Use GitHub issues, comments, labels, and branch commits as the sole state across passes instead of subagent handles, resume prompts, or in-memory conductor state.
Never pass conversation history, summaries of user intent, or opinions.

Forbid subagents from loading `SKILL.md` in the skill directory, running routing queries, or spawning subagents.
Each subagent executes one bounded leaf action and returns control to the conductor's routing loop.

Every requirement a subagent needs lives in the issues.
A subagent that finds a requirement missing returns the missing requirement as a question, with one scoped exception for `slice`.
`slice` may auto-resolve reversible slice-local defaults into ticket bodies and `## Auto-resolved Decisions` on `<spec>`, escalating only scope, observable product behavior, or irreversible architecture choices as `Questions`.

### Role complexity matrix

Assign subagent complexity from the lifecycle role or the target ticket's `## Complexity` section (`gh issue view <n> --json body --jq .body`). Fall back to the Default Complexity column, or to `high` when an inherited `## Complexity` section is missing:

| Role | Lifecycle Phase | Complexity Source | Default Complexity |
| :--- | :--- | :--- | :--- |
| **`decide`** | Plan | Fixed Default | `low` for research, `medium` for prototypes and tasks |
| **`slice`** | Tickets | Fixed Default | `high` |
| **`prepare-bug`** | Tickets | Fixed Default | `medium` |
| **`validate`** | Spec / Tickets | Target | `medium` for `Target: spec`, `high` for `Target: ticket-set` |
| **`implement`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`rework`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`review`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`final-review`** | Review | Fixed Default | `high` |
| **`close-out`** | Close-out | Fixed Default | `low` |

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
1. Read prior reports from the active cycle and all control comments (`## Answers`, `## Auto-resolved Decisions`, and `## Circuit Breaker Reset`) from GitHub.
2. Verify clearance of every prior Blocker and Question.
3. Restrict new Blockers and `Clarifying Questions` to uncleared prior findings, defects introduced in text or diffs modified since the prior pass, sections rewritten under a broad `## Circuit Breaker Reset`, or concrete factual contradictions against active code or source requirements.
4. Keep prior Warnings and belated non-regression notes on unchanged surface non-blocking by recording those findings as advisory Warnings in validation gates, or by classifying those findings as Nits or omitting those notes in review gates. Suppress verbatim repeated Warnings.
5. Honor all prior settled decisions. Count active Blockers that reintroduce cleared Blockers from the active cycle as `**Reintroduced**: <M>`, starting after the latest `## Circuit Breaker Reset` or intervening `**Verdict**: Approved` or `**Verdict**: Validated` report matching the active `Report heading` (whichever is more recent).
```

## Return schema

Every subagent returns exactly this block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report, or None>
```

Slicing subagents populate `Issues: #<n>, ...` with all created ticket numbers.
When `slice` posts `## Auto-resolved Decisions` on `<spec>`, `slice` returns that comment URL in `Evidence:` (and `Evidence: None` otherwise).
Other actions that post no report comment return `Evidence: None`.
The conductor reads only this block.

## Tier 2

Run every action in the current session, with one exception.
A session may validate or review only as the session's first action.
When the next routing row is validation or review after any other action, halt and print `ship-it <slug>` for a fresh session.

Apply [Delta-audit directive](#delta-audit-directive) directly whenever a first-action verification run executes at pass 2 or later in the current cycle (when `SKILL.md` § 3 `Count check` finds at least one prior non-approved report matching the active `Report heading`).
Use GitHub issues, comments, labels, and branch commits as the sole state across fresh-session halts instead of session handles or in-memory state.
