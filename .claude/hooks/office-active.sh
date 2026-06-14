#!/bin/bash
# Helper: is the Agentic Delivery Office ACTIVE in this project?
# exit 0 = active, exit 1 = inactive. Used by gate-commit.sh and office-board.sh.
#
# Rules: if no global scope registry exists (e.g. a project-scoped install or a
# pre-scope setup) → ACTIVE. Otherwise membership in ~/.claude/office/scope.json:
#   excluded → inactive · in_scope → active · unknown → per default_policy.
proj="${1:-${CLAUDE_PROJECT_DIR:-$PWD}}"
scope="$HOME/.claude/office/scope.json"
[ -f "$scope" ] || exit 0   # no registry → active

SCOPE="$scope" PROJ="$proj" python3 - <<'PY'
import json, os, sys
proj = os.path.realpath(os.environ['PROJ'])
try: s = json.load(open(os.environ['SCOPE']))
except Exception: sys.exit(0)
def match(lst):
    for p in lst or []:
        try:
            if os.path.realpath(os.path.expanduser(p)) == proj: return True
        except Exception: pass
    return False
if match(s.get('excluded')): sys.exit(1)
if match(s.get('in_scope')): sys.exit(0)
sys.exit(0 if s.get('default_policy','opt-in') == 'opt-out' else 1)
PY
