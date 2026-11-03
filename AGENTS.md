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
