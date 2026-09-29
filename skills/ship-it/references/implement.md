# Implement: build, test-first, one ticket at a time

Build the work described by a ticket (or, for a small feature with no
ticket-splitting, directly against the spec). Each run of this phase should be
a fresh session: a ticket is self-contained by construction, so old context
from prior tickets rarely helps and often just costs tokens.

## Process

1. **Claim the ticket** (`gh issue edit <number> --add-assignee "@me"`) before
   writing anything, so a concurrent session doesn't pick up the same one. Note the assignee
   must be quoted as `"@me"` to ensure cross-platform shell compatibility.

2. **Execute the verification cycle.** Tailor the verification strategy to the nature of the change and repository:

   - **Where Red-Green applies**: Code changes in repositories with existing automated test suites and frameworks where test-first slices are viable and meaningful. Build strictly in test-first Red-Green slices:
     - **Step 1: Red Phase (Failing Test & Verification Gate)**:
       Write a test capturing the next unit of behavior or acceptance criterion. Run the test suite or single test file and observe the failure. Before proceeding to the Green Phase or writing any production/implementation code, you MUST establish concrete proof of the Red step as an explicit gate. Valid verification evidence includes:
       - Natural test runner output or terminal failure logs recorded in the handoff report or issue comment.
       - A git commit capturing the failing test.
       Avoid dogmatic ceremony: prescriptive commit naming conventions (such as mandatory `(RED)` prefixes) and specific HTML wrapper blocks (such as `<details>` tags) are not required. Any clear terminal output, test runner failure trace, or test commit qualifies as valid proof. Writing implementation code for executable features before demonstrating failing test evidence is prohibited.
     - **Step 2: Green Phase (Implementation & Verification)**:
       Write the minimal code necessary to make the failing test pass. Run the test and observe pass. Repeat this cycle for each slice or acceptance criterion. Use the seams the spec already settled on (see `spec.md`); introducing a new seam mid-implementation is a sign the spec's seam choice needs revisiting, not a reason to route around it quietly.

   - **Where Red-Green is not viable or needed**: Documentation, markdown skill definitions, configuration files, visual/asset changes, or repositories lacking test infrastructure. In these contexts:
     - Do not force artificial test ceremony or write brittle string-matching mock tests.
     - Verify requirements directly against acceptance criteria using domain-appropriate verification (such as manual inspection, diff auditing, schema validation, linting, or typechecking).
     - Record this acceptance criteria verification in the handoff report and issue comment.

3. **Check as you go, not just at the end.** Run typechecking and the relevant single test
   file regularly through the build, not only once everything's written. Run the full test
   suite once, at the end, before calling the ticket done.

4. **Stop drifting from the acceptance criteria.** If something in the ticket turns out to
   be wrong or the acceptance criteria don't fit what you're learning mid-build, don't silently
   reinterpret it: say so, and either edit the issue (`gh issue edit <number>`) or flag it in a comment
   (`gh issue comment <number> --body "<text>"`) rather than quietly building
   something else.

5. **Commit and stop.** Once the ticket's behavior is built and the full suite is green (or acceptance criteria verified for non-code changes), commit the work-in-progress to the current branch so the diff exists and survives past this session. Don't self-review and don't close the ticket here: the session that just wrote this code is the worst-positioned session to check it, it's carrying every rationalization it made along the way. Leave the ticket assigned and open; that "implemented, awaiting review" state is what a fresh session picks up next.

6. **Report and hand off.** Tell the user the ticket is implemented and waiting on independent
   review under the 2-Tier Context Isolation Protocol (see [references/validate.md](validate.md)),
   and that the next step is an isolated review session running `review.md` against this diff
   (e.g., via `ship-it review`, `/ship-it review`, or the equivalent in conversation).
   Include the Red verification proof (e.g., test runner output, terminal failure log, or failing
   test commit ref), or the acceptance criteria verification summary where Red-Green is not applicable,
   in the handoff report and issue comment. Don't run review yourself, even as a "quick check" before
   stopping; in-context persona simulation is strictly prohibited.

## When there's no ticket (small, single-session feature)

Same process, just working directly from the spec's User Stories and Implementation Decisions
instead of a ticket's acceptance criteria. The spec issue itself is the record; there's nothing
separate to claim (`gh issue edit <number> --add-assignee "@me"`) or close (`gh issue close <number>`).
