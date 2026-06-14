---
description: View or change which projects the Agentic Delivery Office is active in, and the default policy for new projects.
allowed-tools: Bash
---

Manage the Office scope registry at `~/.claude/office/scope.json`
(shape: `{ "default_policy": "opt-in" | "opt-out", "in_scope": [paths], "excluded": [paths] }`).

Do what I ask. If I gave no specific instruction, show me the current state:
read `~/.claude/office/scope.json` and present, clearly:

1. The **default policy** for projects not yet listed:
   - `opt-in` → a new project is inactive until I run `/office-init` (explicit acceptance).
   - `opt-out` → a new project is active automatically unless I exclude it.
2. The **in-scope** projects (Office active).
3. The **excluded** projects (Office explicitly off).

Then offer the actions I can ask for, and perform whichever I choose by editing
the JSON (preserve formatting, use absolute paths):
- **Enroll** a project → add its absolute path to `in_scope` (and remove from `excluded`).
- **Exclude** a project → add to `excluded` (and remove from `in_scope`).
- **Switch default policy** between `opt-in` and `opt-out`.
- **Forget** a project → remove it from both lists (reverts to default policy).

Always echo the resulting policy + lists back so I can confirm. Never touch
anything outside `scope.json`.
