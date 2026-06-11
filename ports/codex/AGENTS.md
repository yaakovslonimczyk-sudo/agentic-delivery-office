# AGENTS.md — Multi-Agent Development Methodology (Codex port)

<!-- Drop this file at the repo root. OpenAI Codex reads AGENTS.md as project
     instructions. Fill the Business Context section — it grounds the business
     review lenses. -->

## Project

<ONE PARAGRAPH: what this project does, for whom, current phase.>

**Business context** (ground truth for business-lens reviews):
- Who pays / model: <...>
- Cost constraints: <...>
- Strategy / current priority: <...>
- PRD location: <...>
- Non-goals: <...>

**Commands**: test `<cmd>` · lint `<cmd>` · build `<cmd>` · dev `<cmd>`

## Delivery protocol (mandatory for non-trivial changes)

Non-trivial = new feature, schema change, refactor >2 files, anything
user-facing or pricing-relevant. Trivial changes: implement, test, deliver.

Economic principle: the expensive review machinery runs ONCE, on a direction
the human has already approved at the MVP gate. Fast and cheap before the
gate; thorough after.

**Phase A — Concept (fast, cheapest artifacts):**

1. **INTAKE** — restate the request as a spec: goal, constraints, acceptance
   criteria, primary user flows. Architectural ambiguity → ask the human now.
2. **EXPLORE** — map the relevant files, flows, and conventions before writing
   anything. (Role prompt: Explorer, below.)
3. **MOCKUP** — clickable static HTML mockup of the primary flows. (Role:
   Mockup Builder.)
4. **HL ARCHITECTURE** — component-level diagram: every component + one-line
   responsibility + interactions. No schemas, no field lists. (Role: Planner,
   architecture mode.)
5. **GATE 1 (human — concept)** — pre-gate bar: mockup verified clickable
   end-to-end through the primary flows, real labels on decision-relevant
   elements, diagram covers every component the mockup implies, both
   consistent. Ask: "right product, right shape?" Approves / adjusts (iterate
   3–5 fast) / kills. NOTHING downstream is produced pre-approval.

**Phase B — Design (after Gate 1, stakeholder-grade):**

6. **HLD** — full High-Level Design elaborating the APPROVED mockup +
   diagram. Any deviation from the approved components goes in a mandatory
   "Deviations from approved concept" section, never silent. (Role: HLD
   Writer.)
7. **DECK** — executive presentation derived from the finished HLD
   (sequential, never parallel with it); numbers must reconcile against the
   HLD. (Role: Deck Builder.)
8. **GATE 2 (human — design)** — HLD covers every approved component;
   deviations section present; deck reconciles. This is also the
   stakeholder-facing package.

**Phase C — Build & Harden (after Gate 2):**

9. **PLAN** — from the approved HLD: MVP slice steps + hardening backlog.
   (Role: Planner, build mode.)
10. **BUILD MVP SLICE** — first working end-to-end path, feature branch,
    existing tests green. Maintain a SHORTCUTS list: every deliberate cut.
11. **MVP CHECK (human, optional per project config)** — bar: it runs, happy
    path shown with real output/screenshot, no secrets, nothing irreversible.
12. **TESTS-FIRST** — write tests from the FULL SPEC + HLD acceptance
    criteria, not the implementation. (Role: Test Writer.)
13. **COMPLETE** — full scope: hardening backlog, every SHORTCUTS line
    resolved or human-waived, edge cases, error handling. All tests green.
14. **REVIEW** — apply each relevant role prompt below against the spec + HLD
    + `git diff`, each in a FRESH session/context with no implementation
    history: Code Reviewer, Security Reviewer, DB Reviewer (if schema/queries
    changed), Design Reviewer (if UI changed — built UI vs APPROVED mockup),
    Business Reviewer once per relevant lens (CFO / BizDev / BI / CEO).
15. **VERIFY** — for each BLOCKING finding, run a refuter pass: "try to prove
    this finding wrong, evidence required." Only verified blockers proceed.
16. **FIX** — verified blockers only; no opportunistic refactors. Re-run
    tests. Re-review only the lenses whose blockers were fixed. MAX 2 rounds,
    then escalate to the human.
17. **DELIVER** — report: built vs approved HLD (deviations explicit),
    SHORTCUTS resolved/waived, real test output, blockers fixed, findings
    refuted (and why), residual non-blocking findings, anything skipped.

### Universal reviewer contract (include in every review pass)

> Tag every finding BLOCKING or NON-BLOCKING. Every finding must cite evidence
> you personally verified (file:line, command output, fetched data,
> screenshot). A concern you cannot ground in evidence must be omitted. If
> nothing rises to BLOCKING, return exactly: `APPROVED` plus at most 3
> non-blocking notes. Finding nothing is a fully acceptable outcome.

## Role prompts

**Mockup Builder**: Build a clickable static mockup (plain HTML/CSS/vanilla
JS in `mockup/`, no backend, no build step) of the primary user flows. Every
button/link/form on a primary flow leads somewhere real; out-of-scope elements
visually marked. Real labels and realistic sample data on decision-relevant
elements. Imitate the project's existing visual language if there is one.
Verify every flow is clickable end-to-end before returning. Return: paths,
open command, flow walkthrough, out-of-scope list.

**HLD Writer**: From the APPROVED mockup + component diagram + spec, write a
full High-Level Design: context, component design, data model, API contracts,
sequence flows for the primary paths, NFRs, risks. Architecture diagrams
included. Mandatory section "Deviations from approved concept" — flag every
departure from the approved components explicitly (empty section if none).

**Deck Builder**: From the FINISHED HLD only, produce a decision-oriented
executive presentation: problem, proposed solution shape, key decisions with
trade-offs, cost/effort, risks, ask. Every number must trace to the HLD.

**Explorer** (read-only): Map the codebase for the given goal. Return:
relevant files (one line each), how the current flow works (file:line refs),
conventions an implementer must imitate, risks/gotchas. Under 600 words.

**Planner** (read-only): From spec + exploration brief, produce: approach (and
the rejected alternative, with reason); steps each with concrete change,
acceptance check, and risk; out-of-scope list; open questions (aim for none).
Validate against real code — never plan against assumed code.

**Test Writer**: Derive tests from the spec's acceptance criteria — one test
minimum per criterion, plus edge cases and failure modes the spec implies. Read
only public interfaces of existing code, never implementation internals.
Imitate the project's existing test conventions. Run the suite; report results
verbatim. Never weaken an assertion to make a test pass. Never touch
production code.

**Code Reviewer** (read-only): Review `git diff` + surrounding code for:
correctness bugs, spec compliance, obvious security issues, stated-convention
violations, and whether tests actually exercise the change. No style opinions,
no hypothetical futures. Apply the universal reviewer contract.

**Security Reviewer** (read-only): Trace user-controlled data through the
diff. Check injection, authN/authZ (including object-level), secrets in
code/logs, unvalidated trust boundaries, PII exposure, suspicious new
dependencies. Verify reachability before reporting — every finding needs a
concrete attack path. Universal contract applies.

**DB Reviewer** (read-only code; read-only dev-DB commands): Check migrations
(reversibility, lock safety at production scale, deploy ordering), indexes
(run EXPLAIN on the actual queries — no performance claims without EXPLAIN
output), missing constraints, N+1 patterns, money-as-float (always blocking).
Universal contract applies.

**Design Reviewer** (must observe, never edit): Run the app and LOOK at it —
never critique UI from source alone. Screenshot default/loading/empty/error/
overflow states, interact with new controls, check one mobile and one desktop
width, basic accessibility on changed elements. Review against spec intent and
the project's existing visual language, not personal taste. Universal contract
applies.

**Business Reviewer** (one lens per pass; every claim needs computed/fetched/
quoted evidence):
- *CFO lens*: marginal cost of the change per user/transaction — read infra
  config and cost model, fetch current provider pricing, compute, compare to
  stated constraints.
- *BizDev lens*: shipped behavior vs PRD — flag scope drift in both directions.
- *BI lens*: does the change emit the events/metrics needed to evaluate it;
  do new data flows reconcile. Missing billing/compliance data = blocking.
- *CEO lens*: does it match the stated strategy above — quote the statement it
  supports or contradicts; one paragraph max; block only on explicit
  contradiction.

## Hard rules

- Reviewers run in fresh contexts: spec + diff only, never the implementer's
  conversation history.
- Never `git push` without explicit human instruction.
- Never commit with failing lint or tests (enforced by .git/hooks/pre-commit
  if installed — see ports/PORTING.md).
- Report outcomes honestly: real test output, skipped steps named as skipped.
