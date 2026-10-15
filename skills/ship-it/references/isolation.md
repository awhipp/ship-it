# 2-Tier Context Isolation Protocol

Enforce context isolation during implementation, validation, and review to prevent authoring bias.
Never simulate an adversarial validator or reviewer within the authoring session context.
Select the execution tier by inspecting the environment dynamically before delegating tasks.

## Dynamic Tool Inspection

Inspect the runtime harness for subagent execution and interactive prompt primitives before delegating tasks.
Check for available dispatch tools such as `invoke_subagent`, `Agent`, or equivalent harness primitives.
Check for interactive prompt tools such as `ask_question`, `prompt`, or equivalent interactive primitives.
Execute Tier 1 when subagent dispatch tools exist.
Execute Tier 2 when subagent dispatch tools are absent.

## Autonomous Implementation Protocol (Tier 1)

When subagent tools exist, dispatch unstarted tickets to isolated child subagents with zero parent conversation context.
This keeps conductor context clean, unbiased, and focused on orchestration.

### 1. Child Subagent Inputs

Pass explicit ticket parameters to the implementation subagent:

- **Target issue requirements**: Pass the issue title, issue number, and complete issue body.
- **Target branch**: Pass the feature branch name.
- **Acceptance criteria**: Pass the specific checklist items from the ticket.
- **Reference instructions**: Pass the path to [implement.md](implement.md) and [writing.md](writing.md).

### 2. Implementation Subagent Execution

Direct the child subagent to execute implementation independently:

1. **Test-first Red-Green practice**: Follow domain-aligned verification or Red-Green testing per [implement.md](implement.md).
2. **Commit changes**: Commit all working code directly to the target feature branch.
3. **Record verification evidence**: Document test results and criteria checks in the issue comment thread.
4. **Return verdict summary**: Return a concise verdict summary directly to the parent conductor. Include changed files, commit hashes, and verification evidence.

### 3. Error Handling

Halt execution and alert the developer immediately when an implementation subagent encounters an unrecoverable failure.
Do not proceed to review or downstream tickets after a failed run.
Report the specific error, affected files, and ticket number to the developer.

## Continuous Phase Chaining (Tier 1)

In autonomous loop mode, chain directly from implementation verdict to review subagent dispatch:

1. **Ingest implementation verdict**: Receive the verdict summary and verify clean commit generation.
2. **Dispatch review subagent**: Launch an isolated review subagent immediately per the Autonomous Verification Protocol.
3. **Advance the frontier**: When the review approves the diff, close the ticket and advance to the next unstarted ticket.

## Autonomous Rework Protocol (Tier 1)

When a review subagent applies `ship-it:changes-requested`, trigger autonomous rework:

1. **Dispatch remediation subagent**: Launch an isolated subagent with the review feedback, ticket requirements, and branch name.
2. **Commit fixes**: The remediation subagent fixes reported defects, re-runs verification, and commits fixes to the branch.
3. **Re-dispatch review subagent**: Launch a fresh review subagent to verify the remediated diff.
4. **Bounded retry limit**: Permit at most two remediation retry attempts per ticket.
5. **Escalate to developer**: Halt execution and alert the developer if review rejection persists after two attempts.

## Autonomous Verification Protocol (Tier 1)

When subagent tools exist, execute validation and review autonomously without manual session restarts:

1. **Spawn isolated child agent**: Launch a fresh child agent with zero parent conversation context.
2. **Pass task inputs only**: Pass only the target issue number, diff fixed-point or branch ref (for reviews), requirements, and reference instructions ([validate.md](validate.md) or [review.md](review.md)).
3. **Execute verification**: Direct the child agent to execute the evaluation independently, post the full report comment to the GitHub issue, and apply appropriate labels.
4. **Return verdict summary**: Direct the child agent to return a concise verdict summary directly to the parent conductor.
5. **Resume conductor flow**: Ingest the verdict summary, report results to the developer, and proceed or stop per the reported outcome.

## Manual Fallback Protocol (Tier 2)

When subagent tools are absent, execute manual fallback across separate sessions:

### 1. Authoring Session Handoff

When an authoring session requires validation or review:

1. **Apply status label**: Add the `ready-for-agent` status label to the target artifact issue (`gh issue edit <number> --add-label "ready-for-agent"`).
2. **Output fresh session command**: Print the explicit command for the user to execute in a fresh session (such as `/ship-it validate <number>` or `/ship-it review <number>`).
3. **Pause execution**: Stop the conductor run immediately. Prohibit in-context persona simulation.

### 2. Standalone Verification Execution

When running in a fresh session dedicated to validation or review (or picking up an artifact carrying `ready-for-agent`):

1. **Execute verification directly**: Inspect the target artifact and source requirements directly per [validate.md](validate.md) or [review.md](review.md). Do not pause or re-trigger Tier 2 fallback.
2. **Post findings and update labels**: Post the full report comment to the issue, apply outcome labels (`ship-it:validated`, `ship-it:reviewed`, or `ship-it:changes-requested`), and remove `ready-for-agent`.
3. **Conclude review or validation**: For reviews, close the ticket with a resolution comment if clean, and execute feature close-out if final. Report the outcome to the user.
