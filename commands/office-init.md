---
description: Activate the Agentic Delivery Office in the current project (creates CLAUDE.md roster + business context; wires the commit gate).
---

The Agentic Delivery Office agents, hooks, and Live Board are installed at
user scope (`~/.claude/`), so they are already available here. Your job is to
set up only the **per-project** pieces that the methodology cannot infer
globally.

If I invoked this with the word **scan** (e.g. `/office-init scan`), first run
bulk enrollment: list the git repositories under `~/dev` (one level deep), show
them to me, let me pick which to enroll, and add each chosen absolute path to
`in_scope` in `~/.claude/office/scope.json`. Then continue below for the
current project only.

Do the following in the current working directory:

1. **Enroll this project in the Office scope.** Add its absolute path to
   `in_scope` in `~/.claude/office/scope.json` (create the file if missing with
   `{"default_policy":"opt-in","in_scope":[],"excluded":[]}`; remove the path
   from `excluded` if present). This is what makes the gates, the commit gate,
   and the Live Board active here — without it, a system-wide install stays
   dormant in this project.

2. If no `CLAUDE.md` exists, create one. If it exists, append a clearly-marked
   "Agentic Delivery Office" section. It must contain:
   - **Team roster**: SENIOR tier = `model: inherit` (frontier). JUNIOR tier
     model = one tier below the current frontier — ask me for the value, or
     default to the project's current mid-tier alias. State that tiers are
     relative to the frontier, never hardcoded.
   - **Business context** (this grounds the business-reviewer lenses): who
     pays / the cost model, current strategy/priority, the PRD location, and
     non-goals. Ask me for anything you cannot infer from the repo.
   - A one-line pointer: "Delivery protocol: ~/.claude/office/ORCHESTRATION.md".

3. Detect this project's test and lint commands (package.json scripts,
   Makefile, pyproject, etc.) and confirm the global commit-gate hook will
   work here; if the commands are non-standard, note them in CLAUDE.md so the
   gate can find them.

4. Tell me how to start the Live Board for this project
   (`/office-board`), and confirm setup is complete.

Ask me the minimum set of questions needed to fill the business context — that
section is what makes the CFO/BizDev/BI/CEO review lenses real rather than
decorative.
