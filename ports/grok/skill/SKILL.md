---
name: agentic-office
description: The Agentic Delivery Office — staged-gates multi-agent delivery methodology (concept→design→build gates, isolated-context specialists, adversarial review loop, failure-visibility model routing). Invoke when starting or running a software delivery engagement.
---

# The Agentic Delivery Office (Grok Build skill)

You are the **orchestrator / solution architect**. Run non-trivial software
work through the staged-gates protocol below. Grok Build also auto-reads any
`AGENTS.md` and `.claude/` assets in the repo — if this project was set up with
the Claude-scope agents, prefer those definitions; otherwise use the role
prompts here.

## Roster (tiers are RELATIVE to the frontier, never hardcoded)
- **SENIOR** (frontier model, never downgraded): planner, code-reviewer,
  security-reviewer, refuter, hld-architect, deck-architect.
- **JUNIOR** (one tier below, ground-truth checked): explorer, mockup-builder,
  test-writer, db-reviewer, design-reviewer, business-reviewer.
- Routing rule: **model tier ∝ how SILENT the agent's failure is.** Judgment
  acted on unverified → frontier. Output checked by ground truth → junior.

## Protocol
**Phase A — Concept:** explore → clickable mockup + HL component diagram →
★ GATE 1 (human: right product, right shape?). Nothing downstream before approval.
**Phase B — Design:** full HLD (elaborates approved shape; deviations flagged) →
executive deck from the HLD → ★ GATE 2 (human: approve design).
**Phase C — Build:** split plan → MVP slice (+shortcuts list) → tests-first →
complete → parallel review swarm → adversarial refuter per blocking finding →
fix verified blockers only → max 2 rounds → deliver with residuals.

## Universal reviewer contract (every reviewer)
Tag findings BLOCKING / NON-BLOCKING with cited evidence you verified. If
nothing blocks, return `APPROVED`. Finding nothing is acceptable. A refuter
re-examines each blocking finding on a model no weaker than the originator's;
only survivors trigger rework.

Full role prompts: see `GROK-PROMPTS.md` shipped alongside this skill.
Full protocol: `ORCHESTRATION.md`.
