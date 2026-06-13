---
description: Start the Office Board (live agent org-chart / football pitch) and open it in the browser.
allowed-tools: Bash
---

Start the Office Board server and open it:

1. Run the global board server in the background:
   `node ~/.claude/office-board/server.js &`
   (It serves on http://localhost:5599 and streams the events the
   office-board hook appends to `~/.claude/office-board/events.jsonl`.)
2. Open `http://localhost:5599` in the browser.
3. Tell me both views are available: **Blueprint** (the org chart, for the
   boardroom and the patent) and **⚽ Match** (the football pitch — same data,
   with the ball, goals, the VAR/refuter, and tap-for-player-card). Mention the
   `#match` and `#demo` deep links.

If port 5599 is busy, report what is using it instead of forcing a kill.
