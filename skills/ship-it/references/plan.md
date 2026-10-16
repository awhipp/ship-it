# Plan: chart a map of decision tickets

Chart a map when setup selects mapping before specification.
The map tracks open architectural and scope questions and resolves them one decision ticket at a time.
Planning produces settled decisions, not product code.

## The map

The map is a GitHub issue titled `[<slug>] Map: <destination gist>` with the `ship-it:map` label:

```markdown
## Destination

<One or two sentences naming what completing this map produces: a specification ready for spec.md.>

## Notes

<Domain context and standing preferences for this feature.>

## Decisions so far

<!-- One line per closed decision ticket: summary and issue link. -->

## Not yet specified

<!-- Fog: questions anticipated that depend on open decisions before they can be phrased precisely. -->

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

- **Research** (`ship-it:research`): A fact discoverable in documentation, APIs, or source code. Inspect the source directly and record the answer.
- **Prototype** (`ship-it:prototype`): A question about appearance or behavior that needs a minimal throwaway artifact before deciding. Build the prototype, observe the outcome, and discard or note the result.
- **Grilling** (`ship-it:grilling`): A decision requiring user input. Ask the user strictly one question per turn; never batch questions or answer for the user.
- **Task** (`ship-it:task`): Concrete setup work required before a decision (such as provisioning access). Perform the work or ask the user to complete it.

## Fog of war

Questions that can be stated precisely right now become decision tickets, even when blocked by earlier tickets.
Questions that cannot yet be phrased precisely belong under `## Not yet specified` until resolving an earlier ticket clears the fog.
Work outside the destination belongs under `## Out of scope` and never becomes a ticket.

## Process

### Charting (no map exists)

1. Grill the user to settle the destination and surface open decisions, asking strictly one question per turn.
2. Publish the map issue (`gh issue create --title "[<slug>] Map: <gist>" --body-file <file> --label "ship-it:map"`).
3. Create decision tickets for every question that can be stated precisely now, wiring dependencies per [tickets.md](tickets.md#relationships).
4. Continue straight into resolving decision tickets.

### Resolving (map is open)

1. Read the map (`gh issue view <map-number>`) and list its decision tickets (`gh issue list --search "<slug> in:title" --state open --json number,title,labels`).
2. Select the lowest-numbered open, unblocked decision ticket.
3. Claim the ticket (`gh issue edit <n> --add-assignee "@me"`).
4. Resolve the ticket per its type and [isolation.md](isolation.md):
   - Dispatch `research`, `prototype`, and `task` tickets per `isolation.md`. The subagent posts the findings on the ticket, closes the ticket (`gh issue close <n> --comment "<summary>"`), and returns `done`. When blocked on user input, the subagent leaves the ticket open and returns `questions`.
   - Run `grilling` tickets in the conductor, asking one question per turn until settled, then close the ticket with the answer.
5. Once the ticket closes, update the map (`gh issue edit <map-number> --body-file <file>`):
   - Append a one-line summary and link under `## Decisions so far`.
   - Graduate newly specifiable items from `## Not yet specified` into new decision tickets, and move ruled-out items to `## Out of scope`.
6. While open decision tickets remain or `## Not yet specified` is non-empty, return to `SKILL.md` § 2 (`Query state`) to resolve the next decision ticket. When neither remains, close the map (`gh issue close <map-number> --comment "<summary>"`) and halt at Boundary 1 exit.
