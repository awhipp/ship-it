# Spec: synthesize settled decisions

Turn settled decisions into a high-level design specification published as a GitHub issue.
The specification provides cross-cutting architectural context that guides every ticket and review.
This phase is synthesis, not an open-ended interview.
When a point remains unsettled, ask the user directly instead of guessing.

## Process

1. **Gather settled context**: When a map exists for the feature, read the full map body via `gh issue view <map-number> --json body --jq .body` without `--comments`. When sourced from an issue (`ship-it #<n>`), read the source issue body via `gh issue view <n> --json body --jq .body`. Otherwise, read the verbatim directive text from setup.
2. **Explore the codebase**: Run `git fetch origin <default-branch>`, and inspect `origin/<default-branch>` using read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. Warn the user when local `HEAD` diverges from `origin/<default-branch>`. Identify affected modules, shared contracts, data models, and system invariants using targeted searches, the repository's vocabulary, and Architecture Decision Records (ADRs).
3. **Define test seams**: Determine where and how to verify the feature using existing test runners and directories, preferring high-level seams with minimal touchpoints. For `fix` feature types, specify `Root cause: <mechanism>` and `Reproduction seam: <test or CLI command failing before fix>`. When automated tests do not apply, define direct checks rather than custom string-matching scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition). Confirm the verification seams with the user before drafting.
4. **Draft the spec**: Draft the specification using the template below, following [writing.md](writing.md). Write concise single-contract bullet points covering cross-cutting concerns.
   - **Keep spec altitude**: Name modules, boundaries, and shared contracts rather than internal functions, file paths, internal CLI flags, flags of invoked external tools, or shell commands. Prefer naming a module boundary over asserting unneeded existing behavior. Exempt public CLI or interface contracts exposed by the feature to users or callers and `Reproduction seam` commands under `## Testing Decisions` on `fix` specs.
   - **Check subsystem cohesion**: Before pausing for approval, warn the user when a draft spans unrelated subsystems lacking a shared runtime contract or joint acceptance path. Suggest one spec per subsystem or a tighter cross-cutting altitude. Keep that subsystem warning strictly advisory without blocking publication after user approval.
   - **Obtain draft approval**: Pause and obtain explicit user approval of the draft before creating the GitHub issue.
5. **Publish the spec**:
   - **Sourced from `ship-it #<n>` without a map**: Run [source-issue adoption](isolation.md#source-issue-adoption) with title `[<slug>] Spec: <gist>`, label `ship-it:spec`, and no `## Notes` bullet.
   - **Map exists or no source issue exists**: Leave `#<n>` untouched, write the spec body to a temporary payload file, create a new issue via `gh issue create`, and delete the temporary file immediately:

     ```shell
     gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec"
     ```

6. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing advances to Row 7 (spec validation).

## Spec template

```markdown
## Source

- **Request**: #<n> (<original-title>) when sourced from an issue, or verbatim "<idea>" directive text. Pair with `Map: None` when adopted directly as the spec, or `Map: #<n>` when adopted as the map first.
- **Map**: #<map-number> (or "None")
- **Branch**: <type>/<slug>

## Problem and Goal

State the user problem and target outcome in two to four sentences without implementation mechanics, following [writing.md](writing.md).

## Scope and Behaviors

Numbered list of observable behaviors covering the feature surface area:

1. **<Behavior>**: <Observable outcome>

## Implementation Decisions

State each high-level contract, boundary, or rule once across the feature:
- **Architecture and module boundaries**: Name the components, modules, or subsystems involved and define their responsibilities.
- **Contracts and schemas**: Specify shared interfaces, API contracts, data models, and state transitions across components.
- **Cross-cutting invariants and failure handling**: State error-handling rules, edge-case policies, backward-compatibility constraints, and system invariants.
- **Deferred to slicing**: <detail>

Omit line numbers and low-level function bodies unless a prototype established a concrete schema or state machine.

## Testing Decisions

State the verification strategy aligned with workspace conventions and existing test runners.
Name the domain modules and seams that receive coverage, or state the direct checks without inventing custom test scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
For `fix` feature types, specify:
- **Root cause**: <mechanism>
- **Reproduction seam**: <test or CLI command failing before fix>

## Out of Scope

List explicitly excluded capabilities.
```

## Remediation

When validation applies `ship-it:changes-requested` to the specification:

Conductors update the spec body directly via surgical edits without posting issue comments.
Conductors must never post comments or author `## Answers` or `## Circuit Breaker Reset` headings during autonomous blocker resolutions or deferrals of slice-local questions.

1. **Read the report**: Read the spec comments via `gh issue view <spec-number> --json comments --jq '[.comments[].body]'` and select the latest `## Validation: Spec` report in-agent.
2. **Resolve cited Blockers**: Limit remediation edits to cited Blockers, settled cross-cutting guidance from `## Answers` or `## Circuit Breaker Reset` comments, and any remaining slice-local `Clarifying Questions`:
   - **Active-code checks**: Run `git fetch origin <default-branch>`, and compare active-code claims against `origin/<default-branch>` using read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. Warn the user when local `HEAD` diverges from `origin/<default-branch>`.
   - **Settled guidance**: Fold cross-cutting `## Answers` and `## Circuit Breaker Reset` decisions into the spec body.
   - **Slice-local questions**: Append any remaining slice-local `Clarifying Questions` not already recorded by `SKILL.md` § 4 strictly to `- **Deferred to slicing**: <detail>` under `## Implementation Decisions`. Apply that surgical edit (`gh issue edit <spec-number> --body-file <file>`, deleting the temporary file immediately) without prompting the user or posting a comment per `SKILL.md` § 4 (`Dispatch and verdicts`).
   - **Advisory warnings**: Leave advisory Warnings untouched. Editing warning-only sections expands the active edit surface on later validation passes. Warnings never trigger independent remediation passes or revalidation loops.

   Resolve every cited Blocker using one of four remediation paths while preserving untouched text verbatim:
   - **In-body edit**: Apply the minimal surgical edit (`gh issue edit <spec-number> --body-file <file>`, deleting the temporary file immediately) needed to remove the cited contradiction or architectural gap without adding unrequested claims. Route any new implementation detail required by that fix to `- **Deferred to slicing**: <detail>` under `## Implementation Decisions`.
   - **Defer to slicing**: Record slice-local details or caller edge cases directly under `## Implementation Decisions` in the spec body as `- **Deferred to slicing**: <detail>` without prompting the user.
   - **Descope**: Remove capabilities and record them under `## Out of Scope` only after obtaining explicit user approval.
   - **Split scope**: Create a follow-up GitHub issue for the deferred work and link the issue under `## Out of Scope` only after obtaining explicit user approval.
3. **Remove label**: Clear `ship-it:changes-requested` (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
4. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 7 (spec validation).
