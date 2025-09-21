import os
import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.start_containers import start_containers
from helpers.verify.verify_frontend_is_up import verify_frontend_is_up
from helpers.troubleshooting_message_giver import troubleshooting_message_front_install

def handle_front(frontend_folder, front_app_container_name, no_cache=False, install_front=False, sudo=False):
    """
    Objectif: Handles frontend-related operations including dependency installation and Docker container management.

    Parameters:
        - frontend_folder: Path to the frontend directory. (String)
        - front_app_container_name: Name of the frontend application Docker container. (String)
        - no_cache: If True, builds Docker images without cache. Defaults to False. (Boolean)
        - install_front: If True, installs npm dependencies before starting containers. Defaults to False. (Boolean)
        - sudo: If True, uses sudo for npm install. Defaults to False. (Boolean)

    Return Value:
        - None: This function does not return a value but performs operations and prints status messages. (NoneType)
    """
    colored_print("Starting frontend operations...", "blue")

    # Step 0: Change working directory to frontend/
    change_directory(frontend_folder)

    # Step 1: Verify dependencies and optionally install
    package_lock_exists = os.path.exists(os.path.join(".", "package-lock.json"))
    node_modules_exists = os.path.isdir(os.path.join(".", "node_modules"))

    if install_front:
        try:
            colored_print("Installing dependencies using npm (forced by --install-front)...", "blue")
            # Utilisation de sudo si spécifié
            command = ["sudo", "npm", "install"] if sudo else ["npm", "install"]
            subprocess.run(command, shell=True, check=True)
            colored_print("Dependencies installed successfully!", "green")
        except FileNotFoundError:
            colored_print("npm is not installed or not found in PATH!", "red")
            return
        except subprocess.CalledProcessError:
            colored_print("Failed to install dependencies with npm!", "red")
            return
    else:
        if package_lock_exists and node_modules_exists:
            colored_print("Dependencies detected (package-lock.json and node_modules found). Skipping npm install.", "blue")
        else:
            colored_print(troubleshooting_message_front_install, "red")
            return

    # Step 2: Build and start containers with docker-compose
    start_containers(no_cache=no_cache)
    verify_frontend_is_up(front_app_container_name, nb_of_retry=10)
