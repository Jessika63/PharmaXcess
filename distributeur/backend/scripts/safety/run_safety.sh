#!/bin/bash

# Strict error handling
set -euo pipefail

# Run Safety with explicit failure on vulnerabilities
safety scan \
    --file ./distributeur/backend/requirements.txt \
    --policy-file ./distributeur/backend/scripts/safety/safety-policy.yaml \
    --output json \
    --exit-code 1  # Force exit code 1 on vulnerabilities

echo "No critical vulnerabilities detected"
exit 0