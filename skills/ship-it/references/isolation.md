# 2-Tier Context Isolation Protocol

Enforce context isolation during validation and review to prevent authoring bias.
Never simulate an adversarial validator or reviewer within the authoring session context.
Select the execution tier by inspecting the environment dynamically before delegating tasks.

## Dynamic Tool Inspection

Inspect the runtime harness environment for subagent execution primitives before delegating tasks.
Check for available dispatch tools such as `invoke_subagent`, `Agent`, or equivalent harness primitives.
Execute Tier 1 when subagent dispatch tools exist.
Execute Tier 2 when subagent dispatch tools are absent.

## Autonomous Protocol (Tier 1)

When subagent tools exist, execute validation and review autonomously without manual session restarts:

1. **Spawn isolated child agent**: Launch a fresh child agent with zero parent conversation context.
2. **Pass task inputs only**: Pass only the target issue number, diff fixed-point or branch ref (for reviews), requirements, and reference instructions ([validate.md](validate.md) or [review.md](review.md)).
3. **Execute verification**: Direct the child agent to execute the evaluation independently, post the full report comment to the GitHub issue, and apply appropriate labels.
4. **Return verdict summary**: Direct the child agent to return a concise verdict summary directly to the parent conductor.
5. **Resume conductor flow**: Ingest the verdict summary, report results to the user, and proceed or stop per the reported outcome.

## Manual Fallback Protocol (Tier 2)

When subagent tools are absent, execute manual fallback across separate sessions:

1. **Apply status label**: Add the `ready-for-agent` status label to the target artifact issue (`gh issue edit <number> --add-label "ready-for-agent"`).
2. **Output fresh session command**: Print the explicit command for the user to execute in a fresh session (such as `/ship-it validate <number>` or `/ship-it review <number>`).
3. **Pause execution**: Stop the conductor run immediately. Prohibit in-context persona simulation.
