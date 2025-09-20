
import requests
import os
import sys
import re
from helpers.env_functions.load_env_file import load_env_file

def handle_origins(backend_folder):
    """Affiche les frontends enregistrés"""
    # Charger la clé secrète depuis le .env du backend
    env_path = os.path.join(backend_folder, ".env")

    # Essayer de charger avec load_env_file d'abord
    try:
        env_data = load_env_file(env_path)
        secret_key = env_data['CORS_SECRET_KEY']
    except (ImportError, FileNotFoundError, KeyError):
        # Fallback: lecture manuelle du fichier .env
        secret_key = None
        if os.path.exists(env_path):
            with open(env_path, 'r') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        if key.strip() == 'CORS_SECRET_KEY':
                            secret_key = value.strip()
                            break

    # Si la clé n'est pas trouvée, afficher une erreur et quitter
    if not secret_key:
        print("❌ Erreur : CORS_SECRET_KEY non trouvée dans le fichier .env")
        sys.exit(1)

    # Nettoyer la clé en enlevant les guillemets
    secret_key = re.sub(r"^['\"]|['\"]$", '', secret_key)

    try:
        response = requests.get(
            "http://localhost:5000/list-origins",
            headers={'X-Secret-Key': secret_key}
        )

        if response.status_code == 200:
            data = response.json()
            print("🌐 Frontends enregistrés :")
            print(f"   Nombre total : {data['count']}")
            print("   Liste des origines :")
            for i, origin in enumerate(data['allowed_origins'], 1):
                print(f"   {i}. {origin}")
        else:
            print(f"❌ Erreur : {response.status_code}")
            print(f"   Message : {response.text}")
    except Exception as e:
        print(f"❌ Erreur de connexion : {e}")
