"""
Configuration pour le système CORS dynamique
"""
import os

# Clé secrète partagée entre le backend et les frontends
# Cette clé doit être la même dans tous les frontends
CORS_SECRET_KEY = os.getenv('CORS_SECRET_KEY')

# URL du backend pour l'enregistrement CORS

env = os.getenv('ENV')

if env == 'production':
    BACKEND_URL = "http://57.128.57.96:5000"
elif env == 'development':
    BACKEND_URL = "localhost:5000"
else:
    print("Erreur : la variable ENV n'est pas définie correctement")

# Endpoint pour l'enregistrement CORS
REGISTER_ORIGIN_ENDPOINT = '/register-origin'

def get_cors_registration_url():
    """Retourne l'URL complète pour l'enregistrement CORS"""
    return f"{BACKEND_URL}{REGISTER_ORIGIN_ENDPOINT}"

def get_cors_headers():
    """Retourne les headers nécessaires pour l'enregistrement CORS"""
    return {
        'X-Secret-Key': CORS_SECRET_KEY,
        'Content-Type': 'application/json'
    }
