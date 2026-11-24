# Tickets: split a spec into session-sized slices

Break a validated spec into vertical tracer-bullet tickets that serve as the low-level design.
Each ticket gives its slice exact touchpoints and design deltas so the implementer faces zero design ambiguity.
Every feature produces at least one ticket.

## Process

### 1. Read the spec and explore the codebase

Read the validated spec body without comment queries, including `## Decision Register` and `## Deferred to slicing`.
Run `git fetch origin <default-branch>` and inspect `origin/<default-branch>` with read-only git commands on explicit paths, so local branches and dirty trees stay untouched.
Use targeted symbol and path searches anchored on the spec's modules and contracts to locate the files, symbols, types, and test suites each slice touches.
Look for prefactoring that simplifies later slices.
When a slice covers an enumerable source set, enumerate every member from the spec and active code.

### 2. Draft vertical slices

- Cut each slice as a narrow, complete path through every touched layer per [Slicing anti-patterns](#slicing-anti-patterns).
- Author each slice with the [Ticket template](#ticket-template), honoring `## Decision Register` entries.
- Cover every `## Deferred to slicing` entry across the ticket set.
- Emit `## Consolidation checklist` when `## Acceptance criteria` quantify over an enumerable source set (`every`, `all`, or `each`) without naming every member. List every member. Omit it on other tickets and on `ship-it:bug` tickets.
- Auto-resolve reversible slice-local defaults supported by active code or the spec, and record each for `## Auto-resolved Decisions`.
- Batch any irreversible scope, product-behaviour, or architecture Question and return `questions` with `Evidence: None` before creating any ticket.
- Put verification in every slice. Organize tests by domain seam per the [ticket-naming prohibition](writing.md#ticket-naming-prohibition), or state direct checks per the [ad-hoc test harness prohibition](writing.md#ad-hoc-test-harness-prohibition).
- For mechanical refactors across the codebase, use expand → migrate → contract.

### 3. Publish in dependency order

Publish blockers first so dependants can cite their numbers.
Title each issue `[<slug>] Ticket: <gist>`, apply `ship-it:ticket`, and write relationships per [Relationships](#relationships):

```shell
gh issue create --title "[<slug>] Ticket: <gist>" --body-file <file> --label "ship-it:ticket"
gh issue edit <n> --parent <spec-id> --add-blocked-by <blocker-id>
```

When defaults were auto-resolved, post one comment on `<spec>` with this format:

```markdown
## Auto-resolved Decisions
- **#<ticket>** [<section>]: <chosen reversible default> (<spec or active-code anchor>; reversible: <scope>)
```

Return `done` with `Issues: #<n>, ...`, and the comment URL in `Evidence:` when posted, or `Evidence: None`.

## Granularity thresholds

- **Lower bound**: Each ticket changes executable behaviour verified by tests or direct checks. Collapse work without a testable consumer seam.
- **Upper bound**: Keep each ticket inside one fresh context window and one coherent domain.
- **Precedence**: Slicing anti-patterns outrank size-driven splits. Split only when the upper bound breaks and every resulting slice keeps a testable vertical seam.
- **Small specs**: Default a compact, localized spec to one ticket.
- **Prefactoring**: Create a dedicated prefactoring ticket only when two or more later tickets use it, and sequence it first.

## Slicing anti-patterns

- **Docs-Tail**: A trailing ticket only for documentation. Bundle docs into the functional ticket.
- **Config-Preamble**: A first ticket declaring unused settings or dependencies. Fold them into the first consumer.
- **Horizontal Slice**: Separate tickets for data, logic, and interface. Cut vertically through all layers.
- **Orphaned Scaffolding**: Empty modules or stubs as a ticket. Create scaffolding inside the ticket that wires real callers.
- **Micro-Refactor**: A rename or cleanup ticket blocking functional work. Absorb it into the ticket touching those files.

## Complexity taxonomy

Assign each ticket a tier from its non-test source files, scope, and reasoning need. Assign the higher tier when non-file dimensions outrank the file count.

- **`low`**: 1–2 source files, direct checks, no architectural ambiguity.
- **`medium`**: 3–5 source files, a conventional vertical slice with routine edge cases.
- **`high`**: 6+ source files or cross-cutting subsystems, such as state machines, concurrency, or security paths.

## Ticket template

Tickets own the low-level design. Cite `Spec § <section>` for every spec-owned contract and never restate it.
Write `Not applicable, because <reason>.` in any section without content.

```markdown
Part of #<spec-id>

## Complexity

<level> - <One-sentence rationale based on scope, touched layers, and reasoning depth.>

## Slice goal

Name the vertical slice in one to two sentences and cite the `Spec § <section>` it implements.

## Low-level design

- **Touchpoints**: Name the exact files, modules, and symbols to create, modify, or remove.
- **Design deltas**: Specify slice-local symbol signatures, step order, state flow, failure handling, and boundaries with sibling tickets (what the slice introduces, leaves, or removes). Never write bare pointer stubs.

## Acceptance criteria

- [ ] <Self-contained, single-sentence imperative check, including edge cases and negative invariants>

<!-- Only when criteria quantify over an enumerable set without naming every member: -->
## Consolidation checklist

- [ ] <member>

## Blocked by

- [ ] Blocked by #<blocker-id>
```

Write `None (can start immediately).` under `## Blocked by` when no blockers exist.
Keep `## Acceptance criteria` self-contained with controlled vocabulary, even where that repeats the spec.
Omit line numbers and literal code blocks, and name exact paths, modules, and symbols.

## Relationships

Body text is the only relationship data the skill reads:

- **Write on creation**: Write `Part of #<spec-id>` on the first line and list blockers under `## Blocked by`. Then optionally decorate with native links in a separate `gh issue edit` call (`--parent <spec-id>` and `--add-blocked-by <blocker-id>`), ignoring its errors. No step reads native links.
- **Read on inspection**: A ticket's blockers are the `#<id>` entries under its `## Blocked by`, and its dependants are the open tickets whose `## Blocked by` names it. Its open direct dependency neighbors are its open blockers and dependants. Evaluate open tickets in ascending number order against the already-queried closed-ticket set, and stop at the first ticket whose blockers all have `state: "CLOSED"`.

## Remediation

When ticket-set validation applies `ship-it:changes-requested` to `<spec>`:

1. **Read**: Take the latest `## Validation: Ticket set` report, `## Answers`, and `## Auto-resolved Decisions` from the spec comments, and fetch the open tickets once per [writing.md](writing.md#bounded-search-truncation).
2. **Edit**: Fold settled `## Answers` into open ticket bodies, and resolve every Blocker with surgical body edits. Leave advisory Warnings untouched, because editing them removes `ship-it:validated` and widens revalidation.
   - Edit bodies directly. Post no ticket comments and no `## Answers`.
   - Post one `## Auto-resolved Decisions` comment on `<spec>` for each reversible slice-local default.
   - On bug tickets, correct the root cause, reproduction seam, or criteria. On feature tickets, fix the low-level design, create missing slices, and close redundant ones (`gh issue close <n> --reason "not planned"`).
   - Obtain user approval when a change alters scope.
   - **Consistency sweep**: When an edit changes a term, threshold, symbol home, or shared contract, reconcile every open ticket body in the same pass.
   - **Checklists**: Keep `## Consolidation checklist` items and their `- [x]` states. On a feature ticket with neither `ship-it:reviewed` nor `ship-it:changes-requested` and a `- [x]` item, keep the box only when a prior `## Review: Ticket` report exists, and reset it to `- [ ]` otherwise. Add new members unchecked.
3. **Labels**: Remove `ship-it:validated` only from edited, created, or split tickets and their open direct dependency neighbors. Retain it on untouched tickets.
4. **Clear**: Remove `ship-it:changes-requested` from `<spec>`.
5. **Continue**: Return to `SKILL.md` § 2 (`Query state`).

## Pre-validation gate

The conductor runs this inside Row 9 before dispatching `validate` (`Target: ticket-set`), on every path into Row 9 (slicing, remediation, bug preparation, a cap-halt reset, and folded answers).

1. **Read**: Run `gh issue list --search "[<slug>] in:title" --state open --limit 100 --json number,title,body,labels`, check truncation per [writing.md](writing.md#bounded-search-truncation), and reconcile with `gh issue view <n> --json number,title,body,labels` for issues the preceding action returned or edited.
2. **Filter**: Keep only open issues whose title starts with `[<slug>]` or whose number the preceding action returned or edited. Exclude `ship-it:spec`, `ship-it:map`, decision-ticket labels (`ship-it:research`, `ship-it:prototype`, `ship-it:grilling`, `ship-it:task`), and `ship-it:bug` issues lacking `ship-it:ticket`.
3. **Repair directly** (no subagent; temporary `--body-file` payloads, deleted immediately):
   - A missing or malformed `[<slug>] ` title prefix (`gh issue edit <n> --title ...`).
   - A missing `ship-it:ticket` label (`gh issue edit <n> --add-label "ship-it:ticket"`).
   - A missing `Part of #<spec>` header.
   - A non-canonical `## Blocked by` tasklist: normalize to `- [ ] Blocked by #<id>` or `None (can start immediately).`, stripping self-links and duplicates.
   - An under-tiered `## Complexity` below the [taxonomy](#complexity-taxonomy) bands (`low` 1–2, `medium` 3–5, `high` 6+ non-test source files): raise the tier and update the rationale to state the touched source-file count. Keep higher tiers justified by non-file dimensions, skip `ship-it:bug` tickets, and leave a missing or invalid tier to `validate`.
4. **Invalidate and halt**: Strip `ship-it:validated` from every ticket the gate edited and its open direct dependency neighbors (per [Relationships](#relationships)). Halt and ask the user when the open blocker graph holds a multi-ticket semantic cycle.

## Bug preparation

Diagnose an open `ship-it:bug` issue lacking `ship-it:ticket`, define a reproduction seam, and format the issue as a bug ticket.
File bug issues as `[<slug>] <gist>` with `ship-it:bug`.

1. **Investigate**: Read the bug issue, its parent spec, and its `## Answers`. Check out `<branch>` when it exists, or `origin/<default-branch>` otherwise, and locate the defect by targeted search. When an unwritten product fact blocks diagnosis, post the questions on the bug issue and return `questions` without adding `ship-it:ticket`.
2. **Reproduce**: Find or verify a targeted test or CLI command that fails reliably before any fix. Discard temporary edits afterward.
3. **Persist**: Write the body with the template below, run `gh issue edit <n> --body-file <file> --add-label "ship-it:ticket"`, and keep `ship-it:bug` as provenance.
4. **Link**: Optionally add `--parent <spec-id>`, ignoring errors per [Relationships](#relationships).
5. **Return**: `done` with `Evidence: None`.

```markdown
Part of #<spec-id>

## Complexity

<level> - <One-sentence rationale.>

## Root cause

<mechanism>

## Reproduction seam

<test or CLI command failing before fix>

## Acceptance criteria

- [ ] <Self-contained, single-sentence imperative check>

## Blocked by

None (can start immediately).
```
