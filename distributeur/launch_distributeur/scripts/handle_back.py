import os
import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.start_containers import start_containers
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file

def handle_back(backend_folder, db_dump_date, db_container_name, back_app_container_name):
    """
    Handles the backend operations, including verification and container management:
    1. Verifies the environment file and database dump file.
    2. Builds and starts the Docker containers for the backend.
    3. Waits for the database container to be up and ready.
    4. Imports the database dump file into the database container.

    Parameters:
    - env_file_path (str): Path to the environment file (.env).
    - required_env_keys (list): List of required keys that should be present in the environment file.
    - backend_folder (str): Path to the backend folder where the database dump file is located.
    - db_dump_date (str): Date string used to construct the database dump file name.
    """
    colored_print("Starting backend operations...", "blue")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 1: Start containers with docker-compose in detached mode
    start_containers()
    verify_backend_is_up(back_app_container_name, nb_of_retry=10)

    # Step 2: Wait for the database container to be ready
    verify_database_is_up(db_container_name, nb_of_retry=10)

    # Step 3: Get .env variables
    env_data = load_env_file(".env")

    # Step 4: Execute the database dump
    # Use the fake dump in CI, otherwise use the real one
    if os.environ.get("CI", "false").lower() == "true":
        dump_file_name = "temp_fake_database_dump_px.sql"
    else:
        dump_file_name = f"database_dump_px_{db_dump_date}.sql"

    if not os.path.exists(dump_file_name):
        if os.environ.get("CI", "false").lower() == "true":
            colored_print(f"Dump file '{dump_file_name}' not found, but running in CI, so continuing without it.", "yellow")
            return  # Skip the dump import in CI
        else:
            colored_print(f"Dump file '{dump_file_name}' not found in the backend folder!", "red")
            return

    try:
        colored_print(f"Importing database dump '{dump_file_name}' into the container...", "blue")
        with open(dump_file_name, "r", encoding="utf-8") as dump_file:
            dump_content = dump_file.read()  # Read the SQL dump as a string

        # Debug: print environment variables and dump file name
        colored_print(f"CI: {os.environ.get('CI')}", "violet")
        colored_print(f"DB_NAME: {env_data.get('DB_NAME')}", "violet")
        colored_print(f"DB_USER: {env_data.get('DB_USER')}", "violet")
        colored_print(f"DB_PASSWORD: {env_data.get('DB_PASSWORD')}", "violet")
        colored_print(f"MYSQL_ROOT_PASSWORD: {env_data.get('MYSQL_ROOT_PASSWORD')}", "violet")
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
                "-p" + env_data["MYSQL_ROOT_PASSWORD"]
            ],
            input=dump_content,  # Pass the string content
            text=True,           # Ensure subprocess expects a string
            capture_output=True, # Capture stdout and stderr
            check=True
        )
        colored_print("Database dump imported successfully!", "green")
    except subprocess.CalledProcessError as e:
        error_message = e.stderr
        if "Operation CREATE USER failed" in error_message:
            colored_print("User already exists. Skipping user creation.", "yellow")
        else:
            colored_print(f"Failed to import the database dump!\nDetails: {error_message}", "red")
