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
