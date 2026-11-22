# Isolation: who runs each action

Isolation keeps authoring bias out of verification and keeps the conductor's context small.
The conductor orchestrates without absorbing raw diffs, transcripts, or implementation rationale.

## Pick the tier

- **Tier 1**: An execution-capable subagent dispatch tool with shell execution and file-writing capabilities exists. Launch subagents with fresh, unforked context without inherited conversation history. Disable context inheritance when configurable. Select an execution-capable subagent rather than a read-only exploration subagent so the subagent can run `gh` and `git` commands.
- **Tier 2**: No execution-capable subagent dispatch tool exists, or the harness supports only full-context session forking.

## Actions

| Action | Reference | Runs in |
| :--- | :--- | :--- |
| Chart map, resolve grilling ticket | [plan.md](plan.md) | Conductor (needs the user) |
| Draft spec, remediate spec | [spec.md](spec.md) | Conductor (needs the user) |
| Remediate ticket set | [tickets.md#remediation](tickets.md#remediation) | Conductor (needs the user) |
| Resolve research, prototype, or task ticket | [plan.md#ticket-types](plan.md#ticket-types), [plan.md#subagent-execution](plan.md#subagent-execution) | Subagent: `decide` |
| Slice tickets | [tickets.md](tickets.md) | Subagent: `slice` |
| Prepare bug | [bug-prep.md](bug-prep.md), [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) | Subagent: `prepare-bug` |
| Implement ticket | [implement.md](implement.md) | Subagent: `implement` |
| Rework ticket | [rework.md](rework.md) | Subagent: `rework` |
| Validate spec or ticket set | [validate-spec.md](validate-spec.md) (`Target: spec`), [validate-tickets.md](validate-tickets.md) with [tickets.md#granularity-thresholds](tickets.md#granularity-thresholds), [tickets.md#slicing-anti-patterns](tickets.md#slicing-anti-patterns), and [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) (`Target: ticket-set`) | Subagent: `validate` |
| Review ticket | [review-ticket.md](review-ticket.md), [review-core.md](review-core.md) | Subagent: `review` |
| Final review | [review-final.md](review-final.md), [review-core.md](review-core.md), [tickets.md#complexity-taxonomy](tickets.md#complexity-taxonomy) | Subagent: `final-review` |
| Close out | [close-out.md#initial-close-out](close-out.md#initial-close-out) (`Mode: initial`), [close-out.md#synchronization](close-out.md#synchronization) (`Mode: sync`) | Subagent: `close-out` |

## Tier 1: dispatch packet

Pass only these fields to the subagent:

- **Role**: One of the subagent roles above.
- **Target**: `spec` | `ticket-set`, for `validate`.
- **Mode**: `initial` | `sync`, for `close-out`.
- **Complexity**: `low` | `medium` | `high`.
- **Reference**: The assigned reference file(s) to follow, plus [writing.md](writing.md). Load only the assigned reference file(s) and `writing.md`; treat links to other reference files as citations rather than files to load.
- **Issues**: The target issue number and the parent spec or map number.
- **Slug**: The feature slug.
- **Default branch**: The default branch name (such as `main`), read once via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`.
- **Branch**: The feature branch, for `prepare-bug`, `validate`, `implement`, `rework`, `review`, `final-review`, and `close-out`.
- **Return block**: The [Return schema](#return-schema) block, copied verbatim, because subagents never load `isolation.md`.

Never pass conversation history, summaries of user intent, or opinions.
Forbid subagents from loading `SKILL.md` in the skill directory, running routing queries, or spawning subagents. Each subagent executes one bounded leaf action and returns control to the conductor's routing loop.
Every requirement a subagent needs lives in the issues.
A subagent that finds a requirement missing returns the missing requirement as a question.

### Role complexity matrix

Assign subagent complexity from the lifecycle role or the target ticket's `## Complexity` section. Fall back to the Default Complexity column, or to `high` when an inherited `## Complexity` section is missing:

| Role | Lifecycle Phase | Complexity Source | Default Complexity |
| :--- | :--- | :--- | :--- |
| **`decide`** | Plan | Ticket or Default | `low` for research, `medium` for prototypes and tasks |
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

## Return schema

Every subagent returns exactly this block:

```text
Verdict: done | approved | changes-requested | questions | failed
Issues: #<n>, ...
Questions: <numbered list, or None>
Evidence: <link to the issue comment holding the full report, or None>
```

Slicing subagents populate `Issues: #<n>, ...` with all created ticket numbers.
Actions that post no report comment return `Evidence: None`.
The conductor reads only this block.

## Tier 2

Run every action in the current session, with one exception.
A session may validate or review only as the session's first action.
When the next routing row is validation or review after any other action, halt and print `ship-it <slug>` for a fresh session.

## Source-issue adoption

Publish a new map or spec when the phase precondition applies, using four parameters:

- **Precondition**: Applicability rule supplied by [plan.md](plan.md#charting-no-map-exists) or [spec.md](spec.md#process).
- **Title**: `[<slug>] Map: <gist>` or `[<slug>] Spec: <gist>`.
- **Type label**: `ship-it:map` or `ship-it:spec`.
- **Notes bullet**: Optional line recorded under `## Notes` during in-place adoption.

When the precondition holds, follow these steps:

1. Present two interactive options:
   - **Option 1 (Recommended)**: `Adopt source issue #<n> in place (updates title, adds artifact label, keeps the original body as a comment, and replaces the body with the artifact template)`
   - **Option 2**: `Create a new issue (retains original source issue #<n> untouched as external reference)`
2. Write the artifact body to a temporary payload file per [writing.md](writing.md#cross-platform-shell-conventions).
3. On **Option 1**, keep the original request before replacing the body. Write `## Original request` and the current body (`gh issue view <n> --json body --jq .body`) to a second temporary file, post it with `gh issue comment <n> --body-file <file>`, and delete that file. Skip this comment when the body is empty. Then include the `## Notes` bullet when configured, and run:

   ```shell
   gh issue edit <n> --title "<title>" --add-label "<type-label>" --body-file <file>
   ```

4. On **Option 2**, leave source issue `#<n>` untouched and run:

   ```shell
   gh issue create --title "<title>" --body-file <file> --label "<type-label>"
   ```

5. Delete the temporary payload file immediately after `gh issue edit` or `gh issue create` completes.
