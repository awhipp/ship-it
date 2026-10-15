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

`ship-it` automatically queries your GitHub repository to determine the active feature and current phase.
When interactive prompt tools exist, `ship-it` prompts the developer to select an execution mode:

- **Autonomous loop mode**: Orchestrates isolated child subagents across implementation, review, and ticket progression until completing the specification.
- **Step-by-step mode**: Executes one phase at a time and prompts for interactive confirmation before downstream work.

When interactive prompt tools are absent, `ship-it` defaults to step-by-step mode.
In step-by-step mode, the conductor executes exactly one bounded slice of work, verifies the gate, and reports the next step.

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
| **4. Implement** | Build one ticket with domain-aligned verification. | Isolated subagent (Tier 1) or fresh session (Tier 2). | Git Diff & Commit | [`implement.md`](skills/ship-it/references/implement.md) |
| **5. Review** | Independent review across Standards and Spec Fidelity. | Two-axis review report with zero findings. | Review Verdict & Label | [`review.md`](skills/ship-it/references/review.md) |

### How Phases Work

1. **Plan (Map)**: Used only when a feature is ambiguous or broad. Maps decisions one question at a time across the frontier of the unknown. Well-scoped features skip directly to Spec.
2. **Spec**: Synthesizes requirements, architecture, and test seams into an unambiguous spec issue. Passes an adversarial audit gate ([`validate.md`](skills/ship-it/references/validate.md)) in an isolated context before ticketing.
3. **Tickets**: Splits the validated spec into small, self-contained vertical slices. Links tickets natively via GitHub sub-issues and dependencies (`--parent`, `--blocked-by`) with dual-channel markdown tasklist fallback.
4. **Implement**: Executes the active frontier ticket on a dedicated branch using deterministic 3-state routing (Reviewed, In-Progress, Unstarted). Under Tier 1, the conductor dispatches an isolated implementation subagent per the [Autonomous Implementation Protocol](skills/ship-it/references/isolation.md#autonomous-implementation-protocol-tier-1) with zero parent context. Under Tier 2, the conductor preserves manual fallback by applying `ready-for-agent` and prompting for a fresh session. Strongly recommends test-first Red-Green where automated test suites exist, or direct acceptance verification where they do not. The authoring session never reviews its own work.
5. **Review**: Audits the diff under the [2-Tier Context Isolation Protocol](skills/ship-it/references/isolation.md). Spawns isolated review subagents autonomously under Tier 1, or pauses with `ready-for-agent` under Tier 2. Evaluates **Coding Standards** (Martin Fowler refactoring baseline) and **Spec Fidelity** along two independent axes. When review requests changes, autonomous loop mode triggers remediation subagents with bounded retries before developer escalation.

### Conductor Orchestration and Execution Modes

`ship-it` orchestrates feature delivery across two distinct execution modes:

- **Autonomous loop mode**: The conductor drives continuous subagent build loops across the entire specification. It dispatches implementation subagents, verifies commits, dispatches review subagents, closes approved tickets, and advances the frontier autonomously until completing the specification.
- **Step-by-step mode**: The conductor executes exactly one bounded slice of work per invocation. It requests interactive confirmation before executing downstream phases, keeping developers in full control of every transition.

When interactive prompt tools exist (`ask_question`, `prompt`), `ship-it` prompts the developer to select the execution mode at the start of every run.
When interactive tools are absent, the conductor defaults to step-by-step mode.

### Autonomous Implementation and Continuous Build Loop (Tier 1)

In environments with subagent primitives (`invoke_subagent`, `Agent`), the conductor executes the [Autonomous Implementation Protocol](skills/ship-it/references/isolation.md#autonomous-implementation-protocol-tier-1):

- **Zero-Context Isolation**: The conductor dispatches unstarted tickets to isolated child subagents with zero parent conversation context. This practice prevents context bloat and eliminates authoring confirmation bias.
- **Continuous Phase Chaining**: Upon receiving a clean implementation verdict summary, the conductor immediately verifies commit generation and dispatches an isolated review subagent.
- **Autonomous Frontier Progression**: When the review subagent approves the diff, the conductor posts a resolution comment, closes the ticket, and advances immediately to the next unstarted ticket.
- **Feature Close-Out Protocol**: When the final ticket of a specification closes, the conductor posts a completion comment to the parent specification and instructs opening or updating the pull request.

### Autonomous Rework Routing with Bounded Retries

When a review subagent rejects a diff and applies `ship-it:changes-requested`, `ship-it` initiates the [Autonomous Rework Protocol](skills/ship-it/references/isolation.md#autonomous-rework-protocol-tier-1):

- **Remediation Dispatch**: The conductor launches an isolated remediation subagent with the review feedback, ticket requirements, and feature branch name.
- **Remediation Verification**: The remediation subagent fixes reported defects, executes verification, and commits fixes directly to the branch.
- **Re-Verification**: The conductor dispatches a fresh review subagent to audit the remediated diff.
- **Bounded Retry Limit**: Rework routing enforces a strict limit of at most two remediation attempts per ticket. If review rejection persists after two attempts, the conductor alerts the developer and halts execution.

### Tier 2 Manual Fallback Preservation

In environments lacking subagent primitives, `ship-it` preserves full manual fallback without compromising rigor:

- **Authoring Session Handoff**: The conductor applies the `ready-for-agent` status label, prints the explicit command for a fresh session, and stops execution. In-context persona simulation is strictly prohibited.
- **Fresh Session Execution**: Developers or agents execute implementation, validation, and review in dedicated, fresh sessions per the reference guides.
- **Manual Rework Workflow**: When a review requests changes, a fresh manual session claims the ticket, resolves findings, commits remediations, posts an explanatory comment, and removes the `ship-it:changes-requested` label for re-review.

---

## Core Guarantees

- **Zero Proprietary State**: No SaaS lock-in or local runtime state. GitHub is the state machine—tracked via native issues, markdown tasklists, `ship-it:*` labels, branches, and commits.
- **Continuous Subagent Build Loop**: In autonomous loop mode under Tier 1, the conductor continuously chains implementation subagents, review subagents, and ticket frontier progression until completing the specification.
- **Autonomous Subagent Execution**: Conductor detects harness subagent primitives dynamically. It runs implementation, validation, and review in isolated child contexts with zero parent conversation context.
- **Bounded Autonomous Rework Routing**: When a review requests changes, the conductor routes tickets to isolated remediation subagents with retries bounded to at most two attempts before escalating to the developer.
- **Preserved Tier 2 Manual Fallback**: When subagent tools are absent, the conductor applies `ready-for-agent`, prints the exact command for a fresh session, and pauses execution without simulating personas in-context.
- **Dual-Channel Issue Relationships**: Connects issues natively with GitHub sub-issues and dependencies (`--parent`, `--blocked-by`). Transparently falls back to markdown pointers (`Part of #<spec-id>`, `## Blocked by`) across unsupported repository tiers.
- **Deterministic 3-State Orient Routing**: Isolates ticket evaluation to the lowest-numbered open ticket on the specification frontier. Routes deterministically across Reviewed, In-Progress, and Unstarted states without sequence confusion.
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
