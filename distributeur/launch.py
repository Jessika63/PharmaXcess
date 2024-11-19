
import os
import re
from datetime import datetime

# Function to print with colors
def colored_print(message, color):
    colors = {
        "red": "\033[91m",
        "yellow": "\033[93m",
        "green": "\033[92m",
        "blue": "\033[94m",
        "reset": "\033[0m",
    }
    print(f"{colors.get(color, colors['reset'])}{message}{colors['reset']}")

# Function to verify the .env file
def verify_env_file(env_path, required_keys):
    colored_print("STEP 1: Verifying .env file", "blue")

    if not os.path.exists(env_path):
        colored_print("ERROR: .env file is missing!", "red")
        exit(1)

    with open(env_path, "r") as file:
        lines = file.readlines()

    env_data = {}
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            key, _, value = line.partition("=")
            env_data[key.strip()] = value.strip()

    missing_keys = [key for key in required_keys if key not in env_data]
    if missing_keys:
        colored_print(f"ERROR: Missing keys in .env file: {', '.join(missing_keys)}", "red")
        exit(1)

    extra_keys = [key for key in env_data if key not in required_keys]
    if extra_keys:
        colored_print(f"WARNING: Extra keys found in .env file: {', '.join(extra_keys)}", "yellow")

    colored_print("SUCCESS: .env file verification passed!", "green")

# Function to verify the database dump file
def verify_db_dump(dump_folder, expected_date):
    colored_print("STEP 2: Verifying database dump file", "blue")

    expected_file_pattern = f"database_dump_px_{expected_date}.sql"
    dump_file_path = os.path.join(dump_folder, expected_file_pattern)

    if not os.path.exists(dump_file_path):
        colored_print(f"WARNING: The expected dump file '{expected_file_pattern}' is missing!", "yellow")
    else:
        colored_print("SUCCESS: Correct database dump file is present!", "green")

    # Check if there are other dump files in the folder
    other_dumps = [
        f for f in os.listdir(dump_folder)
        if re.match(r"database_dump_px_\d{2}_\d{2}_\d{4}\.sql", f) and f != expected_file_pattern
    ]

    if other_dumps:
        colored_print(f"WARNING: Other dump files found: {', '.join(other_dumps)}", "yellow")

# Main script
if __name__ == "__main__":
    # Variables
    backend_folder = "backend"
    env_file_path = os.path.join(backend_folder, ".env")
    required_env_keys = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "MYSQL_ROOT_PASSWORD"]
    db_dump_date = "17_11_2024"

    # Run checks
    verify_env_file(env_file_path, required_env_keys)
    verify_db_dump(backend_folder, db_dump_date)
