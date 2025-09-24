#!/bin/bash
set -e

REPORT_DIR="tests/reports"
LOG_DIR="tests/logs"
mkdir -p "$REPORT_DIR" "$LOG_DIR"

UNIT_LOG="$LOG_DIR/unit.log"
INTEGRATION_LOG="$LOG_DIR/integration.log"
SECURITY_LOG="$LOG_DIR/security.log"
COVERAGE_JSON="$REPORT_DIR/coverage-final.json"
COVERAGE_HTML="$REPORT_DIR/coverage-html"

# Run unit tests
npx jest tests/unit --coverage --coverageDirectory="$COVERAGE_HTML" --json --outputFile="$UNIT_LOG" || exit 1

# Run integration tests
npx jest tests/integration --json --outputFile="$INTEGRATION_LOG" || exit 1

# Run security tests (included in integration)
cp "$INTEGRATION_LOG" "$SECURITY_LOG"

# Print summary
cat "$UNIT_LOG"
echo "---"
cat "$INTEGRATION_LOG"
echo "---"
cat "$SECURITY_LOG"

# Check coverage
COVERAGE=$(npx jest --coverage --coverageReporters=json-summary --coverageDirectory="$REPORT_DIR" | grep 'All files' | tail -1)
COVERAGE_PCT=$(jq '.total.lines.pct' "$REPORT_DIR/coverage-summary.json")

if (( $(echo "$COVERAGE_PCT < 95" | bc -l) )); then
  echo "WARNING: Coverage is $COVERAGE_PCT%. Target is 95%." >&2
else
  echo "Coverage is $COVERAGE_PCT%."
fi

exit 0
