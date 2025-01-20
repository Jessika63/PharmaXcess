
import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up

def handle_test(backend_folder, db_container_name, back_container_name):
    """
    Handles testing operations by:
    1. Ensuring the database container is up and ready.
    2. Running the test suite using docker-compose.
    """
    colored_print("Preparing to run tests...", "green")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 1: Check if containers is ready
    verify_database_is_up(db_container_name)
    verify_backend_is_up(back_container_name, nb_of_retry=2)

    # Step 2: Run tests using docker-compose
    try:
        colored_print("Running tests using docker-compose...", "blue")
        subprocess.run(["docker-compose", "run", "--rm", "test"], check=True)
        colored_print("Tests completed successfully!", "green")
    except FileNotFoundError:
        colored_print(
            "docker-compose command not found! Ensure Docker Compose is installed and in your PATH.",
            "red"
        )
    except subprocess.CalledProcessError:
        colored_print("Tests failed during execution!", "red")
    except Exception as e:
        colored_print(f"Unexpected error while running tests: {e}", "red")
