#!/bin/bash
set -eo pipefail

# Trouver la racine du dépôt Git
REPO_ROOT=$(git rev-parse --show-toplevel)
REQUIREMENTS_FILE="$REPO_ROOT/backend/requirements.txt"
POLICY_FILE="$REPO_ROOT/backend/scripts/safety/safety-policy.yaml"
ENV_FILE="$REPO_ROOT/backend/.env"

echo "Running strict Safety scan (v3.5.1)..."
echo "Repo root: $REPO_ROOT"
echo "Requirements file: $REQUIREMENTS_FILE"
echo "Policy file: $POLICY_FILE"
echo "Env file: $ENV_FILE"

# Check if files exist
[ -f "$REQUIREMENTS_FILE" ] || { echo "Error: requirements.txt not found"; exit 1; }
[ -f "$POLICY_FILE" ] || { echo "Error: safety-policy.yaml not found"; exit 1; }

# Load .env file if it exists
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    while IFS= read -r line || [ -n "$line" ]; do
        if [[ $line =~ ^# ]] || [[ -z "${line// }" ]]; then
            continue
        fi

        if [[ ! $line =~ = ]]; then
            echo "Warning: Skipping malformed line (no = found): $line"
            continue
        fi

        line=$(echo "$line" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//; s/[[:space:]]*=[[:space:]]*/=/')

        key=$(echo "$line" | cut -d '=' -f 1)
        value=$(echo "$line" | cut -d '=' -f 2-)

        if [[ ! $key =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
            echo "Warning: Skipping malformed line (invalid key): $line"
            continue
        fi

        value="${value%\"}"
        value="${value#\"}"
        value="${value%\'}"
        value="${value#\'}"

        export "$key"="$value"
        echo "Exported: $key"
    done < "$ENV_FILE"
else
    echo "Warning: .env file not found at $ENV_FILE"
    echo "Using environment variables directly"
fi

# Check if API key is available
if [ -z "$SAFETY_API_KEY" ]; then
    echo "Error: SAFETY_API_KEY not found in environment variables"
    exit 1
fi

# Fix encoding issues
export PYTHONIOENCODING=UTF-8

# Run scan with API key
echo "Running Safety scan with API key..."
set +e
safety scan --file "$REQUIREMENTS_FILE" --policy-file "$POLICY_FILE" --key "$SAFETY_API_KEY"
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
