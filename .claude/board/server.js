#!/usr/bin/env node
// Office Board — live visibility for the Agentic Delivery Office.
// Zero dependencies. Run from the project root:  node .claude/board/server.js [port]
// Events are appended to .claude/board/events.jsonl by the office-board.sh hook
// and streamed to the browser over SSE.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || process.env.OFFICE_BOARD_PORT || '5599', 10);
// events.jsonl lives next to this server (.claude/board/), regardless of cwd
const EVENTS = path.join(__dirname, 'events.jsonl');
// scope registry: standard location for a user-scope install (~/.claude/office),
// with fallbacks for project-scope / dev layouts. Generic — no hardcoded paths.
const SCOPE_CANDIDATES = [
  path.join(__dirname, '..', 'office', 'scope.json'),               // ~/.claude/office-board → ~/.claude/office
  path.join(process.env.HOME || '', '.claude', 'office', 'scope.json'),
];
function readScope() {
  for (const f of SCOPE_CANDIDATES) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* next */ }
  }
  return { default_policy: 'opt-in', in_scope: [], excluded: [] };
}
function readEvents() {
  try {
    return fs.readFileSync(EVENTS, 'utf8').split('\n')
      .map(l => l.trim()).filter(Boolean)
      .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
}
// Explicit per-project state written by the orchestrator at gate transitions (Layer 2).
function readStates() {
  const dir = path.join(path.dirname(SCOPE_CANDIDATES[1] || ''), 'engagements'); // ~/.claude/office/engagements
  const alt = path.join(__dirname, '..', 'office', 'engagements');
  const out = {};
  for (const d of [dir, alt]) {
    try {
      for (const fn of fs.readdirSync(d)) {
        if (!fn.endsWith('.json')) continue;
        try { const s = JSON.parse(fs.readFileSync(path.join(d, fn), 'utf8')); out[s.project] = s; } catch {}
      }
    } catch {}
  }
  return out;
}
// Infer phase from which agents have run (automatic, zero-effort fallback).
const PHASE_C = new Set(['code-reviewer','security-reviewer','test-writer','db-reviewer','design-reviewer','refuter']);
const PHASE_B = new Set(['hld-architect','deck-architect']);
function inferPhase(agents) {
  if ([...agents].some(a => PHASE_C.has(a))) return 'C';
  if ([...agents].some(a => PHASE_B.has(a))) return 'B';
  return 'A';
}
// Aggregate real agent activity per project + fold in enrolled-but-idle projects + merge explicit state.
function engagements() {
  const scope = readScope();
  const states = readStates();
  const byProj = {};
  const base = p => (p || '').split('/').filter(Boolean).pop() || p || 'unknown';
  for (const p of (scope.in_scope || [])) {
    const name = base(p);
    byProj[name] = { project: name, path: p, tokens: 0, runs: 0, active: 0, lastTs: 0, enrolled: true, agents: new Set() };
  }
  for (const e of readEvents()) {
    const name = e.proj || base(e.projPath) || 'unknown';
    const g = byProj[name] || (byProj[name] = { project: name, path: e.projPath || '', tokens: 0, runs: 0, active: 0, lastTs: 0, enrolled: false, agents: new Set() });
    if (e.agent) g.agents.add(e.agent);
    if (e.ev === 'spawn') g.active++;
    if (e.ev === 'return') { g.active = Math.max(0, g.active - 1); g.runs++; g.tokens += (e.tokens || 0); }
    g.lastTs = Math.max(g.lastTs, e.ts || 0);
  }
  const list = Object.values(byProj).map(g => {
    const st = states[g.project];
    const phase = st ? st.phase : (g.runs ? inferPhase(g.agents) : null);
    const status = st ? st.status : (g.active > 0 ? 'building' : (g.runs ? 'idle' : 'enrolled'));
    return { project: g.project, path: g.path, tokens: g.tokens, runs: g.runs, active: g.active,
             lastTs: Math.max(g.lastTs, st ? st.updatedAt || 0 : 0), enrolled: g.enrolled,
             phase, status, note: st ? st.note : '', history: st ? (st.history || []) : [] };
  });
  return { default_policy: scope.default_policy || 'opt-in', engagements: list.sort((a, b) => b.lastTs - a.lastTs) };
}
// Per-engagement economics: one authoritative scan of events.jsonl → tokens bucketed
// by agent and by phase (phase via the same inferPhase used everywhere). Dollars are
// NEVER computed here — prices live client-side (zero new deps, single source for tiers).
const ROSTER = new Set([...PHASE_C, ...PHASE_B, 'planner', 'explorer', 'mockup-builder', 'business-reviewer']);
function economics(project) {
  const base = p => (p || '').split('/').filter(Boolean).pop() || p || 'unknown';
  const byAgent = {}, byPhase = { A: 0, B: 0, C: 0 }, agentPhase = {};
  let total = 0;
  for (const e of readEvents()) {
    const name = e.proj || base(e.projPath) || 'unknown';
    if (name !== project || e.ev !== 'return') continue;
    const agent = e.agent || 'unknown';
    const tok = e.tokens || 0;
    const phase = inferPhase(new Set([agent]));
    byAgent[agent] = (byAgent[agent] || 0) + tok;
    agentPhase[agent] = phase;
    byPhase[phase] += tok;
    total += tok;
  }
  let attributed = 0;
  for (const [a, t] of Object.entries(byAgent)) if (ROSTER.has(a)) attributed += t;
  return { project, byAgent, agentPhase, byPhase, total, unattributed: total - attributed };
}
function sendJSON(res, obj) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

fs.mkdirSync(path.dirname(EVENTS), { recursive: true });
if (!fs.existsSync(EVENTS)) fs.writeFileSync(EVENTS, '');

const clients = new Set();
let offset = fs.statSync(EVENTS).size; // new lines only; history is replayed per-client

function pump() {
  let stat;
  try { stat = fs.statSync(EVENTS); } catch { return; }
  if (stat.size < offset) offset = 0; // file was reset
  if (stat.size === offset) return;
  const stream = fs.createReadStream(EVENTS, { start: offset, end: stat.size - 1 });
  let buf = '';
  stream.on('data', d => (buf += d));
  stream.on('end', () => {
    offset = stat.size;
    for (const line of buf.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      for (const res of clients) res.write(`data: ${t}\n\n`);
    }
  });
}

try { fs.watch(path.dirname(EVENTS), () => setTimeout(pump, 50)); } catch { /* poll only */ }
setInterval(pump, 1000);

http.createServer((req, res) => {
  if (req.url === '/api/scope') { sendJSON(res, readScope()); return; }
  if (req.url === '/api/engagements') { sendJSON(res, engagements()); return; }
  if (req.url.startsWith('/api/economics')) {
    const project = new URL(req.url, 'http://x').searchParams.get('project') || '';
    sendJSON(res, economics(project));
    return;
  }
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    for (const line of fs.readFileSync(EVENTS, 'utf8').split('\n')) {
      if (line.trim()) res.write(`data: ${line.trim()}\n\n`);
    }
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
}).listen(PORT, () => console.log(`Office Board → http://localhost:${PORT}`));
