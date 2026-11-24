# Plan: intake, map, and spec

Intake starts a feature, a map settles open decisions, and the spec turns them into a high-level design.

## Intake

Run only for a new feature. Hold the confirmed `Request` in context until first publication.

1. **Clarify**: Check whether the request answers **goal**, **success criteria**, **constraints**, and **scope** with concrete, checkable statements (a passing mention is unanswered). When all four are answered, state the skip in one line and keep the verbatim request as `Request`. Otherwise ask one batch of at most four questions on the unanswered topics (interactive question tool when available) and end the turn. On "skip" or a decline, keep the verbatim request.
2. **Check size**: Judge whether the request fits one spec. When too big, state why and ask the user to choose **narrow the feature** or **proceed as is**, ending the turn. Flag the request for step 6 on **proceed as is**.
3. **Confirm**: On the narrow path, draft the narrowed request and ask the user to confirm it. Otherwise, when step 1 asked questions, restate the request refined by the answers and ask for confirmation. End the turn each time, and on rejection revise and re-confirm. Skip confirmation when step 1 was skipped or declined and step 2 did not narrow.
4. **Slug and type**: Propose a kebab-case slug and a Conventional Commits type (`feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`, `build`, `ci`). Check it with `gh issue list --search "[<slug>] in:title" --state all --limit 100 --json title`. Treat it as taken when any title starts with `[<slug>]` or 100 results return ([truncation warning](writing.md#bounded-search-truncation)), and propose another.
5. **Source issue**: From `ship-it #<n>`, capture the issue title and number for in-place adoption, and format `Request` as `#<n> (<original-title>): <confirmed text>`.
6. **Choose the path**: Ask the user to confirm the slug and type, and to choose charting a map or writing the spec directly. Recommend a map when the idea leaves a scope or architecture decision open, or when step 2 flagged the request.

## The map

The map is an issue titled `[<slug>] Map: <destination gist>` with the `ship-it:map` label. Keep `## Notes` and `## Decisions so far` to single-sentence bullets (a summary and issue link per closed decision ticket):

```markdown
## Source

- **Request**: <confirmed request; `#<n> (<original-title>): <text>` when sourced from an issue>
- **Branch**: <type>/<slug>

## Destination

<What completing this map produces.>

## Notes

## Decisions so far

## Not yet specified

<Anticipated questions that depend on open decisions.>

## Out of scope

<Ruled-out work, with a brief rationale.>
```

Each decision ticket is a child issue titled `[<slug>] <Type>: <question gist>` with its type label. Its body is `Part of #<map-id>`, `## Question` (one sentence), and `## Blocked by` (`- [ ] Blocked by #<blocker-id>` per blocker).

## Ticket types

- **Research** (`ship-it:research`): A fact in documentation, APIs, or source. Record the answer.
- **Prototype** (`ship-it:prototype`): An appearance or behavior question that needs a throwaway artifact.
- **Grilling** (`ship-it:grilling`): A decision needing user input. Ask one question per turn, and never answer for the user.
- **Task** (`ship-it:task`): Setup work a decision needs.

Make a ticket of every question with clear phrasing now, even when blocked. Park questions that depend on open decisions under `## Not yet specified`, and out-of-destination work under `## Out of scope`. Reserve tickets for architecture, scope, or user-preference forks.

## Process

### Charting (no map exists)

1. Grill the user, one question per turn, to settle the destination.
2. Publish the map. From `ship-it #<n>`, run [source-issue adoption](#source-issue-adoption) with title `[<slug>] Map: <gist>`, label `ship-it:map`, and Notes bullet `- Adopted in place from source issue #<n> (<original-title>).`. Otherwise run `gh issue create --title "[<slug>] Map: <gist>" --body-file <file> --label "ship-it:map"`.
3. Create a decision ticket for every question with clear phrasing, then decorate with `gh issue edit <n> --parent <map-id> --add-blocked-by <blocker-id>`, ignoring errors. Continue into resolving.

### Resolving (map is open)

1. Read the map body (`gh issue view <map-number> --json body --jq .body`). Take decision tickets from the state query.
2. Claim (`gh issue edit <n> --add-assignee "@me"`) the lowest-numbered open decision ticket whose blockers are all closed. When all are blocked, report each with its open blockers and halt.
3. Resolve by type. `research`, `prototype`, and `task`: dispatch `decide` per [isolation.md](isolation.md). `grilling`: ask in the conductor until settled, then close with `--comment`, or post multi-line findings (`gh issue comment <n> --body-file <file>`) and `gh issue close <n>`.
4. Update the map body (`gh issue edit <map-number> --body-file <file>`): append the decision summary and link under `## Decisions so far`, graduate newly specifiable `## Not yet specified` items into tickets, and move ruled-out items to `## Out of scope`. When no open tickets remain, graduate or rule out every remaining item.
5. While open decision tickets remain, return to `SKILL.md` § 2. When none remain, close the map (`gh issue close <map-number> --comment "<summary>"`) and halt at Boundary 1 exit.

#### Subagent execution

`decide` reads only the ticket body, its `## Answers`, and the map body. It closes the ticket with `--comment "<decision and rationale>"` and returns `done` with `Evidence: None`, or posts multi-line findings (`gh issue comment <n> --body-file <file>`), closes, and returns `done` with `Evidence: <comment-url>`. When blocked on the user, it leaves the ticket open and returns `questions`.

## Spec

Publish settled decisions as a high-level design for every ticket and review. This is synthesis, so ask the user about any unsettled point.

### Spec process

1. **Gather context**: With a map, read its body and copy `Request`, `Branch`, and every `## Out of scope` entry. Otherwise use the confirmed `Request` from intake. When an issue sourced the request, also read its body (or its `## Original request` comment after in-place adoption) for original wording. The confirmed `Request` governs where they differ.
2. **Explore**: Run `git fetch origin <default-branch>` and inspect `origin/<default-branch>` with read-only git commands on explicit paths, leaving local branches untouched. Warn when local `HEAD` diverges. Identify affected modules, contracts, and invariants via search and ADRs.
3. **Define test seams**: Prefer high-level seams in existing runners, or direct checks per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition). Confirm them with the user before drafting.
4. **Draft** with the [template](#spec-template) and [writing.md](writing.md). Warn (advisory) when the draft spans unrelated subsystems with no shared runtime contract. Obtain explicit user approval before creating the issue.
5. **Publish**: From `ship-it #<n>` without a map, run [source-issue adoption](#source-issue-adoption) with title `[<slug>] Spec: <gist>`, label `ship-it:spec`, and no Notes bullet. Otherwise leave `#<n>` untouched and run `gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec"`.
6. **Continue**: Return to `SKILL.md` § 2 (Row 7 validates).

### Spec template

Keep one altitude: behaviours, boundaries, and shared contracts.
Omit file paths, internal functions, and slice-local flags, except contracts registered in `## Decision Register`, public CLI or interface contracts the feature exposes, and the `Reproduction seam` command.

```markdown
## Source

- **Request**: <confirmed request; `#<n> (<original-title>): <text>` when sourced from an issue>
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

Name the covered modules and seams, or state direct checks.
For `fix` specs, add `Root cause: <mechanism>` and `Reproduction seam: <test or CLI command failing before fix>`.

## Out of scope

List explicitly excluded capabilities.
```

### Spec remediation

When validation applies `ship-it:changes-requested`, edit the spec body directly (`gh issue edit <spec-number> --body-file <file>`). Post no comments and no `## Answers`.

1. **Read**: `gh issue view <spec-number> --json comments --jq '[.comments[] | select(.body | startswith("## Validation: Spec") or startswith("## Answers")) | .body]'`, and take the latest report.
2. **Resolve**: Limit edits to cited Blockers and settled `## Answers`. Check active-code claims against fetched `origin/<default-branch>`. Leave advisory Warnings alone, since editing them widens later validation.
   - **Edit**: Apply the minimal fix for the cited contradiction or gap. Route new cross-slice contract fixes to `## Decision Register`.
   - **Defer**: Record slice-local details and caller edge cases under `## Deferred to slicing`, with no prompt.
   - **Descope** or **split scope**: Only after explicit user approval, record the capability under `## Out of scope`, or file a follow-up issue and link it there.
3. **Clear and continue**: Run `gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`, then return to `SKILL.md` § 2 (Row 7 revalidates).

## Source-issue adoption

Publish a map or spec from `ship-it #<n>` by adopting `#<n>` in place, with the caller's title, type label, and optional Notes bullet.

1. Post a comment of `## Original request` plus the current body (`gh issue view <n> --json body --jq .body`), skipping it when the body is empty.
2. Run `gh issue edit <n> --title "<title>" --add-label "<type-label>" --body-file <file>`, with the Notes bullet in the body when configured.
