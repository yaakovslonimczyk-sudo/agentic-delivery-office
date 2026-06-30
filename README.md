# The Agentic Delivery Office — Agent Methodology Kit

A portable, project-agnostic setup for multi-agent software development with
minimal human intervention: specialist subagents with isolated contexts,
staged human gates ordered by artifact cost, a bounded internal
review-and-fix loop, and deterministic quality gates.

The methodology is explained in the article *"The Agentic Delivery Office"*
(see [article/MEDIUM-ARTICLE.md](article/MEDIUM-ARTICLE.md), with figures).

**This is a system-level setup, not a per-project copy.** You install it once
into your home directory; the agents, protocol, Live Board, hooks, and slash
commands then apply to every project. Per-project business context is added
on demand with a slash command.

```bash
git clone https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office.git
cd agentic-delivery-office
./install.sh                      # Claude Code, user scope (recommended)
```

Then, inside any project:

```
/office-init     # adds this project's roster + business context
/office-board    # opens the Live Board (blueprint org-chart / ⚽ match view)
```

### Portable across providers (one methodology, three runtimes)

| Runtime | Command | Global drop targets |
|---|---|---|
| **Claude Code** | `./install.sh` | `~/.claude/agents/*.md`, `~/.claude/commands/`, `~/.claude/settings.json`, `~/.claude/office-board/` |
| **OpenAI Codex** | `./install.sh --target codex` | `~/.codex/agents/*.toml`, protocol appended to `~/.codex/AGENTS.md` |
| **Grok Build** | `./install.sh --target grok` | global skill `~/.grok/skills/agentic-office/` (Grok also auto-reads `.claude/` + `AGENTS.md`) |
| _legacy per-project_ | `./install.sh --scope project [PATH]` | copies into `PATH/.claude/` |

Add `--dry-run` to preview without changing anything. The installer is
idempotent and never clobbers — it merges hooks and appends marked blocks.

## What's inside

```
agent-methodology-kit/
├── README.md                  ← you are here
├── install.sh                 ← copies the kit into any project
├── ORCHESTRATION.md           ← the delivery-loop protocol (the methodology itself)
├── CLAUDE.md.template         ← project-context template (fill in per project)
├── .claude/
│   ├── settings.json          ← permissions allowlist + commit quality gate
│   ├── hooks/
│   │   └── gate-commit.sh     ← blocks git commit unless lint + tests pass
│   └── agents/
│       ├── explorer.md        ← read-only codebase mapper
│       ├── mockup-builder.md  ← clickable HTML mockup for Gate 1
│       ├── planner.md         ← Mode 1: HL component diagram · Mode 2: split build plan
│       ├── hld-architect.md   ← full HLD with PlantUML diagrams (Phase B / Gate 2)
│       ├── deck-architect.md  ← executive .pptx derived from the HLD
│       ├── code-reviewer.md   ← cold diff review, read-only
│       ├── test-writer.md     ← tests from the SPEC, not the implementation
│       ├── security-reviewer.md
│       ├── db-reviewer.md     ← schema/migration/EXPLAIN review
│       ├── design-reviewer.md ← UI critique with eyes (preview/browser tools)
│       └── business-reviewer.md ← one definition, invoked per lens (CFO/BizDev/BI/CEO)
└── ports/
    ├── PORTING.md             ← how the concepts map across providers
    ├── codex/AGENTS.md        ← drop at repo root for OpenAI Codex
    └── grok/GROK-PROMPTS.md   ← copy-paste prompt pack for Grok or any other LLM
```

## Per-project setup (after the one-time system install)

The system install puts the agents and protocol in your home. The only thing
that is genuinely per-project is the **business context** (which grounds the
CFO/BizDev/BI/CEO review lenses) and the **roster** (the JUNIOR-tier line). Add
them by running `/office-init` inside a project — it interviews you for the
minimum context and writes the project's `CLAUDE.md`.

### Scope — which projects the office runs in

A system-wide install does **not** impose the methodology on every repo. The
office is **scoped** via `~/.claude/office/scope.json`, with a default policy:

- **`opt-in`** (default, recommended for multi-project users): a project stays
  dormant — no gates, no commit gate, not on the board — until you run
  `/office-init` there. New projects require explicit acceptance.
- **`opt-out`**: every project is active unless you exclude it.

Manage it with `/office-scope` (list, enroll, exclude, switch policy) or
`/office-init scan` to bulk-enroll repos under `~/dev`. A `--scope project`
install auto-enrolls that project.

Prefer the legacy self-contained copy instead? `./install.sh --scope project`
drops everything into the project's `.claude/`. In that mode, edit `CLAUDE.md`
(fill the placeholders — especially the
business context, which is what grounds the business-reviewer lenses), and run
a first feature through the loop described in `ORCHESTRATION.md`.

## Design principles (why the kit looks like this)

1. **Agents are defined by tools + verifiable deliverable, not job titles.**
   Every agent either has restricted tools (reviewers can't edit) or a
   deliverable that can be checked against ground truth (tests, screenshots,
   `EXPLAIN` output, fetched pricing data).
2. **Fresh context is a feature.** Reviewers see only the diff and the spec —
   never the implementer's reasoning — so they catch what the author can't.
3. **Silence is a valid review outcome.** Every reviewer must return
   `APPROVED` when nothing rises to blocking. This is what keeps an autonomous
   fix loop from oscillating forever.
4. **Blocking findings get adversarially verified before triggering rework.**
   A refuter agent tries to kill each finding; only survivors get fixed.
5. **The loop is bounded.** Max 2 fix-and-re-review rounds, then deliver to the
   human with residuals listed.
6. **Hooks enforce what prompts only suggest.** The commit gate runs lint and
   tests mechanically; no agent can skip it.
7. **Staged gates, artifacts ordered by cost.** Gate 1: clickable mockup + HL
   component diagram (cheapest direction test). Gate 2: full HLD + executive
   deck — produced ONLY after Gate 1 approval, since they elaborate the
   approved shape. Build & the review swarm run only after Gate 2. Deliberate
   shortcuts during the MVP slice are tracked in a list that the hardening
   phase must resolve — cuts never silently ship.

## Office Board — live visibility

A zero-dependency local dashboard that shows the org chart in real time:
which agent holds the ball right now (animated pass from the orchestrator),
each agent's tier/model, cumulative tokens, run count, and an engagement log.

```bash
node .claude/board/server.js        # from the project root
# open http://localhost:5599
```

How it works: the `office-board.sh` hook fires on every Agent-tool spawn
(PreToolUse) and return (PostToolUse — the return carries the subagent's
token usage), appending events to `.claude/board/events.jsonl`; the server
streams them to the browser over SSE. Hooks only see start/end of each
engagement, so token counters settle when an agent reports back — for
mid-run token streaming you'd graduate to Claude Code's OpenTelemetry
metrics. Agents outside the roster (e.g. ad-hoc general-purpose spawns)
appear automatically as amber "contractor" cards.

**Auto-open:** in projects where the Office is active, the board opens by
itself on session start (the `office-scope.sh` SessionStart hook launches the
server and your browser). It never spawns duplicate tabs — if a board tab is
already open it focuses/refreshes that one instead. The view stays live via
SSE, so re-opened sessions show current data. Headless / CI / SSH sessions
skip the browser and just keep the server running. Opt out with
`OFFICE_BOARD_AUTO_OPEN=0`; change the port with `OFFICE_BOARD_PORT`.

## Phase B design agents

The Design phase uses two SENIOR-tier agents that **ship in the kit**:
`hld-architect` (full HLD with PlantUML component + sequence diagrams, data
schemas, and acceptance criteria) and `deck-architect` (executive `.pptx`
derived from the HLD). `install.sh` places them in `~/.claude/agents/` alongside
the other nine, so they are available in every project. The Codex and Grok
ports carry the same two roles as the generic HLD Writer / Deck Builder
prompts in `ports/` — the protocol is identical.

## Token cost expectations

A full cycle (explore → plan → implement → parallel reviews → verify → fix →
re-review) runs ~3–5× the tokens of single-agent work. The orchestrator's own
context stays lean (it only ever sees summaries), which is what preserves
quality over long autonomous sessions.

Model routing is policy, not improvisation — see "Model routing" in
ORCHESTRATION.md. The rule: tier ∝ how silent the agent's failure is. Tiers
are RELATIVE to the frontier, never hardcoded model names: SENIOR = the
session model (`model: inherit` — upgrades free when the frontier moves);
JUNIOR = one tier below, defined in exactly one line of the project's
CLAUDE.md roster and passed as a spawn-time override. Judging agents (planner,
code/security reviewers, refuters) are SENIOR and never downgraded; grounded
agents start JUNIOR and get promoted/demoted per project via evidence-driven
performance reviews logged in the roster. Junior-tier routing cuts ~30–40% of
spend at near-zero quality risk.
