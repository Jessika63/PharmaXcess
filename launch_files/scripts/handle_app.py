
import os
import subprocess
import platform
import shutil
import sys
import time
import requests
import shutil

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory

def setup_ngrok(mobile_app_folder):
    """
    Configure et démarre ngrok automatiquement
    """
    colored_print("Configuration de ngrok...", "blue")

    # Lecture du token ngrok depuis le .env du frontend
    env_file_path = os.path.join(mobile_app_folder, '.env')
    ngrok_token = None

    try:
        with open(env_file_path, 'r') as f:
            for line in f:
                if line.startswith('NGROK_TOKEN='):
                    ngrok_token = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    except Exception as e:
        colored_print(f"Erreur lecture .env: {e}", "red")
        return False

    if not ngrok_token:
        colored_print("Token ngrok non trouvé dans .env", "red")
        return False

    # Vérification ngrok (Windows -> ngrok.cmd, Linux/Mac -> ngrok)
    ngrok_path = shutil.which("ngrok") or shutil.which("ngrok.cmd")
    if not ngrok_path:
        colored_print("✗ Ngrok introuvable dans le PATH Python", "red")
        return False

    # Vérifier version ngrok
    try:
        subprocess.run([ngrok_path, "--version"], check=True, capture_output=True)
        colored_print("✓ Ngrok est installé", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"✗ Erreur en lançant ngrok: {e}", "red")
        return False

    # Authentification ngrok
    try:
        colored_print("Authentification ngrok...", "blue")
        subprocess.run([ngrok_path, "authtoken", ngrok_token], check=True)
        colored_print("✓ Authentification ngrok réussie", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"✗ Erreur authentification ngrok: {e}", "red")
        return False

    # Démarrage de ngrok
    try:
        colored_print("Démarrage du tunnel ngrok...", "blue")
        ngrok_process = subprocess.Popen(
            [ngrok_path, "http", "5000", "--log=stdout"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )

        # Attendre que ngrok soit prêt
        time.sleep(3)

        # Récupérer l'URL du tunnel
        try:
            response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
            if response.status_code == 200:
                tunnels = response.json().get("tunnels", [])
                for tunnel in tunnels:
                    if tunnel.get("proto") == "https":
                        ngrok_url = tunnel["public_url"]
                        colored_print(f"✓ Tunnel ngrok actif: {ngrok_url}", "green")
                        return ngrok_url
        except Exception:
            colored_print("⚠ Impossible de récupérer l'URL ngrok via API", "yellow")
            # Fallback: on suppose que le tunnel standard est actif
            return "https://dorie-nonerodent-unyieldingly.ngrok-free.dev"

    except Exception as e:
        colored_print(f"✗ Erreur démarrage ngrok: {e}", "red")
        return False

    return False


def update_backend_url(mobile_app_folder, ngrok_url):
    """
    Met à jour l'URL du backend dans le .env
    """
    env_file_path = os.path.join(mobile_app_folder, '.env')

    try:
        # Lecture du fichier .env
        with open(env_file_path, 'r') as f:
            lines = f.readlines()

        # Mise à jour de l'URL du backend
        updated_lines = []
        backend_url_updated = False

        for line in lines:
            if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                updated_lines.append(f'EXPO_PUBLIC_BACKEND_URL={ngrok_url}\n')
                backend_url_updated = True
            else:
                updated_lines.append(line)

        # Si la variable n'existait pas, l'ajouter
        if not backend_url_updated:
            updated_lines.append(f'\nEXPO_PUBLIC_BACKEND_URL={ngrok_url}\n')

        # Écriture du fichier .env
        with open(env_file_path, 'w') as f:
            f.writelines(updated_lines)

        colored_print(f"✓ URL backend mise à jour: {ngrok_url}", "green")
        return True

    except Exception as e:
        colored_print(f"✗ Erreur mise à jour .env: {e}", "red")
        return False

def handle_app(mobile_app_folder, install_app=False, sudo=False, no_cache=False, tunnel=False):
    """
    Objectif: Handles mobile app operations including dependency installation and startup.

    Parameters:
        - mobile_app_folder: Path to the mobile app directory. (String)
        - install_app: If True, installs npm dependencies before starting. Defaults to False. (Boolean)
        - sudo: If True, uses sudo for npm install. Defaults to False. (Boolean)
        - no_cache: If True, adds --no-cache flag to npm install. Defaults to False. (Boolean)
        - tunnel: If True, starts Expo in tunnel mode. Defaults to False. (Boolean)

    Return Value:
        - process: Le processus de l'application mobile ou None en cas d'erreur
    """
    colored_print("Starting mobile app operations...", "blue")

    # Configuration ngrok si mode tunnel
    ngrok_url = None

    try:
        ngrok_url = setup_ngrok(mobile_app_folder)
        if not ngrok_url:
            colored_print("Échec de la configuration ngrok", "red")
            return None

        # Mise à jour de l'URL du backend
        if not update_backend_url(mobile_app_folder, ngrok_url):
            colored_print("Échec de la mise à jour de l'URL backend", "red")
            return None

    except Exception as e:
        colored_print(f"Erreur configuration ngrok: {e}", "red")
        return None

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
        if tunnel:
            colored_print("Starting React Native app in TUNNEL mode...", "blue")
        else:
            colored_print("Starting React Native app...", "blue")

        is_windows = platform.system() == "Windows"

        # Construction de la commande en fonction du mode tunnel
        if tunnel:
            # Commande pour le mode tunnel
            command = ["npx", "expo", "start", "--tunnel"]
        else:
            # Commande normale
            command = ["npm", "start"]

        # Utiliser directement la sortie standard du script parent
        process = subprocess.Popen(
            command,
            stdout=sys.stdout,  # Rediriger vers la sortie standard actuelle
            stderr=sys.stderr,  # Rediriger vers l'erreur standard actuelle
            universal_newlines=True,
            shell=is_windows
        )

        if tunnel:
            colored_print("📡 Expo started in TUNNEL mode - accessible from external networks", "green")
        else:
            colored_print("📱 Expo started in LAN mode - accessible on local network only", "green")

        return process
    except Exception as e:
        colored_print(f"Failed to start mobile app: {e}", "red")
        return None
