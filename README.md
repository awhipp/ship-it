# ship-it

[![Live Site](https://img.shields.io/badge/Live_Site-awhipp.github.io%2Fship--it-2563eb?style=flat-square&logo=githubpages&logoColor=white)](https://awhipp.github.io/ship-it/)
[![Standard](https://img.shields.io/badge/agentskills.io-compliant-10b981?style=flat-square)](https://agentskills.io)

**The Autonomous Conductor for Software Engineering.** Put developers back in the driver's seat of the SDLC with phase-bounded loops, mandatory human review pauses, universal task isolation, and pragmatic, domain-aligned verification.

```txt
Boundary 1: Mapping       Boundary 2: Definition       Boundary 3: Execution
    [ Plan ]        ──▶    [ Spec ──▶ Tickets ]   ──▶   [ Implement ──▶ Review ]
 ⏸ Review Pause              ⏸ Review Pause               ⏸ Review Pause
```

*Phase-bounded autonomous execution. Verified gates at every seam. Zero context rot.*

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

`ship-it` queries your GitHub repository during Orient to determine the active feature slug, current phase, and active automation boundary.
When interactive prompt tools exist (`ask_question`, `prompt`), `ship-it` displays the active boundary and stopping checkpoint, and prompts the developer to choose an execution mode:

- **Phase-Bounded Autonomous Loops**: Runs autonomously strictly within the active boundary (`Mapping`, `Spec & Tickets`, or `Implementation & Review`). Execution halts automatically at the boundary exit checkpoint for mandatory human review.
- **Step-by-step mode**: Executes one phase or ticket at a time. The conductor pauses for interactive confirmation before every downstream step.

When interactive prompt tools are absent, `ship-it` defaults to step-by-step mode.
In step-by-step mode, the conductor executes exactly one bounded slice of work, verifies the gate, and reports the next step.

Need to verify repo setup or label provisioning? Run:

```bash
/ship-it preflight
```

*(See [`preflight.md`](skills/ship-it/references/preflight.md) for automated checks).*

---

## Why ship-it?

Autonomous coding agents present severe operational challenges:

- **Unchecked Agent Drift**: Giving an agent a loose prompt and massive context leads to hallucinated APIs, ignored constraints, and unreviewable 1,500-line mega-PRs.
- **Context Rot and Authoring Bias**: Accumulating conversation history across lifecycle stages degrades LLM reasoning. Long-lived agents author, slice, implement, and self-review code while rationalizing their own blind spots.
- **Babysitting Fatigue**: Micro-prompting an agent line-by-line destroys developer velocity.

`ship-it` solves these challenges by combining **phase-bounded autonomous loops**, **mandatory human review pauses**, and **universal task isolation**.
Instead of running unbounded agents across bloated context windows, `ship-it` confines autonomy to discrete phases, dispatches tasks to isolated zero-context child subagents, stores state natively in GitHub issues, and halts for developer review at every boundary exit.

---

## The 5-Phase Lifecycle and Automation Boundaries

`ship-it` maps the five software engineering phases into three discrete automation boundaries.
Each boundary enforces a mandatory pause for human review before downstream work can begin:

| Automation Boundary | Lifecycle Phase | Purpose | Exit Checkpoint & Mandatory Review Pause | Primary Artifact | Reference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Boundary 1: Mapping** | **1. Plan** | Chart architectural decisions when requirements are foggy. | Map resolves and all decision tickets close. Developer approves settled decisions before specification. | Decision Map (`[slug] Map: ...`) | [`plan.md`](skills/ship-it/references/plan.md) |
| **Boundary 2: Definition** | **2. Spec** | Define problem statement, user stories, and test seams. | Specification passes adversarial audit. For single-session features, developer approves spec before build. | Feature Spec (`[slug] Spec: ...`) | [`spec.md`](skills/ship-it/references/spec.md) |
| **Boundary 2: Definition** | **3. Tickets** | Decompose specification into vertical tracer-bullet slices. | Ticket set validation passes with `ship-it:validated` and `ready-for-agent`. Developer approves slice breakdown before build. | Vertical Tickets (`[slug] Ticket: ...`) | [`tickets.md`](skills/ship-it/references/tickets.md) |
| **Boundary 3: Execution** | **4. Implement** | Build one slice with test-first Red-Green or domain checks. | Implementation subagent passes verification and commits diff. Chains to review subagent. | Git Diff & Commit | [`implement.md`](skills/ship-it/references/implement.md) |
| **Boundary 3: Execution** | **5. Review** | Independent review across Standards and Spec Fidelity. | Final ticket closes, spec completion comment posts, and PR opens. Halts for human PR review. Merging is strictly manual. | Review Verdict & PR | [`review.md`](skills/ship-it/references/review.md) |

---

## Phase-Bounded Automation Boundaries

Autonomous execution operates strictly within three discrete automation boundaries.
The conductor enforces hard halts at each boundary exit.
Autonomous transitions across boundary gates without explicit developer approval are strictly prohibited:

### Boundary 1: Mapping (Plan Phase)

Boundary 1 charts decisions and clears uncertainty before drafting specifications:

- **Boundary entry**: Begins when initiating an unmapped feature or resuming an open map.
- **Execution scope**: Charts decision destinations, creates decision tickets, and resolves architectural forks.
- **Child subagent delegation**: Dispatches research, prototype, and task tickets to isolated child subagents with zero parent conversation context per [isolation.md](skills/ship-it/references/isolation.md#decision-ticket-protocol-tier-1). Pauses autonomous execution immediately for interactive developer input on grilling tickets.
- **Mandatory human review pause**: Halts when the map resolves and all decision tickets close. The conductor reports settled decisions and waits for explicit developer approval before advancing to Boundary 2.

### Boundary 2: Spec & Tickets (Definition Phase)

Boundary 2 formalizes requirements and validates execution plans before authoring code:

- **Boundary entry**: Begins after developer approval of Boundary 1, or when well-scoped work skips planning.
- **Execution scope**: Drafts feature specifications, conducts adversarial audits, slices vertical tickets, and validates ticket sets.
- **Child subagent delegation**: Dispatches specification validation, ticket slicing, and ticket set validation to isolated child subagents with zero parent conversation context per [isolation.md](skills/ship-it/references/isolation.md). Passing only the specification issue verifies that the spec is self-contained.
- **Mandatory human review pause**: Halts after ticket set validation passes carrying `ship-it:validated` and `ready-for-agent` (or after spec validation passes for single-session specs). The conductor reports the validated breakdown and waits for explicit developer approval before advancing to Boundary 3.

### Boundary 3: Implementation & Review (Execution Phase)

Boundary 3 builds and reviews verified slices test-first until completing the specification:

- **Boundary entry**: Begins after developer approval of Boundary 2, initiating implementation of the ticket frontier (or validated single-session spec).
- **Execution scope**: Claims tickets, builds slices test-first, verifies commits, audits diffs via independent review subagents, executes autonomous rework up to two retries, and advances the frontier.
- **Child subagent delegation**: Dispatches implementation, diff review, and remediation to isolated child subagents with zero parent conversation context per [isolation.md](skills/ship-it/references/isolation.md).
- **Mandatory human review pause**: Halts when the final ticket closes, the completion comment posts on the parent specification, and the pull request opens. Automated pull request merge is strictly prohibited. The conductor halts execution and waits for human review and merge approval.

---

## Conductor Orchestration and Execution Modes

`ship-it` orchestrates feature delivery across two distinct execution modes:

- **Phase-Bounded Autonomous Loops**: The conductor runs continuous subagent build loops strictly within the active boundary. It executes tasks, coordinates subagent handoffs, and halts at the boundary exit checkpoint for developer review.
- **Step-by-step mode**: The conductor executes exactly one bounded slice of work per invocation. It requests interactive confirmation before executing downstream phases, keeping developers in full control of every transition.

When interactive prompt tools exist (`ask_question`, `prompt`), `ship-it` prompts the developer with the active boundary and stopping checkpoint at the start of every run.
When interactive tools are absent, the conductor defaults to step-by-step mode.

---

## Universal Task Isolation (Tier 1)

`ship-it` enforces universal task isolation under Tier 1 environments across all lifecycle phases:

- **Conductor as Lightweight Orchestrator**: The parent conductor never absorbs raw code diffs, bulky test transcripts, or implementation rationale. It coordinates transitions and manages high-level state.
- **Zero-Context Child Subagents**: The conductor dispatches every self-contained workload to an isolated child subagent with zero parent conversation context:
  - **Decision tickets**: Dispatches research, prototype, and task tickets from planning maps to isolated subagents per the [Decision Ticket Protocol](skills/ship-it/references/isolation.md#decision-ticket-protocol-tier-1). Subagents record findings in issue comments and return structured verdict summaries.
  - **Ticket slicing**: Dispatches vertical tracer-bullet slicing from validated specifications to an isolated subagent per the [Ticket Slicing Protocol](skills/ship-it/references/isolation.md#ticket-slicing-protocol-tier-1). Passing only the specification issue verifies that the spec is self-contained.
  - **Implementation**: Dispatches unstarted tickets to isolated subagents per the [Autonomous Implementation Protocol](skills/ship-it/references/isolation.md#autonomous-implementation-protocol-tier-1). Subagents build code, verify criteria, and return commit hashes and evidence.
  - **Validation and review**: Dispatches specs, ticket sets, and code diffs to fresh subagents per the [Autonomous Verification Protocol](skills/ship-it/references/isolation.md#autonomous-verification-protocol-tier-1). Evaluators audit artifacts objectively without authoring bias.
  - **Autonomous remediation**: Dispatches review findings to isolated remediation subagents per the [Autonomous Rework Protocol](skills/ship-it/references/isolation.md#autonomous-rework-protocol-tier-1).
- **Elimination of Context Rot**: Isolating workloads prevents conversational detours and token accumulation from degrading LLM reasoning across lifecycle phases. Every subagent operates with a clean, focused context window.

### Continuous Phase Chaining (Tier 1)

In autonomous loop mode within Boundary 3, the conductor executes [Continuous Phase Chaining](skills/ship-it/references/isolation.md#continuous-phase-chaining-tier-1):

- **Zero-Context Isolation**: The conductor dispatches unstarted tickets to isolated child subagents with zero parent conversation context.
- **Automated Verification Handoff**: Upon receiving a clean implementation verdict summary, the conductor immediately verifies commit generation and dispatches an isolated review subagent.
- **Autonomous Frontier Progression**: When the review subagent approves the diff, the conductor posts a resolution comment, closes the ticket, and advances immediately to the next unstarted ticket.
- **Feature Close-Out Protocol**: When the final ticket closes, the conductor posts a completion comment to the parent specification, opens or updates the pull request, and halts execution for human review.

### Autonomous Rework Routing with Bounded Retries

When a review subagent rejects a diff and applies `ship-it:changes-requested`, `ship-it` initiates the [Autonomous Rework Protocol](skills/ship-it/references/isolation.md#autonomous-rework-protocol-tier-1):

- **Remediation Dispatch**: The conductor launches an isolated remediation subagent with the review feedback, ticket requirements, and feature branch name.
- **Remediation Verification**: The remediation subagent fixes reported defects, executes verification, and commits fixes directly to the branch.
- **Re-Verification**: The conductor dispatches a fresh review subagent to audit the remediated diff.
- **Bounded Retry Limit**: Rework routing enforces a strict limit of at most two remediation attempts per ticket. If review rejection persists after two attempts, the conductor alerts the developer and halts execution for human intervention.

### Tier 2 Manual Fallback Preservation

In environments lacking subagent primitives, `ship-it` preserves full manual fallback without compromising rigor:

- **Authoring Session Handoff**: The conductor applies the `ready-for-agent` status label, prints the explicit command for a fresh session, and stops execution. In-context persona simulation is strictly prohibited.
- **Fresh Session Execution**: Developers or agents execute implementation, validation, and review in dedicated, fresh sessions per the reference guides.
- **Manual Rework Workflow**: When a review requests changes, a fresh manual session claims the ticket, resolves findings, commits remediations, posts an explanatory comment, and removes the `ship-it:changes-requested` label for re-review.

---

## Core Guarantees

- **Strict Boundary Enforcement**: The conductor enforces hard halts at each boundary exit. Autonomous loops never transition across boundary gates without explicit developer approval. Automated pull request merging is strictly prohibited.
- **Mandatory Human Review Pauses**: Guaranteed review checkpoints halt autonomous execution at the exits of Mapping, Definition, and Execution. Developers inspect settled decisions, validated ticket breakdowns, and final pull requests.
- **Universal Task Isolation**: The parent conductor operates strictly as a lightweight orchestrator without absorbing heavy domain tokens. Every self-contained workload runs in isolated subagents with zero parent conversation context to eliminate context rot and authoring bias.
- **Phase-Bounded Autonomous Loops**: Conductor prompts developers with active boundaries and stopping checkpoints. Autonomous execution runs strictly to the active boundary exit before pausing for human review.
- **Zero Proprietary State**: No SaaS lock-in or local runtime state. GitHub is the state machine—tracked via native issues, markdown tasklists, `ship-it:*` labels, branches, and commits.
- **Continuous Subagent Build Loop**: In autonomous loop mode within Boundary 3, the conductor continuously chains implementation subagents, review subagents, and ticket frontier progression until completing the specification.
- **Bounded Autonomous Rework Routing**: When a review requests changes, the conductor routes tickets to isolated remediation subagents with retries bounded to at most two attempts before escalating to the developer.
- **Preserved Tier 2 Manual Fallback**: When subagent tools are absent, the conductor applies `ready-for-agent`, prints the exact command for a fresh session, and pauses execution without simulating personas in-context.
- **Dual-Channel Issue Relationships**: Connects issues natively with GitHub sub-issues and dependencies (`--parent`, `--blocked-by`). Transparently falls back to markdown pointers (`Part of #<spec-id>`, `## Blocked by`) across unsupported repository tiers.
- **Deterministic 3-State Orient Routing**: Isolates ticket evaluation to the lowest-numbered open ticket on the specification frontier. Routes deterministically across Reviewed, In-Progress, and Unstarted states without sequence confusion.
- **Context Hygiene as a Feature**: LLMs degrade as context history bloats. `ship-it` enforces fresh sessions and isolated child contexts across all phases, eliminating hallucination loops and confirmation bias. Highlights lean implement discovery (ephemeral subagent exploration for multi-file tickets) and targeted final sweeps for negative invariants to prevent context bloat.
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
