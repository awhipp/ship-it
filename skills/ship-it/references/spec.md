# Spec: synthesize settled decisions

Turn settled decisions into a high-level design specification published as a GitHub issue.
The specification provides cross-cutting architectural context that guides every ticket and review.
This phase is synthesis, not an open-ended interview.
When a point remains unsettled, ask the user directly instead of guessing.

## Process

1. **Gather settled context**: When a map exists for the feature, read "Decisions so far" via `gh issue view <map-number>` and inspect any referenced decision tickets. Otherwise, read the directive text or source issue from setup.
2. **Explore the codebase**: Ground the specification in active code using targeted symbol and path searches rather than full-repository directory scans. Read relevant interface and module sections to identify affected modules, shared contracts, data models, and system invariants. Use the repository's vocabulary and respect existing Architecture Decision Records (ADRs).
3. **Define test seams**: Determine where and how to verify the feature using existing test runners and directories. Prefer high-level seams with minimal touchpoints. When automated tests do not apply, define direct checks rather than custom string-matching scripts per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition). Confirm the verification seams with the user before drafting.
4. **Draft the spec**: Draft the specification using the template below, following [writing.md](writing.md). Pause and obtain explicit user approval of the draft before creating the GitHub issue.
5. **Publish the spec**: Create the issue with `--body-file`:

   ```shell
   gh issue create --title "[<slug>] Spec: <gist>" --body-file <file> --label "ship-it:spec"
   ```

6. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing advances to Row 7 (spec validation).

## Spec template

```markdown
## Source

- **Request**: > <directive text or issue #n body, verbatim>
- **Map**: #<map-number> (or "None")
- **Branch**: <type>/<slug>

## Problem Statement

Describe the user problem from the user perspective, following [writing.md](writing.md).

## Solution

Describe the proposed solution from the user perspective, following [writing.md](writing.md).

## User Stories

Numbered list covering the complete feature surface area:

1. As a <actor>, I want <feature>, so that <benefit>.

## Implementation Decisions

State the high-level design and cross-cutting context that govern the entire feature:
- **Architecture and module boundaries**: Name the components, modules, or subsystems involved and define their responsibilities.
- **Contracts and schemas**: Specify shared interfaces, API contracts, data models, and state transitions across components.
- **Cross-cutting invariants and failure handling**: State error-handling rules, edge-case policies, backward-compatibility constraints, and system invariants.

Omit line numbers and low-level function bodies unless a prototype established a concrete schema or state machine.

## Testing Decisions

State the verification strategy aligned with workspace conventions and existing test runners.
Name the domain modules and seams that receive coverage, or state the direct checks without inventing custom test scripts per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).

## Out of Scope

List explicitly excluded capabilities.

## Further Notes

State additional context or operational constraints.
```

## Remediation

When validation applies `ship-it:changes-requested` to the specification:

1. **Read the report**: Inspect the validation report and any `## Answers` comments via `gh issue view <spec-number> --comments`.
2. **Update the spec**: Resolve every Blocker in the issue body (`gh issue edit <spec-number> --body-file <file>`). Obtain user approval when a fix changes scope or architecture.
3. **Post resolution comment**: Explain the fix for each Blocker (`gh issue comment <spec-number> --body "<text>"`).
4. **Remove label**: Clear `ship-it:changes-requested` (`gh issue edit <spec-number> --remove-label "ship-it:changes-requested"`).
5. **Continue the routing loop**: Return to `SKILL.md` § 2 (`Query state`). Routing re-runs Row 7 (spec validation).
