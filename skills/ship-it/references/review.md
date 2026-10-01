# Review: two-axis check of the diff

Review strictly enforces the [2-Tier Context Isolation Protocol](validate.md#2-tier-context-isolation-protocol); in-context persona simulation is strictly prohibited.

Review the changes made in this phase along two independent axes, reported side by side without
merging or reranking:

- **Standards**: does the diff follow this repo's documented coding standards?
- **Spec**: does the diff faithfully implement the ticket or spec it came from?

## Why two axes, not one

A change can pass one and fail the other:

- Follows every standard, but builds the wrong thing → Standards pass, Spec
  fail.
- Does exactly what was asked, but breaks the project's conventions → Spec
  pass, Standards fail.

Collapsing these into one score lets whichever axis reads more favorably hide
the other's problems. Keep them separate.

## Process

### 1. Pin the fixed point

Diff against whatever point this ticket's work started from: usually the
branch point, or the last commit before this ticket began.
`git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the
merge-base), plus `git log <fixed-point>..HEAD --oneline` for the commit list.
Confirm the fixed point resolves and the diff is non-empty before going
further; a bad ref should fail here; not inside two review passes that then
have nothing to say.

### 2. Verify verification evidence

Before evaluating the diff against standards and spec, inspect the evidence for the verification strategy required by [references/implement.md](implement.md):

- **Automated test suites (where applicable)**:
  Inspect the commit history (`git log <fixed-point>..HEAD --oneline`) and the issue thread or handoff comment (`gh issue view <number> --comments` or `gh issue view`) for verification evidence (such as test runner output, test commit refs, or terminal traces). Evaluate whether verification was appropriate for the change: where tests were written or modified, confirm they pass and verify the acceptance criteria. Do not automatically reject diffs solely over missing terminal failure logs if the tests and implementation cleanly verify the requirements.

- **Where automated tests are not viable or needed**:
  Confirm that the handoff report or issue thread documents domain-appropriate acceptance criteria verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).

### 3. Identify the spec source

In order: the ticket or spec this implementation session started from (read via
`gh issue view <number> --json number,title,body`); issue references
in the commit messages (`#123`, `Closes #45`); a path or issue number the user names.
If truly nothing turns up, ask, and if the user says there genuinely isn't one,
skip the Spec pass and say so in the final report rather than inventing a
standard to check against.

### 4. Identify the standards sources

Anything the repo documents about how code should be written:
`CODING_STANDARDS.md`, `CONTRIBUTING.md`, a style guide, whatever exists.

On top of whatever's documented, always carry this fixed baseline (Fowler,
_Refactoring_, ch. 3), since it applies even when a repo documents nothing.
Two rules bind it: a documented repo standard always overrides it (where the
repo endorses something the baseline would flag, suppress the flag), and every
smell here is a labelled judgement call, never a hard violation. Skip anything
tooling already enforces (a linter rule already catching it needs no human
restating it).

- **Mysterious Name**: a name that doesn't reveal what it holds or does →
  rename it; if no honest name comes, the design itself is murky.
- **Duplicated Code**: the same logic shape in more than one hunk or file →
  extract the shared shape, call it from both.
- **Feature Envy**: a method reaching into another object's data more than
  its own → move the method to the data it envies.
- **Data Clumps**: the same few fields or params always traveling together →
  bundle them into a type.
- **Primitive Obsession**: a primitive or string standing in for a domain
  concept that deserves its own type → give the concept its own small type.
- **Repeated Switches**: the same switch/if-cascade on the same type recurs →
  replace with polymorphism, or one shared map.
- **Shotgun Surgery**: one logical change forces scattered edits across many
  files → gather what changes together into one module.
- **Divergent Change**: one file or module edited for several unrelated
  reasons → split so each module changes for one reason.
- **Speculative Generality**: abstraction or hooks added for a need the spec
  doesn't have → delete it; inline back until a real need shows up.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't
  depend on → hide the walk behind one method.
- **Middle Man**: a class or function that mostly just delegates onward → cut
  it, call the real target directly.
- **Refused Bequest**: a subclass or implementer ignoring most of what it
  inherits → drop the inheritance, use composition.
- **Ticket-Named Artifacts**: test files, test suites, or source files named after
  tickets rather than domain seams → rename per the [ticket-naming prohibition](implement.md#ticket-naming-prohibition).
- **Over-Architected Test Ceremonies**: ad-hoc mock test harnesses or invented runners
  simulating coverage → replace with direct verification per the [ad-hoc test harness prohibition](implement.md#ad-hoc-test-harness-prohibition).

### 5. Run both passes

**Standards pass**, given the diff, the commit list, whatever standards
sources were found, and the smell baseline above: report, per file or hunk
where relevant, every place the diff violates a documented standard (citing
the file and the rule) and any baseline smell spotted (naming it, quoting the
hunk). Documented-standard breaches can be hard violations; baseline smells
stay judgement calls. Skip anything tooling enforces. Keep it tight, under 400
words.

**Spec pass**, given the diff, the commit list, and the spec or ticket: report
requirements asked for that are missing or partial, behavior in the diff that
wasn't asked for (scope creep), and requirements that look implemented but
where the implementation looks wrong. Quote the spec line for each finding.
Under 400 words.

If there's no spec source, skip this pass and say so.

### 6. Report

Present both under `## Standards` and `## Spec` headings, unmerged. Close with
a one-line summary: total findings per axis, and the worst issue **within**
each axis, if any. Don't declare a single overall winner across the two axes;
that's exactly the reranking the separation exists to prevent.

## Outcome

- **Verification evidence missing or either axis has findings**: post findings to the ticket
  (`gh issue comment <number> --body-file <file>` or `gh issue comment <number> --body "<text>"`) and hand back to a fresh
  `implement.md` session to address. The ticket stays open, unreviewed; do not apply
  `ship-it:reviewed` on a report that has anything outstanding or lacks appropriate verification evidence.
- **Verification evidence verified and both axes clean**: apply `ship-it:reviewed`
  (`gh issue edit <number> --add-label "ship-it:reviewed"`), then close out. The
  work-in-progress commit is already on the branch from `implement.md`, so comment
  the resolution (`gh issue comment <number> --body "<text>"`),
  close the ticket (`gh issue close <number> --comment "<text>"`),
  and open the PR or merge, per how the user works.
  Close-out is gated on this label; do not skip straight to closing because the
  diff "looked fine" without a report to back it. If this is the final ticket of
  the spec, execute the [Feature Close-Out Protocol](../SKILL.md#feature-close-out-protocol).
