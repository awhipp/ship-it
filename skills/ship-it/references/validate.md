# Validate: adversarial audit before anyone builds on this

Read a published artifact, spec, ticket set, or map, as an outside skeptic and
try to break it, before its decisions get turned into code. This phase is
**recommended by default**: run it whenever tickets or implementation will
build on top of something for more than one session, because a gap found now
costs a comment; the same gap found mid-implementation costs a rewrite. Skip it
only for a small, well-scoped feature where that risk genuinely doesn't apply —
skipping is the deliberate exception, not the default path through the loop.

## Why this has to run fresh

The person who wrote the spec remembers why they phrased something loosely,
what they meant by a vague acceptance criterion, which edge case they
consciously deferred. None of that reasoning is visible to whoever builds from
the artifact later; only the words on the issue are. An audit run by the same
context that authored the artifact inherits that memory and reads right past
the very gaps a builder would trip on.

So: if you authored this spec, ticket set, or map in the current session, do
not audit it yourself. Either start a fresh session that reads only the
published issue plus the original requirements, or spawn a subagent with that
same restricted view. Either way, the auditor should have no access to the
reasoning that produced the artifact, only to the artifact and to what it's
supposed to satisfy.

## What "requirements" means, per artifact

- **Spec**: the map's resolved decisions it was built from (if a map exists),
  and the conversation or ticket that asked for the spec in the first place.
- **Tickets**: the spec they were split from. Every ticket set is checked
  against the spec's User Stories and Implementation Decisions.
- **Map**: the destination it names, and its "Decisions so far." (For a map,
  fog is not itself a defect; see below.)

Read the requirements before the artifact, so the audit starts from what was
asked for rather than from what was written.

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

Post the findings as a comment on the artifact's issue, so they're visible to
whoever reads it next, in this session or a later one:

```markdown
## Validation: <artifact type>

<One line: overall read on the artifact's shape and readiness.>

### Blockers
- **B-1** [<section>]: <what's wrong, one sentence on why it blocks>
- *(or "None")*

### Warnings
- **W-1** [<section>]: <what's underspecified, one sentence on the guess it forces>
- *(or "None")*

### Nits
- **N-1** [<section>]: <the improvement, one sentence>
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

Findings only, no rewrites: this phase names what's wrong and hands it back;
fixing the spec belongs to `spec.md`, fixing tickets to `tickets.md`, fixing
the map to `plan.md`. Resolving that way, in the phase that owns the artifact,
keeps this audit an outside check rather than a second author.

## Verdict and the label

- **Any Blocker** → don't apply `ship-it:validated`. The artifact goes back to
  the phase that owns it, read in a fresh session, so the fix isn't written by
  the same context the audit just caught out.
- **Zero Blockers** → apply `ship-it:validated`
  (`gh issue edit <n> --add-label "ship-it:validated"`). Warnings and Nits are
  on record in the comment; the user decides whether to fold them in now or
  carry them forward, they don't hold up the label.
