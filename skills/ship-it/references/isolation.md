# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates without absorbing raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: A subagent dispatch tool with shell execution and file-writing capabilities exists. Select an execution-capable subagent rather than a read-only exploration subagent so the subagent can run `gh` and `git` commands.
- **Tier 2**: No execution-capable subagent dispatch tool exists.

## Actions

| Action | Reference | Runs in |
| :--- | :--- | :--- |
| Chart map, resolve grilling ticket | [plan.md](plan.md) | Conductor (needs the user) |
| Draft spec, remediate spec | [spec.md](spec.md) | Conductor (needs the user) |
| Remediate ticket set | [tickets.md](tickets.md#remediation) | Conductor (needs the user) |
| Resolve research, prototype, or task ticket | [plan.md](plan.md#ticket-types) | Subagent: `decide` |
| Slice tickets | [tickets.md](tickets.md) | Subagent: `slice` |
| Implement ticket | [implement.md](implement.md) | Subagent: `implement` |
| Rework ticket | [implement.md](implement.md#rework) | Subagent: `rework` |
| Validate spec or ticket set | [validate.md](validate.md) | Subagent: `validate` |
| Review ticket | [review.md](review.md) | Subagent: `review` |
| Final review | [review.md](review.md#final-review) | Subagent: `final-review` |
| Close out | [implement.md](implement.md#close-out) | Subagent: `close-out` |

## Tier 1: dispatch packet

Pass only these fields to the subagent:

- **Role**: One of the subagent roles above.
- **Complexity**: `low` | `medium` | `high`.
- **Reference**: The file and section to follow, plus [writing.md](writing.md). Load only the assigned reference file and `writing.md`; treat links to other reference files as citations rather than files to load.
- **Issues**: The target issue number and the parent spec or map number.
- **Branch**: The feature branch, for `implement`, `rework`, `review`, `final-review`, and `close-out`.

Never pass conversation history, summaries of user intent, or opinions.
Every requirement a subagent needs lives in the issues.
A subagent that finds a requirement missing returns the missing requirement as a question.

### Role complexity matrix

Assign subagent complexity from the lifecycle role or the target ticket's `## Complexity` section, falling back to `high` when a ticket omits complexity:

| Role | Lifecycle Phase | Complexity Source | Default Complexity |
| :--- | :--- | :--- | :--- |
| **`decide`** | Plan | Ticket or Default | `low` for research, `medium` for prototypes and tasks |
| **`slice`** | Tickets | Fixed Default | `high` |
| **`validate`** | Spec / Tickets | Fixed Default | `high` |
| **`implement`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`rework`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`review`** | Implementation | Target Ticket | Inherited from `## Complexity` |
| **`final-review`** | Review | Fixed Default | `high` |
| **`close-out`** | Close-out | Fixed Default | `low` |

### Complexity directives

Include the matching directive in the subagent dispatch prompt:

- **`low`**: `Complexity: low. Expect a localized change. Check each requirement in the assigned issues.`
- **`medium`**: `Complexity: medium. Check each requirement and edge case the assign issues name.`
- **`high`**: `Complexity: high. Check each requirement, edge case, and invariant against active code, including callers outside the named touchpoints.`

When the dispatch tool accepts a reasoning-effort setting, set the setting to the same level.

## Return schema

Every subagent returns exactly this block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report, or None>
```

Actions that post no report comment return `Evidence: None`.
The conductor reads only this block.

## Tier 2

Run every action in the current session, with one exception.
A session may validate or review only as the session's first action.
When the next routing row is validation or review after any other action, halt and print `ship-it <slug>` for a fresh session.
