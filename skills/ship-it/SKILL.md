---
name: ship-it
description: "Conducts a feature through the full build loop, plan, spec, tickets, implement, review, end to end across as many sessions as it takes, in any GitHub repository. Looks at what already exists for the feature (a map, a spec, tickets, a diff awaiting review) and states the one next step to take. Manual-only workflow: do NOT invoke automatically or unprompted; only activate when explicitly requested by the user via ship-it or /ship-it."
compatibility: Git repository, GitHub issue access (gh CLI or GitHub MCP/API), and a cross-platform shell.
metadata:
  disable-model-invocation: "true"
---

# Ship It

Conduct a feature through the full build loop, one phase at a time, across
however many sessions it takes:

**Plan → Spec → Tickets → Implement → Review**

This skill is self-contained and tracks work as GitHub issues: everything it
needs lives in this folder and in the files it writes into the repo you run it
in. It doesn't call out to any other skill.

## Invocation & Harness Configuration

`ship-it` is designed as a manual-only workflow and should not be invoked automatically by models without explicit user request.

### Claude Code

To disable automatic model invocation in Claude Code while maintaining schema conformance, configure `.claude/config.json` with `skillOverrides`:

```json
{
  "skillOverrides": {
    "ship-it": {
      "disableModelInvocation": true
    }
  }
}
```

This represents the zero-deviation configuration approach. Environments requiring file-level overrides may specify `disable-model-invocation: true` directly at the root of `SKILL.md` frontmatter, though this trades off strict validation conformance against open agent skill schemas.

## Why a conductor, not one pass

A feature big enough to need all five phases is also too big to hold in one
context window. Clearing context between phases is a feature, not a
limitation: the model reasons better in a fresh window than a crowded one, so
"one long session" is deliberately not the goal here.

This skill does not try to run the whole loop in a single reply. Each time you
run it, it works out where the feature currently stands and does **one** phase's
worth of work, then stops and tells you the next command. Run it again,
whenever, to keep going.

## Preflight, only when needed

`ship-it` assumes the repo is already set up: `gh` installed and
authenticated, a `github.com` remote, Issues enabled with write access, and
the `ready-for-agent` label and the `ship-it:*` type labels present (see
[references/preflight.md](references/preflight.md)). Normal runs don't check
any of this — skip straight to "Every run" below.

Run the checklist in [references/preflight.md](references/preflight.md) only
when the user explicitly asks (`/ship-it preflight`), or when a `gh` call
during a phase fails in a way that checklist covers (auth, permissions,
missing label, disabled Issues). Fix what's fixable, report the rest.

## Every run

### 1. Orient: which feature, which phase

If it isn't obvious from the conversation which feature is in play (the repo
may have several going at once), ask, and settle on that feature's **slug**: a
short, consistent identifier every issue for it carries in its title (e.g.
`auth-rewrite`, giving titles like `[auth-rewrite] Spec: ...`). A fresh
session with no conversation history just asks for the slug directly.

Once you have the slug, run one query per artifact type, in this order, and
take whichever comes back furthest along:

1. **Map**, not fully resolved:
   `gh issue list --label "ship-it:map" --search "<slug> in:title" --state open --json number,title,labels,state`
   (see [references/plan.md](references/plan.md))
2. **Published spec**:
   `gh issue list --label "ship-it:spec" --search "<slug> in:title" --state open --json number,title,labels,state`
   (see [references/spec.md](references/spec.md))
3. **Tickets** generated from that spec:
   `gh issue list --label "ship-it:ticket" --search "<slug> in:title" --json number,title,labels,assignees,state`
   (see [references/tickets.md](references/tickets.md)). When routing to a
   ticket, **skip any with a non-empty `assignees`** — another session has
   already claimed it.
4. **An implementation in progress**, or a diff that hasn't been reviewed yet:
   check for an open PR referencing the slug or a matching branch, and for a
   ticket from step 3 that's assigned but still open (see
   [references/implement.md](references/implement.md) and
   [references/review.md](references/review.md))

Each query above already asks for `labels`, so read them off the same
response rather than issuing a follow-up call: `ship-it:validated` on a map,
spec, or ticket set means it already passed the adversarial audit in
[references/validate.md](references/validate.md); `ship-it:reviewed` on a
ticket means its diff already passed independent review. Its **absence** on a
spec or ticket set that spans more than one session is the signal to validate
next — don't read a published artifact with no `ship-it:validated` label as
license to route straight past the audit into tickets or implementation.

Whichever of these is furthest along tells you the phase. Nothing existing at
all means the feature hasn't started.

### 2. Route to the one next step

| Current state                                                                        | Next step                                                                                                             |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Nothing exists; the feature is well-scoped enough to hold in one session             | Read `references/spec.md`, write the spec directly. No map needed.                                                    |
| Nothing exists; the effort is genuinely too big or too foggy to scope in one sitting | Read `references/plan.md`, chart the map. Use the test in that file, not a guess, to decide "foggy" vs "well-scoped." |
| A map exists and isn't resolved                                                      | Read `references/plan.md`, resolve the next ticket on the map. One ticket per session.                                |
| The map is resolved (or planning was skipped) and no spec exists                     | Read `references/spec.md`.                                                                                            |
| A spec exists, lacks `ship-it:validated`, and the build spans more than one session  | Read `references/validate.md` and audit the spec before splitting it into tickets. This is the recommended default here, not a parallel option to skip in favor of speed; skip only for a genuinely small, well-scoped spec. |
| A spec exists, no tickets yet, and the build needs more than one session             | Read `references/tickets.md`.                                                                                         |
| A spec exists and the whole build fits in one sitting                                | Read `references/implement.md` directly against the spec; skip ticket-splitting.                                      |
| Tickets exist, lack `ship-it:validated`, and haven't started                         | Read `references/validate.md` and audit the ticket set before anyone starts building. Recommended default whenever the set is big enough that a bad slice would surface mid-implementation; skip only for a small, obviously-right set. |
| Tickets exist and at least one is unblocked and unclaimed                            | Read `references/implement.md`, claim and build that ticket. Start a **fresh session** for it (see Context hygiene).  |
| A ticket is implemented (assigned, still open) and lacks `ship-it:reviewed`          | Read `references/review.md` in a **fresh session**, separate from whatever session implemented it.                    |
| A ticket carries `ship-it:reviewed`                                                  | Close out: comment resolution, close the ticket, open the PR or merge, per how the user works.                        |
| Review found issues                                                                  | Route back to `references/implement.md`, in a fresh session, to address them, then back to `references/review.md`.    |

### 3. Report and stop

End every run with one line: which phase you worked, what you did, and, if
the feature isn't finished, the exact next thing to run. Don't silently chain
into the next phase in the same reply unless the user explicitly asked for the
whole loop at once.

## Context hygiene

- **Plan → Spec → Tickets** benefit from staying in one unbroken conversation
  once planning has produced a clear destination: the thinking compounds. Not
  a hard rule, just worth naming if you're about to lose the thread.
- **Implement** should start in a **fresh session per ticket**. A ticket is
  self-contained by construction (see `references/tickets.md`), so carrying
  old context in only costs tokens without adding value.
- **Validate and review each want their own fresh session too**, and for the
  same underlying reason: the session that authored a spec, ticket set, or
  diff carries the reasoning behind it, and that reasoning is exactly what an
  outside check needs to not have. Carrying it in doesn't just waste tokens
  here, it biases the very check the fresh session exists to run.
- If a session's context is growing large before a natural stopping point,
  that's the signal to wrap up and hand off, not to push through with degraded
  reasoning.

## Reference index

| File                                               | Read it when                                                               |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [references/preflight.md](references/preflight.md) | A `gh` call fails, or the user asks to preflight the repo                  |
| [references/plan.md](references/plan.md)           | The effort is too big or foggy for one session                             |
| [references/spec.md](references/spec.md)           | Turning a settled idea into a spec                                         |
| [references/validate.md](references/validate.md)   | Adversarially auditing a published spec, ticket set, or map before build   |
| [references/tickets.md](references/tickets.md)     | Splitting a spec into buildable, session-sized slices                      |
| [references/implement.md](references/implement.md) | Building a ticket or a small spec, test-first                              |
| [references/review.md](references/review.md)       | A diff exists and needs checking against standards and spec, fresh session |
