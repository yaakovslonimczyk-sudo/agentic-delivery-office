#!/bin/bash
# Streams Agent/Task tool spawn+return events to the Office Board
# (.claude/board/events.jsonl). Registered for PreToolUse and PostToolUse.
# Never blocks anything: always exits 0 with no decision output.

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
case "$tool" in Task|Agent) ;; *) exit 0 ;; esac

# Only record activity for projects in the Office's scope
"$(dirname "$0")/office-active.sh" "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 0

ev=$(printf '%s' "$input" | jq -r '.hook_event_name // empty')
# Events go to the global office board by default (system-level install);
# OFFICE_BOARD_DIR overrides, e.g. for a per-project board.
dir="${OFFICE_BOARD_DIR:-$HOME/.claude/office-board}"
mkdir -p "$dir"

ts=$(date +%s)
agent=$(printf '%s' "$input" | jq -r '.tool_input.subagent_type // "claude"')
model=$(printf '%s' "$input" | jq -r '.tool_input.model // ""')
desc=$(printf '%s' "$input" | jq -r '.tool_input.description // ""' | head -c 120)

if [ "$ev" = "PreToolUse" ]; then
  jq -cn --arg ts "$ts" --arg a "$agent" --arg m "$model" --arg d "$desc" \
    '{ts:($ts|tonumber),ev:"spawn",agent:$a,model:$m,desc:$d}' >> "$dir/events.jsonl"
elif [ "$ev" = "PostToolUse" ]; then
  # token usage: try structured fields first, then the textual usage block
  tokens=$(printf '%s' "$input" | jq -r '[.. | objects | (.subagent_tokens? // .total_tokens? // empty)] | first // empty' 2>/dev/null)
  if [ -z "$tokens" ]; then
    tokens=$(printf '%s' "$input" | grep -o 'subagent_tokens[": ]*[0-9]*' | grep -o '[0-9]*$' | head -1)
  fi
  jq -cn --arg ts "$ts" --arg a "$agent" --arg m "$model" --arg d "$desc" --arg t "${tokens:-0}" \
    '{ts:($ts|tonumber),ev:"return",agent:$a,model:$m,desc:$d,tokens:($t|tonumber)}' >> "$dir/events.jsonl"
fi
exit 0
