# ship-it

[![Live Site](https://img.shields.io/badge/Live_Site-awhipp.github.io%2Fship--it-2563eb?style=flat-square&logo=githubpages&logoColor=white)](https://awhipp.github.io/ship-it/)
[![Standard](https://img.shields.io/badge/agentskills.io-compliant-10b981?style=flat-square)](https://agentskills.io)

**The Deterministic Conductor for Software Engineering.** Drive features from idea to pull request with phase-bounded loops, zero-assumption verification gates, isolated subagents, and GitHub Issues as the single source of state.

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

`ship-it` runs a feature through five phases grouped into three automation boundaries.
Within each boundary, the conductor dispatches self-contained tasks to fresh, zero-context subagents (or fresh sessions in harnesses without subagents) and loops until the boundary exit checkpoint.
At every boundary exit, the conductor halts for human review; your next `ship-it <slug>` invocation is your approval to enter the next boundary.

| Boundary | Phase | What happens | Exit halt | Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1. Mapping** | **Plan** | Charts open decisions as a map and resolves research, prototype, task, and grilling tickets. | Map closes with all decisions settled. | [`plan.md`](skills/ship-it/references/plan.md) |
| **2. Definition** | **Spec** | Synthesizes settled context into a spec (`## Source`, stories, decisions, test seams) and validates it. | Spec carries `ship-it:validated`. | [`spec.md`](skills/ship-it/references/spec.md), [`validate.md`](skills/ship-it/references/validate.md) |
| **2. Definition** | **Tickets** | Slices the spec into vertical tracer-bullet tickets and validates the set. | Every ticket carries `ship-it:validated`. | [`tickets.md`](skills/ship-it/references/tickets.md), [`validate.md`](skills/ship-it/references/validate.md) |
| **3. Execution** | **Implement & Review** | Builds each unblocked ticket on `<type>/<slug>`, reviews the diff along Standards and Spec axes, and closes approved tickets. | All tickets close. | [`implement.md`](skills/ship-it/references/implement.md), [`review.md`](skills/ship-it/references/review.md) |
| **3. Execution** | **Final Review & PR** | Audits the full branch diff against the parent spec, opens the PR, and posts a per-file change and traceability comment on every changed file. | PR opens and awaits human merge. | [`review.md`](skills/ship-it/references/review.md#final-review), [`implement.md`](skills/ship-it/references/implement.md#close-out) |

---

## Core guarantees

- **Deterministic Routing**: One first-match routing table in [`SKILL.md`](skills/ship-it/SKILL.md) derives the next step solely from GitHub issue state, labels, and assignees. Given the same repository state, the conductor takes the same action every time.
- **Explicit Directives Only**: Invoking `ship-it` without a slug, issue number, idea, or `preflight` halts immediately instead of scanning or guessing.
- **Zero-Assumption Verification**: Validators and reviewers use one severity scale: **Blocker**, **Question**, and **Nit**. When a fact needed to judge an artifact or diff is unwritten, the evaluator records a clarifying question and withholds approval until the user's answer is recorded on the issue.
- **Two-Tier Context Isolation**: In Tier 1 harnesses, the conductor dispatches decision tickets, ticket slicing, implementation, rework, validation, review, final review, and close-out to zero-context subagents via one standard packet and return schema ([`isolation.md`](skills/ship-it/references/isolation.md)). In Tier 2 harnesses, the conductor halts before validation or review and prints `ship-it #<n>` for a fresh session.
- **Two-Axis Review + Final Spec-vs-PR Gate**: Every ticket diff is checked independently for Standards and Spec fidelity from a recorded `Fixed point: <sha>`. After the last ticket closes, a final review audits the whole branch against the parent spec and creates fix tickets if cross-ticket regressions or missing requirements appear.
- **Annotated Pull Requests**: Close-out comments on every file in the pull request diff with what changed, why, and which ticket and spec section it traces to. Merging is always manual.
- **Pragmatic Verification**: Follows existing repository test runners and conventions, recommends Red-Green where tests apply, and prohibits ticket-named test files and ad-hoc string-matching harnesses for prose or config.
- **Zero Proprietary State**: All state lives in GitHub issues, labels, comments, branches, and commits.

---

## Dogfooded: built by ship-it

- **Marketing Experience & Site Foundation**: [Spec #16](https://github.com/awhipp/ship-it/issues/16) → PR [#22](https://github.com/awhipp/ship-it/pull/22).
- **Pragmatic Testing Guidelines**: [Spec #21](https://github.com/awhipp/ship-it/issues/21) → PR [#26](https://github.com/awhipp/ship-it/pull/26).
- **Skill File DRY/SSOT Audit**: [Spec #27](https://github.com/awhipp/ship-it/issues/27) → PR [#32](https://github.com/awhipp/ship-it/pull/32).
- **Lean Implement Discovery**: [Spec #34](https://github.com/awhipp/ship-it/issues/34) → PR [#35](https://github.com/awhipp/ship-it/pull/35).
- **Fast-Path Resolution**: [Spec #36](https://github.com/awhipp/ship-it/issues/36) → PR [#37](https://github.com/awhipp/ship-it/pull/37).
- **Agnostic Harness Support**: PR [#8](https://github.com/awhipp/ship-it/pull/8).

---

## Developing ship-it

The canonical skill definition lives in [`skills/ship-it/`](skills/ship-it/).
Link `.agents/skills` (ignored by Git) to `skills/` so your local harness runs your working tree:

**Windows (PowerShell):**

```powershell
New-Item -ItemType Junction -Path ".agents\skills" -Target (Resolve-Path "skills")
```

**macOS / Linux:**

```bash
mkdir -p .agents && ln -s ../skills .agents/skills
```

---

## Prior art

- **Matt Pocock's [Wayfinder](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder)**: Inspired the 5-phase lifecycle, decision maps, and mapping the frontier.
- **[Spec-First Protocol (SFP)](https://github.com/awhipp/spec-first-protocol)**: Origin of adversarial audits and context clearing as architectural features.
- **Classic Literature**: Hunt & Thomas (*The Pragmatic Programmer*), Martin Fowler (*Refactoring*, *Parallel Change*), and Michael Feathers (*Working Effectively with Legacy Code*).
