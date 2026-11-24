## Invariants

Change only by explicit breaking decision.

  1. GitHub issues, labels, comments, and the feature branch are the
     only state. Nothing load-bearing lives in a session, a local file,
     or a subagent's memory.
  2. The human approves at three boundaries and merges the PR. The
     skill never merges.
  3. No author verifies their own work. Validation and review run in
     fresh context, read-only on the artifact under audit.
  4. Never guess on scope, observable behaviour, or irreversible
     architecture. Ask, or defer explicitly to a named later stage.
  5. Altitude: the Spec is high-level (behaviours, boundaries, shared
     contracts); tickets are the low-level design (touchpoints, deltas,
     acceptance criteria). Neither does the other's job.
  6. Tickets are vertical, independently verifiable slices.
  7. Portable by construction: agent-agnostic, OS-agnostic, any
     codebase, nothing required beyond git and `gh`.
  8. Convergence is structural: pass 1 is complete, pass 2+ is
     delta-only, and no gate runs a third non-approved pass without a
     human reset.
  9. Size is an invariant, not an aspiration: the byte budgets in the
     acceptance criteria are checked in the PR that changes the skill.

## Release and versioning

**Version manifest** (`skills/ship-it/version.json`):
- `version`: SemVer of the skill. The release tag is `v<version>`.
- `released`: date the version was cut, `YYYY-MM-DD`.
- `minGhVersion`: lowest `gh` the skill supports. `references/preflight.md` checks `gh --version` against it.

**SemVer bumps**:
- Major: a breaking change, including any change to an invariant.
- Minor: a compatible behaviour change, including any change to a convention.
- Patch: a fix or wording change that alters no behaviour.

**Lifecycle ownership**:
- The PR author edits `skills/ship-it/version.json` (`version`, `released`, and `minGhVersion` when a newer `gh` is needed) in the same PR that changes `skills/ship-it/`.
- `release.yml` owns the `v<version>` tag and the GitHub Release. Never create either by hand: an existing tag makes the workflow skip.

**Release automation**:
- `.github/workflows/version-check.yml` runs on a pull request that touches `skills/ship-it/**`. If the diff against the base branch lacks `skills/ship-it/version.json`, it emits a warning and a step-summary notice. It never fails the check.
- `.github/workflows/release.yml` runs on a push to `main` that changes `skills/ship-it/version.json`. It reads `version` and runs `gh release create v<version> --generate-notes`. If that tag or release already exists, it exits without publishing, so a merge publishes only when `version` is new.

**PR checklist** (a PR that changes `skills/ship-it/`):
- [ ] The PR body reports the bytes of each touched file before and after, and these invariant-9 budgets, measured with `wc -c`:
  - total over every file in `skills/ship-it/` ≤ 70,000
  - `SKILL.md` ≤ 10,000
  - `SKILL.md` + `references/isolation.md` + `references/writing.md` ≤ 25,000
