#!/bin/bash
# Auto-launches / focuses the Office Live Board when the Office is ACTIVE in the
# project. Fired (detached) from office-scope.sh on every SessionStart so the
# board is always present and current — without spawning duplicate tabs.
#
# Behavior:
#   - ensures the board server is running (starts it if down);
#   - if NO browser tab is watching  → opens the board (a tab is needed);
#   - if a tab IS already watching    → focuses it instead of opening a new one
#       · macOS: `open <url>` re-uses & raises the existing tab for that URL;
#       · other OSes can't reliably raise a tab, so we send a focus ping and let
#         the live SSE stream keep that tab current (no duplicate tab);
#   - data is always fresh through the existing SSE stream.
#
# Safe in headless / CI / SSH: with no browser opener or display it simply keeps
# the server running and never blocks. Best-effort throughout (no `set -e`).
# Opt out entirely with  OFFICE_BOARD_AUTO_OPEN=0
[ "${OFFICE_BOARD_AUTO_OPEN:-1}" = "0" ] && exit 0
[ -n "$CI" ] && exit 0

PORT="${OFFICE_BOARD_PORT:-5599}"
DIR="${OFFICE_BOARD_DIR:-$HOME/.claude/office-board}"
SERVER="$DIR/server.js"
URL="http://localhost:$PORT"
[ -f "$SERVER" ] || exit 0
command -v node >/dev/null 2>&1 || exit 0

port_open(){ (exec 3<>/dev/tcp/127.0.0.1/"$PORT") 2>/dev/null && { exec 3>&-; return 0; }; return 1; }

is_wsl(){ grep -qiE 'microsoft|wsl' /proc/version 2>/dev/null; }
have_opener(){
  case "$(uname -s)" in
    Darwin) command -v open >/dev/null 2>&1 ;;
    Linux)  if is_wsl; then command -v wslview >/dev/null 2>&1 || command -v cmd.exe >/dev/null 2>&1
            else [ -n "$DISPLAY$WAYLAND_DISPLAY" ] && command -v xdg-open >/dev/null 2>&1; fi ;;
    *)      command -v start >/dev/null 2>&1 ;;
  esac
}
open_url(){
  case "$(uname -s)" in
    Darwin) open "$URL" >/dev/null 2>&1 & ;;
    Linux)  if is_wsl; then
              if command -v wslview >/dev/null 2>&1; then wslview "$URL" >/dev/null 2>&1 &
              else cmd.exe /c start "$URL" >/dev/null 2>&1 & fi
            else xdg-open "$URL" >/dev/null 2>&1 & fi ;;
    *)      start "" "$URL" >/dev/null 2>&1 & ;;
  esac
}
focus_ping(){ command -v curl >/dev/null 2>&1 && curl -s --max-time 1 "$URL/api/focus" >/dev/null 2>&1 & }

# 1. Ensure the server is up.
if ! port_open; then
  nohup node "$SERVER" >"$DIR/server.log" 2>&1 &
  for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do port_open && break; sleep 0.2; done
fi
port_open || exit 0

# 2. Count tabs already watching, then open-or-focus.
clients=0
if command -v curl >/dev/null 2>&1; then
  clients=$(curl -s --max-time 1 "$URL/api/status" | sed -n 's/.*"clients":[ ]*\([0-9]*\).*/\1/p')
fi
case "$clients" in ''|*[!0-9]*) clients=0 ;; esac

if [ "$clients" -gt 0 ]; then
  focus_ping
  # macOS re-uses & raises the existing tab; elsewhere we avoid a duplicate.
  [ "$(uname -s)" = "Darwin" ] && open_url
else
  have_opener && open_url
fi
exit 0
