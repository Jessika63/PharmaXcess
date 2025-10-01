
import os
import subprocess

from helpers.colored_print import colored_print
from helpers.verify.verify_database_is_up import verify_databases_are_up
from helpers.env_functions.load_env_file import load_env_file
from helpers.change_directory import change_directory

from . import temp_updates_functions as temp

# Global dictionary for updates
UPDATE_FUNCTIONS = {
    "temp_change_frpp_by_rpps": temp.change_frpp_by_rpps,
}

def handle_update(update_function, db_configs, backend_folder):
    """
    Objectif: Exécute une fonction de mise à jour SQL sur une ou plusieurs bases de données
    définies dans db_configs, en s'assurant que les conteneurs DB sont disponibles.

    Parameters:
        - update_function: Nom de la fonction de mise à jour à exécuter
                          (doit exister dans UPDATE_FUNCTIONS). (str)
        - db_configs: Liste de dictionnaires contenant la config des bases de données :
                      { "container_name": str, "env_prefix": str }. (list)
        - backend_folder: Chemin vers le dossier backend (str)

    Return Value:
        - None
    """
    colored_print("Starting database update...", "green")

    # Step 0: Se placer dans backend/
    change_directory(backend_folder)

    # Step 1: Vérifier que toutes les bases de données sont prêtes
    if db_configs:
        verify_databases_are_up(db_configs, nb_of_retry=10)

    # Step 2: Vérifier que la fonction demandée existe
    if update_function not in UPDATE_FUNCTIONS:
        colored_print(f"Unknown update function '{update_function}'!", "red")
        return
    sql_command = UPDATE_FUNCTIONS[update_function]()

    # Step 3: Charger les variables d'environnement depuis .env
    env_data = load_env_file(".env")

    # Step 4: Exécuter la commande SQL sur chaque base
    for db_config in db_configs:
        db_container_name = db_config["container_name"]
        env_prefix = db_config.get("env_prefix", "")

        db_name_key = f"{env_prefix}DB_NAME"
        root_password_key = f"{env_prefix}MYSQL_ROOT_PASSWORD"

        db_name = env_data.get(db_name_key, env_data.get("DB_NAME"))
        root_password = env_data.get(root_password_key, env_data.get("MYSQL_ROOT_PASSWORD"))

        try:
            colored_print(
                f"Executing update function '{update_function}' on DB '{db_name}' "
                f"in container '{db_container_name}'...",
                "blue"
            )
            subprocess.run(
                [
                    "docker", "exec", db_container_name, "mysql", "-uroot",
                    "-p" + root_password, "-D", db_name, "-e", sql_command
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            colored_print(
                f"Database update executed successfully with {update_function} "
                f"on '{db_container_name}'!", "green"
            )
        except subprocess.CalledProcessError as e:
            error_message = e.stderr.replace(
                "mysql: [Warning] Using a password on the command line interface can be insecure.\n", ""
            )
            if error_message.strip():
                colored_print(
                    f"Failed to execute update on '{db_container_name}'. "
                    f"Details: {error_message}", "red"
                )
            else:
                colored_print(
                    f"Failed to execute update on '{db_container_name}'. "
                    "No additional error details provided.",
                    "red"
                )
