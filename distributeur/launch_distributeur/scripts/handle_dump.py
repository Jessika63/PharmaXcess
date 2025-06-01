import subprocess
from datetime import datetime
import os

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file
from helpers.config.update_json_config import update_json_config

def handle_dump(backend_folder, db_container_name, back_container_name):
    # sourcery skip: extract-method, use-fstring-for-concatenation
    """
    Handles the process of creating a database dump using Docker and updating
    a JSON configuration file with the dump date.
    """

    colored_print("Preparing to run tests...", "green")

    # Change directory to the backend folder
    change_directory(backend_folder)

    # Verify that the database and backend are running before proceeding
    verify_database_is_up(db_container_name)
    verify_backend_is_up(back_container_name, nb_of_retry=2)

    try:
        # Get the current date formatted as DD_MM_YYYY
        today = datetime.now().strftime("%d_%m_%Y")
        colored_print("Exporting dump ...", "blue")

        # Load environment variables from the .env file
        env_data = load_env_file(".env")
        database_name = env_data["DB_NAME"]
        database_user = env_data["DB_USER"]
        dump_file_name = f"database_dump_px_{today}.sql"

        # Define the command template once
        command_template = (
            "printf '{create_db}' > {dump_file_name} && "
            "docker exec -i {db_container_name} mysqldump -uroot -p{root_pw} "
            "--databases {db_name} --add-drop-database >> {dump_file_name} && "
            "printf '{create_user}' >> {dump_file_name} && "
            "printf '{grant_priv}' >> {dump_file_name} && "
            "printf 'FLUSH PRIVILEGES;{newline}' >> {dump_file_name}"
        )

        # Define OS-specific variables
        if os.name == "nt":  # Windows
            create_db = f"CREATE DATABASE IF NOT EXISTS `{database_name}`;\\nUSE `{database_name}`;\\n"
            create_user = f"CREATE USER \\'{database_user}\\'@\\'%%\\' IDENTIFIED BY \\'{env_data["DB_PASSWORD"]}\\';\\n"
            grant_priv = f"GRANT ALL PRIVILEGES ON `{database_name}`.* TO \\'{database_user}\\'@\\'%%\\';\\n"
            newline = '\\n'
        else:  # Unix/Linux/Mac
            create_db = f"CREATE DATABASE IF NOT EXISTS `{database_name}`;\nUSE `{database_name}`;\n"
            create_user = f"CREATE USER \'{database_user}\'@\'%%\' IDENTIFIED BY \'{env_data["DB_PASSWORD"]}\';\n"
            grant_priv = f"GRANT ALL PRIVILEGES ON `{database_name}`.* TO \'{database_user}\'@\'%%\';\n"
            newline = '\n'

        # Build the final command
        command = command_template.format(
            create_db=create_db,
            create_user=create_user,
            grant_priv=grant_priv,
            newline=newline,
            dump_file_name=dump_file_name,
            db_container_name=db_container_name,
            root_pw=env_data['MYSQL_ROOT_PASSWORD'],
            db_name=database_name
        )

        # Execute the command in the shell
        subprocess.run(command, shell=True, check=True)
        colored_print("Database dump exported successfully!", "green")

        # Update the launch_config.json file with the dump date
        key_path = ["verification_settings", "db_dump_date"]
        value = today  # Use the formatted current date as the value
        update_json_config("../../../launch_config.json", key_path, value, mode="change")

        # Update the leak checker config to replace the old dump file with the new one
        key_path = ["ignore_files"]
        value = [
            "distributeur/backend/" + dump_file_name,  # Add the new dump file with the current date
            # You can retain other existing files here or replace them as needed
        ]
        update_json_config("../../../backend/scripts/leak_checker/config.json", key_path, value, mode="update")

    except Exception as e:
        colored_print(f"Unexpected error while exporting dump: {e}", "red")
