
#!/bin/bash
set -eo pipefail

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Define paths relative to script location
REQUIREMENTS_FILE="${SCRIPT_DIR}/../../requirements.txt"
POLICY_FILE="${SCRIPT_DIR}/safety-policy.yaml"

echo "Running strict Safety scan (v3.5.1)..."
echo "Script directory: ${SCRIPT_DIR}"
echo "Requirements: ${REQUIREMENTS_FILE}"
echo "Policy: ${POLICY_FILE}"

[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }
[ -f "$POLICY_FILE" ] || { echo "Error: safety-policy.yaml not found at ${POLICY_FILE}"; exit 1; }

# Show policy file content for debugging
echo "Policy file content:"
cat "$POLICY_FILE"

safety scan \
    --file "$REQUIREMENTS_FILE" \
    --policy-file "$POLICY_FILE" \
    --output json \
    --exit-code 1

echo "Scan completed - no vulnerabilities found"
