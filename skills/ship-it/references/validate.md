# Validate: adversarial audit before anyone builds on this

Read a published artifact, spec, ticket set, or map, as an outside skeptic and
try to break it, before its decisions get turned into code. This phase is
**recommended by default**: run it whenever tickets or implementation will
build on top of something for more than one session, because a gap found now
costs a comment; the same gap found mid-implementation costs a rewrite. Skip it
only for a small, well-scoped feature where that risk genuinely doesn't apply —
skipping is the deliberate exception, not the default path through the loop.

## 2-Tier Context Isolation Protocol

The person or session that authored a spec, map, ticket set, or code diff remembers why they phrased
something loosely, what shortcuts or rationalizations they made, and which edge cases they
consciously deferred. None of that reasoning is visible to whoever builds from or reviews the artifact
later; only the words and code on record are. An audit or review run by the same context that authored the
artifact inherits that internal memory and reads right past the very gaps an independent check would catch.

**In-context persona simulation is strictly prohibited**: An agent must NEVER attempt to
"switch personas" or simulate an outside skeptic or reviewer within the same unbroken session that
authored the artifact or diff. In-context persona switching within an authoring session is strictly
prohibited due to inherent confirmation bias and context token leakage; claims of "clearing working state"
within an existing context fail to eliminate authoring bias.

All validation and review phases MUST follow the **2-Tier Context Isolation Protocol**:

- **Tier 1 (Isolated Subagent)**: For multi-agent harnesses supporting subagent execution
  (e.g., Antigravity, Claude Code subagents). The parent session spawns an isolated subagent
  with a restricted prompt containing only the target artifact/diff and upstream requirements, with
  zero access to the authoring conversation history (for reviews, ideally separate subagent
  invocations for the Standards and Spec axes so neither axis bleeds context into the other).
- **Tier 2 (Fresh Session / Window)**: Universal protocol for single-agent or manual harnesses
  (e.g., Cursor, Aider, terminal). The user initiates a completely fresh conversation tab or
  session with a dedicated prompt for the validation or review phase.

Either way, the auditor or reviewer must have no access to the reasoning that produced the artifact or diff,
only to the artifact and to what it is required to satisfy.

## What "requirements" means, per artifact

- **Spec**: the map's resolved decisions it was built from (if a map exists),
  and the conversation or ticket that asked for the spec in the first place.
- **Tickets**: the spec they were split from. Every ticket set is checked
  against the spec's User Stories and Implementation Decisions.
- **Map**: the destination it names, and its "Decisions so far." (For a map,
  fog is not itself a defect; see below.)

Read the requirements before the artifact (`gh issue view <number> --json body`),
so the audit starts from what was asked for rather than from what was written.

## What to look for

Not a fixed checklist, a set of angles. Not all apply to every artifact type;
use judgment about which bite here.

- **Contradictions**: two parts of the artifact that can't both be true, or a
  decision that quietly reverses one made earlier.
- **Traceability gaps**: something the requirements asked for that the
  artifact never addresses, or addresses only partially. Walk the
  requirements one at a time and find where each lands in the artifact; that
  walk is itself the check, not a formality after it.
- **Untestable criteria**: acceptance criteria or user stories that can't be
  turned into a red/green test at any real seam. If nobody can say whether
  this passed, it isn't a criterion yet.
- **Silent scope**: behavior the artifact commits to that nothing in the
  requirements asked for. Scope creep found here is cheap; found in a diff,
  it's a fight about what "done" means.
- **Missing paths**: error and exception handling the happy path skipped past,
  constraints stated with no way to enforce or verify them.
- **Map-specific**: is a "resolved" decision actually resolved, or restated
  fog with a checkmark on it? Fog itself is fine, that's what the phase is
  for, flag only fog mislabeled as settled.
- **Ticket-specific**: are the slices genuinely vertical (would each one
  actually demo end to end), are the blocking edges real gates or just
  sequencing preference, does the set actually cover the whole spec once you
  line every ticket back up against it?

## Severity

Three tiers. Each one is a question, not a vibe, ask it and the tier answers
itself:

- **Blocker** — if this stays unresolved, can whoever builds from this
  artifact actually build the right thing? If no, it's a Blocker.
- **Warning** — can they build it anyway, just by guessing at what's
  underspecified? If they'd have to guess, it's a Warning.
- **Nit** — is the artifact already correct without this, just weaker for
  lacking it? That's a Nit.

Don't round a Warning up to sound thorough, and don't round a Blocker down to
avoid holding up the build; the tier is what unblocks or doesn't.

## Report

Post the findings as a comment on the artifact's issue
(`gh issue comment <number> --body-file <file>`), so they're visible to
whoever reads it next, in this session or a later one. Format all report
findings, in-place resolutions, and summaries as concise statements adhering
to [writing.md](writing.md):

```markdown
## Validation: <artifact type>

<One line: overall read on the artifact's shape and readiness adhering to writing.md.>

### Blockers
- **B-1** [<section>]: <what's wrong, one sentence on why it blocks adhering to writing.md>
- *(or "None")*

### Warnings
- **W-1** [<section>]: <what's underspecified, one sentence on the guess it forces adhering to writing.md>
- *(or "None")*

### Nits
- **N-1** [<section>]: <the improvement, one sentence adhering to writing.md>
- *(or "None")*

### In-place Resolutions
- **R-1** [<section>]: <minor typo, phrasing clarification, or formatting fix patched in issue body adhering to writing.md>
- *(or "None")*

### Traceability
| Requirement | Where it lands | |
| --- | --- | --- |
| <gist> | <section, or "missing"> | ✅ / ⚠️ / ❌ |

**Verdict**: <ready to build from as-is> / <blocked on B-1..N above>
```

A clean pass still writes this comment in full, stating plainly that nothing
was found; a silent "looks fine" thumbs-up isn't a record anyone can check
later, and can't be told apart from an audit that didn't actually happen.

## Findings and remediation: major handoff vs. minor fast-path

Major structural defects, missing requirements, scope creep, or architectural blockers
cannot be rewritten by the validator: fixing the spec belongs to `spec.md`, fixing
tickets to `tickets.md`, fixing the map to `plan.md`. Resolving major issues that way,
in the phase that owns the artifact, keeps this audit an outside check rather than a
second author.

**Minor findings (fast-path)**: For minor findings meeting the threshold—typos,
formatting nits, phrasing clarifications, or trivial omissions that do not alter
architecture, scope, or core decisions—the validator may patch the artifact issue body
directly in-place (`gh issue edit <number> --body "<updated-body>"`). The validator
records each in-place fix under `### In-place Resolutions` in the validation comment
report. If zero blockers remain after in-place remediation, the artifact is unblocked.

## Verdict and the label

- **Any remaining Blocker** → do not apply `ship-it:validated`. Major structural defects
  or unresolvable blockers route back to the phase that owns the artifact, read in a fresh
  session (Tier 2) or isolated subagent (Tier 1), so the fix isn't written by the same
  context the audit just caught out.
- **Zero Blockers** → apply `ship-it:validated`
  (`gh issue edit <number> --add-label "ship-it:validated"`). If minor findings were
  resolved in-place via the fast-path, confirm the updated artifact issue body is saved
  and documented in the report. Warnings and Nits are on record in the comment; the user
  decides whether to fold them in now or carry them forward, they don't hold up the label.
