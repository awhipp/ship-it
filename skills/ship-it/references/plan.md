# Plan: chart a map of decision tickets

For an effort too big or too foggy for one session: the way from here to the
destination isn't visible yet. This phase charts that way as a map, then
resolves it one decision at a time until the route is clear. It produces
**decisions**, not built features; building happens later, in Implement.

## Is this actually needed?

Before charting anything, check the escape hatch: fan out breadth-first across
the whole space (see step 2 below) and see whether it turns up any real fog. If
it doesn't, if the whole thing is already clear enough to write a spec
directly, stop here and go straight to `spec.md` instead. Charting a map for
something that doesn't need one is pure overhead.

## The map

The map is a single GitHub issue titled `[<slug>] Map: <destination gist>`
and labelled `ship-it:map`, with this body:

```markdown
    ## Destination

    <What reaching the end of this map looks like: usually "a spec ready to hand to
    /spec." One or two lines.>

    ## Notes

    <Domain context; standing preferences for this effort.>

    ## Decisions so far

    <!-- One line per resolved ticket: enough to judge relevance, with a link to the
    ticket for the full detail. Never restate the decision here, just gist and link. -->

    ## Not yet specified

    <!-- Fog: questions you can tell are coming but can't yet phrase precisely.
    See "Fog of war" below. -->

    ## Out of scope

    <!-- Work ruled beyond the destination. Never graduates into a ticket. -->
```

Each **ticket** is a child issue of the map (see `preflight.md` for the
sub-issue/blocking API), titled `[<slug>] <ticket type>: <question gist>` and
labelled with its type below (`ship-it:research`, `ship-it:prototype`,
`ship-it:grilling`, or `ship-it:task`), with a body of just the question:

```markdown
    ## Question

    <The decision or investigation this ticket resolves.>
```

## Refer by name

In anything the user reads, refer to the map and its tickets by their issue
title, not a bare `#42`. The title carries the meaning; the number only helps
`gh` find the thing. Link the title to the issue where a link is possible, and
let the number ride inside that link rather than stand on its own in prose.

## Ticket types

- **Research**: a fact a decision is waiting on, findable by reading
  docs/APIs/code. Resolve it yourself, in this session, by actually reading
  the source rather than guessing.
- **Prototype**: the question is about how something should look or behave,
  and needs a cheap, rough, concrete artifact to react to before it can be
  answered in prose. Build the smallest throwaway version that answers the
  question, show it, capture the answer.
- **Grilling**: a conversation with the user is the only way to resolve it,
  because it's a decision only they can make. This is the default case. Ask
  sharp, one-at-a-time questions; don't answer on their behalf.
- **Task**: something must merely be _done_, not decided, before a decision
  can be made (provisioning access, moving data so its shape becomes visible).
  Do the work if you can; if only the user can do it, leave them a precise
  checklist and record what changed once it's done.

## Fog of war

The map is deliberately incomplete. Beyond the live tickets lies the fog:
questions you can tell are coming but can't yet state precisely, because they
hang on other questions still open. Resolving a ticket clears fog ahead of it;
whatever becomes specifiable graduates into a fresh ticket.

The test for ticket vs. fog: can you state the question precisely **right
now**, whether or not you can act on it yet? If yes, it's a ticket, even if
it's blocked. If you can only gesture at the area, it's fog: write it into
"Not yet specified," coarser than a ticket, without pre-slicing it.

## Out of scope

The destination fixes the scope. Work beyond it isn't fog and doesn't belong
in "Not yet specified": it gets its own line in "Out of scope," with the gist
and why. If an existing ticket turns out to sit past the destination, close it
and move its gist here rather than resolving it on the route. Out-of-scope
work never graduates; it returns only as a fresh effort if the destination
itself changes.

## Working the map, one session at a time

**Charting** (first time through, no map exists yet):

1. Grill the user to name the destination: the spec, decision, or change this
   map is finding its way to. Settle this first; it fixes the scope.
2. Grill again, breadth-first this time: fan out across the whole space rather
   than deep on one thread, surfacing open decisions and what's takeable now.
3. Write the map: destination and notes filled in, decisions-so-far empty, fog
   sketched into "Not yet specified."
4. Create whatever tickets you can specify now, then wire their blocking
   edges. Everything else stays in the fog.
5. Stop. Charting is its own session's work; it resolves nothing.

**Resolving** (a map already exists):

1. Read the map (the low-resolution body, not every ticket).
2. Pick the ticket: whichever the user named, or the first unblocked,
   unclaimed one (the frontier), in order.
3. Claim it (`gh issue edit <n> --add-assignee @me`) before doing any work, so
   a concurrent session skips it.
4. Resolve it: work the ticket per its type above.
5. Record the resolution: post the answer, close the ticket, append a
   one-line gisted pointer to the map's "Decisions so far."
6. Graduate any fog the answer just made specifiable into fresh tickets
   (create, then wire blocking edges), clearing it out of "Not yet specified."
   If the answer reveals a ticket sits beyond the destination, rule it out of
   scope instead of resolving it.

Resolve **at most one ticket per session** (research tickets are the
exception; several can run in a batch since they need no back-and-forth).
When no tickets remain and nothing is left in the fog, the map is clear: hand
off to `spec.md`.
