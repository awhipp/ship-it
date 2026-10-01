# Implement: build, test-first, one ticket at a time

Build the work described by a ticket (or, for a small feature with no
ticket-splitting, directly against the spec). Each run of this phase should be
a fresh session: a ticket is self-contained by construction, so old context
from prior tickets rarely helps and often just costs tokens.

## Process

### 1. Branch and claim the ticket

Work on a dedicated feature branch rather than `main` (or the default branch)—create the feature branch if starting the feature, or switch to the existing feature branch—ensuring `review.md`'s three-dot diff (`git diff <fixed-point>...HEAD`) has a valid merge-base. Claim the ticket (`gh issue edit <number> --add-assignee "@me"`) before writing anything, so a concurrent session doesn't pick up the same one. Note the assignee must be quoted as `"@me"` to ensure cross-platform shell compatibility.

### 2. Execute the verification cycle

Tailor the verification strategy to the nature of the change and repository:

- **Detect workspace test conventions first**:
  Before writing any test or implementation code, inspect the repository to identify existing test frameworks, runners, and conventions (e.g., `npm test`, `pytest`, `cargo test`, `go test`, `vitest`, `jest`, and directories such as `tests/`, `__tests__/`, `spec/`, or co-located `*.test.ts`). If an established test runner and structure exist, abide by them as the primary default.

- **Recommended test-first practice (Red-Green)**:
  Where an automated test suite exists and unit/slice testing is viable and meaningful, practicing test-first Red-Green is strongly recommended to clarify design seams and guard against regressions:
  - **Red step**: Write a test capturing the next unit of behavior or acceptance criterion. Run the test and observe it fail.
  - **Green step**: Write the minimal code necessary to make the test pass. Run the test and observe it pass.
  - Repeat this cycle for each slice or acceptance criterion. Use the seams the spec already settled on (see `spec.md`); introducing a new seam mid-implementation is a sign the spec's seam choice needs revisiting, not a reason to route around it quietly.
  - Reframe Red-Green as a recommended software engineering discipline for building confidence, rather than a rigid bureaucratic gate or mandatory rejection threat. Failure logs or intermediate Red commits are valuable verification evidence when available, but absence of terminal failure logs should not block progress when the implementation and tests cleanly verify the acceptance criteria.

#### Ticket-naming prohibition

Never name test files, test suites, or source files after tickets or issue numbers (e.g., strictly prohibit `ticket-18.test.js`, `test_issue_23.py`, or similar ticket-bound artifacts). Tests outlive transient issue tracking; naming them after tickets creates technical debt and obscures domain ownership. Automated tests must live in domain- or module-aligned test files organized strictly by **domain, module, or feature seam** (e.g., `tests/marketing.test.js`, `tests/auth.test.ts`, `src/conductor.test.ts`).

#### Ad-hoc test harness prohibition

For documentation, markdown skill definitions, configuration files, visual/asset changes, or repositories lacking test infrastructure:
- Do not force over-architected test ceremonies, invent ad-hoc test runners, or write brittle string-matching mock tests simply to simulate test coverage.
- Verify requirements directly against acceptance criteria using domain-appropriate verification (such as linting, typechecking, build compilation, manual inspection, CLI/browser verification, or schema validation).
- Record this verification evidence in the handoff report and issue comment.

### 3. Check as you go, not just at the end

Run typechecking and the relevant single test file regularly through the build, not only once everything's written. Run the full test suite once, at the end, before calling the ticket done.

### 4. Stop drifting from the acceptance criteria

If something in the ticket turns out to be wrong or the acceptance criteria don't fit what you're learning mid-build, don't silently reinterpret it: say so, and either edit the issue (`gh issue edit <number>`) or flag it in a comment (`gh issue comment <number> --body "<text>"`), rather than quietly building something else.

### 5. Commit and stop

Once the ticket's behavior is built and the full suite is green (or acceptance criteria verified for non-code changes), commit the work-in-progress to the feature branch so the diff exists and survives past this session. Don't self-review and don't close the ticket here: the session that just wrote this code is the worst-positioned session to check it, it's carrying every rationalization it made along the way. Leave the ticket assigned and open; that "implemented, awaiting review" state is what a fresh session picks up next.

### 6. Report and hand off

Tell the user the ticket is implemented and waiting on independent review under the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol), and that the next step is an isolated review session running `review.md` against this diff (e.g., via `ship-it review`, `/ship-it review`, or the equivalent in conversation). Include the verification summary (e.g., test runner output, test commit ref, or domain-appropriate acceptance criteria verification) in the handoff report and issue comment. Don't run review yourself, even as a "quick check" before stopping; in-context persona simulation is strictly prohibited.

## When there's no ticket (small, single-session feature)

Same process, just working directly from the spec's User Stories and Implementation Decisions
instead of a ticket's acceptance criteria, still on a dedicated feature branch. The spec issue itself is the record; there's nothing
separate to claim (`gh issue edit <number> --add-assignee "@me"`) or close (`gh issue close <number>`).
