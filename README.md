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
thing it writes into a repo is the GitHub issues it creates. It conforms to the
open agent skill standard (`agentskills.io`), making it copyable into any global
or project skills directory and usable across any compatible agent harness.

> [!TIP]
> ### See it in action: A living case study
>
> Follow [GitHub Issue #1](https://github.com/awhipp/ship-it/issues/1) on this repository as an active, living case study demonstrating the complete `ship-it` build loop in action: drafting and adversarially auditing the specification, splitting it into vertical-slice tickets with unblocking dependencies, test-first Red-Green implementation with concrete failure proof, and independent multi-tier code reviews.

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

- **Conductor with zero internal memory**: `ship-it` carries no internal state.
  Each run re-derives where a feature stands by reading the trail of work
  already on record: the map, the spec, the tickets, the diff. That same trail
  lets separate sessions work the same feature without colliding, since each one
  claims only the piece nobody else has picked up yet.
- **Open standard schema alignment**: Conforms strictly to the `agentskills.io`
  specification with schema-compliant metadata and explicit negative triggers to
  prevent unprompted autonomous activations.
- **2-Tier Context Isolation Protocol**: In-context persona switching within an
  unbroken authoring session is strictly prohibited due to inherent confirmation
  bias. `ship-it` establishes a two-tier context isolation architecture:
  - **Tier 1 (Isolated Subagent)**: For harnesses supporting subagent execution
    (e.g., Antigravity, Claude Code subagents), spawning an isolated subagent
    with a restricted prompt containing only the target artifact and upstream requirements.
  - **Tier 2 (Fresh Session / Window)**: Universal protocol for single-agent or
    manual harnesses (Cursor, Aider, terminal CLI), running each validation or
    review in a fresh conversation tab.
- **Test-first Red-Green verification gates**: Implementers must execute a strict
  two-step cycle: write a test capturing the behavior, observe failure (Red), write
  code, and observe pass (Green). Before writing any implementation code, the
  implementer must establish a concrete verification artifact (a failing test
  commit using the `(RED)` convention or a collapsible `<details><summary>Red Phase Failure Log</summary>`
  log). Diff reviews explicitly check for and reject diffs lacking this proof.
- **Tool-agnostic issue abstraction**: Operations are defined by logical actions
  (`QueryArtifact`, `ReadIssue`, `CreateIssue`, `UpdateIssue`, `CommentIssue`,
  `AssignSelf`, `CloseIssue`, `LinkDependency`, `LinkParentChild`) mapped to both
  the `gh` CLI and the GitHub Model Context Protocol (`mcp__github__*`).
- **Cross-platform shell compatibility**: All commands and scripts operate
  identically on Windows PowerShell/CMD and Unix/macOS shells without bash-specific
  assumptions.
- **Markdown relationship fallbacks**: Parent-child hierarchies (`Part of #<id>`)
  and blocking dependency graphs (`## Blocked by` tasklists) work natively on all
  GitHub plans without requiring preview sub-issue API access.
- **Two-axis independent review**: Standards and spec-fidelity run as two
  separate passes that never collapse into one verdict, alongside verification
  of the Red failure artifact.

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

| Phase         | Produces                                                                                                                                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Plan**      | A map (a GitHub issue) charting the open decisions for an effort too big or too foggy to spec directly, using strict one-question-per-turn dialogue. Only needed when the destination genuinely isn't clear yet.                      |
| **Spec**      | A GitHub issue synthesizing what's been decided into a Problem Statement, Solution, User Stories, Implementation Decisions, Testing Decisions, and Out of Scope. Adversarially audited via fresh context before tickets.         |
| **Tickets**   | Vertical-slice GitHub issues splitting the spec into session-sized, independently buildable pieces, each declaring what blocks it. Gated by explicit user confirmation before creation.                                          |
| **Implement** | A test-first build of one ticket (or the whole spec, if it fits in one sitting) following the strict two-step Red-Green cycle with verified proof of failure, ending in a diff ready for review.                                  |
| **Review**    | A two-axis check of that diff in an isolated fresh context (Tier 1 subagent or Tier 2 session): does it follow the repo's coding standards, does it faithfully implement what was asked, and did it provide proof of test failure? |

## Setup and requirements

`ship-it` needs, per repo:

- GitHub issue access via the `gh` CLI (installed and authenticated) or the GitHub Model Context Protocol (MCP) server
- A `github.com` remote
- Issues enabled on the repo, with write access
- A cross-platform shell (PowerShell on Windows, or bash/zsh on macOS/Linux)

`ship-it` assumes all of this is already in place and doesn't check it on a
normal run. If an issue tool call fails, or you request preflight (e.g., via
`ship-it preflight`, `/ship-it preflight`, or prompt), it runs the checklist,
fixes what it can (like a missing `ready-for-agent` label), and reports the rest
instead of guessing or stopping partway through. See
[references/preflight.md](references/preflight.md) for the full checklist.

## Using it

Invoke `ship-it` using your environment's preferred method—via natural language prompt,
slash command (`/ship-it`), or terminal execution. It figures out which feature and phase
you mean (asking if it isn't obvious), does one phase's worth of work, and ends with one line
telling you what it did and what to run next.
