# Bug preparation

Inspect an open `ship-it:bug` issue lacking `ship-it:ticket`, diagnose the root cause, define a reproduction seam, and format the bug ticket for execution without re-slicing the feature.
File bug issues as `[<slug>] <gist>` with the `ship-it:bug` label so routing discovers the issues.

## Preparation process

1. **Investigate active code**: Read the bug issue body and parent spec body via `gh issue view <n> --json body --jq .body` without reading comments. Fetch `origin/<default-branch>` (and `origin/<branch>` when present on `origin`), check out `<branch>` when present or `origin/<default-branch>` otherwise, and locate the defect mechanism using targeted symbol and path searches rather than full-repository scans. When unwritten product facts block diagnosis, post the questions on the bug issue (`gh issue comment <n> --body-file <file>`, deleting the temporary file immediately) and return `questions` without adding `ship-it:ticket`.
2. **Establish reproduction seam**: Identify or verify a targeted test or CLI command that fails reliably before code changes. Discard any temporary workspace edits after verification so the working tree stays clean.
3. **Persist bug ticket**: Write the formatted bug ticket body (following the template below, including `Part of #<spec-id>`) to a temporary file. Update the issue and apply `ship-it:ticket` (`gh issue edit <n> --body-file <file> --add-label "ship-it:ticket"`), then delete the temporary file immediately. Retain `ship-it:bug` to preserve defect provenance.
4. **Link parent spec**: Optionally attempt native parent linking (`gh issue edit <n> --parent <spec-id>`), ignoring errors per [tickets.md](tickets.md#relationships). Fresh-context validation runs next.
5. **Handoff**: Return `done` with `Evidence: None`.

## Bug ticket template

```markdown
Part of #<spec-id>

## Complexity

<level> - <Single-sentence rationale justifying the chosen level based on scope, touched layers, and reasoning depth.>

## Root cause

<mechanism>

## Reproduction seam

<test or CLI command failing before fix>

## Acceptance criteria

- [ ] <Single-sentence imperative verification or edge-case check adhering to writing.md>

## Blocked by

None (can start immediately).
```
