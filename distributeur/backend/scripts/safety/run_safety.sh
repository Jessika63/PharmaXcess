
#!/bin/bash

# Run Safety
echo "Running safety check..."
safety check -r ./distributeur/backend/requirements.txt --policy-file ./distributeur/backend/scripts/safety/safety-policy.yaml

# Capture the exit code for GitHub Actions (0 if OK, 1 if there are vulnerabilities)
exit $?
