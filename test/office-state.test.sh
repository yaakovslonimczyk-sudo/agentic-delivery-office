#!/usr/bin/env bash
# Acceptance-criteria tests for office-state.sh
#
# AC coverage:
#  #7  Append: two successive calls → history length 2, top-level = last entry
#  #8  Backfill: old flat file (no history) → history[0]=seeded from old fields,
#                history[1]=new entry; old note preserved in history[0]
#  #9  Cleared: "cleared" status removes the file
#
# Zero deps: bash + jq (available in the project environment).
# Hermetic: uses a dedicated tmpdir; never touches ~/.claude/office.

set -euo pipefail

SCRIPT="$(cd "$(dirname "$0")/.." && pwd)/.claude/bin/office-state.sh"
PASS=0
FAIL=0

pass() { echo "  PASS: $1"; PASS=$((PASS+1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL+1)); }

assert_eq() {
  local label="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    pass "$label"
  else
    fail "$label — expected '$expected', got '$actual'"
  fi
}

assert_file_exists() {
  local label="$1" file="$2"
  if [ -f "$file" ]; then pass "$label"; else fail "$label — file not found: $file"; fi
}

assert_file_absent() {
  local label="$1" file="$2"
  if [ ! -f "$file" ]; then pass "$label"; else fail "$label — file should be absent: $file"; fi
}

# ─── setup ───────────────────────────────────────────────────────────────────
TMPDIR_TEST=$(mktemp -d)
trap 'rm -rf "$TMPDIR_TEST"' EXIT

SLUG="test-project"
STATE_DIR="$TMPDIR_TEST/engagements"
mkdir -p "$STATE_DIR"
STATE_FILE="$STATE_DIR/$SLUG.json"
PROJECT_DIR="/tmp/$SLUG"

run_state() {
  OFFICE_STATE_DIR="$STATE_DIR" \
  CLAUDE_PROJECT_DIR="$PROJECT_DIR" \
    bash "$SCRIPT" "$@"
}

# ─── AC#9: cleared removes the file ─────────────────────────────────────────
echo ""
echo "=== AC#9: cleared ==="

# Create a file first
run_state A gate1_pending "initial note" > /dev/null
assert_file_exists "file exists before cleared" "$STATE_FILE"

run_state A cleared > /dev/null
assert_file_absent "file absent after cleared" "$STATE_FILE"

# ─── AC#7: append — two successive calls ─────────────────────────────────────
echo ""
echo "=== AC#7: append ==="

# Start clean
rm -f "$STATE_FILE"

run_state A gate1_pending "first call note" > /dev/null
run_state B building       "second call note" > /dev/null

assert_file_exists "state file exists after two calls" "$STATE_FILE"

HIST_LEN=$(jq '.history | length' "$STATE_FILE")
assert_eq "history length is 2" "2" "$HIST_LEN"

# Top-level fields must reflect the LAST call
TL_PHASE=$(jq -r '.phase'  "$STATE_FILE")
TL_STATUS=$(jq -r '.status' "$STATE_FILE")
TL_NOTE=$(jq -r '.note'   "$STATE_FILE")
assert_eq "top-level phase = last call (B)"           "B"              "$TL_PHASE"
assert_eq "top-level status = last call (building)"   "building"       "$TL_STATUS"
assert_eq "top-level note = last call note"           "second call note" "$TL_NOTE"

# History[0] must be the FIRST call
H0_PHASE=$(jq -r '.history[0].phase'  "$STATE_FILE")
H0_STATUS=$(jq -r '.history[0].status' "$STATE_FILE")
H0_NOTE=$(jq -r '.history[0].note'   "$STATE_FILE")
assert_eq "history[0].phase = A"              "A"               "$H0_PHASE"
assert_eq "history[0].status = gate1_pending" "gate1_pending"   "$H0_STATUS"
assert_eq "history[0].note preserved"         "first call note" "$H0_NOTE"

# History[1] must be the SECOND call
H1_PHASE=$(jq -r '.history[1].phase'  "$STATE_FILE")
H1_STATUS=$(jq -r '.history[1].status' "$STATE_FILE")
assert_eq "history[1].phase = B"       "B"        "$H1_PHASE"
assert_eq "history[1].status = building" "building" "$H1_STATUS"

# Ordering: history[0].ts <= history[1].ts
H0_TS=$(jq '.history[0].ts' "$STATE_FILE")
H1_TS=$(jq '.history[1].ts' "$STATE_FILE")
if [ "$H0_TS" -le "$H1_TS" ]; then
  pass "history is chronologically ordered (h[0].ts <= h[1].ts)"
else
  fail "history ordering wrong: h[0].ts=$H0_TS > h[1].ts=$H1_TS"
fi

# ─── AC#8: backfill — pre-change flat file (no history array) ────────────────
echo ""
echo "=== AC#8: backfill ==="

rm -f "$STATE_FILE"

# Write a legacy flat object WITHOUT a history array, simulating a pre-schema file.
cat > "$STATE_FILE" <<'JSON'
{"project":"test-project","path":"/tmp/test-project","phase":"A","status":"gate1_pending","note":"old preserved note","updatedAt":1699000000}
JSON

run_state B building "new note after backfill" > /dev/null

HIST_LEN=$(jq '.history | length' "$STATE_FILE")
assert_eq "backfill: history length is 2" "2" "$HIST_LEN"

# history[0] must be seeded from the old flat fields
BF_H0_PHASE=$(jq -r '.history[0].phase'  "$STATE_FILE")
BF_H0_STATUS=$(jq -r '.history[0].status' "$STATE_FILE")
BF_H0_NOTE=$(jq -r '.history[0].note'   "$STATE_FILE")
BF_H0_TS=$(jq    '.history[0].ts'        "$STATE_FILE")
assert_eq "backfill: history[0].phase = A"                "A"                    "$BF_H0_PHASE"
assert_eq "backfill: history[0].status = gate1_pending"   "gate1_pending"        "$BF_H0_STATUS"
assert_eq "backfill: old note preserved in history[0]"    "old preserved note"   "$BF_H0_NOTE"
assert_eq "backfill: history[0].ts seeded from updatedAt" "1699000000"           "$BF_H0_TS"

# history[1] must be the new entry
BF_H1_PHASE=$(jq -r '.history[1].phase'  "$STATE_FILE")
BF_H1_STATUS=$(jq -r '.history[1].status' "$STATE_FILE")
BF_H1_NOTE=$(jq -r '.history[1].note'   "$STATE_FILE")
assert_eq "backfill: history[1].phase = B"        "B"                       "$BF_H1_PHASE"
assert_eq "backfill: history[1].status = building" "building"                "$BF_H1_STATUS"
assert_eq "backfill: history[1].note correct"      "new note after backfill" "$BF_H1_NOTE"

# Top-level must reflect new entry
BF_TL_PHASE=$(jq -r '.phase'  "$STATE_FILE")
BF_TL_STATUS=$(jq -r '.status' "$STATE_FILE")
assert_eq "backfill: top-level phase = B"        "B"        "$BF_TL_PHASE"
assert_eq "backfill: top-level status = building" "building" "$BF_TL_STATUS"

# ─── AC#9 (extra): cleared on non-existent file is idempotent / exits 0 ──────
echo ""
echo "=== AC#9 (extra): cleared when file absent is safe ==="

rm -f "$STATE_FILE"
if run_state A cleared > /dev/null 2>&1; then
  pass "cleared on non-existent file exits 0"
else
  fail "cleared on non-existent file exited non-zero"
fi

# ─── summary ─────────────────────────────────────────────────────────────────
echo ""
echo "Results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then exit 1; fi
