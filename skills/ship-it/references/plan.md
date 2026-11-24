# Plan: chart a map of decision tickets

Chart a map when setup selects mapping before specification.
The map tracks open architectural and scope questions and resolves them one decision ticket at a time.
Planning produces settled decisions, not product code.

## The map

The map is a GitHub issue titled `[<slug>] Map: <destination gist>` with the `ship-it:map` label. Keep `## Notes` and `## Decisions so far` to concise single-sentence bullets:

```markdown
## Source

- **Request**: #<n> (<original-title>): <confirmed request> when sourced from an issue, or the confirmed request from setup.
- **Branch**: <type>/<slug>

## Destination

<One or two sentences naming what completing this map produces: a specification ready for spec.md.>

## Notes

- <Concise single-sentence domain context or standing preference for this feature.>
<!-- When adopted in place from an issue, record: - Adopted in place from source issue #<n> (<original-title>). -->

## Decisions so far

<!-- One concise single-sentence bullet per closed decision ticket: self-contained decision summary and issue link. -->

## Not yet specified

<!-- Fog: anticipated questions that depend on open decisions before the conductor can phrase the questions precisely. -->

## Out of scope

<!-- Work ruled outside the destination, with a brief rationale. -->
```

Each decision ticket is a child issue of the map titled `[<slug>] <Type>: <question gist>` and labeled with its type (`ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, or `ship-it:task`):

```markdown
Part of #<map-id>

## Question

<Single-sentence question this ticket resolves.>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

Link issues by title in user-facing messages rather than bare issue numbers.

## Ticket types

- **Research** (`ship-it:research`): A fact discoverable in documentation, APIs, or source code. Locate relevant symbols and files with targeted search, read the specific sections directly, and record the answer.
- **Prototype** (`ship-it:prototype`): A question about appearance or behavior that needs a minimal throwaway artifact before deciding. Build the prototype, observe the outcome, and discard or note the result.
- **Grilling** (`ship-it:grilling`): A decision requiring user input. Ask the user strictly one question per turn; never batch questions or answer for the user.
- **Task** (`ship-it:task`): Concrete setup work required before a decision (such as provisioning access). Perform the work or ask the user to complete the step.

## Fog of war

State questions that have a clear phrasing right now as decision tickets, even when blocked by earlier tickets.
Place questions that depend on open decisions under `## Not yet specified` until resolving an earlier ticket clears the fog.
Work outside the destination belongs under `## Out of scope` and never becomes a ticket.
Reserve decision tickets for open architectural, scope, or user-preference forks. Settle trivial implementation choices (such as local naming or formatting) during specification or implementation instead of creating decision tickets.

## Process

### Charting (no map exists)

1. Grill the user to settle the destination and surface open decisions, asking strictly one question per turn.
2. Publish the map issue:
   - **Sourced from `ship-it #<n>`**: Run [source-issue adoption](isolation.md#source-issue-adoption) with title `[<slug>] Map: <gist>`, label `ship-it:map`, and `## Notes` bullet `- Adopted in place from source issue #<n> (<original-title>).`.
   - **Started without a source issue**: Write the map body to a temporary payload file, create the issue via `gh issue create --title "[<slug>] Map: <gist>" --body-file <file> --label "ship-it:map"`, and delete the temporary file immediately.
3. Create decision tickets for every question that has a clear phrasing now. Write `Part of #<map-id>` and `## Blocked by` in the body. After each `gh issue create`, link the ticket with `gh issue edit <n> --parent <map-id> --add-blocked-by <blocker-id>`, ignoring errors (optional decoration).
4. Continue straight into resolving decision tickets.

### Resolving (map is open)

1. Read the map body once via `gh issue view <map-number> --json body --jq .body`. Evaluate decision tickets directly from the batch query payload obtained during state querying in `SKILL.md § 2`, keeping issues whose title starts with `[<slug>]` and whose labels include `ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, or `ship-it:task`.
2. Select the lowest-numbered open decision ticket whose blockers are all closed, checking open decision tickets in ascending number order against the closed set. When every open decision ticket is blocked, report each one with its open blockers and halt.
3. Claim the ticket (`gh issue edit <n> --add-assignee "@me"`).
4. Resolve the ticket by its type:
   - **`research`, `prototype`, or `task`**: Dispatch a `decide` subagent per [isolation.md](isolation.md).
   - **`grilling`**: Run in the conductor, asking one question per turn until settled. Close the ticket with `--comment` for single-line settlements, or post multi-line findings via `gh issue comment <n> --body-file <file>`, delete the temporary file immediately, and run `gh issue close <n>`.
5. Once the ticket closes, update the map body (`gh issue edit <map-number> --body-file <file>`), deleting the temporary file immediately:
   - Append a self-contained single-sentence decision summary and issue link under `## Decisions so far`.
   - Graduate newly specifiable items from `## Not yet specified` into new decision tickets, and move ruled-out items to `## Out of scope`. When no open decision tickets remain, graduate or rule out every remaining item under `## Not yet specified` before proceeding.
6. While open decision tickets remain, return to `SKILL.md` § 2 (`Query state`) to resolve the next decision ticket. When none remain, close the map (`gh issue close <map-number> --comment "<summary>"`) and halt at Boundary 1 exit.

#### Subagent execution

Execute `research`, `prototype`, and `task` tickets in a `decide` subagent per [## Ticket types](#ticket-types):

- **Single-line settlement**: Close the ticket (`gh issue close <n> --comment "<settled decision and rationale>"`) and return `done` with `Evidence: None`.
- **Multi-line findings**: Post findings via `gh issue comment <n> --body-file <file>`, delete the temporary file immediately, close the ticket (`gh issue close <n>`), and return `done` with `Evidence: <comment-url>`.
- **Blocked on user input**: Leave the ticket open and return `questions`.
