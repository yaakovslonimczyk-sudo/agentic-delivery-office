# Porting the Methodology to Other Providers

The methodology has four layers. Only the bottom one is Claude-specific:

| Layer | Claude Code | OpenAI Codex | Grok / generic LLM |
|---|---|---|---|
| **Protocol** (the loop) | ORCHESTRATION.md | Same file, referenced from AGENTS.md | Same file, pasted or referenced |
| **Project context** | CLAUDE.md | AGENTS.md (root) | System prompt / first message |
| **Specialist prompts** | `.claude/agents/*.md` (frontmatter + body) | Inlined into AGENTS.md, or separate sessions per role | `grok/GROK-PROMPTS.md` — plain prompt pack |
| **Enforcement** (hooks, permissions) | settings.json + hooks | Sandbox/approval modes; **git pre-commit hook** | **git pre-commit hook** (only portable gate) |

## Key mapping notes

**Subagent → fresh session.** The portable meaning of a "subagent with its own
context" is: a NEW conversation/session that receives ONLY (a) the role prompt,
(b) the spec, (c) the diff or brief. Never paste the implementer's chat history
into a reviewer session — the cold context is the quality mechanism. On
providers without a spawn-agent primitive, you (or a script) open the sessions.

**Auto-delegation is Claude Code-specific.** The `description:` frontmatter
field is what lets Claude route automatically. Elsewhere, the orchestration is
explicit: the protocol in ORCHESTRATION.md tells whoever drives (human or
coordinator script) which role to invoke when.

**Tool restriction degrades to instruction.** `tools:` frontmatter is enforced
by Claude Code's harness. On other providers, "you must not edit files" is only
a prompt instruction — back it with the git pre-commit hook below so violations
are caught mechanically.

**Hooks → git hooks.** Claude Code's PreToolUse gate is harness-level. The
portable equivalent (works everywhere, including for humans):

```bash
# .git/hooks/pre-commit  (chmod +x)
#!/bin/bash
set -e
if [ -f package.json ]; then
  jq -e '.scripts.lint' package.json >/dev/null 2>&1 && npm run lint --silent
  jq -e '.scripts.test' package.json >/dev/null 2>&1 && npm test --silent
fi
```

**Model routing ports directly.** The tiering rule (SENIOR for judging
agents — planner, code/security reviewers, refuters; JUNIOR for grounded
agents — explorer, mockup, tests, db/design/business reviews) is
provider-agnostic AND relative: SENIOR = the provider's current frontier
model, JUNIOR = one tier below it. Never hardcode model names anywhere except
the single roster line in the project context file — when the provider ships
a new frontier, update that one line. Invariants to preserve: a refuter never
runs on a weaker model than the finding it judges, and reviewers are never
downgraded to save cost — their failure mode (shallow APPROVED) is silent.

**Verdict contract is universal.** The single most portable quality mechanism
is the reviewer contract (BLOCKING/NON-BLOCKING, evidence required, APPROVED
when clean, max 2 fix rounds). It is plain prompt text — it works identically
on every provider. If you port only one thing, port this.

## Per-provider files

- `codex/AGENTS.md` — drop at the repo root. Codex CLI/Web reads AGENTS.md the
  way Claude Code reads CLAUDE.md. Contains the protocol plus condensed role
  prompts to be used as explicit instructions ("act as the code-reviewer
  defined below against this diff").
- `grok/GROK-PROMPTS.md` — provider-agnostic prompt pack: one self-contained
  prompt per role, designed to be pasted into a fresh Grok (or any LLM)
  session with the spec + diff appended. Also usable via API as system prompts.
