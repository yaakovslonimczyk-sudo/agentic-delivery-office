# Onboarding — The Agentic Delivery Office

Get the office running and put one real feature through it in ~10 minutes.
This is a **system-level** setup for Claude Code (with ports for Codex and
Grok). You install once; it applies to every project.

## 1. Install (pick one)

**Try it contained, in one project first (recommended):**
```bash
git clone https://github.com/yaakovslonimczyk-sudo/agentic-delivery-office.git
cd agentic-delivery-office
./install.sh --scope project /path/to/a/real/project
```

**Or system-wide, once it has earned your trust:**
```bash
./install.sh                 # Claude Code, user scope
# or: ./install.sh --target codex | grok
```

Add `--dry-run` to see every action first. The installer is idempotent and
never clobbers — it merges hooks and appends marked blocks.

## 2. Activate the project

Inside the project, in Claude Code:
```
/office-init     # interviews you for the business context + model roster
/office-board    # opens the Live Board at http://localhost:5599
```
The business context you provide is what makes the CFO/BizDev/BI/CEO review
lenses real rather than decorative — answer those questions properly.

## 3. Run one feature through the gates

Ask Claude: *"Take this feature through ORCHESTRATION.md."* You will hit:

- **Gate 1 — Concept:** a clickable mockup + a component diagram. You approve
  the *direction* (or adjust / kill) — cheaply, before any real build.
- **Gate 2 — Design:** the HLD + an executive deck, both from the approved
  shape. You approve the *design*.
- **Build:** MVP slice → tests-first → a parallel review swarm → the refuter
  kills false findings → fixes → delivery, with residuals listed.

You are the manager: you spend judgment at the gates, not on every line.

## 4. Watch it work

Open the Live Board (`/office-board`):
- **Blueprint** — the org chart: who holds the ball, per-agent tokens, runs.
- **⚽ Match** — the same data as a football pitch (Jacobito on commentary).

## What's where

- `~/.claude/office/ORCHESTRATION.md` — the full protocol (the methodology).
- `~/.claude/agents/` — the specialist roster (read-only reviewers, etc.).
- The story & rationale: the article in `article/MEDIUM-ARTICLE.md`.

## The one rule that makes it work

Reviewers run on **cold context** and must cite evidence or stay silent;
the refuter never runs weaker than the finding it judges; the human is spent
at the gates. Don't dilute those three and it converges.
