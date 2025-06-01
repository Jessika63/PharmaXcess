#!/bin/bash
set -eo pipefail

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define absolute paths
REQUIREMENTS_FILE="${SCRIPT_DIR}/../../requirements.txt"
POLICY_FILE="${SCRIPT_DIR}/../../scripts/safety_policy.yaml"

echo "Running strict Safety scan (v3.5.1)..."
echo "Requirements: $REQUIREMENTS_FILE"
echo "Policy: $POLICY_FILE"

[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }
[ -f "$POLICY_FILE" ] || { echo "Error: safety_policy.yaml not found"; exit 1; }

safety scan \
    --file "$REQUIREMENTS_FILE" \
    --policy-file "$POLICY_FILE" \
    --output json \
    --exit-code 1

echo "Scan completed - no vulnerabilities found"