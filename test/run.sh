#!/usr/bin/env bash
# Test runner for the Agentic Delivery Office.
# Usage:  bash test/run.sh
# Exit code: 0 all pass, 1 any failure.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FAIL=0

echo "========================================="
echo " Agentic Delivery Office — test suite"
echo "========================================="

echo ""
echo "--- [1/2] Node economics / engagements API tests ---"
node --test "$ROOT/test/economics.test.js" || FAIL=1

echo ""
echo "--- [2/2] Bash office-state.sh tests ---"
bash "$ROOT/test/office-state.test.sh" || FAIL=1

echo ""
if [ "$FAIL" -eq 0 ]; then
  echo "All test suites passed."
else
  echo "One or more test suites FAILED."
  exit 1
fi
