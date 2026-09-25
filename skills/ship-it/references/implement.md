# Implement: build, test-first, one ticket at a time

Build the work described by a ticket (or, for a small feature with no
ticket-splitting, directly against the spec). Each run of this phase should be
a fresh session: a ticket is self-contained by construction, so old context
from prior tickets rarely helps and often just costs tokens.

## Process

1. **Claim the ticket** (`gh issue edit <n> --add-assignee @me`) before
   writing anything, so a concurrent session doesn't pick up the same one.

2. **Test-first, at agreed seams.** Work in red-green slices: write the test
   that captures the next piece of behavior, watch it fail, make it pass,
   then move to the next slice. Use the seams the spec already settled on
   (see `spec.md`); introducing a new seam mid-implementation is a sign the
   spec's seam choice needs revisiting, not a reason to route around it
   quietly.

3. **Check as you go, not just at the end.** Run typechecking and the
   relevant single test file regularly through the build, not only once
   everything's written. Run the full test suite once, at the end, before
   calling the ticket done.

4. **Stop drifting from the acceptance criteria.** If something in the
   ticket turns out to be wrong or the acceptance criteria don't fit what
   you're learning mid-build, don't silently reinterpret it: say so, and
   either edit the issue or flag it in a comment rather than quietly building
   something else.

5. **Commit and stop.** Once the ticket's behavior is built and the suite is
   green, commit the work-in-progress to the current branch so the diff exists
   and survives past this session. Don't self-review and don't close the
   ticket here: the session that just wrote this code is the worst-positioned
   session to check it, it's carrying every rationalization it made along the
   way. Leave the ticket assigned and open; that "implemented, awaiting
   review" state is what a fresh session picks up next.

6. **Report and hand off.** Tell the user the ticket is implemented and
   waiting on independent review, and that the next step is a **fresh
   session** running `review.md` against this diff. Don't run review
   yourself, even as a "quick check" before stopping; that's the dirty-context
   review this split exists to avoid.

## When there's no ticket (small, single-session feature)

Same process, just working directly from the spec's User Stories and
Implementation Decisions instead of a ticket's acceptance criteria. The spec
issue itself is the record; there's nothing separate to claim or close.
