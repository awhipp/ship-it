# Review: two-axis check of the diff

Review strictly enforces the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol); in-context persona simulation is strictly prohibited.

Review diffs along two independent axes, reported side by side without merging or reranking:

- **Standards**: Does the diff follow the repository's documented coding standards?
- **Spec**: Does the diff faithfully implement the ticket or spec requirements?

## Why two axes, not one

A diff can pass one axis and fail the other:

- Follows every standard, but builds the wrong thing → Standards pass, Spec fail.
- Implements requirements faithfully, but breaks conventions → Spec pass, Standards fail.

Combining these into one score allows a strong result on one axis to mask failures on the other.
Keep the axes separate.

## Process

### 1. Pin the fixed point

Diff against the fixed starting point of the ticket: usually the branch point or the commit preceding the ticket.
Run `git diff <fixed-point>...HEAD` using three dots to compare against the merge-base.
Run `git log <fixed-point>..HEAD --oneline` to review the commit list.
Confirm the fixed point resolves and the diff is non-empty before proceeding.
A bad ref must fail immediately here.

### 2. Verify verification evidence

Inspect evidence for the verification strategy required by [references/implement.md](implement.md) before evaluating code against standards and spec:

- **Automated test suites (where applicable)**:
  Inspect commit history (`git log <fixed-point>..HEAD --oneline`) and the issue thread (`gh issue view <number> --comments` or `gh issue view`). Verify that automated tests exist and pass when expected. Confirm that tests verify acceptance criteria. Do not reject diffs solely over missing terminal failure logs when tests and code verify requirements cleanly.

- **Non-automated verification**:
  Confirm that the handoff report or issue thread documents domain-appropriate acceptance criteria verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).

### 3. Identify the spec source

Locate the source specification in this priority order:
1. The ticket or spec issue (`gh issue view <number> --json number,title,body`).
2. Issue references in commit messages (such as `#123` or `Closes #45`).
3. An explicit path or issue number provided by the user.

If no spec exists, ask the user.
If the user confirms no spec exists, skip the Spec pass and record this omission in the report.

### 4. Identify the standards sources

Inspect repository documentation for coding rules: `CODING_STANDARDS.md`, `CONTRIBUTING.md`, style guides, or linter configurations.

Also apply this baseline smell catalog (Fowler, *Refactoring*, ch. 3).
Documented repository standards override this baseline.
Every smell is a judgment call rather than a hard failure.
Skip issues already handled by automated linters.

- **Mysterious Name**: A name does not reveal what it holds or does → rename it.
- **Duplicated Code**: Identical logic appears in multiple places → extract shared logic into a helper.
- **Feature Envy**: A function accesses another module's data more than its own → move the function to the data.
- **Data Clumps**: Multiple fields or parameters always appear together → bundle them into a type.
- **Primitive Obsession**: Primitives represent domain concepts needing validation → wrap them in a dedicated type.
- **Repeated Switches**: Identical conditionals repeat across functions → use polymorphism or lookup tables.
- **Shotgun Surgery**: A single logical change requires scattered edits across many files → consolidate related code into one module.
- **Divergent Change**: One module changes for multiple unrelated reasons → split the module by responsibility.
- **Speculative Generality**: Code adds unused hooks or abstractions → remove unused abstractions and inline them.
- **Message Chains**: Chained method calls navigate object graphs → encapsulate the traversal in a dedicated method.
- **Middle Man**: A function delegates all work to another function → remove the middle layer and call the target directly.
- **Refused Bequest**: A subclass ignores inherited behavior → replace inheritance with composition.
- **Ticket-Named Artifacts**: Test or source files named after tickets rather than domain seams → rename per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition).
- **Over-Architected Test Ceremonies**: Mock harnesses simulate coverage for non-code changes → replace with direct verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).
- **Unclear Prose / Dense Phrasing**: Text violates [writing.md](writing.md) with dense noun clusters, long sentences, or passive phrasing → rewrite for brevity.

### 5. Run both passes

**Standards pass**: Evaluate the diff, commit list, and identified standards sources against the baseline smell catalog.
Report every breach of documented standards and any baseline smells.
Cite specific files and line numbers.
Keep this section under 400 words.

**Spec pass**: Evaluate the diff and commit list against the spec or ticket.
Report missing requirements, partial implementations, unintended scope creep, or incorrect behavior.
Quote the relevant spec line for each finding.
Keep this section under 400 words.

If no spec exists, skip the Spec pass and state that no spec was provided.

### 6. Report

Present both passes under `## Standards` and `## Spec` headings, unmerged. Format all findings, in-place resolutions, and summaries as concise statements adhering to [writing.md](writing.md):

```markdown
## Standards

<Findings citing file, rule, and hunk, formatted as concise statements following writing.md. Under 400 words. Or "None".>

## Spec

<Findings citing spec requirement and implementation divergence, formatted as concise statements following writing.md. Under 400 words. Or "None".>

### In-place Resolutions

- **R-1** [<file>#L<lines>]: <Concise description of the fix, rationale, and commit hash following writing.md>
- *(or "None")*

**Summary**: <One-line summary of findings per axis and worst issue within each axis, if any.>
```

When minor findings are remediated via the fast-path, document them under `### In-place Resolutions` detailing the patched hunks, rationale, and the distinct commit hash.
Close with a one-line summary: total findings per axis (and in-place resolutions), plus the worst outstanding issue **within** each axis, if any.
Do not declare a single overall winner across the two axes; that reranking defeats the two-axis separation.

## Outcome

- **Major findings or missing verification evidence**: Architectural defects, missing acceptance criteria, behavioral redesigns, multi-file refactoring, or missing verification evidence cannot be patched in review. Post findings to the ticket (`gh issue comment <number> --body-file <file>` or `gh issue comment <number> --body "<text>"`) and hand back to a fresh `implement.md` session to address under the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol). The ticket stays open and unreviewed. Do not apply `ship-it:reviewed` to a diff with outstanding major findings or missing verification evidence.
- **Minor findings (fast-path)**: Minor findings include cosmetic fixes, formatting nits, typos, or trivial 1–2 line fixes without architectural changes.
  The reviewer may remediate them directly within the active context window:
  1. Patch the files in-place.
  2. Commit the changes as a distinct commit (e.g. `git commit -m "style: address review nits"`).
  3. Re-run the full verification suite (or domain-appropriate checks) to confirm all checks pass.
  4. Document the remediations under `### In-place Resolutions` in the review report.
  5. Apply `ship-it:reviewed` (`gh issue edit <number> --add-label "ship-it:reviewed"`), post the review report comment, and proceed directly to close-out without a session hop.
- **Verification evidence verified and both axes clean**: Apply `ship-it:reviewed` (`gh issue edit <number> --add-label "ship-it:reviewed"`), then close out. The work-in-progress commit is already on the branch from `implement.md`. Post the resolution comment (`gh issue comment <number> --body "<text>"`), close the ticket (`gh issue close <number> --comment "<text>"`), and open the pull request or merge. Close-out requires this label; do not close tickets without an accompanying review report. If this is the final ticket of the spec, execute the [Feature Close-Out Protocol](../SKILL.md#feature-close-out-protocol).
