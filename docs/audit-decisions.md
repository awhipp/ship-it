# Audit Decision Log

This document records the 18 user-approved decisions settled during the `skills/ship-it/` best-practice alignment audit.
Review these records before proposing changes that reopen settled trade-offs.

## Summary Table

| ID | Topic | Decision | Record |
| :--- | :--- | :--- | :--- |
| **H1** | Behavioral routing-fixture evals | **No-go** | [H1: Behavioral routing-fixture evals](#h1-behavioral-routing-fixture-evals) |
| **H2** | Trivial quote-free `--jq` filters | **Modified-go** | [H2: Trivial quote-free `--jq` filters](#h2-trivial-quote-free---jq-filters) |
| **H3** | Role-split reference files | **Go** | [H3: Role-split reference files](#h3-role-split-reference-files) |
| **H4** | Unified circuit-breaker rule and table | **Modified-go** | [H4: Unified circuit-breaker rule and table](#h4-unified-circuit-breaker-rule-and-table) |
| **M1** | Stable string row identifiers | **No-go** | [M1: Stable string row identifiers](#m1-stable-string-row-identifiers) |
| **M2** | Split `writing.md` by concern | **No-go** | [M2: Split `writing.md` by concern](#m2-split-writingmd-by-concern) |
| **M3** | Compact routing table metadata | **Modified-go** | [M3: Compact routing table metadata](#m3-compact-routing-table-metadata) |
| **M4** | Single-ticket fast lane | **No-go** | [M4: Single-ticket fast lane](#m4-single-ticket-fast-lane) |
| **M5** | Versioning and `minGhVersion` sync | **Modified-go** | [M5: Versioning and `minGhVersion` sync](#m5-versioning-and-minghversion-sync) |
| **M6** | Post-PR `skill-judge` cadence | **Modified-go** | [M6: Post-PR `skill-judge` cadence](#m6-post-pr-skill-judge-cadence) |
| **M7** | Static CI link and frontmatter checks | **No-go** | [M7: Static CI link and frontmatter checks](#m7-static-ci-link-and-frontmatter-checks) |
| **L1** | Deduplicate subagent prohibitions | **Modified-go** | [L1: Deduplicate subagent prohibitions](#l1-deduplicate-subagent-prohibitions) |
| **L2** | Reason clauses for bare prohibitions | **Modified-go** | [L2: Reason clauses for bare prohibitions](#l2-reason-clauses-for-bare-prohibitions) |
| **L3** | Trimmed `README.md` boundary table | **Modified-go** | [L3: Trimmed `README.md` boundary table](#l3-trimmed-readmemd-boundary-table) |
| **L4** | Circuit-breaker reset author verification | **No-go** | [L4: Circuit-breaker reset author verification](#l4-circuit-breaker-reset-author-verification) |
| **L5** | Portable manual-only invocation guarantee | **Go** | [L5: Portable manual-only invocation guarantee](#l5-portable-manual-only-invocation-guarantee) |
| **L6** | Upstream repository manifest field | **No-go** | [L6: Upstream repository manifest field](#l6-upstream-repository-manifest-field) |
| **Gov** | `AGENTS.md` invariants and decision log | **Approved** | [Gov: `AGENTS.md` invariants and decision log](#gov-agentsmd-invariants-and-decision-log) |

## Decision Records

### H1: Behavioral routing-fixture evals

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/297), [tool evaluation](https://github.com/awhipp/ship-it/issues/293)).
- **Rationale**: Static checks duplicate pull request review, and tool evaluation confirmed `claude plugin eval` requires live model calls via a harness-specific runner rather than offline fixture grading.
- **Revisit condition**: Revisit if a harness-agnostic offline runner can deterministically grade frozen GitHub state fixtures without live model billing.

### H2: Trivial quote-free `--jq` filters

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/298), [shell evaluation](https://github.com/awhipp/ship-it/issues/294)).
- **Rationale**: Windows PowerShell 5.1 strips unescaped inner double quotes while `pwsh` 7 and POSIX shells reject backslash or doubled quotes, so trivial quote-free selectors (`.body[:120]` and `.body`) with in-agent heading and verdict counting eliminate fragile `implode` and `|keys[]` filters without bundled scripts.
- **Revisit condition**: Revisit only if GitHub CLI changes `--jq` argument parsing on Windows PowerShell 5.1; never adopt backslash-escaped quotes, doubled quotes, or bundled helper scripts.

### H3: Role-split reference files

- **Decision**: **Go** ([decision record](https://github.com/awhipp/ship-it/issues/299)).
- **Rationale**: Splitting shared reference files into 15 role-scoped files under [`skills/ship-it/references/`](../skills/ship-it/references/) makes file loading the scoping boundary, removes all six `| Role | Scope | Skip |` tables, and prevents cross-role altitude contamination.
- **Revisit condition**: Revisit only if a new workflow role introduces shared procedures that warrant an additional role-specific or shared core reference file.

### H4: Unified circuit-breaker rule and table

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/301)).
- **Rationale**: Collapsing three repeated circuit-breaker protocols into one shared counting rule, an inline trip-and-reset procedure, and one four-column lookup table in [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md) without skip rules removes six per-entry conditions without adding a separate reference file.
- **Revisit condition**: Revisit if a new validation or review gate requires its own verdict issue or report heading in the shared lookup table.

### M1: Stable string row identifiers

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/300)).
- **Rationale**: Numbered row citations span only four files (32 citations total, 27 inside [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md)), whereas named rows add a second identifier while first-match routing still requires ordered numbers.
- **Revisit condition**: Revisit only if mid-table row insertions become frequent enough that renumbering causes defects and lettered sub-rows cannot absorb them.

### M2: Split `writing.md` by concern

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/302)).
- **Rationale**: Nearly every role uses both the prose rules and shell conventions in [`skills/ship-it/references/writing.md`](../skills/ship-it/references/writing.md), and moving testing prohibitions would force cross-role file loads and dozens of link updates for minimal context savings.
- **Revisit condition**: Revisit only if [`skills/ship-it/references/writing.md`](../skills/ship-it/references/writing.md) grows substantially and a role-loading matrix justifies separate `shell.md` and `testing.md` files during a broader reference refactor.

### M3: Compact routing table metadata

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/303)).
- **Rationale**: Dropping the `Source` column and moving repeated circuit-breaker and Tier 2 clauses into shared rules below the routing table in [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md) saves tokens on every invocation while keeping unique halt logic inside each row's `Transition` cell.
- **Revisit condition**: Revisit if a new routing predicate introduces on-demand comment queries or Tier 2 fresh-session halts that must be listed in the table notes.

### M4: Single-ticket fast lane

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/304)).
- **Rationale**: Separate final review provides the only independent test and branch verification run that does not rely on implementer handoff comments, and a fast-lane branch would add untested routing complexity.
- **Revisit condition**: Revisit as a content optimization inside [`skills/ship-it/references/review-final.md`](../skills/ship-it/references/review-final.md) for single-ticket features while preserving the separate final-review routing gate and independent verification run.

### M5: Versioning and `minGhVersion` sync

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/305), [tool evaluation](https://github.com/awhipp/ship-it/issues/295)).
- **Rationale**: Removing the stale literal JSON block from [`AGENTS.md`](../AGENTS.md) and reading `minGhVersion` from [`skills/ship-it/version.json`](../skills/ship-it/version.json) in [`skills/ship-it/references/preflight.md`](../skills/ship-it/references/preflight.md) eliminates drift, whereas `release-please` lacks documented `released` date stamping and cannot derive bump tiers from `[<slug>]`-prefixed pull requests.
- **Revisit condition**: Revisit release automation only if pull request titles standardize on Conventional Commits and automated tooling supports stamping the `released` date field.

### M6: Post-PR `skill-judge` cadence

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/307)).
- **Rationale**: Running the advisory `skill-judge` evaluation in [`AGENTS.md`](../AGENTS.md) only on minor and major SemVer bumps (and on demand for patches) removes per-PR triage overhead on patch changes that do not alter skill structure.
- **Revisit condition**: Revisit if patch pull requests introduce structural or progressive-disclosure regressions that escape review.

### M7: Static CI link and frontmatter checks

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/306), [tool evaluation](https://github.com/awhipp/ship-it/issues/296)).
- **Rationale**: Tool evaluation showed `markdown-link-check` lacks anchor checking, `lychee --offline --include-fragments` is unverified locally, and `skills-ref validate` is demonstration-only and rejects `disable-model-invocation: true`, so one-time anchor verification during refactors replaces permanent CI jobs.
- **Revisit condition**: Revisit if broken markdown links or intra-file anchors repeatedly reach `main` between structural refactors.

### L1: Deduplicate subagent prohibitions

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/308)).
- **Rationale**: Stating subagent prohibitions once in [`skills/ship-it/references/isolation.md`](../skills/ship-it/references/isolation.md) enforces a single source of truth, while retaining point-of-action temporary file deletion reminders at every write step prevents leaked payload files from entering commits.
- **Revisit condition**: Revisit only if temporary payload file handling moves to a mechanism that cannot leave untracked files in the working tree.

### L2: Reason clauses for bare prohibitions

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/309)).
- **Rationale**: Adding a concise one-clause second sentence to five bare prohibitions in [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md), [`skills/ship-it/references/isolation.md`](../skills/ship-it/references/isolation.md), [`skills/ship-it/references/implement.md`](../skills/ship-it/references/implement.md) (and [`skills/ship-it/references/rework.md`](../skills/ship-it/references/rework.md)), and [`skills/ship-it/references/writing.md`](../skills/ship-it/references/writing.md) explains the failure mode where agents might otherwise rationalize past an edge case.
- **Revisit condition**: Revisit if new bare prohibition rules are added where the failure mode is not already stated in the adjacent sentence.

### L3: Trimmed `README.md` boundary table

- **Decision**: **Modified-go** ([decision record](https://github.com/awhipp/ship-it/issues/310)).
- **Rationale**: Trimming the `## How it works` table in [`README.md`](../README.md) to `Boundary`, `Phase`, `Phase exit / Boundary halt`, and `Reference` linking to [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md) removes duplicated phase prose and per-row reference lists without affecting the independent `gh-pages` marketing site.
- **Revisit condition**: Revisit if [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md) changes its five-phase or three-boundary model, directive forms, or `minGhVersion`.

### L4: Circuit-breaker reset author verification

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/311)).
- **Rationale**: Comparing comment authors against `gh api user` cannot distinguish user-typed resets from agent-posted comments because both share the authenticated `gh` account, and the check would block legitimate team collaborators.
- **Revisit condition**: Revisit only if a separate trust requirement for `authorAssociation` across external issue comments is filed and approved.

### L5: Portable manual-only invocation guarantee

- **Decision**: **Go** ([decision record](https://github.com/awhipp/ship-it/issues/312)).
- **Rationale**: Documenting in [`AGENTS.md`](../AGENTS.md) that `disable-model-invocation: true` is a Claude Code extension outside `agentskills.io` ensures maintainers preserve the manual-only sentence in [`skills/ship-it/SKILL.md`](../skills/ship-it/SKILL.md) `description` as the portable guarantee across harnesses.
- **Revisit condition**: Revisit if the `agentskills.io` specification adopts a standard cross-harness frontmatter field for manual-only invocation.

### L6: Upstream repository manifest field

- **Decision**: **No-go** ([decision record](https://github.com/awhipp/ship-it/issues/313)).
- **Rationale**: The upstream repository path `awhipp/ship-it` appears only in two version-check queries, and adding a repository field to [`skills/ship-it/version.json`](../skills/ship-it/version.json) would expand the manifest surface for the rare case of a fork publishing independent releases.
- **Revisit condition**: Revisit if a diverged fork publishes independent skill releases and needs `version.json` to drive upstream update checks.

### Gov: `AGENTS.md` invariants and decision log

- **Decision**: **Approved** ([decision record](https://github.com/awhipp/ship-it/issues/314)).
- **Rationale**: Updating nine maintenance invariants in [`AGENTS.md`](../AGENTS.md) and linking to this durable decision log aligns repository governance with all settled audit outcomes and prevents future audits from re-litigating resolved questions.
- **Revisit condition**: Revisit whenever a future user-approved audit decision modifies a repository maintenance invariant or supersedes a record in this file.
