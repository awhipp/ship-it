# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates; it never absorbs raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: A subagent dispatch tool exists (such as `invoke_subagent`, `Task`, or `Agent`).
- **Tier 2**: No subagent dispatch tool exists.

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
- **Reference**: The file and section to follow, plus [writing.md](writing.md).
- **Issues**: The target issue number and the parent spec or map number.
- **Branch**: The feature branch, for `implement`, `rework`, `review`, `final-review`, and `close-out`.

Never pass conversation history, summaries of user intent, or opinions.
Every requirement a subagent needs lives in the issues.
A subagent that finds a requirement missing returns it as a question.

## Return schema

Every subagent returns exactly this block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report>
```

The conductor reads only this block.

## Tier 2

Run every action in the current session, with one exception.
A session may validate or review only when that is its first action.
When the next routing row is validation or review after any other action, halt and print `ship-it <slug>` for a fresh session.
