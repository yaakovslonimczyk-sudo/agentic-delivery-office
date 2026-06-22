# Orchestration Protocol — Staged Gates: Concept → Design → Build

This file defines how the orchestrator (the main session) runs a feature from
request to human delivery with minimal human intervention. It is referenced
from CLAUDE.md and applies to any non-trivial change (new feature, schema
change, refactor touching >2 files, anything user-facing or pricing-relevant).

Trivial changes (typo, config tweak, single obvious bugfix) skip the loop:
implement, run tests, deliver.

## Economic principle

Validation artifacts are ordered by cost: a clickable mockup + component
diagram costs a fraction of an HLD; an HLD costs a fraction of a hardened
build. Each human gate approves the cheap artifact before the next
order-of-magnitude of spend. The expensive review machinery (parallel lenses,
refuters, fix rounds) runs ONCE, at the end, on an approved design.

## The Orchestrator

The orchestrator is the MAIN SESSION itself — never a subagent. Structural
reasons: subagents cannot spawn subagents (delegation is one level deep),
cannot pause for human input mid-task, and hold no memory across invocations.
The main session is the only entity that persists across gates and carries the
accumulated state: spec, gate decisions, human adjustments, SHORTCUTS list.

The orchestrator's conduct contract (it acts as the human's Solution Architect):

- **Delegate everything verbose** — exploration, review, artifact production go
  to subagents; the orchestrator keeps only conclusions in its context.
  Exception: implementation, which it does itself (it has the full picture).
- **At gates, present decisions, not logs.** A gate presentation is: the
  artifact (how to open/try it), what was decided and why, the open question
  for the human, and the options. Never paste raw subagent output.
- **Carry human verdicts forward.** Every gate adjustment becomes part of the
  spec for all downstream phases and subagent prompts.
- **Translate between altitudes.** Executive framing toward the human;
  precise, self-contained briefs toward subagents.
- **Own honesty of status.** Reports reflect what subagents actually verified,
  with evidence; failures and skipped steps are stated, never smoothed over.

## Roles

| Agent | Source | Deliverable |
|---|---|---|
| explorer | kit | Structured brief: relevant files, flows, conventions |
| mockup-builder | kit | Clickable HTML mockup of the primary flows |
| planner | kit | HL component diagram (Phase A); split build plan (Phase C) |
| hld-architect | kit | Full High-Level Design document with PlantUML diagrams |
| deck-architect | kit | Executive .pptx derived from the HLD |
| (orchestrator) | — | Implementation — the main session implements |
| test-writer | kit | Tests derived from the SPEC, independent of implementation |
| code-reviewer / security-reviewer / db-reviewer / design-reviewer / business-reviewer | kit | Review findings per the verdict contract, or APPROVED |

(`hld-architect`/`deck-architect` ship in the kit for Claude Code; the Codex and
Grok ports carry the same two roles as the generic HLD Writer / Deck Builder
prompts in ports/ — the protocol is identical.)

## PHASE A — Concept (fast, cheapest artifacts)

```
A0. INTAKE     Restate the request as a spec: goal, constraints, acceptance
               criteria. Identify the primary user flows (these are what the
               mockup must demonstrate). Ambiguity that changes the
               architecture → ask the human NOW.

A1. EXPLORE    Spawn explorer with the spec (existing codebase context,
               conventions, integration points). Receive the brief.

A2. MOCKUP     Spawn mockup-builder with the spec + primary flows.
               Receive a clickable HTML mockup (static, no backend).

A3. HL ARCH    Spawn planner in architecture mode: a component-level diagram —
               every component, its single-line responsibility, and the
               interactions between them (and with external services).
               Component level only; the full HLD comes after the gate.

A4. GATE 1     ★ HUMAN CHECKPOINT — concept ★
               Pre-gate bar (mandatory before claiming the human's attention):
                 - mockup opens in a browser and the PRIMARY FLOWS are
                   clickable end-to-end — verified by actually clicking
                   through them (screenshots captured), not by reading the code
                 - no placeholder text on decision-relevant elements (button
                   labels, flow names, key data fields are real)
                 - the HL diagram names every component with a responsibility
                   and shows every interaction the mockup implies
                 - mockup and diagram are consistent with each other
               Present: how to open the mockup, the flow walkthrough, the
               component diagram. Ask: "Is this the right product and the
               right shape of the system?"
               Approves / adjusts (iterate A2–A4 fast) / kills.
               NOTHING downstream (HLD, deck, code) is produced pre-approval.
```

## PHASE B — Design (after Gate 1, stakeholder-grade artifacts)

```
B1. HLD        Spawn hld-architect with: the spec, the APPROVED mockup, the
               APPROVED component diagram, and the explorer brief. The HLD
               must elaborate the approved shape — any deviation from the
               approved components must be flagged in a dedicated
               "Deviations from approved concept" section, never silent.

B2. DECK       Spawn deck-architect with the finished HLD (sequential — the
               deck derives from the HLD, never written in parallel with it).
               Executive framing: decision-oriented, numbers consistent with
               the HLD.

B3. GATE 2     ★ HUMAN CHECKPOINT — design ★
               Pre-gate bar:
                 - HLD covers every component from the approved diagram;
                   deviations section present (even if empty)
                 - deck's claims and numbers reconcile against the HLD
                 - both artifacts open/render correctly (verified, not assumed)
               Present: HLD + deck + the deviations section first.
               Approves / adjusts (iterate B1–B3) / kills.
               These artifacts are also the stakeholder-facing package.
```

## PHASE C — Build & Harden (after Gate 2)

```
C1. PLAN       Spawn planner with the approved HLD: split plan — MVP slice
               steps (first working end-to-end path) + hardening backlog.

C2. BUILD MVP  Orchestrator implements the MVP slice on a feature branch.
               Existing tests stay green. Maintain a SHORTCUTS list: every
               deliberate cut (stubbed auth, missing error handling,
               hardcoded values) gets a line.

C3. MVP CHECK  Optional human checkpoint (configure in CLAUDE.md; default ON
               for greenfield, OFF when Gates 1–2 fully de-risked direction).
               Bar: it runs; happy path demonstrated with real output or
               screenshot; no secrets; nothing irreversible (no push, no
               migrations on shared databases). Present demo + SHORTCUTS list.

C4. TESTS-FIRST Spawn test-writer with the FULL spec + HLD acceptance criteria
               (not the implementation). Tests define done.

C5. COMPLETE   Full scope: hardening backlog, every SHORTCUTS line resolved or
               explicitly human-waived, edge cases, error handling. All tests
               green.

C6. REVIEW     Spawn IN PARALLEL, each with the spec + HLD + `git diff` + nothing else:
                 - code-reviewer
                 - security-reviewer
                 - db-reviewer        (only if schema/queries changed)
                 - design-reviewer    (only if UI changed — reviews the BUILT
                                       UI against the APPROVED mockup)
                 - business-reviewer × once per relevant lens:
                     CFO lens   — unit economics, infra cost of the change
                     BizDev     — does it match the PRD / market positioning
                     BI lens    — are emitted events/metrics sufficient & reconcilable
                     CEO lens   — does it match the stated strategy in CLAUDE.md
               Each returns findings tagged BLOCKING or NON-BLOCKING, each
               with cited evidence, or the single line APPROVED.

C7. VERIFY     For each BLOCKING finding, spawn one refuter agent:
               "Try to prove this finding is wrong or not actually blocking.
                Evidence required." Findings the refuter kills are demoted to
               non-blocking with a note. Only verified blockers proceed.

C8. FIX        Fix verified blockers. Re-run tests.

C9. RE-REVIEW  Re-spawn ONLY the reviewers whose blockers were fixed, with the
               new diff. Max 2 total fix rounds. Unresolved after round 2 →
               escalate to human, do not loop further.

C10. DELIVER   Final message to the human contains:
                 - What was built vs the approved HLD (deviations explicit)
                 - SHORTCUTS list: each resolved or human-waived
                 - Test results (actual output, not "tests pass")
                 - Blockers found → fixed (one line each)
                 - Findings waived by the refuter and why
                 - Residual NON-BLOCKING findings (the human's backlog)
                 - Anything skipped, honestly
```

## Model routing (token optimization)

Routing principle: **model tier is inversely proportional to how SILENT the
agent's failure is** — not to task difficulty. Agents whose output is checked
by ground truth run on a cheaper tier; agents whose judgment the loop acts on
unverified run on the frontier tier.

Tiers are RELATIVE to the frontier, never absolute model names. The frontier
moves often; the policy must survive it unchanged:

- **SENIOR** = the orchestrator's session model (the frontier). Implemented
  as `model: inherit` in frontmatter — upgrades automatically and for free
  whenever the session moves to a newer frontier model.
- **JUNIOR** = one tier below the current frontier. Defined in ONE place: the
  "Team roster" section of the project's CLAUDE.md. No agent file ever names
  a model; the orchestrator passes the roster's JUNIOR model as the spawn-time
  override for junior-assigned agents. When the frontier moves, update one
  line in CLAUDE.md and the whole junior bench moves with it.

| Who | Tier | Why |
|---|---|---|
| Orchestrator (main session) | SENIOR | Carries all state; errors compound everywhere |
| planner | SENIOR (inherit) | Planning errors compound through every phase |
| code-reviewer, security-reviewer | SENIOR (inherit) | A shallow APPROVED is indistinguishable from a real one — silent failure |
| refuters (C7) | ALWAYS the orchestrator's model | They overrule reviewers; never weaker than the finding they judge |
| hld-architect, deck-architect | SENIOR | Stakeholder-facing, judgment-dense |
| explorer | JUNIOR | Brief is consumed and implicitly re-checked downstream |
| mockup-builder | JUNIOR | Output faces the human at Gate 1 — failures are visible |
| test-writer | JUNIOR | Tests RUN — output is self-verifying |
| db-reviewer | JUNIOR | Must attach EXPLAIN output — claims are grounded |
| design-reviewer | JUNIOR | Must attach screenshots — claims are grounded |
| business-reviewer | JUNIOR | Evidence-or-silence contract grounds every claim |

These are STARTING assignments, not fixed ones — see performance reviews
below. The project's CLAUDE.md roster is the live source of truth; this table
is the default a new project starts from.

Per-spawn exceptions remain asymmetric:
- **Upgrade freely** (e.g., explorer on unfamiliar, critical territory; a
  business-reviewer CFO pass on a pricing decision).
- **Downgrade only when the output is mechanically verifiable.** Never
  downgrade a reviewer or refuter to save tokens — that is the most expensive
  saving in the system.

### Performance reviews — hiring seniors, firing juniors (and vice versa)

Tier assignments evolve per project, driven by evidence the loop already
produces. At delivery (C10), the orchestrator checks:

- **Promote an agent to SENIOR** when its junior-tier output caused rework:
  its Gate artifacts bounced twice for quality (not direction), its findings
  were repeatedly killed by refuters, its briefs/tests missed things the
  reviewers later caught. Two strikes on the same agent → promote and record.
- **Trial-demote an agent to JUNIOR** when its senior-tier output is never
  challenged: across ~3 deliveries its findings all survive refuters and gates
  accept its artifacts first-pass, AND its failure mode is at least partially
  grounded. (planner, code/security reviewers, and refuters are exempt —
  their failure stays silent regardless of track record.)
- **Record every change** in the CLAUDE.md roster log: agent, date, direction,
  one-line reason. The roster is the personnel file; assignments persist
  across sessions because CLAUDE.md is loaded every session.

Do not spend orchestrator turns deliberating model choice per spawn; the
roster IS the decision. Where the savings are: junior-tier agents typically
account for half the spawned-token volume; one tier down cuts ~30–40% of
total spend at near-zero quality risk. The senior judging tier is the part
you never cut.

## Reviewer verdict contract (all reviewers)

Every reviewer prompt must include, verbatim:

> Tag every finding BLOCKING or NON-BLOCKING. Every finding must cite evidence
> you personally verified (file:line, command output, fetched data, screenshot).
> A concern you cannot ground in evidence must be omitted. If nothing rises to
> BLOCKING, return exactly: `APPROVED` plus at most 3 non-blocking notes.
> Finding nothing is a fully acceptable outcome.

## Recording engagement state (so the cockpit shows it live)

At each phase/gate transition, record the engagement's state so the Office
cockpit shows real status (not just inferred activity). Run, from the project:

    ~/.claude/office/bin/office-state.sh <phase A|B|C> <status> [note]

- Reaching GATE 1 → `office-state.sh A gate1_pending "mockup + HL diagram ready"`
- Human approves Gate 1 → `office-state.sh B building "HLD in progress"`
- Reaching GATE 2 → `office-state.sh B gate2_pending "HLD + deck ready"`
- Approved, building → `office-state.sh C building`
- 2 fix rounds exhausted → `office-state.sh C escalated "<finding>"`
- Delivered → `office-state.sh C delivered "<residuals>"`
- Abandon tracking → `office-state.sh - cleared`

Phase alone is inferred automatically from which agents have run; this records
the explicit gate/decision status that inference can't see.

## Anti-oscillation rules

- A fix may only address verified blockers; no opportunistic refactors inside the loop.
- A reviewer may not raise a NEW blocker in re-review unless the fix itself introduced it.
- Hard cap: 2 fix rounds in Phase C. Then the human decides.
- The lens swarm never runs before Gate 2 approval.
- HLD and deck are never produced before Gate 1 approval.

## Human touchpoints (the complete list)

1. Architectural ambiguity at intake (only if genuinely undecidable).
2. GATE 1 — clickable mockup + HL component diagram (always, non-trivial work).
3. GATE 2 — HLD + executive deck (always, non-trivial work).
4. MVP demo check (optional, per CLAUDE.md config).
5. Escalation after 2 unresolved fix rounds (exceptional).
6. `git push` / deploy (always explicit).

Everything else runs unattended.

## Parallelism

C6 reviewers are independent — always spawn in a single batch; refuters in C7
likewise. A2 (mockup) and A3 (HL diagram) may run in parallel from the same
spec, but must be reconciled before Gate 1. B1→B2 is strictly sequential.
