
#!/bin/bash
set -eo pipefail

echo "Running strict Safety scan (v3.5.1)..."
echo "Working directory: $(pwd)"

REQUIREMENTS_FILE="distributeur/backend/requirements.txt"

[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }

safety scan \
    --file "$REQUIREMENTS_FILE" \
    --output json \
    --exit-code 1

echo "Scan completed - no vulnerabilities found"
exit 0