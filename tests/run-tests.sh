#!/usr/bin/env bash
set -euo pipefail

# ClauseGuard Test Suite Runner
# Invokes ClauseGuard skill via claude -p for each contract fixture,
# validates output against expected marker files using MUST/SHOULD/MUSTNOT patterns.

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONTRACT_DIR="${CONTRACT_DIR:-$SCRIPT_DIR/contracts}"
EXPECTED_DIR="${EXPECTED_DIR:-$SCRIPT_DIR/expected}"
OUTPUT_DIR="${OUTPUT_DIR:-$SCRIPT_DIR/output}"

# Counters
TOTAL_PASS=0
TOTAL_FAIL=0
TOTAL_WARN=0
TOTAL_SKIP=0
ERRORS=()

# Colors (disabled if not a terminal)
if [ -t 1 ]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  BLUE='\033[0;34m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  BLUE=''
  NC=''
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check prerequisites
echo "=== ClauseGuard Test Suite ==="
echo "Date: $(date)"
echo ""

if ! command -v claude &> /dev/null; then
  echo -e "${RED}ERROR: claude CLI not found.${NC}"
  echo "Install: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo -e "${RED}ERROR: ANTHROPIC_API_KEY not set${NC}"
  echo "Export your API key: export ANTHROPIC_API_KEY=sk-..."
  exit 1
fi

# Count contracts
CONTRACT_COUNT=$(ls "$CONTRACT_DIR"/*.txt 2>/dev/null | wc -l | tr -d ' ')
echo "Contracts: $CONTRACT_COUNT"
echo "Expected:  $(ls "$EXPECTED_DIR"/*.expected 2>/dev/null | wc -l | tr -d ' ')"
echo ""

if [ "$CONTRACT_COUNT" -eq 0 ]; then
  echo -e "${RED}ERROR: No contract files found in $CONTRACT_DIR${NC}"
  exit 1
fi

# Process each contract
for contract in "$CONTRACT_DIR"/*.txt; do
  name=$(basename "$contract" .txt)
  expected="$EXPECTED_DIR/${name}.expected"
  output="$OUTPUT_DIR/${name}.output"

  # Skip if no expected file
  if [ ! -f "$expected" ]; then
    echo -e "${YELLOW}SKIP${NC}: $name (no .expected file)"
    ((TOTAL_SKIP++))
    continue
  fi

  echo -e "${BLUE}Testing${NC}: $name"

  # Read contract content for inline passing
  contract_content=$(cat "$contract")

  # Run ClauseGuard skill in headless mode
  # --max-turns 1 limits to single response (cost control)
  # Pass contract content inline to avoid file path issues in Docker
  if ! claude -p "Review this contract using /clauseguard analysis:

$contract_content" \
    --output-format text \
    --max-turns 1 \
    > "$output" 2>/dev/null; then
    echo -e "  ${RED}ERROR${NC}: claude command failed for $name"
    ERRORS+=("$name: claude invocation failed")
    ((TOTAL_FAIL++))
    continue
  fi

  # Check for empty output
  if [ ! -s "$output" ]; then
    echo -e "  ${RED}ERROR${NC}: empty output for $name"
    ERRORS+=("$name: empty output (claude returned nothing)")
    ((TOTAL_FAIL++))
    continue
  fi

  # Validate output against expected markers
  validate_result=$(bash "$SCRIPT_DIR/validate.sh" "$output" "$expected" 2>&1)
  validate_exit=$?

  # Parse validate.sh output for counters
  local_pass=$(echo "$validate_result" | grep "^PASS_COUNT:" | cut -d: -f2)
  local_fail=$(echo "$validate_result" | grep "^FAIL_COUNT:" | cut -d: -f2)
  local_warn=$(echo "$validate_result" | grep "^WARN_COUNT:" | cut -d: -f2)

  # Show detailed results (filter out counter lines)
  echo "$validate_result" | grep -v "^PASS_COUNT:\|^FAIL_COUNT:\|^WARN_COUNT:"

  # Accumulate totals
  TOTAL_PASS=$((TOTAL_PASS + ${local_pass:-0}))
  TOTAL_FAIL=$((TOTAL_FAIL + ${local_fail:-0}))
  TOTAL_WARN=$((TOTAL_WARN + ${local_warn:-0}))

  if [ "$validate_exit" -gt 0 ]; then
    ERRORS+=("$name: $validate_exit MUST pattern(s) failed")
  fi

  echo ""
done

# Summary
echo "==============================="
echo "=== Results ==="
echo "==============================="
echo -e "  ${GREEN}PASS${NC}: $TOTAL_PASS"
echo -e "  ${RED}FAIL${NC}: $TOTAL_FAIL"
echo -e "  ${YELLOW}WARN${NC}: $TOTAL_WARN"
echo -e "  SKIP: $TOTAL_SKIP"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "=== Failures ==="
  for err in "${ERRORS[@]}"; do
    echo -e "  ${RED}-${NC} $err"
  done
fi

echo ""
if [ $TOTAL_FAIL -gt 0 ]; then
  echo -e "${RED}RESULT: FAILED${NC} ($TOTAL_FAIL failures)"
  exit 1
else
  echo -e "${GREEN}RESULT: PASSED${NC}"
  exit 0
fi
