
import os
import json
import re
import argparse
import subprocess
import time

# Function to print with colors
def colored_print(message, color):
    """
    Print a message in the terminal with the specified color.
    """
    colors = {
        "red": "\033[91m",
        "yellow": "\033[93m",
        "green": "\033[92m",
        "blue": "\033[94m",
        "reset": "\033[0m",
    }
    print(f"{colors.get(color, colors['reset'])}{message}{colors['reset']}")


# Function to load configuration
def load_config(config_path):
    """
    Load a JSON configuration file from the given path.

    :param config_path: Path to the JSON configuration file
    :return: Parsed configuration as a dictionary
    """
    if not os.path.exists(config_path):
        colored_print(f"ERROR: Configuration file '{config_path}' is missing !", "red")
        exit(1)

    with open(config_path, "r") as file:
        try:
            config = json.load(file)
        except json.JSONDecodeError as e:
            colored_print(f"ERROR: Failed to parse configuration file: {e}", "red")
            exit(1)

    return config


# Function to verify the .env file
def verify_env_file(env_path, required_keys):
    """
    Verify the presence of required keys in a .env file.

    :param env_path: Path to the .env file
    :param required_keys: List of required keys that should be present in the .env file
    """
    colored_print("STEP 1: Verifying .env file", "blue")

    if not os.path.exists(env_path):
        colored_print("ERROR: .env file is missing !", "red")
        exit(1)

    # Read .env file content and parse keys and values
    with open(env_path, "r") as file:
        lines = file.readlines()

    env_data = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            key, _, value = line.partition("=")
            env_data[key.strip()] = value.strip()

    # Check for missing keys
    missing_keys = [key for key in required_keys if key not in env_data]
    if missing_keys:
        colored_print(f"ERROR: Missing keys in .env file: {', '.join(missing_keys)}", "red")
        exit(1)

    # Warn about extra keys
    extra_keys = [key for key in env_data if key not in required_keys]
    if extra_keys:
        colored_print(f"WARNING: Extra keys found in .env file: {', '.join(extra_keys)}", "yellow")

    colored_print("SUCCESS: .env file verification passed !", "green")


# Function to verify the database dump file
def verify_db_dump(dump_folder, expected_date):
    """
    Verify the presence of the expected database dump file in a folder.

    :param dump_folder: Path to the folder containing database dump files
    :param expected_date: Date of the expected dump file in 'DD_MM_YYYY' format
    """
    colored_print("STEP 2: Verifying database dump file", "blue")

    # Construct the expected filename
    expected_file_pattern = f"database_dump_px_{expected_date}.sql"
    dump_file_path = os.path.join(dump_folder, expected_file_pattern)

    # Check for the expected dump file
    if not os.path.exists(dump_file_path):
        colored_print(f"WARNING: The expected dump file '{expected_file_pattern}' is missing !", "yellow")
    else:
        colored_print("SUCCESS: Correct database dump file is present !", "green")

    # Check if there are other dump files in the folder
    other_dumps = [
        f for f in os.listdir(dump_folder)
        if re.match(r"database_dump_px_\d{2}_\d{2}_\d{4}\.sql", f) and f != expected_file_pattern
    ]

    if other_dumps:
        colored_print(f"WARNING: Other dump files found: {', '.join(other_dumps)}", "yellow")


# Function to load and validate the configuration file
def load_config_file(config_file_path):
    """
    Load and validate the configuration file.

    :param config_file_path: Path to the configuration file
    :return: Parsed configuration as a dictionary
    """
    config = load_config(config_file_path)

    # Validate that required keys are present in the configuration
    missing_config_keys = []
    if "required_env_keys" not in config:
        missing_config_keys.append("required_env_keys")
    if "db_dump_date" not in config:
        missing_config_keys.append("db_dump_date")

    if missing_config_keys:
        colored_print(f"ERROR: Configuration file is missing required keys: {', '.join(missing_config_keys)}", "red")
        exit(1)

    return config


def handle_verif(env_file_path, required_env_keys, backend_folder, db_dump_date):
    """
    Handles verification steps before starting backend operations:
    1. Ensures the environment file exists and contains the required keys.
    2. Verifies the presence of the database dump file in the specified backend folder.

    Parameters:
    - env_file_path (str): Path to the environment file (.env).
    - required_env_keys (list): List of required keys that should be present in the environment file.
    - backend_folder (str): Path to the backend folder where the database dump file is located.
    - db_dump_date (str): Date string used to construct the database dump file name.
    """
    verify_env_file(env_file_path, required_env_keys)
    verify_db_dump(backend_folder, db_dump_date)


def handle_back(env_file_path, required_env_keys, backend_folder, db_dump_date):
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
    handle_verif(env_file_path, required_env_keys, backend_folder, db_dump_date)

    colored_print("Starting backend operations...", "green")

    # Step 0: Change working directory to backend/
    try:
        colored_print(f"Changing directory to '{backend_folder}'...", "blue")
        os.chdir(backend_folder)
    except FileNotFoundError:
        colored_print(f"ERROR: Directory '{backend_folder}' not found !", "red")
        exit(1)
    except Exception as e:
        colored_print(f"ERROR: Failed to change directory to '{backend_folder}': {e}", "red")
        exit(1)

    # Step 1: Start containers with docker-compose in detached mode
    try:
        colored_print("Building and starting Docker containers in detached mode...", "blue")
        subprocess.run(["docker-compose", "up", "--build", "-d"], check=True)
    except subprocess.CalledProcessError:
        troubleshooting_message = (
            "ERROR: Failed to start Docker containers with docker-compose !\n\n"
            "Troubleshooting steps:\n"
            "1. Ensure Docker Desktop (or the Docker daemon) is running.\n"
            "   - Windows/macOS: Check if Docker Desktop is active in your system tray.\n"
            "   - Linux: Run 'sudo systemctl start docker' to start the Docker service.\n"
            "2. Verify Docker Engine context:\n"
            "   - Run 'docker context ls' and ensure the correct context (e.g., 'default' or 'desktop-linux') is active.\n"
            "   - Switch context if necessary using 'docker context use [context-name]'.\n"
            "3. Check if Docker commands work manually:\n"
            "   - Test with 'docker ps' to verify Docker is accessible.\n"
            "   - Run 'docker-compose up --build' directly in the terminal to debug errors.\n"
            "4. Restart Docker:\n"
            "   - Windows/macOS: Open Docker Desktop > Settings > Troubleshooting > Restart Docker.\n"
            "   - Linux: Use 'sudo systemctl restart docker'.\n"
            "5. Ensure your user has permission to run Docker:\n"
            "   - Add your user to the 'docker' group (Linux only): 'sudo usermod -aG docker $USER'."
        )
        colored_print(troubleshooting_message, "yellow")
        exit(1)

    # Step 2: Wait for the database container to be ready
    db_container_name = "distributeur-backend-db-1"
    nb_of_retry = 10  # Number of retries
    waiting_time = 10  # Waiting time in seconds between retries

    colored_print(f"Waiting for database container '{db_container_name}' to be ready...", "blue")

    for attempt in range(1, nb_of_retry + 1):
        try:
            result = subprocess.run(
                ["docker", "exec", db_container_name, "mysqladmin", "ping", "-h", "localhost", "-uroot", "-ppx_root_pwd"],
                capture_output=True,
                text=True,
            )
            if "mysqld is alive" in result.stdout:
                colored_print("Database container is ready !", "green")
                break
        except subprocess.CalledProcessError:
            pass  # Ignore errors and retry

        colored_print(f"Attempt {attempt}/{nb_of_retry}: Database not ready. Retrying in {waiting_time} seconds...", "yellow")
        time.sleep(waiting_time)
    else:
        colored_print(f"ERROR: Database container '{db_container_name}' is not ready after {nb_of_retry} attempts !", "red")
        exit(1)

    # Step 3: Execute the database dump
    dump_file_name = f"database_dump_px_{db_dump_date}.sql"

    if not os.path.exists(dump_file_name):
        colored_print(f"ERROR: Dump file '{dump_file_name}' not found in the backend folder !", "red")
        exit(1)

    try:
        colored_print(f"Importing database dump '{dump_file_name}' into the container...", "blue")
        subprocess.run(
            [
                "docker", "exec", "-i", db_container_name,
                "mysql", "-uroot", "-ppx_root_pwd", "doctors_db"
            ],
            input=open(dump_file_name, "rb").read(),
            check=True
        )
        colored_print("Database dump imported successfully !", "green")
    except subprocess.CalledProcessError:
        colored_print("ERROR: Failed to import the database dump !", "red")
        exit(1)


# Placeholder function for "test" flag
def handle_test():
    colored_print("Running tests...", "green")


# Placeholder function for "front" flag
def handle_front():
    colored_print("Executing frontend-related operations...", "green")


# Main script
if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Utility script with multiple operations.")
    parser.add_argument("--verif", action="store_true", help="Run verification steps")
    parser.add_argument("--back", action="store_true", help="Run backend-related operations")
    parser.add_argument("--test", action="store_true", help="Run tests")
    parser.add_argument("--front", action="store_true", help="Run frontend-related operations")

    # Parse arguments
    args = parser.parse_args()

    # Paths
    config_file_path = "launch_config.json"
    backend_folder = "backend"
    env_file_path = os.path.join(backend_folder, ".env")

    # Load configuration
    config = load_config_file(config_file_path)
    required_env_keys = config.get("required_env_keys", [])
    db_dump_date = config.get("db_dump_date", "")

    # Execute operations based on flags
    if any(vars(args).values()):
        if args.verif:
            handle_verif(env_file_path, required_env_keys, backend_folder, db_dump_date)
        if args.back:
            handle_back(env_file_path, required_env_keys, backend_folder, db_dump_date)
        if args.test:
            handle_test()
        if args.front:
            handle_front()
    else:
        parser.print_help()
        exit(1)
