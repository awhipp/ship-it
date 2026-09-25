# ship-it

`ship-it` is an agentic skill that conducts a feature through a full build
loop, one phase at a time, across however many sessions it takes:

```txt
Plan → Spec → Tickets → Implement → Review
```

It tracks everything as GitHub issues in whatever repo you run it in. Each
time you invoke it, it looks at what already exists for the feature (a map,
a spec, tickets, a diff awaiting review), does one phase's worth of work, and
tells you the exact next thing to run. Run it again, whenever, to keep going.

It's self-contained: everything it needs lives in this folder, and the only
thing it writes into a repo is the GitHub issues it creates. It doesn't call
out to any other skill, which is what makes it copyable into a global skills
directory and usable in any repo.

## Prior art

`ship-it` builds on two existing bodies of work and layers its own ideas on
top of them. This section credits ideas, not code — `ship-it` doesn't invoke
either project.

### Matt Pocock's Wayfinder

- YouTube walkthrough: <https://www.youtube.com/watch?v=F3lL98Pj90o>
- Original skill: <https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder>

`wayfinder` is the planning phase of a longer chain: it charts
a map of decision tickets, then hands off to separate skills (`to-spec`,
`to-tickets`, `implement`, `code-review`) to carry the work from spec through
to a reviewed diff. Each of those is its own skill, and the chain supports
several issue trackers (GitHub, GitLab, Linear, Jira, or local markdown
files), configured per repo by a separate setup skill. `ship-it` takes the
five-phase shape and, in the Plan phase especially, the vocabulary: the map,
decision tickets, the four ticket types, fog of war, the frontier.

### Spec-First Protocol (SFP)

- Project: <https://github.com/awhipp/spec-first-protocol>

SFP is an upstream spec-creation pipeline: a structured discovery interview,
an adversarial audit, an incremental refine loop, then a locked spec. It
stops there by design — it doesn't plan, scaffold, or implement.

`ship-it` takes two principles from it. First, the adversarial audit gate: an
outside skeptic reads an artifact against the original requirements in a
fresh context window and tries to break it before anyone builds on it.
Second, context clearing between phases as a feature rather than a
limitation — a fresh reviewer must not carry the author's reasoning, because
that reasoning is exactly what would bias the check.

### What `ship-it` adds

Neither parent runs a full plan-through-review loop that also checks itself
at every seam, and that gap is where most of `ship-it`'s own ideas live.

The core invention is that `ship-it` carries no memory of its own. Each run
re-derives where a feature stands by reading the trail of work already on
record: the map, the spec, the tickets, the diff. That same trail lets
separate sessions work the same feature without colliding, since each one
claims only the piece nobody else has picked up yet. And every phase checks
whether it's even needed before running: skip the map when there's no real
fog, skip ticket-splitting when the build fits in one sitting, skip Validate
when the feature is small enough that a missed gap costs nothing to catch
later.

Review is the other original piece. Standards and spec-fidelity run as two
separate passes that never collapse into one verdict, so a diff that nails
one axis and misses the other can't hide behind the axis that reads well.

Two more ideas push a parent's idea further than either did alone. Validate
lifts SFP's fresh-context check off the spec alone and applies it to every
artifact, map, spec, or ticket set, before anyone builds on top of it. And
SFP's insistence on a fresh context becomes a hard rule at every seam here:
the session that writes a diff never reviews it, and the session that
authors an artifact never audits it.

The rest is established practice `ship-it` wires in as a default rather than
an option: tracer-bullet vertical slices for splitting work (The Pragmatic
Programmer), expand-migrate-contract for changes too wide to land in one
slice (Parallel Change), and sketching test seams before
writing a line of implementation (Working Effectively with Legacy Code).

- The Pragmatic Programmer: <https://www.oreilly.com/library/view/the-pragmatic-programmer/9780135956977/>
- Parallel Change: <https://martinfowler.com/bliki/ParallelChange.html>
- Working Effectively with Legacy Code: <https://www.oreilly.com/library/view/working-effectively-with/0131177052/>

### Why combine them

`wayfinder` reaches all the way to a reviewed diff but treats verification
as a downstream hand-off. SFP's adversarial, cleared-context rigor is real
but stops at the spec. `ship-it` applies SFP's fresh-context skepticism to
every `wayfinder` handoff: a Validate audit gates any map, spec, or ticket
set before it gets built on, and Review checks the diff in a session that
never saw the code get written. `wayfinder`'s full plan-through-review reach
and SFP's verification rigor at each seam: neither parent does both alone,
and holding that loop together end to end needed something neither had, a
conductor that orients itself from whatever already exists instead of
carrying state, and a Review built so its two checks can't blur into one.

## The flow

| Phase         | Produces                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Plan**      | A map (a GitHub issue) charting the open decisions for an effort too big or too foggy to spec directly. Only needed when the destination genuinely isn't clear yet.                        |
| **Spec**      | A GitHub issue synthesizing what's been decided into a Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, and Out of Scope.                           |
| **Tickets**   | Vertical-slice GitHub issues splitting the spec into session-sized, independently buildable pieces, each declaring what blocks it. Only needed when the build spans more than one session. |
| **Implement** | A test-first build of one ticket (or the whole spec, if it fits in one sitting), ending in a diff ready for review.                                                                        |
| **Review**    | A two-axis check of that diff: does it follow the repo's coding standards, and does it faithfully implement what was asked.                                                                |

## Setup and requirements

`ship-it` needs, per repo:

- The `gh` CLI installed and authenticated
- A `github.com` remote
- Issues enabled on the repo, and write access to it

`ship-it` assumes all of this is already in place and doesn't check it on a
normal run. If a `gh` call fails, or you run `/ship-it preflight`, it runs the
checklist, fixes what it can (like a missing `ready-for-agent` label), and
reports the rest instead of guessing or stopping partway through. See
[references/preflight.md](references/preflight.md) for the full checklist.

## Using it

Invoke `/ship-it`. It figures out which feature and phase you mean (asking if
it isn't obvious), does one phase's worth of work, and ends with one line
telling you what it did and what to run next.
