
import subprocess

from helpers.colored_print import colored_print
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.env_functions.load_env_file import load_env_file
from helpers.change_directory import change_directory

from . import temp_updates_functions as temp

# Global dictionary for updates
UPDATE_FUNCTIONS = {
    "temp_change_frpp_by_rpps": temp.change_frpp_by_rpps,
}

def handle_update(update_function, db_container_name, backend_folder):
    """
    Handles database update operations by executing the specified update function.

    Parameters:
    - update_function (str): The name of the update function to execute.
    """
    colored_print("Starting database update...", "green")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 0: Check if the database container is ready
    verify_database_is_up(db_container_name)

    # Step 1: Check if the update function exists in the dictionary and execute it
    if update_function in UPDATE_FUNCTIONS:
        sql_command = UPDATE_FUNCTIONS[update_function]()
    else:
        colored_print(f"Unknown update function '{update_function}'!", "red")

    # Step 2: Get .env variables
    env_data = load_env_file(".env")

    # Step 3: Execute the update function in the database
    try:
        colored_print(
            f"Executing update function '{update_function}' on database '{env_data['DB_NAME']}'...",
            "blue"
        )
        result = subprocess.run(
            [
                "docker", "exec", db_container_name, "mysql", "-uroot",
                "-p" + env_data["MYSQL_ROOT_PASSWORD"], "-D", env_data["DB_NAME"], "-e", sql_command
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        colored_print(f"Database update executed successfully with {update_function}!", "green")
    except subprocess.CalledProcessError as e:
        # Filter the specific warning
        error_message = e.stderr.replace(
            "mysql: [Warning] Using a password on the command line interface can be insecure.\n", ""
        )
        # Display the error message if it exists
        if error_message.strip():  # Check if the error message is not empty
            colored_print(f"Failed to execute update function. Details: {error_message}", "red")
        else:
            colored_print(
                "Failed to execute update function. No additional error details provided.",
                "red"
            )
