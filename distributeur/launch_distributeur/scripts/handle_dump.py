
import subprocess
from datetime import datetime
import os
import json

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file

def handle_dump(backend_folder, db_container_name, back_container_name):
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

        # Construct the command to create a database dump
        command = (
            f"printf 'CREATE DATABASE IF NOT EXISTS `{database_name}`;\\nUSE `{database_name}`;\\n' > {dump_file_name} && "
            f"docker exec -i {db_container_name} mysqldump -uroot "
            f"-p{env_data['MYSQL_ROOT_PASSWORD']} --databases {database_name} --add-drop-database >> {dump_file_name} && "
            f"printf 'CREATE USER \\'{database_user}\\'@\\'%%\\' IDENTIFIED BY \\'{env_data['DB_PASSWORD']}\\';\\n' >> {dump_file_name} && "
            f"printf 'GRANT ALL PRIVILEGES ON `{database_name}`.* TO \\'{database_user}\\'@\\'%%\\';\\n' >> {dump_file_name} && "
            f"printf 'FLUSH PRIVILEGES;\\n' >> {dump_file_name}"
        )

        # Execute the command in the shell
        subprocess.run(command, shell=True, check=True)
        colored_print("Database dump exported successfully!", "green")

        # Locate the configuration file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        config_path = os.path.join(script_dir, "../../launch_config.json")

        # Check if the configuration file exists
        if not os.path.exists(config_path):
            file_name = os.path.basename(config_path)
            colored_print(f"Configuration file '{file_name}' is missing!", "red")
            return

        # Load and update the JSON configuration file
        with open(config_path, "r") as file:
            try:
                config = json.load(file)
                config["verification_settings"]["db_dump_date"] = today
            except json.JSONDecodeError as e:
                colored_print(f"Failed to parse configuration file: {e}", "red")
                return

        # Write the updated JSON configuration file with a blank line before and after
        with open(config_path, "w") as file:
            file.write("\n")  # Add a blank line before JSON data
            json.dump(config, file, indent=4)
            file.write("\n")  # Add a blank line after JSON data

        colored_print("Config dump date updated successfully!", "green")
    except Exception as e:
        colored_print(f"Unexpected error while exporting dump: {e}", "red")
