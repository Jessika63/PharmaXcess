
#!/bin/bash

# Exécuter Safety
safety check -r ./distributeur/backend/requirements.txt

# Capturer le code de sortie pour GitHub Actions (0 si OK, 1 s'il y a des vulnérabilités)
exit $?
