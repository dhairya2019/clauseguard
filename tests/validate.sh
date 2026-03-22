#!/usr/bin/env bash
# ClauseGuard Test Validator
# Usage: validate.sh <output_file> <expected_file>
# Reads an .expected file and validates each MUST/SHOULD/MUSTNOT pattern
# against the output file using case-insensitive grep.
#
# Exit code: number of MUST failures (0 = all MUST patterns passed)
# Output: per-pattern results + counter lines for machine parsing

set -uo pipefail

OUTPUT="$1"
EXPECTED="$2"

if [ ! -f "$OUTPUT" ]; then
  echo "  ERROR: Output file not found: $OUTPUT"
  echo "PASS_COUNT:0"
  echo "FAIL_COUNT:1"
  echo "WARN_COUNT:0"
  exit 1
fi

if [ ! -f "$EXPECTED" ]; then
  echo "  ERROR: Expected file not found: $EXPECTED"
  echo "PASS_COUNT:0"
  echo "FAIL_COUNT:1"
  echo "WARN_COUNT:0"
  exit 1
fi

LOCAL_PASS=0
LOCAL_FAIL=0
LOCAL_WARN=0

while IFS= read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// /}" ]] && continue

  # Parse type:pattern
  type="${line%%:*}"
  pattern="${line#*:}"

  # Skip if pattern is empty
  [ -z "$pattern" ] && continue

  case "$type" in
    MUST)
      if grep -qi "$pattern" "$OUTPUT" 2>/dev/null; then
        echo "  PASS: MUST pattern found: $pattern"
        ((LOCAL_PASS++))
      else
        echo "  FAIL: MUST pattern not found: $pattern"
        ((LOCAL_FAIL++))
      fi
      ;;
    SHOULD)
      if grep -qi "$pattern" "$OUTPUT" 2>/dev/null; then
        echo "  PASS: SHOULD pattern found: $pattern"
        ((LOCAL_PASS++))
      else
        echo "  WARN: SHOULD pattern not found: $pattern"
        ((LOCAL_WARN++))
      fi
      ;;
    MUSTNOT)
      if grep -qi "$pattern" "$OUTPUT" 2>/dev/null; then
        echo "  FAIL: MUSTNOT pattern found: $pattern"
        ((LOCAL_FAIL++))
      else
        echo "  PASS: MUSTNOT pattern absent: $pattern"
        ((LOCAL_PASS++))
      fi
      ;;
    *)
      # Unknown type, skip
      ;;
  esac
done < "$EXPECTED"

echo "  Result: $LOCAL_PASS pass, $LOCAL_FAIL fail, $LOCAL_WARN warn"

# Output machine-readable counters
echo "PASS_COUNT:$LOCAL_PASS"
echo "FAIL_COUNT:$LOCAL_FAIL"
echo "WARN_COUNT:$LOCAL_WARN"

# Exit with number of failures
exit $LOCAL_FAIL
