#!/bin/bash
# Installs the agent methodology kit into a project.
# Usage: ./install.sh /path/to/project   (defaults to current directory)
set -e

TARGET="${1:-.}"
KIT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$TARGET" ]; then
  echo "Target directory does not exist: $TARGET" >&2
  exit 1
fi
TARGET="$(cd "$TARGET" && pwd)"

echo "Installing agent methodology kit into: $TARGET"

mkdir -p "$TARGET/.claude/agents" "$TARGET/.claude/hooks"

# Agents and hooks: copy (overwrite — these are the methodology, keep them in sync)
cp "$KIT_DIR/.claude/agents/"*.md "$TARGET/.claude/agents/"
cp "$KIT_DIR/.claude/hooks/"*.sh "$TARGET/.claude/hooks/"
chmod +x "$TARGET/.claude/hooks/"*.sh
echo "  ✓ agents (8) and hooks installed"

# Orchestration protocol: copy (overwrite — methodology)
cp "$KIT_DIR/ORCHESTRATION.md" "$TARGET/ORCHESTRATION.md"
echo "  ✓ ORCHESTRATION.md installed"

# settings.json: never overwrite an existing one
if [ -f "$TARGET/.claude/settings.json" ]; then
  echo "  ! .claude/settings.json already exists — NOT overwritten."
  echo "    Merge permissions+hooks manually from: $KIT_DIR/.claude/settings.json"
else
  cp "$KIT_DIR/.claude/settings.json" "$TARGET/.claude/settings.json"
  echo "  ✓ settings.json installed (permissions allowlist + commit gate hook)"
fi

# CLAUDE.md: never overwrite an existing one
if [ -f "$TARGET/CLAUDE.md" ]; then
  echo "  ! CLAUDE.md already exists — NOT overwritten."
  echo "    Add the 'Business context' and 'Orchestration' sections from: $KIT_DIR/CLAUDE.md.template"
else
  cp "$KIT_DIR/CLAUDE.md.template" "$TARGET/CLAUDE.md"
  echo "  ✓ CLAUDE.md created from template — EDIT THE PLACEHOLDERS NOW."
fi

echo ""
echo "Done. Next steps:"
echo "  1. Edit $TARGET/CLAUDE.md — fill all <PLACEHOLDERS> (business context grounds the reviewer lenses)."
echo "  2. Open the project in Claude Code and run a first feature through ORCHESTRATION.md."
echo "  3. Optional: switch to acceptEdits (Shift+Tab) once you trust the loop."
