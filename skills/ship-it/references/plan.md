# Plan: chart a map of decision tickets

Chart a map when setup selects mapping before specification.
The map tracks open architectural and scope questions and resolves them one decision ticket at a time.
Planning produces settled decisions, not product code.

## The map

The map is a GitHub issue titled `[<slug>] Map: <destination gist>` with the `ship-it:map` label. Keep `## Notes` and `## Decisions so far` to concise single-sentence bullets:

```markdown
## Source

- **Request**: #<n> (<original-title>): <confirmed request> when sourced from an issue, or the confirmed request from setup.
- **Branch**: <type>/<slug>

## Destination

<One or two sentences naming what completing this map produces: a specification ready for the spec.>

## Notes

- <Concise single-sentence domain context or standing preference for this feature.>
<!-- When adopted in place from an issue, record: - Adopted in place from source issue #<n> (<original-title>). -->

## Decisions so far

<!-- One concise single-sentence bullet per closed decision ticket: self-contained decision summary and issue link. -->

## Not yet specified

<!-- Fog: anticipated questions that depend on open decisions before the conductor can phrase the questions precisely. -->

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

- **Research** (`ship-it:research`): A fact discoverable in documentation, APIs, or source code. Locate relevant symbols and files with targeted search, read the specific sections directly, and record the answer.
- **Prototype** (`ship-it:prototype`): A question about appearance or behavior that needs a minimal throwaway artifact before deciding. Build the prototype, observe the outcome, and discard or note the result.
- **Grilling** (`ship-it:grilling`): A decision requiring user input. Ask the user strictly one question per turn; never batch questions or answer for the user.
- **Task** (`ship-it:task`): Concrete setup work required before a decision (such as provisioning access). Perform the work or ask the user to complete the step.

## Fog of war

State questions that have a clear phrasing right now as decision tickets, even when blocked by earlier tickets.
Place questions that depend on open decisions under `## Not yet specified` until resolving an earlier ticket clears the fog.
Work outside the destination belongs under `## Out of scope` and never becomes a ticket.
Reserve decision tickets for open architectural, scope, or user-preference forks. Settle trivial implementation choices (such as local naming or formatting) during specification or implementation instead of creating decision tickets.

## Process

### Charting (no map exists)

1. Grill the user to settle the destination and surface open decisions, asking strictly one question per turn.
2. Publish the map issue:
   - **Sourced from `ship-it #<n>`**: Run [source-issue adoption](plan.md#source-issue-adoption) with title `[<slug>] Map: <gist>`, label `ship-it:map`, and `## Notes` bullet `- Adopted in place from source issue #<n> (<original-title>).`.
   - **Started without a source issue**: Write the map body to a temporary payload file, create the issue via `gh issue create --title "[<slug>] Map: <gist>" --body-file <file> --label "ship-it:map"`, and delete the temporary file immediately.
3. Create decision tickets for every question that has a clear phrasing now. Write `Part of #<map-id>` and `## Blocked by` in the body. After each `gh issue create`, link the ticket with `gh issue edit <n> --parent <map-id> --add-blocked-by <blocker-id>`, ignoring errors (optional decoration).
4. Continue straight into resolving decision tickets.

### Resolving (map is open)

1. Read the map body once via `gh issue view <map-number> --json body --jq .body`. Evaluate decision tickets directly from the batch query payload obtained during state querying in `SKILL.md § 2`, keeping issues whose title starts with `[<slug>]` and whose labels include `ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, or `ship-it:task`.
2. Select the lowest-numbered open decision ticket whose blockers are all closed, checking open decision tickets in ascending number order against the closed set. When every open decision ticket is blocked, report each one with its open blockers and halt.
3. Claim the ticket (`gh issue edit <n> --add-assignee "@me"`).
4. Resolve the ticket by its type:
   - **`research`, `prototype`, or `task`**: Dispatch a `decide` subagent per [isolation.md](isolation.md).
   - **`grilling`**: Run in the conductor, asking one question per turn until settled. Close the ticket with `--comment` for single-line settlements, or post multi-line findings via `gh issue comment <n> --body-file <file>`, delete the temporary file immediately, and run `gh issue close <n>`.
5. Once the ticket closes, update the map body (`gh issue edit <map-number> --body-file <file>`), deleting the temporary file immediately:
   - Append a self-contained single-sentence decision summary and issue link under `## Decisions so far`.
   - Graduate newly specifiable items from `## Not yet specified` into new decision tickets, and move ruled-out items to `## Out of scope`. When no open decision tickets remain, graduate or rule out every remaining item under `## Not yet specified` before proceeding.
6. While open decision tickets remain, return to `SKILL.md` § 2 (`Query state`) to resolve the next decision ticket. When none remain, close the map (`gh issue close <map-number> --comment "<summary>"`) and halt at Boundary 1 exit.

#### Subagent execution

Execute `research`, `prototype`, and `task` tickets in a `decide` subagent per [## Ticket types](#ticket-types). Read only the ticket body, its `## Answers` comments, and the map body.

- **Single-line settlement**: Close the ticket (`gh issue close <n> --comment "<settled decision and rationale>"`) and return `done` with `Evidence: None`.
- **Multi-line findings**: Post findings via `gh issue comment <n> --body-file <file>`, delete the temporary file immediately, close the ticket (`gh issue close <n>`), and return `done` with `Evidence: <comment-url>`.
- **Blocked on user input**: Leave the ticket open and return `questions`.

## Spec

Turn settled decisions into a high-level design specification published as a GitHub issue.
The specification provides cross-cutting architectural context that guides every ticket and review.
This phase is synthesis, not an open-ended interview.
When a point remains unsettled, ask the user directly instead of guessing.

### Spec process

1. **Gather settled context**: When a map exists for the feature, read the full map body via `gh issue view <map-number> --json body --jq .body` without `--comments`, copy `Request` and `Branch` from its `## Source`, and copy every entry from its `## Out of scope` section into the spec's `## Out of scope` section. Otherwise, read the confirmed `Request` from setup context (`#<n> (<original-title>): <confirmed request>` when sourced from an issue, or the confirmed request alone). When sourced from an issue (`ship-it #<n>`), also read the source issue body via `gh issue view <n> --json body --jq .body`, or its `## Original request` comment (`gh issue view <n> --json comments --jq '[.comments[] | select(.body | startswith("## Original request")) | .body]'`) when the map adopted that issue in place, as reference for original wording; the confirmed `Request` governs where it differs.
2. **Explore the codebase**: Run `git fetch origin <default-branch>`, and inspect `origin/<default-branch>` using read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. Warn the user when local `HEAD` diverges from `origin/<default-branch>`. Identify affected modules, shared contracts, data models, and system invariants using targeted searches, the repository's vocabulary, and Architecture Decision Records (ADRs).
3. **Define test seams**: Determine where and how to verify the feature using existing test runners and directories, preferring high-level seams with minimal touchpoints. For `fix` feature types, specify `Root cause: <mechanism>` and `Reproduction seam: <test or CLI command failing before fix>`. When automated tests do not apply, define direct checks rather than custom string-matching scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition). Confirm the verification seams with the user before drafting.
4. **Draft the spec**: Draft the specification using the template below, following [writing.md](writing.md). Write concise single-contract bullet points covering cross-cutting concerns.
   - **Keep spec altitude**: Follow the altitude rule in [Spec template](#spec-template). Prefer naming a module boundary over asserting unneeded existing behavior.
   - **Check subsystem cohesion**: Before pausing for approval, warn the user when a draft spans unrelated subsystems lacking a shared runtime contract or joint acceptance path. Suggest one spec per subsystem or a tighter cross-cutting altitude. Keep that subsystem warning strictly advisory without blocking publication after user approval.
   - **Obtain draft approval**: Pause and obtain explicit user approval of the draft before creating the GitHub issue.
5. **Publish the spec**:
   - **Sourced from `ship-it #<n>` without a map**: Run [source-issue adoption](plan.md#source-issue-adoption) with title `[<slug>] Spec: <gist>`, label `ship-it:spec`, and no `## Notes` bullet.
   - **Map exists or no source issue exists**: Leave `#<n>` untouched, write the spec body to a temporary payload file, create a new issue via `gh issue create`, and delete the temporary file immediately:

     ```shell
     gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec"
     ```

6. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing advances to Row 7 (spec validation).

### Spec template

Keep the spec at one altitude: behaviours, boundaries, and shared contracts.
Omit file paths, internal functions, and slice-local flags, except contracts registered in `## Decision Register`, public CLI or interface contracts the feature exposes, and the `Reproduction seam` command.
Write `Not applicable, because <reason>.` in any section without content.

```markdown
## Source

- **Request**: #<n> (<original-title>): <confirmed request> when sourced from an issue, or the confirmed request from setup. Pair with `Map: None` when adopted directly as the spec, or `Map: #<n>` when adopted as the map first.
- **Map**: #<map-number> (or "None")
- **Branch**: <type>/<slug>

## Problem

State the user problem and target outcome in two to four sentences without implementation mechanics.

## Observable behaviours

1. **<Behaviour>**: <Observable outcome>

## Module boundaries

Name each component or module involved and its responsibility.

## Shared contracts

State each interface, schema, state transition, invariant, and failure rule that two or more slices share.

## Decision Register

<Shared cross-slice thresholds, module homes, lifecycle timing rules, and shared external tool or CLI flags, or None>

## Deferred to slicing

<Slice-local detail that tickets resolve, or None>

## Testing seams

Name the modules and seams that receive coverage, or state direct checks per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
For `fix` specs, add `Root cause: <mechanism>` and `Reproduction seam: <test or CLI command failing before fix>`.

## Out of scope

List explicitly excluded capabilities.
```

### Spec remediation

When validation applies `ship-it:changes-requested` to the specification:

Conductors update the spec body directly via surgical edits without posting issue comments.
Conductors must never post comments or author `## Answers` headings during autonomous blocker resolutions or deferrals of slice-local questions.

1. **Read the report**: Read the spec comments via `gh issue view <spec-number> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Spec") or startswith("## Answers")) | .body]'` and select the latest `## Validation: Spec` report in-agent.
2. **Resolve cited Blockers**: Limit remediation edits to cited Blockers, settled cross-cutting guidance from `## Answers` comments, and any remaining slice-local `Clarifying Questions`:
   - **Active-code checks**: Run `git fetch origin <default-branch>`, and compare active-code claims against `origin/<default-branch>` using read-only git commands (`git --no-pager show` or `git --no-pager grep` on explicit paths) so local branches and dirty trees remain untouched. Warn the user when local `HEAD` diverges from `origin/<default-branch>`.
   - **Settled guidance**: Fold cross-cutting `## Answers` decisions into the spec body.
   - **Slice-local questions**: Append any remaining slice-local `Clarifying Questions` not already recorded by `SKILL.md` § 4 strictly to `## Deferred to slicing`. Apply that surgical edit (`gh issue edit <spec-number> --body-file <file>`, deleting the temporary file immediately) without prompting the user or posting a comment per `SKILL.md` § 4 (`Dispatch and verdicts`).
   - **Advisory warnings**: Leave advisory Warnings untouched. Editing warning-only sections expands the active edit surface on later validation passes. Warnings never trigger independent remediation passes or revalidation loops.

   Resolve every cited Blocker using one of four remediation paths while preserving untouched text verbatim:
   - **In-body edit**: Apply the minimal surgical edit (`gh issue edit <spec-number> --body-file <file>`, deleting the temporary file immediately) needed to remove the cited contradiction or architectural gap without adding unrequested claims. Route newly added cross-slice contract fixes to `## Decision Register` and single-slice implementation details to `## Deferred to slicing`.
   - **Defer to slicing**: Record slice-local details or caller edge cases under `## Deferred to slicing` without prompting the user.
   - **Descope**: Remove capabilities and record them under `## Out of scope` only after obtaining explicit user approval.
   - **Split scope**: Create a follow-up GitHub issue for the deferred work and link the issue under `## Out of scope` only after obtaining explicit user approval.
3. **Remove label**: Clear `ship-it:changes-requested` (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
4. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 7 (spec validation).

## Source-issue adoption

Publish a new map or spec when the phase precondition applies, using four parameters:

- **Precondition**: Applicability rule supplied by [plan.md](plan.md#charting-no-map-exists) or [plan.md](plan.md#spec-process).
- **Title**: `[<slug>] Map: <gist>` or `[<slug>] Spec: <gist>`.
- **Type label**: `ship-it:map` or `ship-it:spec`.
- **Notes bullet**: Optional line recorded under `## Notes` during in-place adoption.

When the precondition holds, follow these steps:

1. Present two interactive options:
   - **Option 1 (Recommended)**: `Adopt source issue #<n> in place (updates title, adds artifact label, keeps the original body as a comment, and replaces the body with the artifact template)`
   - **Option 2**: `Create a new issue (retains original source issue #<n> untouched as external reference)`
2. Write the artifact body to a temporary payload file per [writing.md](writing.md#shell-conventions).
3. On **Option 1**, keep the original request before replacing the body. Write `## Original request` and the current body (`gh issue view <n> --json body --jq .body`) to a second temporary file, post it with `gh issue comment <n> --body-file <file>`, and delete that file. Skip this comment when the body is empty. Then include the `## Notes` bullet when configured, and run:

   ```shell
   gh issue edit <n> --title "<title>" --add-label "<type-label>" --body-file <file>
   ```

4. On **Option 2**, leave source issue `#<n>` untouched and run:

   ```shell
   gh issue create --title "<title>" --body-file <file> --label "<type-label>"
   ```

5. Delete the temporary payload file immediately after `gh issue edit` or `gh issue create` completes.
