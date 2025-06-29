#!/bin/bash
set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REQUIREMENTS_FILE="${SCRIPT_DIR}/../../requirements.txt"
IGNORED_FILE="${SCRIPT_DIR}/../../requirements_ignored.txt"
POLICY_FILE="${SCRIPT_DIR}/safety-policy.yaml"

echo "Running strict Safety scan (v3.5.1)..."
echo "Requirements file: $REQUIREMENTS_FILE"
echo "Policy file: $POLICY_FILE"

# Check if files exist
[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }
[ -f "$POLICY_FILE" ] || { echo "Error: safety-policy.yaml not found"; exit 1; }

# Store content and remove file if it exists
if [ -f "$IGNORED_FILE" ]; then
    echo "Storing and removing requirements_ignored.txt..."
    IGNORED_CONTENT=$(cat "$IGNORED_FILE")
    rm -f "$IGNORED_FILE"
fi

# Fix encoding issues
export PYTHONIOENCODING=UTF-8

# Run scan
echo "Running Safety scan..."
set +e
safety scan --file "$REQUIREMENTS_FILE" --policy-file "$POLICY_FILE"
EXIT_CODE=$?
set -e

# Restore ignored file if it existed
if [ -n "${IGNORED_CONTENT+x}" ]; then
    echo "Restoring requirements_ignored.txt..."
    echo "$IGNORED_CONTENT" > "$IGNORED_FILE"
fi

# Check exit code
if [ $EXIT_CODE -ne 0 ]; then
    echo "Safety scan failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
else
    echo "Scan completed - no vulnerabilities found"
    exit 0
fi
