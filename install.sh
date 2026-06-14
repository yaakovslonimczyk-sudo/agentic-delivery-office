#!/bin/bash
# The Agentic Delivery Office — portable installer.
#
#   ./install.sh                         # Claude Code, USER scope (system-wide) — recommended
#   ./install.sh --target codex          # OpenAI Codex, user scope (~/.codex)
#   ./install.sh --target grok           # Grok Build, user scope (~/.grok)
#   ./install.sh --scope project [PATH]  # Claude Code, single project (legacy behavior)
#   ./install.sh --dry-run [...]         # print actions, change nothing
#
# System-level by default: agents + protocol + Live Board + hooks + slash
# commands install once into your home and apply to every project. Per-project
# business context is added later with the /office-init slash command.
set -e
KIT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET="claude"; SCOPE="user"; DRYRUN=0; PROJECT_PATH=""; HOME_DIR="$HOME"

while [ $# -gt 0 ]; do
  case "$1" in
    --target) TARGET="$2"; shift 2;;
    --scope)  SCOPE="$2";  shift 2;;
    --home)   HOME_DIR="$2"; shift 2;;        # test hook: redirect $HOME
    --dry-run) DRYRUN=1; shift;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0;;
    *) PROJECT_PATH="$1"; SCOPE="project"; shift;;
  esac
done

DO(){ if [ "$DRYRUN" = 1 ]; then echo "  [dry] $*"; else "$@"; fi; }
chmodx(){ [ "$DRYRUN" = 1 ] && { echo "  [dry] chmod +x $*"; return; }; chmod +x "$@"; }

append_block(){ # file marker srcfile
  local f="$1" marker="$2" src="$3"
  if [ "$DRYRUN" = 1 ]; then echo "  [dry] append '$marker' block → $f"; return; fi
  mkdir -p "$(dirname "$f")"; touch "$f"
  if grep -qF "$marker" "$f" 2>/dev/null; then echo "  • $f already has the block (skipped)"; return; fi
  { echo ""; echo "<!-- $marker START -->"; cat "$src"; echo "<!-- $marker END -->"; } >> "$f"
  echo "  ✓ block appended → $f"
}

ensure_scope(){ # scope.json
  local f="$1"
  if [ "$DRYRUN" = 1 ]; then echo "  [dry] ensure scope registry → $f (default opt-in)"; return; fi
  mkdir -p "$(dirname "$f")"
  if [ -f "$f" ]; then echo "  • scope registry exists (kept): $f"; return; fi
  printf '{\n  "default_policy": "opt-in",\n  "in_scope": [],\n  "excluded": []\n}\n' > "$f"
  echo "  ✓ scope registry created (default: opt-in) → $f"
}

enroll_scope(){ # scope.json projectpath  (only if registry exists)
  local f="$1" p="$2"
  [ -f "$f" ] || return 0
  if [ "$DRYRUN" = 1 ]; then echo "  [dry] enroll $p → $f"; return; fi
  SCOPE="$f" P="$p" python3 - <<'PY'
import json,os
f=os.environ['SCOPE']; p=os.path.realpath(os.environ['P'])
s=json.load(open(f)); ins=s.setdefault('in_scope',[])
s['excluded']=[x for x in s.get('excluded',[]) if os.path.realpath(os.path.expanduser(x))!=p]
if p not in [os.path.realpath(os.path.expanduser(x)) for x in ins]: ins.append(p)
json.dump(s,open(f,'w'),indent=2)
print("  ✓ enrolled in scope:",p)
PY
}

merge_settings(){ # settings.json hooksdir
  local f="$1" hd="$2"
  if [ "$DRYRUN" = 1 ]; then echo "  [dry] merge hooks (gate-commit, office-board) → $f"; return; fi
  SETTINGS="$f" HOOKS_DIR="$hd" python3 - <<'PY'
import json, os
f=os.environ['SETTINGS']; hd=os.environ['HOOKS_DIR']
try: s=json.load(open(f))
except Exception: s={}
s.setdefault('hooks',{})
def ensure(ev, matcher, cmd):
    arr=s['hooks'].setdefault(ev,[])
    for g in arr:
        for h in g.get('hooks',[]):
            if h.get('command')==cmd: return
    grp={"hooks":[{"type":"command","command":cmd}]}
    if matcher is not None: grp["matcher"]=matcher
    arr.append(grp)
ensure('SessionStart', None,        hd+'/office-scope.sh')
ensure('PreToolUse','Bash',         hd+'/gate-commit.sh')
ensure('PreToolUse','Task|Agent',   hd+'/office-board.sh')
ensure('PostToolUse','Task|Agent',  hd+'/office-board.sh')
os.makedirs(os.path.dirname(f), exist_ok=True)
json.dump(s, open(f,'w'), indent=2)
print("  ✓ hooks merged →", f)
PY
}

install_claude_user(){
  local C="$HOME_DIR/.claude"
  echo "Installing The Agentic Delivery Office → Claude Code (USER scope): $C"
  DO mkdir -p "$C/agents" "$C/commands" "$C/hooks" "$C/office-board" "$C/office" "$C/office/engagements" "$C/office/bin"
  DO cp "$KIT_DIR/.claude/agents/"*.md "$C/agents/"
  DO cp "$KIT_DIR/.claude/hooks/"*.sh "$C/hooks/"; chmodx "$C/hooks/"*.sh
  DO cp "$KIT_DIR/.claude/bin/office-state.sh" "$C/office/bin/"; chmodx "$C/office/bin/office-state.sh"
  DO cp "$KIT_DIR/.claude/board/server.js" "$KIT_DIR/.claude/board/index.html" "$C/office-board/"
  DO cp "$KIT_DIR/ORCHESTRATION.md" "$C/office/ORCHESTRATION.md"
  DO cp "$KIT_DIR/commands/"*.md "$C/commands/"
  merge_settings "$C/settings.json" "$C/hooks"
  ensure_scope "$C/office/scope.json"
  printf '%s\n' \
    "## The Agentic Delivery Office" \
    "" \
    "Installed at user scope. For any non-trivial change, follow the staged-gates" \
    "protocol in \`~/.claude/office/ORCHESTRATION.md\` (concept→GATE 1→design→GATE 2→build)." \
    "Specialist agents live in \`~/.claude/agents/\`. The office is **scoped**: by" \
    "default (opt-in) it stays dormant in a project until you run \`/office-init\` there." \
    "Manage scope with \`/office-scope\`; watch the Live Board with \`/office-board\`." \
    > /tmp/_office_claudemd.txt
  append_block "$C/CLAUDE.md" "AGENTIC-OFFICE" /tmp/_office_claudemd.txt
  echo ""
  echo "Done. Global install complete — default scope policy: opt-in (dormant until /office-init)."
  echo "Next: open a project and run  /office-init   (or  /office-init scan  to bulk-enroll ~/dev)"
}

install_claude_project(){
  local T="${PROJECT_PATH:-.}"; T="$(cd "$T" && pwd)"
  echo "Installing → Claude Code (PROJECT scope): $T"
  DO mkdir -p "$T/.claude/agents" "$T/.claude/hooks" "$T/.claude/board"
  DO cp "$KIT_DIR/.claude/agents/"*.md "$T/.claude/agents/"
  DO cp "$KIT_DIR/.claude/hooks/"*.sh "$T/.claude/hooks/"; chmodx "$T/.claude/hooks/"*.sh
  DO cp "$KIT_DIR/.claude/board/server.js" "$KIT_DIR/.claude/board/index.html" "$T/.claude/board/"
  DO cp "$KIT_DIR/ORCHESTRATION.md" "$T/ORCHESTRATION.md"
  [ -f "$T/.claude/settings.json" ] && echo "  ! .claude/settings.json exists — merge hooks from kit manually" || DO cp "$KIT_DIR/.claude/settings.json" "$T/.claude/settings.json"
  [ -f "$T/CLAUDE.md" ] && echo "  ! CLAUDE.md exists — add roster+business sections from CLAUDE.md.template" || DO cp "$KIT_DIR/CLAUDE.md.template" "$T/CLAUDE.md"
  enroll_scope "$HOME_DIR/.claude/office/scope.json" "$T"   # if a global registry exists, mark this project active
  echo "Done. Edit CLAUDE.md placeholders before first run."
}

install_codex(){
  local X="$HOME_DIR/.codex"
  echo "Installing → OpenAI Codex (user scope): $X"
  DO mkdir -p "$X/agents"
  DO cp "$KIT_DIR/ports/codex/agents/"*.toml "$X/agents/"
  append_block "$X/AGENTS.md" "AGENTIC-OFFICE" "$KIT_DIR/ports/codex/AGENTS.md"
  echo "Done. 9 agents → ~/.codex/agents/*.toml ; protocol appended to ~/.codex/AGENTS.md"
}

install_grok(){
  local G="$HOME_DIR/.grok"
  echo "Installing → Grok Build (user scope): $G"
  DO mkdir -p "$G/skills/agentic-office"
  DO cp "$KIT_DIR/ports/grok/skill/SKILL.md" "$KIT_DIR/ports/grok/skill/GROK-PROMPTS.md" "$KIT_DIR/ports/grok/skill/ORCHESTRATION.md" "$G/skills/agentic-office/"
  echo "Done. Global skill → ~/.grok/skills/agentic-office/ (invoke /agentic-office)."
  echo "Note: Grok Build also auto-reads a project's AGENTS.md and .claude/ assets,"
  echo "      so a project set up for Claude/Codex is largely covered already."
}

case "$TARGET:$SCOPE" in
  claude:user)    install_claude_user;;
  claude:project) install_claude_project;;
  codex:*)        install_codex;;
  grok:*)         install_grok;;
  *) echo "Unknown --target '$TARGET' (claude|codex|grok)"; exit 1;;
esac
