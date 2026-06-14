#!/bin/bash
# PreToolUse hook (matcher: Bash). Blocks `git commit` unless the project's
# lint and test scripts pass. Deterministic quality gate — the agent cannot
# skip it; on denial the reason is fed back so it fixes and retries.
#
# Generic across stacks: gates only on scripts/targets that actually exist.
# Extend the LINT_CMD/TEST_CMD detection for other ecosystems as needed.

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

# Only gate git commit commands
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

# Respect project scope: do not gate projects that aren't in the Office's scope
"$(dirname "$0")/office-active.sh" "${CLAUDE_PROJECT_DIR:-$PWD}" || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

LINT_CMD=""
TEST_CMD=""

# Node
if [ -f package.json ]; then
  jq -e '.scripts.lint' package.json >/dev/null 2>&1 && LINT_CMD="npm run lint --silent"
  jq -e '.scripts.test' package.json >/dev/null 2>&1 && TEST_CMD="npm test --silent"
fi
# Python
if [ -z "$TEST_CMD" ] && { [ -f pyproject.toml ] || [ -d tests ]; }; then
  command -v pytest >/dev/null 2>&1 && TEST_CMD="pytest -q"
fi
# Makefile fallbacks
if [ -f Makefile ]; then
  [ -z "$LINT_CMD" ] && grep -qE '^lint:' Makefile && LINT_CMD="make lint"
  [ -z "$TEST_CMD" ] && grep -qE '^test:' Makefile && TEST_CMD="make test"
fi

deny() {
  jq -n --arg reason "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $reason
    }
  }'
  exit 0
}

if [ -n "$LINT_CMD" ]; then
  if ! out=$($LINT_CMD 2>&1); then
    deny "Commit blocked: lint failed. Fix before committing. Output (tail): $(printf '%s' "$out" | tail -c 1500)"
  fi
fi

if [ -n "$TEST_CMD" ]; then
  if ! out=$($TEST_CMD 2>&1); then
    deny "Commit blocked: tests failed. Fix before committing. Output (tail): $(printf '%s' "$out" | tail -c 1500)"
  fi
fi

exit 0
