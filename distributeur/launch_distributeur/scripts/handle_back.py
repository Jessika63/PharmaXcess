
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
    verify_backend_is_up(back_app_container_name, nb_of_retry=2)

    # Step 2: Wait for the database container to be ready
    verify_database_is_up(db_container_name, nb_of_retry=10)

    # Step 3: Get .env variables
    env_data = load_env_file(".env")

    # Step 4: Execute the database dump
    dump_file_name = f"database_dump_px_{db_dump_date}.sql"

    if not os.path.exists(dump_file_name):
        colored_print(f"Dump file '{dump_file_name}' not found in the backend folder!", "red")

    try:
        colored_print(f"Importing database dump '{dump_file_name}' into the container...", "blue")
        with open(dump_file_name, "r", encoding="utf-8") as dump_file:
            dump_content = dump_file.read()  # Read the SQL dump as a string
        result = subprocess.run(
            [
                "docker", "exec", "-i", db_container_name, "mysql", "-uroot",
                "-p" + env_data["MYSQL_ROOT_PASSWORD"], env_data["DB_NAME"]
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
