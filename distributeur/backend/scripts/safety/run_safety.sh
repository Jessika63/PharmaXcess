
#!/bin/bash

# Exécuter Safety
echo "Running safety check..."
safety check -r ./distributeur/backend/requirements.txt --policy-file ./distributeur/backend/scripts/safety/safety-policy.yaml

# Capturer le code de sortie pour GitHub Actions (0 si OK, 1 s'il y a des vulnérabilités)
exit $?
