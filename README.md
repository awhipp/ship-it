# ship-it

[![Live Site](https://img.shields.io/badge/Live_Site-awhipp.github.io%2Fship--it-2563eb?style=flat-square&logo=githubpages&logoColor=white)](https://awhipp.github.io/ship-it/)
[![Standard](https://img.shields.io/badge/agentskills.io-compliant-10b981?style=flat-square)](https://agentskills.io)

**Disciplined feature delivery for engineering teams.** Drive features from idea to pull request using explicit phase gates, independent reviews, isolated subagents, and GitHub issues as the single source of truth.

```txt
Boundary 1: Mapping       Boundary 2: Definition       Boundary 3: Execution
    [ Plan ]        ──▶    [ Spec ──▶ Tickets ]   ──▶   [ Implement ──▶ Review ──▶ Final Review ]
 ⏸ Human Gate               ⏸ Human Gate                ⏸ Human Gate (Annotated PR)
```

---

## Quickstart

### 1. Prerequisites

Install and authenticate `git` and the GitHub CLI (`gh` 2.94.0 or later):

```bash
gh auth status
```

### 2. Install

```bash
npx skills install awhipp/ship-it
```

Or copy `skills/ship-it` into `.agents/skills/ship-it` or your harness's global skills folder.

### 3. Run with a directive

Every invocation requires an explicit directive so the conductor never guesses what to work on:

```txt
/ship-it "add search caching"   # Start a new feature from an idea
/ship-it #42                    # Start from an existing issue, or resume a ship-it artifact
/ship-it search-cache           # Resume an existing feature by slug
/ship-it preflight              # Verify repo setup and provision labels
```

A bare `/ship-it` halts immediately and asks for one of these four directives before running any GitHub queries.

---

## How it works

`ship-it` guides feature development through five phases across three execution boundaries.
The conductor dispatches discrete tasks to isolated subagents or fresh sessions.
Work runs continuously within each boundary and halts at the boundary exit for human review.

Run `ship-it <slug>` to approve Boundary 1 or Boundary 2 and advance to the next boundary.
Merge the pull request to approve Boundary 3 and complete the feature.

| Boundary | Phase | What happens | Phase exit / Boundary halt | Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1. Mapping** | **Plan** | Charts open decisions as a map and resolves research, prototype, grilling, and task tickets. | **Halt (Boundary 1 exit)**: Map closes with all decisions settled. | [`plan.md`](skills/ship-it/references/plan.md) |
| **2. Definition** | **Spec** | Synthesizes settled decisions into a high-level design specification with cross-cutting context and test seams, then validates the draft against the codebase. | **Continues to Tickets** once the spec carries `ship-it:validated`. | [`spec.md`](skills/ship-it/references/spec.md), [`validate.md`](skills/ship-it/references/validate.md) |
| **2. Definition** | **Tickets** | Slices the specification into ordered low-level design tickets with concrete touchpoints and contracts, then validates the set against the spec and codebase. | **Halt (Boundary 2 exit)**: Every ticket carries `ship-it:validated`. | [`tickets.md`](skills/ship-it/references/tickets.md), [`validate.md`](skills/ship-it/references/validate.md) |
| **3. Execution** | **Implement & Review** | Implements each unblocked ticket on `<type>/<slug>`, reviews diffs across Standards and Spec axes, and closes approved tickets. | **Continues to Final Review** once all tickets close. | [`implement.md`](skills/ship-it/references/implement.md), [`review.md`](skills/ship-it/references/review.md) |
| **3. Execution** | **Final Review & PR** | Audits the complete branch diff against the specification, opens the pull request, and adds rationale comments to each changed file. | **Halt (Boundary 3 exit)**: PR opens and awaits human merge. | [`review.md`](skills/ship-it/references/review.md#final-review), [`implement.md`](skills/ship-it/references/implement.md#close-out) |

### Map vs. Spec

| Dimension | Decision Map (`ship-it:map`) | Feature Specification (`ship-it:spec`) |
| :--- | :--- | :--- |
| **Primary Goal** | Resolve architectural uncertainty and choose a direction. | Deliver settled requirements through verified code. |
| **When to Use** | Use when architectural fog, technical forks, or unknown APIs exist. | Use when destination, technical design, and scope boundaries are clear. |
| **Work Units** | Decision tickets: `research`, `prototype`, `grilling`, `task`. | Vertical build tickets: end-to-end slices with concrete touchpoints. |
| **Core Output** | Recorded technical decisions and cleared fog. | Production pull request with tests, documentation, and review audit. |
| **Exit Gate** | Boundary 1 Exit: All open decisions are settled. | Boundary 3 Exit: All tickets pass two-axis review and final audit. |

---

## Core guarantees

- **Deterministic Routing**: One first-match routing table in [`SKILL.md`](skills/ship-it/SKILL.md) derives the next action from GitHub issues, labels, and assignees.
- **Explicit Directives Only**: Invoking `ship-it` without a slug, issue number, idea, or `preflight` halts immediately instead of scanning or guessing.
- **Zero-Assumption Verification**: Evaluators classify findings as **Blocker**, **Question**, or **Nit** and withhold approval whenever an unwritten fact prevents verification.
- **Two-Tier Context Isolation**: Tier 1 harnesses dispatch execution-capable subagents with prompt-based complexity steering per [`isolation.md`](skills/ship-it/references/isolation.md), while Tier 2 harnesses halt for a fresh session before validation or review.
- **Two-Axis Review and Final Audit**: Reviewers audit each ticket diff across Standards and Spec axes from a recorded or derived `Fixed point: <sha>`, followed by a full-branch final review against the specification.
- **Annotated Pull Requests**: The `close-out` subagent posts a file-level comment on every changed file tracing the change to its ticket and specification section.
- **Pragmatic, Domain-Aligned Verification**: Implementation verifies behavior using existing repository test runners or direct checks while prohibiting ticket-named test files and ad-hoc string-matching test scripts.
- **Search-First Context Efficiency**: Conductor and subagent passes use bounded GitHub queries, one-level reference loading, and targeted symbol search to stay fast on large codebases.

---

## Prior art

- **Matt Pocock's [Wayfinder](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder)**: Inspired the five-phase lifecycle, decision maps, and mapping the frontier.
- **[Spec-First Protocol (SFP)](https://github.com/awhipp/spec-first-protocol)**: Introduced adversarial audits and context clearing as architectural features.
- **Classic Literature**: Hunt & Thomas (*The Pragmatic Programmer*), Martin Fowler (*Refactoring*, *Parallel Change*), and Michael Feathers (*Working Effectively with Legacy Code*).
