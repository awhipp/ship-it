# Plan: chart a map of decision tickets

Chart a map when an effort is too large or ambiguous for a single session. This phase charts the path as a map, then resolves open questions one decision at a time. It produces **decisions**, not code. Implementation occurs later in the Implement phase.

## Is this actually needed?

Before charting, check the escape hatch. Fan out across the domain breadth-first (see step 2 below) to locate genuine uncertainty. If the path is clear enough to write a spec directly, stop here and advance to [spec.md](spec.md). Charting a map for a clear effort adds unnecessary overhead.

## The map

The map is a single GitHub issue titled `[<slug>] Map: <destination gist>` and labelled `ship-it:map`, with this body:

```markdown
    ## Destination

    <What reaching the end of this map looks like: usually "a spec ready to hand to
    spec.md (via ship-it or /ship-it)." Write one or two concise lines adhering to
    [writing.md](writing.md).>

    ## Notes

    <Domain context and standing preferences for this effort. Write concise paragraphs
    following [writing.md](writing.md).>

    ## Decisions so far

    <!-- One line per resolved ticket: gist and issue link adhering to [writing.md](writing.md).
    Provide enough detail to judge relevance. Never restate full decision text here. -->

    ## Not yet specified

    <!-- Fog: questions you can anticipate but cannot yet phrase precisely.
    See "Fog of war" below. -->

    ## Out of scope

    <!-- Work ruled beyond the destination. Out-of-scope work never graduates into a ticket. -->
```

Each **ticket** is a child issue of the map (see [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands) for sub-issues and dependency APIs). Title each ticket `[<slug>] <ticket type>: <question gist>` and label it with its type (`ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, or `ship-it:task`). Format the body with the question adhering to [writing.md](writing.md):

```markdown
    ## Question

    <The decision or investigation this ticket resolves. Phrase as a clear, single-sentence question adhering to writing.md.>
```

## Refer by name

Refer to the map and its tickets by issue title in all user-facing communication, not by a bare number like `#42`. The title conveys meaning, while the number only assists `gh`. Link the title to the issue whenever possible. Place the issue number inside the markdown link rather than standing alone in prose.

## Ticket types

- **Research**: A fact required for a decision, discoverable in documentation, APIs, or source code. Resolve this ticket in the active session by inspecting the source directly.
- **Prototype**: An open question about appearance or behavior requiring a quick, concrete artifact before deciding in prose. Build the minimal throwaway prototype that answers the question, demonstrate it, and record the answer.
- **Grilling**: A decision requiring user input. This is the default ticket type. Ask sharp questions, strictly one question per turn during clarification. Never batch questions into a single turn or answer on behalf of the user.
- **Task**: Concrete work that must be completed before making a decision (such as provisioning access or migrating data). Perform the work directly if possible. If only the user can perform it, provide a concise checklist and record the resulting state.

## Fog of war

The map is deliberately incomplete. Beyond active tickets lies the fog: questions anticipated but not yet stateable with precision because they depend on open decisions. Resolving a ticket clears fog. When an item becomes specifiable, graduate it into a fresh ticket.

The test for ticket versus fog: can you state the question precisely right now? If yes, create a ticket even if blocked. If you can only identify the general topic, record it in "Not yet specified" without premature slicing.

## Out of scope

The destination sets the project boundaries. Work beyond the destination is not fog and does not belong in "Not yet specified". Record out-of-scope items under "Out of scope" with a brief rationale following [writing.md](writing.md). If an existing ticket falls outside the destination, close the ticket and move its summary here. Out-of-scope items never graduate into tickets during this effort.

## Working the map, one session at a time

**Charting** (first time through, no map exists yet):

1. Grill the user to name the destination: the spec, decision, or change this map targets. Settle this first; it fixes the scope. Ask strictly one question per turn during clarification—never batch multiple questions into a single turn.
2. Grill again, breadth-first this time: fan out across the domain rather than exploring one thread deeply. Surface open decisions and actionable items. Continue strictly one question per turn.
3. Write the map: fill in destination and notes, leave decisions-so-far empty, and record fog in "Not yet specified". Ensure all sections follow [writing.md](writing.md).
4. Create tickets for currently specifiable questions (`gh issue create`; see [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands) and [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions)). Wire blocking edges in a markdown tasklist under `## Blocked by`. Leave remaining items in the fog.
5. Stop. Charting is a complete session of work that resolves no tickets.

**Resolving** (a map already exists):

1. Read the map body via `gh issue view <number>`.
2. Pick the ticket: select the ticket named by the user, or take the earliest unblocked, unclaimed ticket on the frontier.
3. Claim the ticket (`gh issue edit <number> --add-assignee "@me"`) before starting work per [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions).
4. Resolve the ticket according to its type. For grilling tickets, ask strictly one question per turn during clarification.
5. Record the resolution: post the answer (`gh issue comment <number> --body "<text>"`), and close the ticket (`gh issue close <number> --comment "<text>"`). Append a one-line summary pointer to the map's "Decisions so far" (`gh issue edit <map-number>`) following [writing.md](writing.md).
6. Graduate newly specifiable fog into fresh tickets (`gh issue create`, then wire blocking edges under `## Blocked by`). Remove graduated items from "Not yet specified". If an answer shows that a ticket lies outside the destination, move it to "Out of scope".

Resolve **at most one ticket per session** (research tickets are the exception; several can run in a batch since they need no user interaction). When no tickets remain and "Not yet specified" is empty, the map is clear: hand off to [spec.md](spec.md) (or run `ship-it` or `/ship-it`).

## Map remediation

When adversarial validation applies `ship-it:changes-requested` to a map, resolve reported blockers before proceeding:

1. **Review audit findings**: Inspect the validation report in the issue comments via `gh issue view <map-number> --comments`.
2. **Remediate blockers**: Update the map destination, notes, tickets, or fog items in the issue body (`gh issue edit <map-number> --body-file <file>`). Resolve contradictions and clarify ambiguous scope.
3. **Post resolution comment**: Post a comment detailing how each blocker was addressed (`gh issue comment <map-number> --body "<text>"`).
4. **Remove status label**: Remove `ship-it:changes-requested` via `gh issue edit <map-number> --remove-label "ship-it:changes-requested"`.

Removing `ship-it:changes-requested` returns the map to the validation queue.
Submit the updated map for re-audit under [validate.md](validate.md) in a fresh session.
