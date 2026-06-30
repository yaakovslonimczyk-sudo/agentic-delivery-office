#!/bin/bash
# SessionStart hook. Decides whether the Agentic Delivery Office is active in
# the project being opened, and tells the session, based on the scope registry
# (~/.claude/office/scope.json). Never blocks; only injects context.
input=$(cat)
proj="${CLAUDE_PROJECT_DIR:-$PWD}"
src=$(printf '%s' "$input" | jq -r '.source // "startup"' 2>/dev/null)
scope="$HOME/.claude/office/scope.json"
[ -f "$scope" ] || exit 0   # project-scoped install or no registry → say nothing

status=$(SCOPE="$scope" PROJ="$proj" python3 - <<'PY'
import json, os
proj = os.path.realpath(os.environ['PROJ'])
try: s = json.load(open(os.environ['SCOPE']))
except Exception: print('none'); raise SystemExit
def match(lst):
    for p in lst or []:
        try:
            if os.path.realpath(os.path.expanduser(p)) == proj: return True
        except Exception: pass
    return False
if match(s.get('excluded')): print('excluded')
elif match(s.get('in_scope')): print('active')
else: print(s.get('default_policy','opt-in'))
PY
)

case "$status" in
  active|opt-out)
    msg="The Agentic Delivery Office is ACTIVE in this project. For any non-trivial change, follow ~/.claude/office/ORCHESTRATION.md — concept → GATE 1 → design → GATE 2 → build — and spend the human's judgment only at the gates."
    # Auto-launch / focus the Live Board (detached; never blocks session start).
    # Skip on compaction so we don't yank focus mid-work.
    case "$src" in
      compact) ;;
      *) nohup "$(dirname "$0")/office-board-open.sh" >/dev/null 2>&1 & ;;
    esac
    ;;
  opt-in)
    msg="The Agentic Delivery Office is installed but NOT active in this project. To run work through the staged-gates methodology here, the human must opt in with /office-init. Until then, work normally and do not impose the gates." ;;
  *)
    exit 0 ;;
esac

jq -cn --arg m "$msg" '{hookSpecificOutput:{hookEventName:"SessionStart",additionalContext:$m}}'
exit 0
