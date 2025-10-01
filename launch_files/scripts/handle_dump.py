
import subprocess
from datetime import datetime
import os

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_databases_are_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file
from helpers.config.update_json_config import update_json_config


def handle_dump(backend_folder, db_configs, back_app_container_name):
    """
    Objectif: Crée un dump des bases de données (via Docker) et met à jour les
    fichiers de configuration avec la date et le nom du fichier de dump.

    Parameters:
        - backend_folder: chemin vers le dossier backend (str)
        - db_configs: liste de dictionnaires de config des bases
                      { "container_name": str, "env_prefix": str } (list)
        - back_app_container_name: nom du conteneur backend (str)

    Return Value:
        - None
    """

    colored_print("Preparing to export database dumps...", "green")

    # Step 0: se placer dans backend/
    change_directory(backend_folder)

    # Step 1: vérifier que toutes les DB et le backend sont up
    if db_configs:
        verify_databases_are_up(db_configs, nb_of_retry=10)
    verify_backend_is_up(back_app_container_name, backend_folder, nb_of_retry=10)

    try:
        # Date du dump → DD_MM_YYYY
        today = datetime.now().strftime("%d_%m_%Y")

        # Charger .env
        env_data = load_env_file(".env")

        # Export pour chaque base
        for db_config in db_configs:
            db_container_name = db_config["container_name"]
            env_prefix = db_config.get("env_prefix", "")

            db_name = env_data.get(f"{env_prefix}DB_NAME", env_data.get("DB_NAME"))
            db_user = env_data.get(f"{env_prefix}DB_USER", env_data.get("DB_USER"))
            db_password = env_data.get(f"{env_prefix}DB_PASSWORD", env_data.get("DB_PASSWORD"))
            root_pw = env_data.get(f"{env_prefix}MYSQL_ROOT_PASSWORD", env_data.get("MYSQL_ROOT_PASSWORD"))

            dump_file_name = f"database_dump_px_{today}.sql"

            colored_print(f"Exporting dump for '{db_name}' in container '{db_container_name}'...", "blue")

            # Commande modèle
            command_template = (
                "printf '{create_db}' > {dump_file_name} && "
                "docker exec -i {db_container_name} mysqldump -uroot -p{root_pw} "
                "--databases {db_name} --add-drop-database >> {dump_file_name} && "
                "printf '{create_user}' >> {dump_file_name} && "
                "printf '{grant_priv}' >> {dump_file_name} && "
                "printf 'FLUSH PRIVILEGES;{newline}' >> {dump_file_name}"
            )

            # Variables spécifiques selon OS
            if os.name == "nt":  # Windows
                create_db = f"CREATE DATABASE IF NOT EXISTS `{db_name}`;\\nUSE `{db_name}`;\\n"
                create_user = f"CREATE USER \\'{db_user}\\'@\\'%%\\' IDENTIFIED BY \\'{db_password}\\';\\n"
                grant_priv = f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO \\'{db_user}\\'@\\'%%\\';\\n"
                newline = "\\n"
            else:  # Unix/Linux/Mac
                create_db = f"CREATE DATABASE IF NOT EXISTS `{db_name}`;\nUSE `{db_name}`;\n"
                create_user = f"CREATE USER '{db_user}'@'%%' IDENTIFIED BY '{db_password}';\n"
                grant_priv = f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{db_user}'@'%%';\n"
                newline = "\n"

            # Construire commande finale
            command = command_template.format(
                create_db=create_db,
                create_user=create_user,
                grant_priv=grant_priv,
                newline=newline,
                dump_file_name=dump_file_name,
                db_container_name=db_container_name,
                root_pw=root_pw,
                db_name=db_name,
            )

            # Exécution
            subprocess.run(command, shell=True, check=True)
            colored_print(f"Database dump for '{db_name}' exported successfully!", "green")

        # Mise à jour de launch_config.json
        key_path = ["verification_settings", "db_dump_date"]
        update_json_config("../../../launch_config.json", key_path, today, mode="change")

        # Mise à jour de leak checker config (ajouter le nouveau dump à ignorer)
        key_path = ["ignore_files"]
        value = [f"backend/database_dump_px_{today}.sql"]
        update_json_config("../../../backend/scripts/leak_checker/config.json", key_path, value, mode="update")

    except Exception as e:
        colored_print(f"Unexpected error while exporting dump: {e}", "red")
