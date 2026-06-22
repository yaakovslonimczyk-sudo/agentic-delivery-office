# Agentic Delivery Office

<!-- Agentic Delivery Office section — created by activation on 2026-06-21. -->

## What this project is

The Agentic Delivery Office is a **portable methodology kit**, not an app: a set
of specialist sub-agent definitions, a staged-gates delivery protocol
(`ORCHESTRATION.md`), mechanical hooks/commands, and a zero-dependency Live
Board cockpit. Installed once at user scope, opt-in per project. Current phase:
**maintenance / polish** — the protocol, agents, installer, cockpit, and the
companion Medium article have all shipped; work now is incremental hardening
and feature additions, dogfooded through the office's own gates.

## Business context

<!-- Inferred at activation from the repo + author intent. Correct any line that's wrong. -->

- **Who pays / business model**: the author's own IP — a thought-leadership /
  open-kit play (a Medium article + a downloadable kit), not a paid SaaS. The
  "customer" is a developer who installs the kit; the "revenue" is credibility
  and adoption.
- **Cost constraints**: the kit's value proposition *is* token economy — it
  routes junior-tier work below the frontier to cut spend. So the cockpit and
  protocol must make per-engagement token/$ cost visible and keep the office's
  own overhead low. Zero runtime dependencies is a hard constraint (the board
  is plain Node http+SSE; the installer is bash + jq/python3).
- **Strategy / current priority**: **correctness and self-consistency over
  feature breadth** — every claim in the README/article must match shipped
  reality (the last realignment commit, 97ad768, was exactly this). A shipped
  feature that contradicts the narrative is worse than a missing one.
- **PRD / spec location**: `ORCHESTRATION.md` (the protocol), `README.md`, and
  `article/MEDIUM-ARTICLE.md` together are the spec.
- **Explicit non-goals**: not a hosted/multi-tenant product; no telemetry
  backend (mid-run token streaming via OpenTelemetry is deferred, not planned);
  no build step or framework dependency for the cockpit.

## Architecture in 5 lines

Methodology kit. `ORCHESTRATION.md` = the protocol; `.claude/agents/*.md` = 11
specialist agents (mirrored to `ports/codex` TOML + `ports/grok` skill);
`.claude/hooks/*.sh` = event emitter + scope gate + commit gate; `.claude/bin/
office-state.sh` = Layer-2 state writer; `.claude/board/{server.js,index.html}`
= the Live Board (Node SSE, reads `events.jsonl` + `~/.claude/office/scope.json`
+ `engagements/*.json`). `install.sh` installs all of it to user scope.

## Conventions

- **Cockpit**: vanilla Node (no deps, no build), single-file `index.html`;
  colors/state read from real endpoints, simulation fallback when no server.
- **Hooks**: bash + `jq`/`python3`, always `exit 0` except the commit gate;
  consult `office-active.sh` for scope before acting.
- **Installer idempotency**: `append_block` wraps content in `<!-- MARKER -->`
  and skips if present; `merge_settings` dedupes hooks by command. Never clobber.
- **Slash commands**: markdown + YAML frontmatter, second-person instructions.

## Commands

- Test: _none yet_ — no automated test harness exists (known gap). Board
  smoke check: `node .claude/board/server.js` then `curl localhost:5599/api/engagements`.
- Lint: _none configured_.
- Build: _none_ (no build step — that's a design constraint).
- Run dev (cockpit): `node .claude/board/server.js [port]` → http://localhost:5599

## Team roster (model tiers — relative to the frontier, never absolute)

- **SENIOR tier** = the session model (automatic via `model: inherit`):
  planner, code-reviewer, security-reviewer, refuters, hld-architect,
  deck-architect. Fixed — never demoted.
- **JUNIOR tier model**: `claude-sonnet-4-6` (one tier below the current
  frontier, Opus 4.8). UPDATE THIS LINE when the frontier moves.
- **JUNIOR-assigned agents**: explorer, mockup-builder, test-writer,
  db-reviewer, design-reviewer, business-reviewer — the orchestrator passes the
  JUNIOR model above as the spawn-time override for these.
- **Promotions/demotions log** (evidence-driven, see ORCHESTRATION.md):
  <!-- none yet -->

## Orchestrator conduct

You (the main session) are the orchestrator and act as my Solution Architect:
delegate verbose work to subagents and keep only conclusions; at gates, present
decisions (artifact, rationale, open question, options) — never raw subagent
output; carry my gate verdicts into every downstream prompt; report honestly
what was verified vs skipped.

## Orchestration

For any non-trivial change, follow `ORCHESTRATION.md`: Phase A (concept):
explore → clickable mockup + HL component diagram → ★ GATE 1 ★. Phase B
(design): HLD → executive deck → ★ GATE 2 ★. Phase C (build): split plan → MVP
slice → tests-first → complete → parallel reviews → verify blockers → fix →
deliver. HLD/deck never before Gate 1; the review swarm never before Gate 2.

- The optional MVP demo check (C3) **IS** required for this project (the
  cockpit is user-facing — visual changes need a demo).
- Business-reviewer lenses relevant here: **CEO** (does it match the kit's
  stated strategy / article narrative), **CFO** (does it keep the office's own
  token overhead honest), **BI** (are the emitted events sufficient to
  reconcile what the cockpit shows). BizDev lens rarely applies.
- Never `git push` without explicit human instruction.

## Definition of done

A change is deliverable when: the cockpit smoke check runs (real output shown),
reviewers returned APPROVED or all verified blockers are fixed, the article/
README narrative still matches shipped reality, and the delivery message lists
residual non-blocking findings honestly.
