# Writing and Clarity Standard

Technical prose in `ship-it` must be clear, concise, and scannable. This standard defines seven core authoring rules for all documentation and lifecycle artifacts.

## Core Rules

| Rule | Requirement | Example |
| :--- | :--- | :--- |
| **1. Sentence Brevity** | Express at most one idea or instruction per sentence. Keep phrasing tight, focused, and natural without wandering compound clauses. | *Good*: Run the test suite before submitting the pull request. |
| **2. Voice and Mood** | Use imperative mood for instructions and procedures. Use active voice for descriptive statements. | *Good*: Inspect the diff for unhandled errors. The test runner executes tests. |
| **3. Noun Clusters** | Restrict consecutive noun strings to at most three words. Break longer chains with prepositions. | *Good*: Protocol to prevent context leakage (*not* session context token leakage prevention protocol). |
| **4. Affirmative Phrasing** | State what to do directly. Avoid double negatives and negative constructions when an affirmative instruction exists. | *Good*: Retain existing comments (*not* do not fail to avoid deleting existing comments). |
| **5. High Scannability** | Structure text with bulleted lists, bold lead-ins, short paragraphs, and clear tables. Keep paragraphs under four sentences. | Use bulleted lists for multi-item sequences. |
| **6. Controlled Vocabulary** | Use one consistent term per concept across all files. State explicit antecedents instead of bare pronouns like "this" or "it". | *Good*: The ticket defines acceptance criteria (*not* It defines them). |
| **7. Single Source of Truth** | State each requirement, contract, or decision once in its canonical section. Reference parent sections from child `ship-it` artifacts instead of restating parent content. | *Good*: Implement the retry policy in Spec § Implementation Decisions (*not* restating the full retry contract in the ticket). |

## Application Across Artifacts

Apply these seven rules across all `ship-it` documentation, maps, specs, tickets, validation reports, and reviews.
Scope Rule 7 cross-referencing to `ship-it` GitHub artifacts, commit subjects (`(#<ticket>)`), and pull request descriptions, closing lists, and file annotations rather than durable source files.
Apply section-scoped precedence inside tickets:
- **Ticket acceptance criteria**: Prioritize self-contained verification over cross-referencing under Rule 7 while preserving controlled vocabulary under Rule 6.
- **Slice goal and low-level design**: Prioritize cross-referencing under Rule 7 over restatement inside `## Slice goal` and for spec-owned contracts inside `## Low-level design`, while keeping slice-local `Design deltas` concrete.

Evaluate clarity and brevity qualitatively through direct inspection. Never write scripts to count words, parse sentence lengths, or measure text metrics. Mechanical word counters optimize for arbitrary metrics instead of reader clarity and waste tool turns.

## Universal Testing Standards

### Ticket-naming prohibition

Never name test or source files after issue numbers (such as `ticket-18.test.js`).
Tests outlive issues.
Organize tests by domain, module, or feature seam (such as `tests/auth.test.ts`).

### Ad-hoc test harness prohibition

Never invent test runners or string-matching scripts to simulate coverage for non-code changes.
A string match passes whenever the text exists, so it proves presence rather than behavior.

### Transient-reference prohibition

Omit `Spec § ...` citations, ticket identifiers, and `#<n>` issue references from product code, tests, code comments, and docstrings.
Follow local repository rules when `CONTRIBUTING.md`, style guides, or repository conventions explicitly require issue references in comments or tests.
Exempt Git workflow records from this prohibition: commit subjects (`(#<ticket>)`), pull request descriptions, closing lists, and pull request `**Traces to**:` annotations retain required traceability.

## Cross-platform shell conventions

- **Shell floor**: Run commands in POSIX shells or `pwsh` 7.4 or later on Windows. Windows PowerShell 5.1 is unsupported.
- **Multi-line bodies**: Use a file-writing tool or a single-quoted PowerShell here-string (`@' ... '@`) instead of Bash heredocs or double-quoted PowerShell strings (`"..."`) so Markdown backticks stay literal. Write multi-line text to a temporary file, pass `--body-file <path>` or `-F body=@<path>`, and delete the temporary file once the `gh` command completes.
- **Surgical body edits**: Fetch the raw issue body (`gh issue view <n> --json body --jq .body`) to a temporary file, and edit only the target section with a file-editing tool so remaining sections and `- [ ]` tasklists stay intact. Inspect the diff with `git --no-pager diff --no-index`. Apply the update via `gh issue edit <n> --body-file <path>`, then delete the temporary file.
- **Diff exit codes**: Treat exit code `1` from `git diff --no-index` as differences detected rather than command failure.
- **Single-quoted `--jq` filters**: Single-quote the whole `--jq` argument and write jq string literals in double quotes inside it. Use field selection and prefix slicing (such as `.body`, `[.comments[].body]`, or `[.comments[].body[:120]]`) for bounded reads. Filter comment headings and verdict lines in-agent or in the `--jq` query.
- **PowerShell special characters**: Quote `"@me"` (`--add-assignee "@me"`) and `"repos/{owner}/{repo}/..."` in `gh api` calls. PowerShell parses unquoted `@me` as a splat expression and unquoted `{owner}` as a script block.
- **Title prefix**: Prefix every issue and pull request title with `[<slug>]`, except leftover-idea issues filed on the narrow intake path.
- **Explicit-path search**: Supply an explicit file or directory path in every `rg`, `grep`, or `find` search (`rg -n "pattern" skills/ship-it/` or `grep -rn "pattern" .`) so searches target paths rather than standard input. Reserve pathless `grep` or `rg` exclusively for upstream pipeline filters (`<cmd> | grep -q ...`). On Windows, unpathed `find` invokes `find.exe` against standard input.
- **Non-stdin execution**: Pass non-interactive flags (such as `--yes`) and set `GIT_TERMINAL_PROMPT=0` in POSIX shells or `$env:GIT_TERMINAL_PROMPT = '0'` in `pwsh` for commands that might prompt. Pipe `$null | <cmd>` in `pwsh`, or redirect `< /dev/null` in POSIX shells, when a command might read standard input in a non-TTY shell. PowerShell reserves the `<` operator and rejects `< /dev/null` and `< NUL`.
- **Non-pager CLI invocation**: Suppress interactive pagers in `git` and `gh` using `git --no-pager <subcommand>` or structured output (`gh ... --json ... --jq '...'`). When no non-paged flag applies, set inline `GIT_PAGER=cat` or `GH_PAGER=cat` in POSIX shells, or set `$env:GIT_PAGER = 'cat'` or `$env:GH_PAGER = 'cat'` in `pwsh`.
- **Command chaining**: Chain dependent commands with `&&` or `||` in POSIX shells and `pwsh` 7.4 or later.
- **Transient write retry**: Inspect target state before retrying once when `gh issue edit`, `gh issue create`, `gh issue comment`, `gh issue close`, `gh pr create`, `gh pr edit`, `gh pr reopen`, or a `gh api` comment write fails with a transient GraphQL, HTTP 5xx, or timeout error. Retain any temporary `--body-file` until the retry completes. Retry once only when inspection confirms the mutation is absent from target state; route to [preflight.md](preflight.md) (conductor) or return `failed` (subagent) on repeated or non-transient errors:
  - **Issue edits and closes**: `gh issue view <n> --json title,body,labels,assignees,state`
  - **Issue comments**: `gh issue view <n> --json comments --jq '[.comments[-3:][].body[:120]]'`
  - **Issue creates**: `gh issue list --state open --limit 100 --json number,title` (checking the returned count per [bounded search truncation](#bounded-search-truncation) before matching the expected title in-agent)
  - **Pull request create, edit, or reopen**: `gh pr list --head "<branch>" --state all --json number,state,url` and `gh pr view <pr> --json state,body`
  - **Comments on pull request files**: `gh api "repos/{owner}/{repo}/pulls/<pr>/comments?per_page=100" --jq '[.[] | {path, commit_id, body: .body[:120]}]'`

## Bounded search truncation

Check the returned item count after every `gh` query that specifies `--limit 100`.

- **Threshold warning**: Emit `"Warning: Search returned 100 results; GitHub search may be truncated."` whenever the query returns 100 items.
- **Subagent reporting**: Embed that warning inside the GitHub output of isolated subagents (`### Warnings` for `validate`, `## Review: Final` for `final-review`, or the pull request body for `close-out`). Subagents then continue, because a truncated audit list narrows coverage instead of recreating artifacts.
- **Return block**: Preserve the four-line return block defined in [isolation.md](isolation.md).
