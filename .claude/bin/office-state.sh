#!/bin/bash
# Record an engagement's phase/gate state for the Office cockpit (Layer 2).
# Run from the project directory. The orchestrator calls this at each gate /
# phase transition so the cockpit can show real "Gate 1 pending", "Phase B",
# "escalated", "delivered" — instead of inferring only from agent activity.
#
# Usage:
#   office-state.sh <phase> <status> [note...]
#     <phase>  : A | B | C            (Concept | Design | Build)
#     <status> : gate1_pending | building | gate2_pending | escalated
#                | delivered | active | cleared
# Examples:
#   office-state.sh A gate1_pending "mockup + HL diagram ready for review"
#   office-state.sh C delivered "shipped with 2 residual non-blockers"
proj="${CLAUDE_PROJECT_DIR:-$PWD}"
slug=$(basename "$proj")
dir="${OFFICE_STATE_DIR:-$HOME/.claude/office/engagements}"
mkdir -p "$dir"
phase="$1"; status="$2"; shift 2 2>/dev/null; note="$*"
ts=$(date +%s)
if [ "$status" = "cleared" ]; then rm -f "$dir/$slug.json"; echo "cleared state: $slug"; exit 0; fi
file="$dir/$slug.json"
# One history entry per transition (this call). Append, seeding history[] from the
# current top-level fields on the first write after the schema change (no migration).
new_entry=$(jq -cn --arg ph "$phase" --arg st "$status" --arg n "$note" --argjson ts "$ts" \
              '{phase:$ph,status:$st,note:$n,ts:$ts}')
if [ -f "$file" ]; then
  jq -c --argjson e "$new_entry" '
    ( if (.history|type) == "array" then .history
      else [ { phase:.phase, status:.status, note:(.note//""), ts:(.updatedAt//0) } ] end ) as $h
    | { project, path,
        phase:  $e.phase, status: $e.status, note: $e.note, updatedAt: $e.ts,
        history: ($h + [$e]) }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
else
  jq -cn --arg p "$slug" --arg pp "$proj" --argjson e "$new_entry" \
    '{project:$p, path:$pp, phase:$e.phase, status:$e.status,
      note:$e.note, updatedAt:$e.ts, history:[$e]}' > "$file"
fi
echo "recorded: $slug → phase $phase / $status"
