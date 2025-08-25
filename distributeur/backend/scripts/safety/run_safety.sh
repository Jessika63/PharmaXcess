#!/bin/bash
set -eo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
REQUIREMENTS_FILE="${SCRIPT_DIR}/../../requirements.txt"
POLICY_FILE="${SCRIPT_DIR}/safety-policy.yaml"

echo "Running strict Safety scan (v3.5.1)..."
echo "Requirements file: $REQUIREMENTS_FILE"
echo "Policy file: $POLICY_FILE"

# Check if files exist
[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }
[ -f "$POLICY_FILE" ] || { echo "Error: safety-policy.yaml not found"; exit 1; }

# Load .env file if it exists
if [ -f "$(dirname "$0")/../.env" ]; then
  export $(grep -v '^#' "$(dirname "$0")/../.env" | xargs)
fi

# Fix encoding issues
export PYTHONIOENCODING=UTF-8

# Run scan
echo "Running Safety scan..."
set +e
safety scan --file "$REQUIREMENTS_FILE" --policy-file "$POLICY_FILE"
EXIT_CODE=$?
set -e

# Check exit code
if [ $EXIT_CODE -ne 0 ]; then
    echo "Safety scan failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
else
    echo "Scan completed - no vulnerabilities found"
    exit 0
fi
