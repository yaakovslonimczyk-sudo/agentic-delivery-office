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
jq -cn --arg p "$slug" --arg pp "$proj" --arg ph "$phase" --arg st "$status" --arg n "$note" --arg ts "$ts" \
  '{project:$p,path:$pp,phase:$ph,status:$st,note:$n,updatedAt:($ts|tonumber)}' > "$dir/$slug.json"
echo "recorded: $slug → phase $phase / $status"
