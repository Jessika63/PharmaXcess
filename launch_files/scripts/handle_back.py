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

def handle_back(backend_folder, db_configs, back_app_container_name, volumes, no_cache=False, location='lyon'):
    """
    Objective:
    Orchestrates backend operations including environment verification, Docker container management, database import for multiple databases, and backend readiness verification.

    Parameters:
    - backend_folder (str): Path to the backend directory containing the database dump files.
    - db_configs (List[Dict]): List of database configuration dictionaries containing:
        - container_name (str): Docker container name for the database.
        - db_dump_date (str): Date of the database dump to import.
        - env_prefix (str): Optional environment variable prefix for this database.
        - name (str): Database name.
    - back_app_container_name (str): Name of the backend application Docker container.
    - volumes (List[str]): List of Docker volumes to optionally remove when no_cache=True.
    - no_cache (bool): If True, rebuild Docker images without cache and remove volumes. Defaults to False.
    - location (str): Default location for the backend ('paris' or 'lyon'). Defaults to 'lyon'.

    Behavior:
    - Changes the working directory to the backend folder.
    - Optionally removes Docker volumes if no_cache is True.
    - Starts Docker containers using docker-compose.
    - Waits for all database containers to be ready.
    - Imports database dumps into their respective containers.
    - Verifies that the backend application is running and responsive.
    - Optionally checks and removes previously registered origins in the backend API.

    Return Value:
    - None: This function performs operations, prints status messages, and does not return a value.
    """

    colored_print("Starting backend operations...", "blue")
    colored_print(f"Setting default location to: {location}", "blue")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 1: Si no_cache=True → on supprime les volumes avant rebuild
    if no_cache:
        colored_print("🗑 no_cache=True → Suppression des volumes avant rebuild...", "blue")
        for v in volumes:
            remove_volume(v)

    # Step 2: Set environment variable for default location
    os.environ['DEFAULT_LOCATION'] = location

    # Step 3: Start containers with docker-compose in detached mode
    start_containers(no_cache=no_cache)

    # Step 3: Wait for all database containers to be ready
    verify_databases_are_up(db_configs, nb_of_retry=10)

    # Step 4: Load .env file
    env_data = load_env_file(".env")

    # Step 5: Import DBs
    for db_config in db_configs:
        db_container_name = db_config["container_name"]
        db_dump_date = db_config["db_dump_date"]
        env_prefix = db_config["env_prefix"]
        db_name = db_config["name"]

        if not db_dump_date or db_dump_date.strip() == "":
            colored_print(f"⏭ No dump date provided for {db_name}, skipping...", "yellow")
            continue  # Skip databases without a dump date

        # Use prefixed environment variables if available
        root_password_key = f"{env_prefix}MYSQL_ROOT_PASSWORD"
        root_password = env_data.get(root_password_key, env_data.get("MYSQL_ROOT_PASSWORD"))

        # Choose dump file (CI fallback)
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
            # --- CHECK INTELLIGENT : détecter si la DB est déjà remplie
            colored_print(f"🔍 Vérification du contenu existant dans la base `{db_name}`...", "blue")

            # Étape 1 : récupérer la liste des tables
            show_tables_cmd = [
                "docker", "exec", db_container_name,
                "mysql", "-uroot", f"-p{root_password}", "-D", db_name, "-sN",
                "-e", "SHOW TABLES;"
            ]
            tables_proc = subprocess.run(show_tables_cmd, capture_output=True, text=True)
            tables_stdout = (tables_proc.stdout or "").strip()
            tables_stderr = (tables_proc.stderr or "").strip()

            if tables_stderr:
                colored_print(f"⚠️ Erreur lors du SHOW TABLES : {tables_stderr}", "yellow")

            if tables_proc.returncode != 0 or not tables_stdout:
                # Aucune table -> première import
                colored_print(f"ℹ️  Aucune table trouvée dans `{db_name}` → première import.", "yellow")
                first_time = True
            else:
                # Étape 2 : analyser les tables
                tables = [t.strip() for t in tables_stdout.splitlines() if t.strip()]
                colored_print(f"ℹ️  Tables trouvées : {tables}", "violet")

                first_time = True  # par défaut, on suppose vide

                # Si table 'utilisateurs' présente → priorité
                if "utilisateurs" in tables:
                    tables_to_check = ["utilisateurs"]
                else:
                    # Sinon, on vérifie la première table existante
                    tables_to_check = [tables[0]]

                for table_name in tables_to_check:
                    count_cmd = [
                        "docker", "exec", db_container_name,
                        "mysql", "-uroot", f"-p{root_password}", "-D", db_name, "-sN",
                        "-e", f"SELECT COUNT(*) FROM `{table_name}`;"
                    ]
                    count_proc = subprocess.run(count_cmd, capture_output=True, text=True)
                    count_stdout = (count_proc.stdout or "").strip()

                    if count_proc.returncode != 0:
                        colored_print(f"⚠️  Impossible de compter les lignes de `{table_name}` (probable table vide).", "yellow")
                        continue

                    try:
                        row_count = int(count_stdout.split()[0]) if count_stdout else 0
                        colored_print(f"📊 Table `{table_name}` contient {row_count} ligne(s).", "violet")
                        if row_count > 0:
                            first_time = False
                            break  # inutile de continuer, on sait que la DB est déjà remplie
                    except Exception as e:
                        colored_print(f"⚠️  Erreur lors du parsing du COUNT(*) pour `{table_name}`: {e}", "yellow")

            # --- ACTION selon first_time
            if first_time:
                colored_print(f"📦 Importing database dump '{dump_file_name}' into container '{db_container_name}' (first import)...", "blue")
            else:
                # Reset database before reimport
                colored_print(f"🧹 Resetting existing database '{db_name}' inside container '{db_container_name}'...", "blue")
                drop_cmd = f"DROP DATABASE IF EXISTS `{db_name}`; CREATE DATABASE `{db_name}`;"
                subprocess.run(
                    ["docker", "exec", "-i", db_container_name, "mysql", "-uroot", f"-p{root_password}", "-e", drop_cmd],
                    check=True,
                    capture_output=True,
                    text=True
                )
                colored_print(f"✅ Database '{db_name}' dropped and recreated successfully.", "green")

            # --- READ dump and import
            if os.path.exists(dump_file_name):
                with open(dump_file_name, "r", encoding="utf-8") as dump_file:
                    dump_content = dump_file.read()
            else:
                colored_print(f"Dump file {dump_file_name} does not exist!", "red")

            # debug preview (violet)
            colored_print(f"First 1000 chars of dump:\n{dump_content[:1000]}", "violet")

            colored_print(f"Running command: docker exec -i {db_container_name} mysql -uroot -p<hidden>", "violet")

            # --- Cleanup optional existing MySQL user (to avoid CREATE USER conflicts)
            colored_print("🧩 Checking if user 'px_user' exists before import...", "blue")
            try:
                drop_user_cmd = (
                    "DROP USER IF EXISTS 'px_user'@'%'; FLUSH PRIVILEGES;"
                )
                subprocess.run(
                    ["docker", "exec", "-i", db_container_name,
                     "mysql", "-uroot", f"-p{root_password}", "-e", drop_user_cmd],
                    capture_output=True,
                    text=True,
                    check=False  # pas grave si user n'existe pas
                )
                colored_print("✅ Existing 'px_user' (if any) removed successfully.", "green")
            except Exception as e:
                colored_print(f"⚠️ Unable to check/remove existing 'px_user': {e}", "yellow")

            colored_print(f"➡️ Executing import into '{db_container_name}/{db_name}'...", "blue")
            subprocess.run(
                ["docker", "exec", "-i", db_container_name, "mysql", "-uroot", f"-p{root_password}", db_name],
                input=dump_content,
                text=True,
                capture_output=True,
                check=True
            )
            colored_print(f"✅ Database dump imported successfully into '{db_container_name}'!", "green")

        except subprocess.CalledProcessError as e:
            # capture stderr for specifics (duplicate key, permissions, etc.)
            err = e.stderr or e.stdout or str(e)
            colored_print(f"❌ Failed to import the database dump into '{db_container_name}'!\nDetails: {err}", "red")
        except Exception as e:
            colored_print(f"❌ Unexpected error while importing dump for '{db_name}': {e}", "red")

    # Step 6: Verify backend is up
    verify_backend_is_up(back_app_container_name, backend_folder, nb_of_retry=10)

    # Step 7: Optionally clear origins
    if no_cache:
        colored_print("🧭 Verifying that allowed origins list is empty...", "blue")

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
                        colored_print(f"🧹 Found {len(origins)} origins → removing them...", "yellow")
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
                                colored_print(f"✅ Origin '{origin}' removed successfully.", "green")
                            else:
                                colored_print(
                                    f"Failed to remove origin '{origin}' → {remove_resp.text}",
                                    "red"
                                )
                    else:
                        colored_print("✅ No origins found, nothing to delete.", "green")
                else:
                    colored_print(f"❌ Could not list origins. Status={response.status_code}, body={response.text}", "red")
        except Exception as e:
            colored_print(f"❌ Exception while checking/removing origins: {e}", "red")

    colored_print("🎯 Backend startup sequence complete!", "green")
