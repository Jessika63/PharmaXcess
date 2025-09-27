"""
Configuration pour le système CORS dynamique
"""
import os

# Clé secrète partagée entre le backend et les frontends
# Cette clé doit être la même dans tous les frontends
CORS_SECRET_KEY = os.getenv('CORS_SECRET_KEY')

# URL du backend pour l'enregistrement CORS
BACKEND_URL = os.getenv('BACKEND_URL', 'http://57.128.57.96:5000')

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
