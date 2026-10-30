---
name: skill-audit
description: "Audits the ship-it skill, reference files, and README.md for agentskills.io compliance, cross-harness portability, large-codebase efficiency, SSOT/DRY hygiene, and writing clarity. Runs in two human-gated steps: Step 1 audits and proposes findings for review; Step 2 implements approved fixes on a branch and opens a PR. Manual-only workflow: invoke only when the user explicitly types skill-audit or /skill-audit."
compatibility: Git repository, GitHub CLI (gh) 2.94.0 or later, and a cross-platform shell.
disable-model-invocation: true
---

# Skill Audit

Audit and maintain [`skills/ship-it/SKILL.md`](../../../skills/ship-it/SKILL.md), [`skills/ship-it/references/`](../../../skills/ship-it/references/), [`README.md`](../../../README.md), and [`.agents/skills/skill-audit/SKILL.md`](SKILL.md) across two human-gated steps.
Step 1 inspects the repository and proposes findings without modifying files.
Step 2 applies human-approved fixes on a dedicated branch, verifies the changes with a fresh subagent pass, and opens a pull request.

## Hard guardrails

1. **Preserve core intent and functionality.** Keep `ship-it`'s five phases, three boundaries, first-match routing table, zero-assumption verification, two-tier isolation, two-axis review, annotated pull requests, and GitHub-native state intact unless the user explicitly directs a behavioral change.
2. **Respect the two-step human gate.** Run Step 1 as a read-only audit and halt after presenting the findings table. Modify files only in Step 2 after the user approves or selects specific findings.
3. **Follow the writing standard.** Write every skill instruction, reference section, and `README.md` update per [`writing.md`](../../../skills/ship-it/references/writing.md).
4. **Never merge a pull request.** Push the audit branch and open the pull request for human review.

## Step 1: Audit and propose (read-only)

Read [`skills/ship-it/SKILL.md`](../../../skills/ship-it/SKILL.md), every file in [`skills/ship-it/references/`](../../../skills/ship-it/references/), [`README.md`](../../../README.md), and [`.agents/skills/skill-audit/SKILL.md`](SKILL.md).
Evaluate every file against these five audit axes:

### 1. `agentskills.io` and cross-harness compliance

- **Frontmatter validity**: Confirm `SKILL.md` starts with valid YAML frontmatter where `name` matches the parent folder (`1–64` lowercase alphanumeric or hyphen characters) and `description` is `1–1024` characters written in third person with explicit trigger conditions.
- **No XML tags in frontmatter**: Confirm the YAML frontmatter contains zero `<` or `>` characters so system prompt parsers never misinterpret placeholders as XML tags.
- **One-level progressive disclosure**: Confirm `SKILL.md` links directly to its `references/*.md` files (`<500` lines each) and that cross-phase citations inside reference files are self-explanatory inline so subagents load only their assigned reference file plus `writing.md`.
- **Harness agnosticism**: Confirm instructions avoid vendor-specific model switches, proprietary configuration files, or single-harness assumptions. Verify [`isolation.md`](../../../skills/ship-it/references/isolation.md) requires execution-capable subagents with shell and file-writing tools rather than read-only exploration subagents.
- **Cross-platform shell and temp-file hygiene**: Confirm [`preflight.md`](../../../skills/ship-it/references/preflight.md) and [`implement.md`](../../../skills/ship-it/references/implement.md) quote PowerShell special characters (`"@me"`, `"repos/{owner}/{repo}/..."`), use `--body-file` instead of heredocs, clean up temporary `--body-file` payloads immediately, and stage explicit file paths (`git add <file>...`).

### 2. Large-codebase and context efficiency

- **Conductor context minimalism**: Confirm the conductor queries only metadata in per-pass routing loops, reads large issue bodies (such as the spec's `## Source` branch) only once when needed, and never absorbs raw diffs or subagent transcripts.
- **Bounded `gh` CLI queries**: Confirm `gh issue list` and `gh label list` queries include explicit `--limit 100` bounds and narrow search prefixes (`--search "[<slug>] in:title"` or `--search "ship-it:"`), use `--force` for idempotent label creation, batch-fetch open tickets during ticket-set validation, and evaluate frontier blockers lazily in ascending issue-number order.
- **Search-first codebase exploration**: Confirm [`plan.md`](../../../skills/ship-it/references/plan.md), [`spec.md`](../../../skills/ship-it/references/spec.md), [`tickets.md`](../../../skills/ship-it/references/tickets.md), and [`validate.md`](../../../skills/ship-it/references/validate.md) instruct agents to use targeted symbol and path searches (`rg`, `git grep`, or harness search tools) and line-range reads rather than full-repository directory scans. Confirm `validate.md` reads the artifact under audit before verifying named touchpoints against active code.
- **Scoped git and test execution**: Confirm [`implement.md`](../../../skills/ship-it/references/implement.md) and [`review.md`](../../../skills/ship-it/references/review.md) fetch specific target branches (`git fetch origin <default-branch> <branch>`), survey diffs with `git diff --stat` before reading full diffs, and run package- or domain-scoped test suites per `## Testing Decisions`.

### 3. SSOT, DRY, and internal consistency

- **Single source of truth**: Confirm each policy (such as issue relationships, complexity tiers, fixed-point derivation, ticket-naming prohibition, and ad-hoc test harness prohibition) has one canonical definition and no conflicting restatements.
- **Routing and transition alignment**: Confirm every row in the `SKILL.md` routing table matches the entry conditions, labels, return schema verdicts, and exit transitions in the corresponding reference file.
- **Zero intra-file duplication**: Flag repeated rules or overlapping subsections within any single file.

### 4. Writing and clarity standard

- Audit every file against the seven rules in [`writing.md`](../../../skills/ship-it/references/writing.md):
  1. **Sentence brevity**: One idea or instruction per sentence, without scripts or word counters.
  2. **Voice and mood**: Imperative mood for procedures; active voice for descriptions.
  3. **Noun clusters**: At most three consecutive nouns.
  4. **Affirmative phrasing**: Direct affirmative statements instead of double negatives.
  5. **High scannability**: Bulleted lists, bold lead-ins, tables, and paragraphs under four sentences.
  6. **Controlled vocabulary**: One consistent term per concept and explicit antecedents instead of bare pronouns (`this`, `it`).
  7. **Single source of truth**: Each requirement, contract, or decision appears once in its canonical section, and child artifacts reference parent sections instead of restating parent content.

### 5. `README.md` synchronization and brevity

- Confirm [`README.md`](../../../README.md) matches the current behavior of `SKILL.md` and `references/*.md`.
- Confirm `README.md` stays brief, clear, and scannable: retain the header, ASCII boundary flow, `## Quickstart`, `## How it works` (5-phase lifecycle table and compact `### Map vs. Spec` summary), single-sentence `## Core guarantees`, and `## Prior art`, without redundant multi-pass prose, collapsible diagrams, or developer setup overhead.

### Step 1 output format

Present the audit report in this structure and **halt** for human input:

```markdown
## Skill Audit Report

| ID | Axis | Severity | File:Line | Finding | Proposed Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A-1 | <1–5> | Critical \| High \| Medium \| Low | `<path>:<line>` | <concise defect> | <specific change> |
```

Ask the user which findings to approve, adjust, or skip before starting Step 2.

## Step 2: Implement approved fixes and open a PR

Run Step 2 only after the user approves findings from Step 1:

1. **Create an isolated branch**: When on `<default-branch>`, create and switch to a dedicated branch (`git checkout -b <type>/<slug>`, such as `refactor/skill-audit`).
2. **Apply approved changes**: Edit [`skills/ship-it/`](../../../skills/ship-it/), [`README.md`](../../../README.md), and [`.agents/skills/skill-audit/SKILL.md`](SKILL.md) to resolve only the approved findings, following [`writing.md`](../../../skills/ship-it/references/writing.md).
3. **Run fresh-context verification**:
   - When a subagent dispatch tool exists, invoke a fresh subagent to run Step 1 of this skill against the updated working tree.
   - Resolve any **Critical** or **High** issues surfaced by the verification pass.
   - Verify that all relative Markdown links and `#anchor` targets resolve across `README.md`, `skills/ship-it/SKILL.md`, `skills/ship-it/references/*.md`, and `.agents/skills/skill-audit/SKILL.md`.
4. **Commit, push, and open a pull request**:
   - Stage the modified files explicitly (`git add <file>...`), commit with Conventional Commits format (`<type>(<slug>): <summary>`), and push the branch (`git push -u origin <branch>`).
   - Open a pull request against the default branch using `gh pr create --base <default-branch> --head <branch> --title "<title>" --body-file <temp-file>` and delete the temporary body file.
   - Report the pull request URL to the user and stop. Never merge the pull request.
