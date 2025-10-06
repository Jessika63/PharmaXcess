
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from helpers.env_functions.verify_env_file import verify_env_files
from helpers.verify.verify_db_dump import verify_db_dump

def handle_verif(env_configs, backend_folder, db_configs):
    """
    Objectif: Vérifie les fichiers .env et la présence des dumps pour toutes les bases.

    Parameters:
        - env_configs: dictionnaire des variables d'environnement nécessaires par dossier
        - backend_folder: dossier backend
        - db_configs: liste des configs de bases de données

    Return Value:
        - None
    """
    verify_env_files(env_configs)

    for db_config in db_configs:
        db_name = db_config["name"]
        db_dump_date = db_config.get("db_dump_date")
        verify_db_dump(backend_folder, db_name, db_dump_date)
