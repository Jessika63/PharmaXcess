import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_database_is_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up

def handle_test(backend_folder, db_container_name, back_container_name, build_first=False):
    """
    Objectif: Handles testing operations by ensuring the database and backend are running,
    then executes the test suite using Docker Compose. Optionally builds the test image first.

    Parameters:
        - backend_folder: Path to the backend directory containing the test configuration. (String)
        - db_container_name: Name of the database Docker container. (String or None if no database needed)
        - back_container_name: Name of the backend application Docker container. (String)
        - build_first: If True, builds the test image before running tests. Defaults to False. (Boolean)

    Return Value:
        - None: This function does not return a value but prints test execution status messages. (NoneType)
    """
    colored_print("Preparing to run tests...", "green")

    # Step 0: Change working directory to backend/
    change_directory(backend_folder)

    # Step 1: Check if containers are ready
    if db_container_name:
        verify_database_is_up(db_container_name)
    verify_backend_is_up(back_container_name, nb_of_retry=10)

    # Step 2: Build test image if requested
    if build_first:
        try:
            colored_print("Building test image...", "blue")
            subprocess.run(["docker-compose", "--profile", "test", "build", "test"], check=True)
            colored_print("Test image built successfully!", "green")
        except subprocess.CalledProcessError as e:
            colored_print(f"Failed to build test image: {e}", "red")
            return

    # Step 3: Run tests using docker-compose
    try:
        colored_print("Running tests using docker-compose...", "blue")
        subprocess.run(["docker-compose", "--profile", "test", "run", "--rm", "test"], check=True)
        colored_print("Tests completed successfully!", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"Tests failed: {e}", "red")
        raise

    except FileNotFoundError:
        colored_print(
            "docker-compose command not found! Ensure Docker Compose is installed and in your PATH.",
            "red"
        )
    except subprocess.CalledProcessError:
        colored_print("Tests failed during execution!", "red")
    except Exception as e:
        colored_print(f"Unexpected error while running tests: {e}", "red")
