from calendar import c
import os
import subprocess
import re
import requests

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.start_containers import start_containers
from helpers.verify.verify_database_is_up import verify_databases_are_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file

from .handle_down import remove_volume

def handle_back(backend_folder, db_configs, back_app_container_name, volumes, no_cache=False):
    """
    Objectif: Orchestrates backend operations including environment verification, Docker container management, and database import for multiple databases.

    Parameters:
        - backend_folder: Path to the backend directory containing the database dump file. (String)
        - db_configs: List of database configuration dictionaries containing container_name, db_dump_date, and env_prefix. (List)
        - back_app_container_name: Name of the backend application Docker container. (String)
        - no_cache: If True, builds Docker images without cache. Defaults to False. (Boolean)

    Return Value:
        - None: This function does not return a value but performs operations and prints status messages. (NoneType)
    """
    colored_print("Starting backend operations...", "blue")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 1: Si no_cache=True → on supprime les volumes avant rebuild
    if no_cache:
        colored_print("🗑 no_cache=True → Suppression des volumes avant rebuild...", "blue")
        for v in volumes:
            remove_volume(v)

    # Step 2: Start containers with docker-compose in detached mode
    start_containers(no_cache=no_cache)

    # Step 2: Wait for all database containers to be ready
    verify_databases_are_up(db_configs, nb_of_retry=10)

    # Step 3: Get .env variables
    env_data = load_env_file(".env")

    # Step 4: Execute database dumps for each database
    for db_config in db_configs:
        db_container_name = db_config["container_name"]
        db_dump_date = db_config["db_dump_date"]
        env_prefix = db_config["env_prefix"]
        db_name = db_config["name"]

        if not db_dump_date or db_dump_date.strip() == "":
            continue  # Skip databases without a dump date

        # Use prefixed environment variables if available
        root_password_key = f"{env_prefix}MYSQL_ROOT_PASSWORD"
        root_password = env_data.get(root_password_key, env_data.get("MYSQL_ROOT_PASSWORD"))

        # Use the fake dump in CI, otherwise use the real one
        if os.environ.get("CI", "false").lower() == "true":
            dump_file_name = "temp_fake_database_dump_px.sql"
        else:
            dump_file_name = f"database_dump_px_{db_name}_{db_dump_date}.sql"

        if not os.path.exists(dump_file_name):
            if os.environ.get("CI", "false").lower() == "true":
                colored_print(f"Dump file '{dump_file_name}' not found, but running in CI, so continuing without it.", "yellow")
            else:
                colored_print(f"Dump file '{dump_file_name}' not found in the backend folder!", "red")
            continue  # Skip this database dump import

        try:
            colored_print(f"Importing database dump '{dump_file_name}' into container '{db_container_name}'...", "blue")
            with open(dump_file_name, "r", encoding="utf-8") as dump_file:
                dump_content = dump_file.read()  # Read the SQL dump as a string

            # Debug: print environment variables and dump file name
            colored_print(f"CI: {os.environ.get('CI')}", "violet")
            colored_print(f"DB_NAME: {env_data.get('DB_NAME')}", "violet")
            colored_print(f"DB_USER: {env_data.get('DB_USER')}", "violet")
            colored_print(f"DB_PASSWORD: {env_data.get('DB_PASSWORD')}", "violet")
            colored_print(f"MYSQL_ROOT_PASSWORD: {root_password}", "violet")
            colored_print(f"Using dump file: {dump_file_name}", "violet")

            if os.path.exists(dump_file_name):
                with open(dump_file_name, 'r', encoding='utf-8') as f:
                    dump_preview = f.read(1000)
                    colored_print(f"First 1000 chars of dump file:\n{dump_preview}", "violet")
            else:
                colored_print(f"Dump file {dump_file_name} does not exist!", "violet")

            colored_print(f"Running command: docker exec -i {db_container_name} mysql -uroot -p<hidden>", "violet")

            result = subprocess.run(
                [
                    "docker", "exec", "-i", db_container_name, "mysql", "-uroot",
                    "-p" + root_password
                ],
                input=dump_content,
                text=True,
                capture_output=True,
                check=True
            )
            colored_print(f"Database dump imported successfully into '{db_container_name}'!", "green")
        except subprocess.CalledProcessError as e:
            error_message = e.stderr
            if "Operation CREATE USER failed" in error_message:
                colored_print(f"User already exists in '{db_container_name}'. Skipping user creation.", "yellow")
            else:
                colored_print(f"Failed to import the database dump into '{db_container_name}'!\nDetails: {error_message}", "red")

    # # Final check: verify backend is up after all operations
    verify_backend_is_up(back_app_container_name, backend_folder, nb_of_retry=10)

    if no_cache:
        colored_print("verifcation that origins is empty", "blue")

        try:
            try:
                secret_key = env_data['CORS_SECRET_KEY']
            except (ImportError, FileNotFoundError, KeyError):
                # Fallback: lecture manuelle du fichier .env
                secret_key = None
                if os.path.exists(".env"):
                    with open(".env", 'r') as f:
                        for line in f:
                            line = line.strip()
                            if line and not line.startswith('#') and '=' in line:
                                key, value = line.split('=', 1)
                                if key.strip() == 'CORS_SECRET_KEY':
                                    secret_key = value.strip()
                                    break
            secret_key = re.sub(r"^['\"]|['\"]$", '', secret_key)

            env = env_data['ENV']
            if env == 'production':
                base_url = "http://57.128.57.96:5000"
            elif env == 'development':
                base_url = "http://localhost:5000"
            else:
                print("Erreur : la variable ENV n'est pas définie correctement")
                base_url = None

            if base_url:
                # Appel à l'API /list-origins avec la clé secrète
                response = requests.get(
                    f"{base_url}/list-origins",
                    headers={"X-Secret-Key": secret_key}
                )

                if response.status_code == 200:
                    data = response.json()
                    origins = data.get("allowed_origins", [])
                    if origins:
                        colored_print(f"Found {len(origins)} origins → removing them...", "yellow")
                        for origin in origins:
                            remove_resp = requests.post(
                                f"{base_url}/remove-origin",
                                headers={
                                    "X-Secret-Key": secret_key,
                                    "Content-Type": "application/json"
                                },
                                json={"origin": origin}
                            )

                            if remove_resp.status_code == 200:
                                colored_print(f"Origin '{origin}' removed successfully", "green")
                            else:
                                colored_print(
                                    f"Failed to remove origin '{origin}' → {remove_resp.text}",
                                    "red"
                                )
                    else:
                        colored_print("No origins found, nothing to delete.", "green")
            else:
                colored_print(
                    f"Could not list origins, status={response.status_code}, body={response.text}",
                    "red"
                )

        except Exception as e:
            colored_print(f"Exception while checking/removing origins: {e}", "red")

