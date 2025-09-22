
import os
import subprocess
import platform
import shutil
import sys

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory

def handle_app(mobile_app_folder, install_app=False, sudo=False, no_cache=False):
    """
    Objectif: Handles mobile app operations including dependency installation and startup.

    Parameters:
        - mobile_app_folder: Path to the mobile app directory. (String)
        - install_app: If True, installs npm dependencies before starting. Defaults to False. (Boolean)
        - sudo: If True, uses sudo for npm install. Defaults to False. (Boolean)
        - no_cache: If True, adds --no-cache flag to npm install. Defaults to False. (Boolean)

    Return Value:
        - process: Le processus de l'application mobile ou None en cas d'erreur
    """
    colored_print("Starting mobile app operations...", "blue")

    # Change to mobile app directory
    change_directory(mobile_app_folder)

    # Check dependencies and optionally install
    package_lock_exists = os.path.exists(os.path.join(".", "package-lock.json"))
    node_modules_exists = os.path.isdir(os.path.join(".", "node_modules"))

    if install_app:
        try:
            # Clean existing dependencies if they exist
            if package_lock_exists:
                os.remove("package-lock.json")
                colored_print("Removed package-lock.json", "yellow")

            if node_modules_exists:
                shutil.rmtree("node_modules")
                colored_print("Removed node_modules directory", "yellow")

            colored_print("Installing dependencies using npm...", "blue")

            # Détection du système d'exploitation
            is_windows = platform.system() == "Windows"

            # Construction de la commande
            if sudo and not is_windows:
                # Utiliser sudo seulement sur Linux/Mac
                command = ["sudo", "npm", "install"]
            else:
                # Ne pas utiliser sudo sur Windows
                command = ["npm", "install"]

            # Add --no-cache flag if specified
            if no_cache:
                command.append("--no-cache")

            # Exécution avec shell=True sur Windows pour trouver npm
            subprocess.run(command, check=True, shell=is_windows)
            colored_print("Dependencies installed successfully!", "green")
        except (FileNotFoundError, subprocess.CalledProcessError) as e:
            colored_print(f"Failed to install dependencies: {e}", "red")
            return None
    else:
        if package_lock_exists and node_modules_exists:
            colored_print("Dependencies detected (package-lock.json and node_modules found). Skipping npm install.", "blue")
        else:
            colored_print("Dependencies not found. Please run with --install-app to install dependencies.", "red")
            return None

    # Start the mobile app with Popen
    try:
        colored_print("Starting React Native app...", "blue")
        is_windows = platform.system() == "Windows"

        # Utiliser directement la sortie standard du script parent
        process = subprocess.Popen(
            ["npm", "start"],
            stdout=sys.stdout,  # Rediriger vers la sortie standard actuelle
            stderr=sys.stderr,  # Rediriger vers l'erreur standard actuelle
            universal_newlines=True,
            shell=is_windows
        )
        return process
    except Exception as e:
        colored_print(f"Failed to start mobile app: {e}", "red")
        return None
