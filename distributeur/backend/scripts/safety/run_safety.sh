
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

# Run scan and capture output
SCAN_OUTPUT=$(safety scan --file "$REQUIREMENTS_FILE" --policy-file "$POLICY_FILE" --output json 2>&1)
EXIT_CODE=$?

# Print the scan output
echo "$SCAN_OUTPUT"

# Check for actual vulnerabilities in output (non-empty arrays)
if echo "$SCAN_OUTPUT" | grep -q '"known_vulnerabilities":\s*\[[^]]' ; then
    echo "Vulnerabilities detected! Failing build."
    exit 1
elif [ $EXIT_CODE -ne 0 ]; then
    echo "Safety scan failed with exit code $EXIT_CODE"
    exit $EXIT_CODE
else
    echo "Scan completed - no vulnerabilities found"
    exit 0
fi
