# Spec: synthesize settled decisions

Turn settled decisions into a high-level design specification published as a GitHub issue.
The specification provides cross-cutting architectural context that guides every ticket and review.
This phase is synthesis, not an open-ended interview.
When a point remains unsettled, ask the user directly instead of guessing.

## Process

1. **Gather settled context**: When a map exists for the feature, read the full map body via `gh issue view <map-number> --json body --jq .body` without `--comments`. When sourced from an issue (`ship-it #<n>`), read the source issue body via `gh issue view <n> --json body --jq .body`. Otherwise, read the verbatim directive text from setup.
2. **Explore the codebase**: Ground the specification in active code using targeted symbol and path searches rather than full-repository directory scans. Read relevant interface and module sections to identify affected modules, shared contracts, data models, and system invariants. Use the repository's vocabulary and respect existing Architecture Decision Records (ADRs).
3. **Define test seams**: Determine where and how to verify the feature using existing test runners and directories, preferring high-level seams with minimal touchpoints. For `fix` feature types, specify `Root cause: <mechanism>` and `Reproduction seam: <test or CLI command failing before fix>`. When automated tests do not apply, define direct checks rather than custom string-matching scripts per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition). Confirm the verification seams with the user before drafting.
4. **Draft the spec**: Draft the specification using the template below, following [writing.md](writing.md). Write concise single-contract bullet points covering cross-cutting concerns. Pause and obtain explicit user approval of the draft before creating the GitHub issue.
5. **Publish the spec**:
   When sourced from `ship-it #<n>` without a map, prompt the user with interactive options:
   - Option 1 (Recommended): `Adopt source issue #<n> in place (updates title, adds artifact label, and overwrites body with the artifact template)`
   - Option 2: `Create a new issue (retains original source issue #<n> untouched as external reference)`
   On Option 1, execute atomic edit:

   ```shell
   gh issue edit <n> --title "[<slug>] Spec: <gist>" --add-label "ship-it:spec" --body-file <file>
   ```

   On Option 2, when a map exists, or when not sourced from an issue, create a new issue and leave source issue `#<n>` untouched:

   ```shell
   gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec"
   ```

   Delete the temporary body file immediately after executing `gh issue edit` or `gh issue create`.

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
Conductors must never post comments or author `## Answers` headings for autonomous blocker resolutions.

1. **Read the report**: Inspect the latest validation report via `gh issue view <spec-number> --json comments --jq '[.comments[].body | select(index(({Validation:1}|keys[])) == 3)] | last // empty'`.
2. **Resolve cited Blockers**: Fold settled answers from `## Answers` comments into the spec body.
   Conductors may opportunistically fold advisory warnings into spec bodies while editing for blockers or while folding answers from questions.
   Warnings never trigger independent remediation passes or revalidation loops.

   Resolve every cited Blocker using one of four remediation paths while preserving untouched text verbatim:
   - **In-body edit**: Apply surgical edits to the spec body (`gh issue edit <spec-number> --body-file <file>`, deleting the temporary file immediately) to resolve high-level architectural gaps.
   - **Defer to slicing**: Record slice-local details or caller edge cases directly in the spec body for ticket slicing without prompting the user.
   - **Descope**: Remove capabilities and record them under `## Out of Scope` only after obtaining explicit user approval.
   - **Split scope**: Create a follow-up GitHub issue for the deferred work and link the issue under `## Out of Scope` only after obtaining explicit user approval.
3. **Remove label**: Clear `ship-it:changes-requested` (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
4. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 7 (spec validation).
