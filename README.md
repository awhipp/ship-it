# ship-it

[![Live Site](https://img.shields.io/badge/Live_Site-awhipp.github.io%2Fship--it-2563eb?style=flat-square&logo=githubpages&logoColor=white)](https://awhipp.github.io/ship-it/)
[![Standard](https://img.shields.io/badge/agentskills.io-compliant-10b981?style=flat-square)](https://agentskills.io)

**The Autonomous Conductor for Software Engineering.** Put developers back in the driver's seat of the SDLC with strict phase gates, 2-tier context isolation, and pragmatic, domain-aligned verification.

```txt
Plan ──▶ Spec ──▶ Tickets ──▶ Implement ──▶ Review
```

*One bounded phase at a time. Verified gates at every seam. Zero agent drift.*

---

## Quickstart

Get up and running with `ship-it` in under two minutes:

### 1. Prerequisites

Ensure standard `git` and the GitHub CLI (`gh`) are installed and authenticated:

```bash
gh auth status
```

### 2. Installation

Install `ship-it` into your project or global agent harness:

```bash
# Recommended: Install via agentskills standard
npx skills install awhipp/ship-it
```

*Alternatively, copy `skills/ship-it` directly into your workspace (`.agents/skills/ship-it`) or global harness directory (Antigravity, Cursor, or Claude Code).*

### 3. Run

Invoke `ship-it` inside any git repo using natural language or slash commands:

```txt
/ship-it
```

`ship-it` automatically queries your GitHub repository to determine the active feature and current phase, executes exactly one bounded slice of work, verifies the gate, and stops with the next step.

Need to verify repo setup or label provisioning? Run:

```bash
/ship-it preflight
```

*(See [`preflight.md`](skills/ship-it/references/preflight.md) for automated checks).*

---

## Why ship-it?

Autonomous coding agents present a frustrating dilemma:

- **Unchecked Agent Drift**: Giving an agent a loose prompt and massive context leads to hallucinated APIs, ignored constraints, and unreviewable 1,500-line mega-PRs.
- **Babysitting Fatigue**: Micro-prompting an agent line-by-line destroys velocity.

`ship-it` solves this by introducing **bounded lifecycle phases** with **verifiable gates**. Instead of trying to write an entire feature in one runaway context window, `ship-it` works one phase at a time, stores state natively in GitHub issues, and enforces hard verification before moving forward.

---

## The 5-Phase Lifecycle

| Phase | Purpose | Checkpoint & Verification Gate | Primary Artifact | Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1. Plan** | Chart architectural decisions when requirements are foggy. | Interactive 1-question-per-turn discovery dialogue. | Decision Map (`[slug] Map: ...`) | [`plan.md`](skills/ship-it/references/plan.md) |
| **2. Spec** | Define problem statement, acceptance criteria, and test seams. | Fresh-context adversarial audit before tickets. | Feature Spec (`[slug] Spec: ...`) | [`spec.md`](skills/ship-it/references/spec.md) |
| **3. Tickets** | Decompose spec into session-sized, vertical slices. | Explicit developer sign-off on ticket DAG & blockers. | Vertical Tickets (`[slug] Ticket: ...`) | [`tickets.md`](skills/ship-it/references/tickets.md) |
| **4. Implement** | Build one ticket with domain-aligned verification in a fresh session. | Recommended Red-Green cycle; green suite or verified criteria. | Git Diff & Commit | [`implement.md`](skills/ship-it/references/implement.md) |
| **5. Review** | Independent review across Standards and Spec Fidelity. | Two-axis review report with zero findings. | Review Verdict & Label | [`review.md`](skills/ship-it/references/review.md) |

### How Phases Work

1. **Plan (Map)**: Used only when a feature is ambiguous or broad. Maps decisions one question at a time across the frontier of the unknown. Well-scoped features skip directly to Spec.
2. **Spec**: Synthesizes requirements, architecture, and test seams into an unambiguous spec issue. Passes an adversarial audit gate ([`validate.md`](skills/ship-it/references/validate.md)) in an isolated context before ticketing.
3. **Tickets**: Splits the validated spec into small, self-contained vertical slices with clear acceptance criteria and `## Blocked by` dependency tasklists.
4. **Implement**: Executes one unblocked ticket on a dedicated branch. Strongly recommends test-first Red-Green where automated test suites exist, or direct acceptance verification where they do not. The authoring session never reviews its own work.
5. **Review**: Audits the diff under the 2-Tier Context Isolation Protocol (isolated subagent or fresh session). Evaluates **Coding Standards** (Martin Fowler refactoring baseline) and **Spec Fidelity** along two independent axes.

---

## Core Guarantees

- **Zero Proprietary State**: No SaaS lock-in or local runtime state. GitHub is the state machine—tracked via native issues, markdown tasklists, `ship-it:*` labels, branches, and commits.
- **Context Hygiene as a Feature**: LLMs degrade as context history bloats. `ship-it` enforces fresh sessions between phases and tickets, eliminating hallucination loops and confirmation bias. Highlights lean implement discovery (ephemeral subagent exploration for multi-file tickets) and targeted final sweeps for negative invariants to prevent context bloat.
- **Domain-Aligned Verification**: Defers to established repository test runners, frameworks, and testing tiers. Strongly recommends test-first Red-Green discipline where automated test suites exist, while strictly prohibiting brittle ad-hoc test harnesses for documentation, markdown skills, or configuration in favor of direct acceptance verification.
- **Two-Axis Non-Collapsing Review**: Code quality cannot mask missing requirements. Standards and Spec Fidelity are audited independently.
- **Harness & Model Agnostic**: Fully compliant with the open `agentskills.io` standard across Windows, macOS, and Linux.

---

## Dogfooded: Built by ship-it

`ship-it` builds itself. The marketing site, interactive documentation, core skills, and this repository structure were planned, ticketed, and implemented using `ship-it`'s own protocol:

- **Marketing Experience & Site Foundation**: [Spec #16](https://github.com/awhipp/ship-it/issues/16) sliced into Tickets [#17](https://github.com/awhipp/ship-it/issues/17), [#18](https://github.com/awhipp/ship-it/issues/18), [#19](https://github.com/awhipp/ship-it/issues/19), and [#20](https://github.com/awhipp/ship-it/issues/20), built and reviewed in isolated sessions landing in PR [#22](https://github.com/awhipp/ship-it/pull/22).
- **Pragmatic Testing Guidelines**: [Spec #21](https://github.com/awhipp/ship-it/issues/21) established domain-aligned verification, repository testing-tier deference, and the ad-hoc test harness prohibition, landing in PR [#26](https://github.com/awhipp/ship-it/pull/26).
- **Skill File DRY/SSOT Audit**: [Spec #27](https://github.com/awhipp/ship-it/issues/27) audited all ship-it reference files to eliminate duplicate prose and align with canonical commands, landing in PR [#32](https://github.com/awhipp/ship-it/pull/32).
- **Lean Implement Discovery**: [Spec #34](https://github.com/awhipp/ship-it/issues/34) established ephemeral subagent exploration for multi-file tickets and targeted final sweeps for negative invariants, landing in PR [#35](https://github.com/awhipp/ship-it/pull/35).
- **Fast-Path Resolution**: [Spec #36](https://github.com/awhipp/ship-it/issues/36) introduced in-place fast-path remediation for minor review and validation findings, landing in PR [#37](https://github.com/awhipp/ship-it/pull/37).
- **Agnostic Harness Support**: Validated via merged PR [#8](https://github.com/awhipp/ship-it/pull/8).

---

## Developing ship-it (For Contributors)

When developing `ship-it` inside this repository:

- **Source of Truth**: The canonical skill definition tracked by Git lives in [`skills/ship-it/`](skills/ship-it/).
- **Agent Discovery**: Agent harnesses (e.g., Antigravity, Cursor) discover workspace customizations in `.agents/skills/`, which is ignored by Git (`.gitignore`).

To ensure your local agent runs your active edits without duplicating files or confusing the repo skill with the agent skill, link `.agents/skills` to `skills/`:

**Windows (PowerShell — NTFS Junction, no admin required):**

```powershell
New-Item -ItemType Junction -Path ".agents\skills" -Target (Resolve-Path "skills")
```

**macOS / Linux:**

```bash
mkdir -p .agents && ln -s ../skills .agents/skills
```

---

## Prior Art & Attribution

`ship-it` stands on the shoulders of foundational work in agentic workflows and software engineering:

- **Matt Pocock's [Wayfinder](https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder)**: Inspired the 5-phase lifecycle, decision maps, and mapping the frontier.
- **[Spec-First Protocol (SFP)](https://github.com/awhipp/spec-first-protocol)**: Origin of adversarial audits and context clearing as architectural features.
- **Classic Literature**: Rooted in practices from Hunt & Thomas (*The Pragmatic Programmer*), Martin Fowler (*Refactoring*, *Parallel Change*), and Michael Feathers (*Working Effectively with Legacy Code*).
