# The Agentic Delivery Office — Agent Methodology Kit

A portable, project-agnostic setup for multi-agent software development with
minimal human intervention: specialist subagents with isolated contexts,
staged human gates ordered by artifact cost, a bounded internal
review-and-fix loop, and deterministic quality gates.

The methodology is explained in the article *"The Agentic Delivery Office"*
(see [article/MEDIUM-ARTICLE.md](article/MEDIUM-ARTICLE.md), with figures).

```bash
git clone https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office.git
cd agentic-delivery-office
./install.sh /path/to/your/project
```

Built for **Claude Code** as the primary runtime, with ports for **OpenAI
Codex** (`AGENTS.md`) and **Grok** (plain-prompt pack).

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

## Install into a project

```bash
./install.sh /path/to/your/project
```

The installer:
1. Copies `.claude/agents/`, `.claude/hooks/`, and `ORCHESTRATION.md` into the project.
2. Copies `.claude/settings.json` only if none exists (never overwrites yours).
3. Creates `CLAUDE.md` from the template only if none exists.
4. Makes hooks executable.

Then open the project, edit `CLAUDE.md` (fill the placeholders — especially the
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

## External agent dependency (Phase B)

The Design phase uses two user-level agents expected at `~/.claude/agents/`:
`hld-architect` (full HLD with PlantUML diagrams) and `deck-architect`
(executive .pptx derived from the HLD). User-scoped agents are available in
every project on the machine, so the kit references them rather than bundling
them. On machines without them, use the generic HLD Writer / Deck Builder
role prompts in `ports/` — the protocol is identical.

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
