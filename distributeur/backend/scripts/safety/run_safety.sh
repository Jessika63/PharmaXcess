
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

# Run scan directly
safety scan \
    --file "$REQUIREMENTS_FILE" \
    --policy-file "$POLICY_FILE" \
    --output json \
    --exit-code 1

echo "Scan completed - no vulnerabilities found"
