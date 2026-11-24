# ship-it

[![Latest Release](https://img.shields.io/github/v/release/awhipp/ship-it?style=flat-square&color=blue)](https://github.com/awhipp/ship-it/releases)
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

Install and authenticate `git` and the GitHub CLI (`gh` 2.18.0 or later):

```bash
gh auth status
```

On Windows, run the skill in `pwsh` 7.4 or later. Windows PowerShell 5.1 is unsupported; install `pwsh` 7.4 or later to migrate.

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
/ship-it preflight              # Verify repo setup and provision labels (alias: init)
/ship-it version                # Check installed version and latest upstream release (aliases: --version, -v)
```

A bare `/ship-it` halts immediately and asks for one of these five directives before running any GitHub queries.
Starting from an existing issue (`/ship-it #<n>`) adopts the source issue in place as the initial map or spec.

---

## How it works

`ship-it` guides feature delivery through five phases across three execution boundaries.
The conductor routes GitHub state and dispatches role-scoped tasks to isolated subagents or fresh sessions.

Work runs continuously within each boundary and pauses at the boundary exit for human review.
Every gate halts for the human after two non-approved passes: reply with guidance, apply the approval label by hand, or stop.

Run `ship-it <slug>` to approve Boundary 1 or Boundary 2 and advance to the next boundary.
Merge the pull request to approve Boundary 3 and complete the feature.

| Boundary | Phase | Phase exit / Boundary halt | Reference |
| :--- | :--- | :--- | :--- |
| **1. Mapping** | **Plan** | **Halt (Boundary 1 exit)**: Map closes with all decisions settled. | [`plan.md`](skills/ship-it/references/plan.md) |
| **2. Definition** | **Spec** | **Continues to Tickets** once the spec carries `ship-it:validated`. | [`plan.md`](skills/ship-it/references/plan.md), [`verify.md`](skills/ship-it/references/verify.md) |
| **2. Definition** | **Tickets** | **Halt (Boundary 2 exit)**: Every ticket carries `ship-it:validated`. | [`tickets.md`](skills/ship-it/references/tickets.md), [`verify.md`](skills/ship-it/references/verify.md) |
| **3. Execution** | **Implement & Review** | **Continues to Final Review** once all tickets close. | [`implement.md`](skills/ship-it/references/implement.md), [`verify.md`](skills/ship-it/references/verify.md) |
| **3. Execution** | **Final Review & PR** | **Halt (Boundary 3 exit)**: PR opens and awaits human merge. | [`verify.md`](skills/ship-it/references/verify.md), [`implement.md`](skills/ship-it/references/implement.md) |

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

- **Deterministic Routing**: One first-match routing table in [`SKILL.md`](skills/ship-it/SKILL.md) derives the next action from GitHub labels, issue bodies, and one `## Ship-it State` comment, and caps every gate at two non-approved passes before a human halt.
- **Explicit Directives Only**: Invoking `ship-it` without a slug, issue number, idea, `preflight` (`init`), or `version` (`--version`, `-v`) halts immediately instead of scanning or guessing.
- **Zero-Assumption Verification**: Evaluators conduct read-only audits classifying findings as **Blocker**, **Warning**, or **Question** without in-place edits, matching audit altitude to artifact scope and withholding approval on unwritten facts.
- **Two-Tier Context Isolation**: A single conductor dispatches role-scoped leaf subagents with fresh, unforked context in Tier 1 per [`isolation.md`](skills/ship-it/references/isolation.md), falling back to Tier 2 fresh-session handoffs for session-forking harnesses.
- **Two-Axis Review and Final Audit**: Reviewers audit each ticket diff across Standards and Spec axes from the ticket's `Fixed point` recorded in `## Ship-it State`, followed by a full-branch final review against the specification.
- **Annotated Pull Requests**: The `close-out` subagent posts a file-level comment on every changed file tracing the change to its ticket and specification section.
- **Pragmatic, Domain-Aligned Verification**: Implementation verifies behavior using existing test runners or direct checks while prohibiting ticket-named files, ad-hoc test scripts, and transient issue or spec citations in product code.
- **Search-First Context Efficiency**: Conductor and subagent passes use bounded GitHub queries, role-scoped reference loading, and targeted symbol search to stay fast across repositories.

---

## Migrating to 1.0.0

1.0.0 is a breaking release. Features in flight on the old version finish on it or are re-baselined by hand. No automated state migration is promised.

---

## Prior art

- **Matt Pocock's [Wayfinder](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder)**: Inspired the five-phase lifecycle, decision maps, and mapping the frontier.
- **[Spec-First Protocol (SFP)](https://github.com/awhipp/spec-first-protocol)**: Introduced adversarial audits and context clearing as architectural features.
- **Classic Literature**: Hunt & Thomas (*The Pragmatic Programmer*), Martin Fowler (*Refactoring*, *Parallel Change*), and Michael Feathers (*Working Effectively with Legacy Code*).
