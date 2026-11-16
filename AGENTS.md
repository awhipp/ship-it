# Agent Instructions (`awhipp/ship-it`)

Coding agents working in `awhipp/ship-it` follow these rules for version management and release automation.
Keep repository-specific release rules inside `AGENTS.md` so the files under `skills/ship-it/` remain portable across repositories.

## Version Manifest

`skills/ship-it/version.json` serves as the canonical version manifest for the `ship-it` skill.

```json
{
  "version": "0.22.0",
  "released": "2026-11-03",
  "minGhVersion": "2.94.0"
}
```

- **`version`**: Semantic version (`MAJOR.MINOR.PATCH`) of the skill.
- **`released`**: Release date in `YYYY-MM-DD` format.
- **`minGhVersion`**: Minimum required version of the GitHub CLI (`gh`).

## SemVer Bump Rules

Update `skills/ship-it/version.json` whenever a change modifies files inside `skills/ship-it/`.
Select the increment tier from the table below:

| Tier | Criteria in `skills/ship-it/` |
| :--- | :--- |
| **Major** | Breaking interface changes, backward-incompatible directive syntax, or fundamental overhauls of the state machine. |
| **Minor** | New directives, phase capabilities, or backward-compatible feature expansions. |
| **Patch** | Bug fixes, documentation updates, or internal performance refinements. |

## Non-Skill Exclusions

Scope version updates strictly to files inside `skills/ship-it/`.
Exclude changes exclusively outside `skills/ship-it/` (such as root `README.md`, `AGENTS.md`, `.github/workflows/`, or repository configuration) from version bumps.

## Lifecycle Ownership and Release Flow

- **Implementation ownership**: Bump `version` and set `released` to the current `YYYY-MM-DD` date in `skills/ship-it/version.json` during the implementation phase of the pull request touching `skills/ship-it/`.
- **Single bump per pull request**: Apply one version increment per pull request regardless of how many build tickets touch `skills/ship-it/`.
- **Safety check on pull requests**: `.github/workflows/version-check.yml` compares pull request changes against `origin/<base>` and emits a non-blocking warning when `skills/ship-it/` changes without a `version.json` update.
- **Automated release publication**: Merging a `skills/ship-it/version.json` change into `main` triggers `.github/workflows/release.yml` to create tag `v<version>` and publish a GitHub Release with auto-generated release notes.

## Skill Maintenance Invariants

When auditing or refactoring `skills/ship-it/` (for example via `/skill-judge` or `/skill-creator`), preserve these repository-specific invariants:

- **Core workflow preservation**: Keep `ship-it`'s five phases, three boundaries, first-match routing table, zero-assumption verification, two-tier isolation (`isolation.md`), two-axis review, annotated pull requests, and GitHub-native state intact unless explicitly directed otherwise.
- **Writing standard**: Author all skill, reference, and `README.md` edits per `skills/ship-it/references/writing.md` without scripts or word counters.
- **Cross-platform shell & `gh` efficiency**: Preserve PowerShell 5.1 quoting (`"@me"`, inner-double-quote-free `--jq '...'`), `--body-file` temp cleanup, bounded `gh` queries (`--limit 100`, `--force`), and search-first codebase exploration.
- **Circuit-breaker & routing parity**: Keep circuit breakers consistent across `SKILL.md` Rows 5–7, 9, 11, and 12, and keep `README.md` concise and synchronized with `skills/ship-it/`.
- **Frontmatter gating**: Retain `disable-model-invocation: true` and avoid `<` or `>` characters in `SKILL.md` YAML frontmatter.

## Post-PR Skill Evaluation

Pull requests that modify files inside `skills/ship-it/` undergo an advisory `skill-judge` evaluation after close-out completes.

### Advisory Trigger and Gate Isolation

- **Modified skill trigger**: Run an advisory `skill-judge` evaluation on modified `skills/ship-it/` files strictly after creating the pull request and posting close-out annotations.
- **Gate isolation**: Execute the `skill-judge` check outside the `final-review` gate of `ship-it`.
- **Boundary preservation**: Preserve `skills/ship-it/references/isolation.md` and exit behavior at `Boundary 3`.

### Invariant Filtering and Triage

- **Invariant filter**: Filter `skill-judge` recommendations against [Skill Maintenance Invariants](#skill-maintenance-invariants), including `disable-model-invocation: true`, the five-phase workflow, and `README.md` parity.
- **Pre-merge report**: Present explicit findings to the user before merge so the user decides whether to file follow-up `ship-it:bug` issues.
- **Confirmed triage**: Open `ship-it:bug` issues only after the user confirms each finding.

### Installation and Fallback

- **Install command**: Install the skill with `npx skills add softaworks/agent-toolkit@skill-judge`.
- **Global availability**: Add the optional `-g` flag to install `skill-judge` globally across workspaces.
- **Unavailable-skill fallback**: Skip the advisory evaluation and report a brief note to the user when `skill-judge` is unavailable in the harness.
