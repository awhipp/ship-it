# ship-it

[![Live Site](https://img.shields.io/badge/Live_Site-awhipp.github.io%2Fship--it-2563eb?style=flat-square&logo=githubpages&logoColor=white)](https://awhipp.github.io/ship-it/)
[![Standard](https://img.shields.io/badge/agentskills.io-compliant-10b981?style=flat-square)](https://agentskills.io)

**The Autonomous Conductor for Software Engineering.** Put developers back in the driver's seat of the SDLC with strict phase gates, 2-tier context isolation, and test-first verification.

```txt
Plan ──▶ Spec ──▶ Tickets ──▶ Implement ──▶ Review
```

*One bounded phase at a time. Verified gates at every seam. Zero agent drift.*

---

## The Philosophy

### The SDLC Crisis: Unchecked AI Drift

Modern autonomous coding agents place developers in a frustrating dilemma:

1. **Unchecked Agent Sprawl**: Hand an autonomous agent a fuzzy prompt and 20,000 tokens of context. The model hallucinates APIs, silently drops constraints, mangles existing codebase conventions, and produces an unreviewable 1,500-line mega-PR. Developers are relegated to rubber-stamping code they don't understand or abandoning agentic tools altogether.
2. **Micro-Prompt Fatigue**: Manually guiding an AI model line-by-line, copy-pasting code snippets, and babysitting every function signature sacrifices the velocity advantages of agentic workflows.

### Prior Art & Attribution

`ship-it` builds upon foundational work in agentic workflows, specifications, and classic software engineering literature.

#### Foundational Lineage

- **Matt Pocock's Wayfinder**:
  - Video Walkthrough: <https://www.youtube.com/watch?v=F3lL98Pj90o>
  - Original Skill: <https://github.com/mattpocock/skills/tree/main/skills/engineering/wayfinder>
  - *Attribution*: `ship-it` draws inspiration from Wayfinder's 5-phase lifecycle and planning vocabulary: the decision map, decision tickets, the four ticket types, and mapping the frontier across the fog of war.
- **Spec-First Protocol (SFP)**:
  - Repository: <https://github.com/awhipp/spec-first-protocol>
  - *Attribution*: `ship-it` adopts SFP's adversarial audit gate (auditing artifacts with fresh-context skepticism before building) and context clearing as a first-class architectural feature.

#### What ship-it Uniquely Adds

Neither parent framework combines an end-to-end plan-through-review conductor with verifiable gates at every handoff. `ship-it` contributes:

1. **Zero Internal State**: `ship-it` stores zero runtime state. It derives state dynamically from GitHub issues, allowing multiple agents and developers to collaborate asynchronously without state desynchronization.
2. **2-Tier Context Isolation Protocol**: Mandatory physical context isolation (Tier 1: Isolated Subagents; Tier 2: Fresh Sessions) for adversarial validation and code review, strictly prohibiting in-context persona simulation.
3. **Test-First Red-Green Verification Gates**: Requiring concrete proof of test failure prior to implementation code authoring.
4. **Non-Collapsing Two-Axis Review**: Standards and Spec Fidelity evaluated independently so high code quality cannot mask spec deviations.
5. **Open Agent Standard Alignment**: Conforms strictly to the `agentskills.io` standard with cross-platform shell compatibility across Windows, macOS, and Linux.

#### Engineering Literature

- **The Pragmatic Programmer** (Andrew Hunt & David Thomas): <https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/>
- **Refactoring: Improving the Design of Existing Code** (Martin Fowler): <https://martinfowler.com/books/refactoring.html>
- **Parallel Change** (Martin Fowler): <https://martinfowler.com/bliki/ParallelChange.html>
- **Working Effectively with Legacy Code** (Michael Feathers): <https://www.informit.com/store/working-effectively-with-legacy-code-9780131177055>

### Core Architectural Guarantees

- **Context Hygiene as a Feature**: Large language models suffer cognitive degradation as conversation history bloats. `ship-it` treats context clearing between phases as a first-class feature rather than a limitation, ensuring each ticket is implemented in a fresh session anchored strictly to a clean git merge-base.
- **Adversarial Validation Gates**: Before writing a single line of production code, specifications and ticket sets are audited by an outside skeptic in an isolated context window to uncover architectural edge cases and design omissions.
- **Test-First Red-Green Discipline**: For executable code, implementers must establish verifiable proof of test failure (failing test commits or terminal failure logs) before implementation code can be written.
- **Two-Axis Non-Collapsing Code Review**: Code reviews evaluate Coding Standards (Martin Fowler refactoring smell baseline) and Spec Fidelity (ticket acceptance criteria) along two independent axes that never collapse into a single blended verdict.
- **Zero Proprietary SaaS Lock-in**: Your GitHub repository is the state machine. `ship-it` stores all state in native GitHub issues, markdown tasklists (`## Blocked by`), labels (`ship-it:*`), git branches, and commits via the official `gh` CLI.

---

## The 5-Phase Lifecycle

| Phase | Purpose | Checkpoint & Verification Gate | Primary Artifact | Reference |
| :--- | :--- | :--- | :--- | :--- |
| **1. Plan** | Chart architectural decisions when requirements are foggy or complex. | Interactive one-question-per-turn dialogue resolving open questions. | Decision Map (`[slug] Map: ...`) | [`plan.md`](skills/ship-it/references/plan.md) |
| **2. Spec** | Define problem statement, solution, user stories, and test seams. | Fresh-context adversarial audit (`ship-it:validated`) before tickets. | Feature Spec (`[slug] Spec: ...`) | [`spec.md`](skills/ship-it/references/spec.md) |
| **3. Tickets** | Decompose spec into session-sized, independently buildable slices. | Explicit developer sign-off on ticket DAG and blocking dependencies. | Vertical Tickets (`[slug] Ticket: ...`) | [`tickets.md`](skills/ship-it/references/tickets.md) |
| **4. Implement** | Build one ticket test-first in a fresh session on a dedicated branch. | Red-phase failure proof followed by green pass and commit. | Git Diff & Commit | [`implement.md`](skills/ship-it/references/implement.md) |
| **5. Review** | Independent 2-tier review across Coding Standards and Spec Fidelity. | Two-axis review report with zero findings before ticket close-out. | Review Verdict & Label | [`review.md`](skills/ship-it/references/review.md) |

### 1. Plan (Map)

When a feature is too broad or architectural paths remain uncertain, `ship-it` begins with **Plan**. Rather than generating assumptions all at once, `ship-it` conducts an interactive discovery dialogue asking exactly one question per turn. It charts decisions across the frontier of the unknown and maps out bounded decisions.

*Only required when the feature is genuinely foggy; well-scoped features proceed directly to Spec.*

See [`skills/ship-it/references/plan.md`](skills/ship-it/references/plan.md).

### 2. Spec

**Spec** synthesizes requirements into an unambiguous, comprehensive architectural specification:

- **Problem Statement** & **Solution**
- **User Stories** with explicit acceptance criteria
- **Implementation Decisions** (architecture, frameworks, branching)
- **Testing Decisions** (test seams, verification strategies)
- **Out of Scope** boundaries

Before splitting into tickets, the spec must pass an adversarial audit conducted in an isolated context (`skills/ship-it/references/validate.md`) to catch unhandled failure modes before any code is written.

See [`skills/ship-it/references/spec.md`](skills/ship-it/references/spec.md) and [`skills/ship-it/references/validate.md`](skills/ship-it/references/validate.md).

### 3. Tickets

**Tickets** breaks an approved spec into session-sized, vertical slices. Each ticket is completely self-contained and declares:

- **Parent Hierarchy**: `Part of #<spec-id>`
- **What to build**: Precise architectural scope
- **Acceptance criteria**: Verifiable checkboxes
- **Blocked by**: Markdown dependency tasklists linking prerequisite tickets

The ticket set requires explicit developer sign-off before issues are created on GitHub.

See [`skills/ship-it/references/tickets.md`](skills/ship-it/references/tickets.md).

### 4. Implement

**Implement** executes one unblocked ticket at a time. Each ticket is picked up in a **fresh session** on a dedicated feature branch to preserve context hygiene:

- **Red Phase (Gate)**: The implementer authors a test asserting the acceptance criteria and captures concrete proof of failure (terminal failure logs or a test commit). Implementation code cannot be written until this gate is demonstrated. For non-code changes (documentation or configuration), verification is performed directly against acceptance criteria.
- **Green Phase**: The minimal code necessary to pass the test is written and verified green.
- **Commit & Stop**: The implementer commits the diff to the feature branch and stops. The authoring session is strictly prohibited from reviewing its own work.

See [`skills/ship-it/references/implement.md`](skills/ship-it/references/implement.md).

### 5. Review

**Review** audits the diff under the **2-Tier Context Isolation Protocol** (Tier 1: Isolated Subagent; Tier 2: Fresh Session). In-context persona simulation is strictly banned:

- **Verification Proof Check**: Confirms valid Red failure proof (or acceptance criteria verification) exists in the commit history or issue thread. Diffs lacking proof are rejected.
- **Standards Axis**: Audits the diff against repo conventions and the Martin Fowler refactoring smell baseline (Mysterious Name, Duplicated Code, Speculative Generality, etc.).
- **Spec Fidelity Axis**: Verifies that every acceptance criterion is satisfied line-by-line and confirms zero out-of-scope code creep.

Only when both axes pass with zero findings does the reviewer apply `ship-it:reviewed`, post the resolution comment, close the ticket, and merge the PR.

See [`skills/ship-it/references/review.md`](skills/ship-it/references/review.md).

---

## Living Case Study: Dogfooding `[marketing]`

### How We Built Our Own Marketing Experience

Rather than describing a hypothetical scenario, `ship-it` was dogfooded to build its own comprehensive marketing and documentation overhaul:

1. **Plan Phase**: Skipped because the objective was well-scoped: launch a marketing landing page on a dedicated `gh-pages` branch and refactor the root `README.md` on `main`.
2. **Spec Phase**: Authored [Spec #16](https://github.com/awhipp/ship-it/issues/16). Passed an adversarial validation audit confirming clean branch isolation between `gh-pages` (web app source) and `main` (clean skill distribution).
3. **Tickets Phase**: Decomposed Spec #16 into four vertical slices with explicit dependency ordering: Ticket #17 (Scaffold & Hero) ➔ Ticket #18 (Explorer & Comparison) ➔ Ticket #19 (Deep Dives & Terminal Simulator) ➔ Ticket #20 (Root README Refactor).
4. **Implement Phase**: Each ticket was implemented in a fresh session with verified Red-Green test proof in Vitest or rigorous link/acceptance criteria auditing.
5. **Review Phase**: Each ticket diff was reviewed in an isolated session under the 2-Tier Context Isolation Protocol across independent Standards and Spec Fidelity axes before ticket closure.

### The Real-World Issue & PR Traceability Matrix

Every phase, issue, commit, and pull request is completely transparent and verifiable on GitHub:

| Phase / Slice | Issue Artifact | Verified Changeset / PR | Red-Green Proof & Verification | Review Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Spec** | [Spec #16](https://github.com/awhipp/ship-it/issues/16) | Published Spec Issue | Adversarial validation audit completed | `ship-it:validated` |
| **Ticket #17** | [Ticket #17](https://github.com/awhipp/ship-it/issues/17) | Commit [`af8a97d`](https://github.com/awhipp/ship-it/commit/af8a97d) | Red test commit `836f747`; all 11 hero tests passing | 0 Standards / 0 Spec findings |
| **Ticket #18** | [Ticket #18](https://github.com/awhipp/ship-it/issues/18) | Commit [`958ea8d`](https://github.com/awhipp/ship-it/commit/958ea8d) | Red test commit `70b8823`; all 20 explorer tests passing | 0 Standards / 0 Spec findings |
| **Ticket #19** | [Ticket #19](https://github.com/awhipp/ship-it/issues/19) | Commit [`2d974de`](https://github.com/awhipp/ship-it/commit/2d974de) | Red test commit `64c9fe6`; all 26 deep-dive tests passing | 0 Standards / 0 Spec findings |
| **Ticket #20** | [Ticket #20](https://github.com/awhipp/ship-it/issues/20) | PR [#22](https://github.com/awhipp/ship-it/pull/22) | Automated URL & anchor verification (100% passing) | Awaiting 2-tier review |

*Additional Prior Art PR*: See merged Pull Request [PR #8](https://github.com/awhipp/ship-it/pull/8) (`feat/agnostic-skill`) establishing harness-, CLI-, and model-agnostic compatibility.

---

## Frictionless Quickstart

### 1. Prerequisites

`ship-it` operates natively with standard git and GitHub tools. Ensure the GitHub CLI is installed and authenticated:

```bash
# Check GitHub CLI authentication
gh auth status

# Check git remote configuration
git remote -v
```

### 2. Installation

Install `ship-it` into your workspace or global agent environment using any of the following methods:

#### Via `npx skills` (Recommended)

```bash
npx skills install awhipp/ship-it
```

#### Manual Workspace Installation

Clone or copy the `skills/ship-it` folder into your project's `.agents/skills/` directory:

```bash
# In your project root
mkdir -p .agents/skills
cp -r /path/to/ship-it/skills/ship-it .agents/skills/ship-it
```

#### Global Agent Harness Installation

Copy `skills/ship-it` into your global harness skills directory:

- **Antigravity**: `~/.gemini/antigravity-ide/skills/ship-it`
- **Cursor**: `~/.cursor/skills/ship-it`
- **Claude Code**: `~/.claude/skills/ship-it`

### 3. Invocation

Invoke `ship-it` using your preferred environment interaction pattern:

- **Natural Language**:

  ```txt
  ship-it
  ```

- **Slash Command**:

  ```txt
  /ship-it
  /ship-it Implement #<ticket-number>
  ```

`ship-it` automatically queries your GitHub repository to determine the active feature and current phase, executes exactly one phase of work, commits progress, and provides the exact next command.

### 4. Automated Preflight

Before starting a feature, or if a GitHub tool call fails, run preflight to verify repository permissions and required labels:

```bash
/ship-it preflight
```

Preflight automatically checks authentication, repository remotes, issue access, and ensures required labels (`ready-for-agent`, `ship-it:map`, `ship-it:spec`, `ship-it:ticket`, `ship-it:validated`, `ship-it:reviewed`) are provisioned. See [`skills/ship-it/references/preflight.md`](skills/ship-it/references/preflight.md).

---
