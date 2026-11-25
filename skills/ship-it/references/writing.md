# Writing and Clarity Standard

Technical prose in `ship-it` must be clear, concise, and scannable. This standard defines three core authoring rules for all documentation and lifecycle artifacts.

## Core Rules

| Rule | Requirement |
| :--- | :--- |
| **1. Sentence Brevity** | Express at most one idea or instruction per sentence. Keep phrasing tight without wandering compound clauses. |
| **2. Controlled Vocabulary** | Use one consistent term per concept across all files. State explicit antecedents instead of bare pronouns like "this" or "it". |
| **3. Single Source of Truth** | State each requirement, contract, or decision once in its canonical section. Reference parent sections from child `ship-it` artifacts instead of restating parent content. |

## Application Across Artifacts

Apply these three rules across all `ship-it` documentation, maps, specs, tickets, validation reports, and reviews.
Scope Rule 3 cross-referencing to `ship-it` GitHub artifacts, commit subjects (`(#<ticket>)`), and pull request descriptions, closing lists, and file annotations rather than durable source files.
Apply section-scoped precedence inside tickets:
- **Ticket acceptance criteria**: Prioritize self-contained verification over cross-referencing under Rule 3 while preserving controlled vocabulary under Rule 2.
- **Slice goal and low-level design**: Prioritize cross-referencing under Rule 3 over restatement inside `## Slice goal` and for spec-owned contracts inside `## Low-level design`, while keeping slice-local `Design deltas` concrete.

Every template section accepts `Not applicable, because <reason>.` in place of content.

Evaluate the three Core Rules qualitatively by direct inspection. Never write scripts to count words, parse sentence lengths, or measure text metrics. Mechanical word counters optimize for arbitrary metrics instead of reader clarity and waste tool turns.

## Universal Testing Standards

### Ticket-naming prohibition

Never name test or source files after issue numbers (such as `ticket-18.test.js`).
Tests outlive issues.
Organize tests by domain, module, or feature seam (such as `tests/auth.test.ts`).

### Ad-hoc test harness prohibition

Never invent test runners or string-matching scripts to simulate coverage for non-code changes.
A string match passes whenever the text exists, so it proves presence rather than behavior.

### Transient-reference prohibition

Omit `Spec § ...` citations, ticket identifiers, and `#<n>` issue references from product code, tests, code comments, docstrings, and repository documentation files.
Follow local repository rules when `CONTRIBUTING.md`, style guides, or repository conventions explicitly require issue references in comments or tests.
Exempt Git workflow records from this prohibition: commit subjects (`(#<ticket>)`), pull request descriptions, closing lists, and pull request `**Traces to**:` annotations retain required traceability.

## Shell conventions

- **Payloads**: Write multi-line text to a temporary file, pass `--body-file <path>`, and delete the file once `gh` completes.
- **`--jq` filters**: Single-quote the whole filter and write jq string literals in double quotes.
- **Title prefix**: Prefix every issue and pull request title with `[<slug>]`.
- **Other conventions**: Read [preflight.md](preflight.md#shell-conventions) when a command misbehaves.

## Bounded search truncation

Check the returned item count after every `gh` query that specifies `--limit 100`.

- **Threshold warning**: Emit `"Warning: Search returned 100 results; GitHub search may be truncated."` whenever the query returns 100 items.
- **Subagent reporting**: Embed that warning inside the GitHub output of isolated subagents (`### Warnings` for `validate`, `## Review: Final` for `final-review`, or the pull request body for `close-out`). Subagents then continue, because a truncated audit list narrows coverage instead of recreating artifacts.