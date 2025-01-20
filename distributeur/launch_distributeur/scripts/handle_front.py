
import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.start_containers import start_containers
from helpers.verify.verify_frontend_is_up import verify_frontend_is_up

def handle_front(frontend_folder, front_app_container_name):
    """
    Handles frontend-related operations by:
    1. Installing dependencies using npm.
    2. Building and starting the containers using docker-compose.
    """
    colored_print("Starting frontend operations...", "blue")

    # Step 0: Change working directory to frontend/
    change_directory(frontend_folder)

    # Step 1: Install dependencies with npm
    try:
        colored_print("Installing dependencies using npm...", "blue")
        subprocess.run(["npm", "install"], check=True)
        colored_print("Dependencies installed successfully!", "green")
    except FileNotFoundError:
        colored_print("npm is not installed or not found in PATH!", "red")
    except subprocess.CalledProcessError:
        colored_print("Failed to install dependencies with npm!", "red")

    # Step 2: Build and start containers with docker-compose
    start_containers()
    verify_frontend_is_up(front_app_container_name, nb_of_retry=10)
