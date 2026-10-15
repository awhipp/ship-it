# Implement: build, test-first, one ticket at a time

Build the work described by a ticket following [writing.md](writing.md).
For small single-session features lacking tickets, implement directly against the spec.
Tier 1 environments dispatch isolated implementation subagents per [isolation.md](isolation.md).
Tier 2 environments execute each run of this phase in a fresh session.
Tickets are self-contained by design.
Prior session context adds minimal value and consumes tokens.

## Process

### 1. Branch and claim the ticket

Work on a dedicated feature branch rather than the default branch.
Create the feature branch when starting the feature, or switch to an existing feature branch.
This branch provides a valid merge-base for the three-dot diff (`git diff <fixed-point>...HEAD`) in [review.md](review.md).
Claim the ticket before writing code to prevent concurrent work:

```shell
gh issue edit <number> --add-assignee "@me" --remove-label "ready-for-agent"
```

Always quote `"@me"` per [Cross-Platform Shell Conventions](preflight.md#cross-platform-shell-conventions).
Consult [Canonical `gh` CLI Commands](preflight.md#canonical-gh-cli-commands) for command syntax.
Claim tickets carrying `ship-it:changes-requested` using this same command to begin rework.

### 2. Execute the verification cycle

Tailor verification to the repository and the change type:

- **Detect workspace test conventions first**:
  Inspect the repository for existing test runners and frameworks before authoring code.
  Check for runners such as `npm test`, `pytest`, `cargo test`, `go test`, `vitest`, or `jest`.
  Inspect directories such as `tests/`, `__tests__/`, `spec/`, or co-located test files.
  Abide by established test conventions as the primary default.
  Honor explicit repository testing tiers rather than creating new verification workflows.

- **Explore codebase (optional for multi-file tickets)**:
  Offload initial exploration to an isolated subagent for tickets touching multiple modules.
  Skip subagent exploration for single-file tickets.
  The subagent returns a session-scoped ephemeral map containing key symbols and relevant files.
  Never persist this exploration map to disk, workspace files, or tickets.
  Treat this map as a starting point; the final sweep acts as the backstop.

- **Recommended test-first practice (Red-Green)**:
  Practice test-first Red-Green when an automated suite exists and unit testing is meaningful.
  This discipline clarifies design seams and guards against regressions:
  - **Red step**: Write a test capturing the next unit of behavior. Run the test and observe failure.
  - **Green step**: Write the minimal code necessary to pass the test. Run the test and observe success.
  Repeat this cycle for each slice or acceptance criterion.
  Use the seams settled during specification in [spec.md](spec.md).
  Treat Red-Green as a recommended engineering discipline to build confidence.
  Intermediate Red failure logs provide valuable verification evidence.
  Do not block progress if tests cleanly verify acceptance criteria without failure logs.

#### Ticket-naming prohibition

Never name test files, suites, or source files after issue numbers (e.g., `ticket-18.test.js` or `test_issue_23.py`).
Tests outlive transient issue tracking.
Naming tests after tickets creates technical debt and obscures domain ownership.
Organize automated tests by **domain, module, or feature seam** (e.g., `tests/marketing.test.js`, `tests/auth.test.ts`, `src/conductor.test.ts`).

#### Ad-hoc test harness prohibition

For documentation, markdown skills, configuration files, visual assets, or repositories lacking test runners:

- Avoid inventing ad-hoc test runners or brittle string-matching tests to simulate coverage.
- Never generate scripts to count words, parse sentence lengths, or measure prose metrics; evaluate writing quality qualitatively.
- Verify requirements directly against acceptance criteria using domain-appropriate methods.
- Use linting, typechecking, build compilation, manual inspection, CLI checks, or schema validation.
- Record this verification evidence in the handoff report and issue comment.

### 3. Check as you go, not just at the end

Run typechecking and targeted test files regularly throughout development.
Run the full test suite once before marking the ticket complete.
Run a targeted final sweep (e.g., grep or a subagent pass) for codebase-wide negative invariants.
Execute this sweep after completing implementation rather than scanning the entire codebase upfront.

### 4. Stop drifting from the acceptance criteria

Halt work if acceptance criteria prove incorrect or conflict with findings during implementation.
Do not silently reinterpret ticket requirements.
Update the issue with corrected criteria (`gh issue edit <number>`).
Alternatively, flag discrepancies in an issue comment (`gh issue comment <number> --body "<text>"`).

### 5. Commit and stop

Commit the work-in-progress to the feature branch once implementation passes verification.
Ensure the diff exists on the branch for subsequent review.
Do not self-review this work.
The authoring session carries confirmation bias and cannot provide objective review.
Leave the ticket assigned and open.
This open state signals that the ticket awaits review.
For tickets carrying `ship-it:changes-requested`, execute the rework workflow below before stopping.

### 6. Report and hand off

Handoff procedures depend on the execution tier:

- **Tier 1 autonomous execution**:
  The implementation subagent returns a concise verdict summary directly to the parent conductor.
  The summary details modified files, commit hashes, and verification evidence.
  Never run review within the implementation subagent.
  - In autonomous loop mode, the conductor chains into review subagent dispatch per [isolation.md](isolation.md).
  - In step-by-step mode, the conductor prompts for confirmation before downstream dispatch.

- **Tier 2 manual execution**:
  Notify the user that the ticket is implemented and awaits review.
  Add the `ready-for-agent` label to the ticket (`gh issue edit <number> --add-label "ready-for-agent"`).
  Print the command for an independent review session executing [review.md](review.md) against this diff.
  Stop the conductor run immediately.
  Never run review yourself; in-context persona simulation is strictly prohibited.

## Rework workflow

When a review rejection applies `ship-it:changes-requested`, execute rework based on the execution tier:

- **Tier 1 environments**:
  The conductor executes the Autonomous Rework Protocol in [isolation.md](isolation.md).
  An isolated remediation subagent claims the ticket, addresses review feedback, commits fixes, and returns a verdict.
  Rework is bounded to a maximum of two retry attempts before developer escalation.

- **Tier 2 environments**:
  Execute this rework workflow in a fresh manual session:
  1. **Claim the ticket**: Claim the unassigned ticket via `gh issue edit <number> --add-assignee "@me"`.
  2. **Inspect review feedback**: Read the review findings recorded in the ticket comments via `gh issue view <number> --comments`.
  3. **Address findings**: Apply domain verification to fix reported defects. Add regression tests or direct checks covering every finding.
  4. **Commit fixes**: Commit all remediations directly to the feature branch.
  5. **Post resolution comment**: Post a comment detailing how each finding was resolved (`gh issue comment <number> --body "<text>"`).
  6. **Remove status label**: Remove `ship-it:changes-requested` via `gh issue edit <number> --remove-label "ship-it:changes-requested"`.

Leave the ticket assigned and open to signal readiness for re-review.
Hand off to an independent review session under [review.md](review.md).

## When there is no ticket (small, single-session feature)

Follow this same process for small features built directly from a specification.
Work on a dedicated feature branch.
Build directly from the User Stories and Implementation Decisions in [spec.md](spec.md).
The spec issue serves as the tracking record.
Do not claim or close tickets separately.
