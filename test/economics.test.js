/**
 * Acceptance-criteria tests for:
 *   GET /api/economics?project=<slug>
 *   GET /api/engagements
 *
 * Zero dependencies — node:test + node:assert + node built-ins only.
 * Hermetic: every test run creates its own tmpdir; sets HOME to that tmpdir
 * so the server never touches the user's real ~/.claude/office data.
 *
 * AC coverage:
 *  #1  Reconciliation: economics.total === engagements.tokens for same project
 *  #2  Phase bucketing: Σ byPhase === total; per-agent phase assignment
 *  #3  byAgent: return-event tokens only; spawn-only agents → 0
 *  #4  Unknown project → HTTP 200, zero-valued shape
 *  #5  Unattributed: out-of-roster agent tokens counted correctly
 *  #6  history passthrough: /api/engagements carries history[] on each object
 */

'use strict';

const test    = require('node:test');
const assert  = require('node:assert/strict');
const http    = require('node:http');
const cp      = require('node:child_process');
const fs      = require('node:fs');
const path    = require('node:path');
const os      = require('node:os');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ado-test-'));
}

/**
 * Boot server.js from a hermetic tmpdir layout:
 *
 *   <tmp>/board/server.js        ← copy of production server
 *   <tmp>/board/index.html       ← copy (server reads it for '/')
 *   <tmp>/board/events.jsonl     ← fixture events
 *   <tmp>/.claude/office/scope.json
 *   <tmp>/.claude/office/engagements/<proj>.json   (optional)
 *
 * Returns { port, kill, home }
 */
function bootServer({ events = [], scopeExtra = {}, engagements = {} } = {}) {
  const tmp  = makeTmp();
  const home = tmp;

  // board dir
  const boardDir = path.join(tmp, 'board');
  fs.mkdirSync(boardDir, { recursive: true });

  // copy server + html
  const src = path.join(__dirname, '..', '.claude', 'board');
  fs.copyFileSync(path.join(src, 'server.js'),   path.join(boardDir, 'server.js'));
  fs.copyFileSync(path.join(src, 'index.html'),  path.join(boardDir, 'index.html'));

  // write events fixture
  const eventsContent = events.map(e => JSON.stringify(e)).join('\n');
  fs.writeFileSync(path.join(boardDir, 'events.jsonl'), eventsContent);

  // scope
  const officeDir = path.join(tmp, '.claude', 'office');
  fs.mkdirSync(officeDir, { recursive: true });
  fs.writeFileSync(
    path.join(officeDir, 'scope.json'),
    JSON.stringify({ default_policy: 'opt-in', in_scope: [], excluded: [], ...scopeExtra })
  );

  // per-project state files
  const engDir = path.join(officeDir, 'engagements');
  fs.mkdirSync(engDir, { recursive: true });
  for (const [proj, state] of Object.entries(engagements)) {
    fs.writeFileSync(path.join(engDir, `${proj}.json`), JSON.stringify(state));
  }

  // pick a random high port
  const port = 40000 + Math.floor(Math.random() * 10000);

  const child = cp.spawn(
    process.execPath,
    [path.join(boardDir, 'server.js'), String(port)],
    { env: { ...process.env, HOME: home }, stdio: ['ignore', 'pipe', 'pipe'] }
  );

  return new Promise((resolve, reject) => {
    let ready = false;
    child.stdout.on('data', d => {
      if (!ready && String(d).includes('localhost')) {
        ready = true;
        resolve({
          port,
          home,
          kill: () => child.kill(),
          child,
        });
      }
    });
    child.stderr.on('data', d => { /* swallow */ });
    child.on('error', reject);
    setTimeout(() => { if (!ready) reject(new Error('server did not start in time')); }, 5000);
  });
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${urlPath}`, res => {
      let body = '';
      res.on('data', d => (body += d));
      res.on('end', () => {
        resolve({ status: res.statusCode, body, json: () => JSON.parse(body) });
      });
    }).on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PROJ = 'alpha';

/**
 * A minimal set of events that exercises all phase-buckets and agent types.
 *
 *   planner      → Phase A (roster)   100 tokens  (return)
 *   hld-architect→ Phase B (roster)   200 tokens  (return)
 *   code-reviewer→ Phase C (roster)   400 tokens  (return)
 *   spawn-only   → Phase A (roster)     0 tokens  (spawn only, no return)
 *   general-purpose→ Phase A (non-roster) 50 tokens (return, unattributed)
 *
 * total = 750 ; attributed = 700 ; unattributed = 50
 */
const FIXTURE_EVENTS = [
  // spawn events — should NOT contribute to tokens
  { ev: 'spawn', proj: PROJ, agent: 'planner',       ts: 1000 },
  { ev: 'spawn', proj: PROJ, agent: 'hld-architect',  ts: 1001 },
  { ev: 'spawn', proj: PROJ, agent: 'code-reviewer',  ts: 1002 },
  { ev: 'spawn', proj: PROJ, agent: 'spawn-only',     ts: 1003 },
  { ev: 'spawn', proj: PROJ, agent: 'general-purpose',ts: 1004 },

  // return events — contribute to tokens
  { ev: 'return', proj: PROJ, agent: 'planner',        ts: 2000, tokens: 100 },
  { ev: 'return', proj: PROJ, agent: 'hld-architect',   ts: 2001, tokens: 200 },
  { ev: 'return', proj: PROJ, agent: 'code-reviewer',   ts: 2002, tokens: 400 },
  { ev: 'return', proj: PROJ, agent: 'general-purpose', ts: 2003, tokens: 50  },

  // unrelated project — must not pollute alpha results
  { ev: 'return', proj: 'other', agent: 'planner', ts: 3000, tokens: 9999 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('AC#4 — unknown project returns HTTP 200 with zero-valued shape', async (t) => {
  const server = await bootServer({ events: [] });
  try {
    const res = await get(server.port, '/api/economics?project=does-not-exist');
    assert.equal(res.status, 200, 'status must be 200');
    const body = res.json();
    assert.equal(body.project,     'does-not-exist');
    assert.deepEqual(body.byAgent,  {});
    assert.deepEqual(body.byPhase,  { A: 0, B: 0, C: 0 });
    assert.equal(body.total,        0);
    assert.equal(body.unattributed, 0);
  } finally {
    server.kill();
  }
});

test('AC#3 — byAgent sums return-event tokens; spawn-only agent contributes 0', async (t) => {
  const server = await bootServer({ events: FIXTURE_EVENTS });
  try {
    const res = await get(server.port, `/api/economics?project=${PROJ}`);
    assert.equal(res.status, 200);
    const { byAgent } = res.json();

    assert.equal(byAgent['planner'],        100, 'planner: 100');
    assert.equal(byAgent['hld-architect'],  200, 'hld-architect: 200');
    assert.equal(byAgent['code-reviewer'],  400, 'code-reviewer: 400');
    assert.equal(byAgent['general-purpose'], 50, 'general-purpose: 50');

    // spawn-only agent must NOT appear (or appear as 0)
    const spawnOnly = byAgent['spawn-only'];
    assert.ok(
      spawnOnly === undefined || spawnOnly === 0,
      `spawn-only agent must have 0 tokens but got ${spawnOnly}`
    );
  } finally {
    server.kill();
  }
});

test('AC#2 — phase bucketing: Σ byPhase === total; inferPhase per-agent', async (t) => {
  const server = await bootServer({ events: FIXTURE_EVENTS });
  try {
    const res = await get(server.port, `/api/economics?project=${PROJ}`);
    const { byPhase, total } = res.json();

    const sum = (byPhase.A || 0) + (byPhase.B || 0) + (byPhase.C || 0);
    assert.equal(sum, total, `Σ byPhase (${sum}) must equal total (${total})`);

    // planner → A (100), general-purpose → A (50)  ∴ A = 150
    assert.equal(byPhase.A, 150, 'phase A');
    // hld-architect → B (200)
    assert.equal(byPhase.B, 200, 'phase B');
    // code-reviewer → C (400)
    assert.equal(byPhase.C, 400, 'phase C');
  } finally {
    server.kill();
  }
});

test('AC#1 — reconciliation: economics.total === engagements.tokens for same project', async (t) => {
  const server = await bootServer({ events: FIXTURE_EVENTS });
  try {
    const [ecoRes, engRes] = await Promise.all([
      get(server.port, `/api/economics?project=${PROJ}`),
      get(server.port, '/api/engagements'),
    ]);
    const { total } = ecoRes.json();
    const { engagements } = engRes.json();
    const eng = engagements.find(e => e.project === PROJ);
    assert.ok(eng, `project ${PROJ} must appear in /api/engagements`);
    assert.equal(total, eng.tokens, `economics.total (${total}) must equal engagements.tokens (${eng.tokens})`);
  } finally {
    server.kill();
  }
});

test('AC#5 — unattributed: out-of-roster agent tokens counted correctly', async (t) => {
  const server = await bootServer({ events: FIXTURE_EVENTS });
  try {
    const res = await get(server.port, `/api/economics?project=${PROJ}`);
    const { total, unattributed, byAgent } = res.json();
    // general-purpose is the only non-roster agent in fixture
    assert.equal(unattributed, byAgent['general-purpose'], 'unattributed === general-purpose tokens');
    assert.equal(unattributed, total - 700, `unattributed (${unattributed}) must be total - 700`);
  } finally {
    server.kill();
  }
});

test('AC#6 — /api/engagements carries history[] on each engagement object', async (t) => {
  const STATE_WITH_HISTORY = {
    project: PROJ,
    path: `/home/user/projects/${PROJ}`,
    phase: 'B',
    status: 'building',
    note: 'initial note',
    updatedAt: 1700000000,
    history: [
      { phase: 'A', status: 'gate1_pending', note: 'early', ts: 1699999000 },
      { phase: 'B', status: 'building',      note: 'initial note', ts: 1700000000 },
    ],
  };

  const server = await bootServer({
    events: FIXTURE_EVENTS,
    engagements: { [PROJ]: STATE_WITH_HISTORY },
  });
  try {
    const res = await get(server.port, '/api/engagements');
    const { engagements } = res.json();
    const eng = engagements.find(e => e.project === PROJ);
    assert.ok(eng, 'project must appear');
    assert.ok(Array.isArray(eng.history), 'history must be an array');
    assert.equal(eng.history.length, 2, 'history must have 2 entries');
    assert.equal(eng.history[0].phase,  'A',             'history[0].phase');
    assert.equal(eng.history[1].status, 'building',      'history[1].status');
  } finally {
    server.kill();
  }
});

test('AC#2 (edge) — C-agent roster members each map to phase C', async (t) => {
  const C_AGENTS = ['code-reviewer','security-reviewer','test-writer','db-reviewer','design-reviewer','refuter'];
  const evts = C_AGENTS.map((a, i) => ({ ev: 'return', proj: 'c-test', agent: a, ts: 2000 + i, tokens: 10 }));
  const server = await bootServer({ events: evts });
  try {
    const res = await get(server.port, '/api/economics?project=c-test');
    const { byPhase, agentPhase } = res.json();
    assert.equal(byPhase.C, 60, 'all 6 C-agents × 10 tokens = 60');
    assert.equal(byPhase.A, 0);
    assert.equal(byPhase.B, 0);
    for (const a of C_AGENTS) {
      assert.equal(agentPhase[a], 'C', `${a} must map to phase C`);
    }
  } finally {
    server.kill();
  }
});

test('AC#2 (edge) — B-agent roster members each map to phase B', async (t) => {
  const B_AGENTS = ['hld-architect','deck-architect'];
  const evts = B_AGENTS.map((a, i) => ({ ev: 'return', proj: 'b-test', agent: a, ts: 2000 + i, tokens: 10 }));
  const server = await bootServer({ events: evts });
  try {
    const res = await get(server.port, '/api/economics?project=b-test');
    const { byPhase, agentPhase } = res.json();
    assert.equal(byPhase.B, 20, 'both B-agents × 10 tokens = 20');
    assert.equal(byPhase.A, 0);
    assert.equal(byPhase.C, 0);
    for (const a of B_AGENTS) {
      assert.equal(agentPhase[a], 'B', `${a} must map to phase B`);
    }
  } finally {
    server.kill();
  }
});

test('AC#3 (edge) — non-return events (start, spawn) do not add to byAgent', async (t) => {
  const evts = [
    { ev: 'start',  proj: 'x', agent: 'planner', ts: 1000, tokens: 9999 },
    { ev: 'spawn',  proj: 'x', agent: 'planner', ts: 1001, tokens: 9999 },
    { ev: 'return', proj: 'x', agent: 'planner', ts: 1002, tokens: 7 },
  ];
  const server = await bootServer({ events: evts });
  try {
    const res = await get(server.port, '/api/economics?project=x');
    const { byAgent, total } = res.json();
    assert.equal(byAgent['planner'], 7,  'only return-event tokens count');
    assert.equal(total,              7,  'total must be 7');
  } finally {
    server.kill();
  }
});

test('AC#1 (edge) — project with zero return events: total===0 and engagements.tokens===0', async (t) => {
  const evts = [
    { ev: 'spawn', proj: 'empty-proj', agent: 'planner', ts: 1000 },
  ];
  const server = await bootServer({ events: evts });
  try {
    const [ecoRes, engRes] = await Promise.all([
      get(server.port, '/api/economics?project=empty-proj'),
      get(server.port, '/api/engagements'),
    ]);
    const { total } = ecoRes.json();
    const { engagements } = engRes.json();
    const eng = engagements.find(e => e.project === 'empty-proj');
    assert.equal(total, 0, 'economics total must be 0');
    assert.ok(eng, 'project must appear in engagements');
    assert.equal(eng.tokens, 0, 'engagements.tokens must be 0');
  } finally {
    server.kill();
  }
});
