import os
import subprocess
import platform
import shutil
import sys
import time
import requests

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory, try_change
from helpers.env_functions.load_env_file import load_env_file

def setup_ngrok(mobile_app_folder):
    """
    Configure et démarre ngrok automatiquement (uniquement pour dev)
    """
    colored_print("Configuration de ngrok...", "blue")

    change_directory(mobile_app_folder)

    # Lecture du token ngrok depuis le .env du frontend
    ngrok_token = None
    try:
        with open(".env", 'r') as f:
            for line in f:
                if line.startswith('NGROK_TOKEN='):
                    ngrok_token = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break
    except Exception as e:
        colored_print(f"Erreur lecture .env: {e}", "red")
        return None

    parent_dir = os.path.abspath(os.path.join(".."))
    try_change(parent_dir)

    if not ngrok_token:
        colored_print("Token ngrok non trouvé dans .env", "red")
        return None

    # Vérification ngrok (Windows -> ngrok.cmd, Linux/Mac -> ngrok)
    ngrok_path = shutil.which("ngrok") or shutil.which("ngrok.cmd")
    use_npx = False
    if not ngrok_path:
        # Try fallback to npx if available (no global ngrok installed)
        npx_path = shutil.which("npx")
        if npx_path:
            colored_print("Ngrok non trouvé globalement, fallback sur 'npx ngrok'", "yellow")
            use_npx = True
        else:
            colored_print("✗ Ngrok introuvable dans le PATH Python et 'npx' absent", "red")
            return None

    try:
        # Build command for version check
        if use_npx:
            subprocess.run(["npx", "ngrok", "--version"], check=True, capture_output=True)
        else:
            subprocess.run([ngrok_path, "--version"], check=True, capture_output=True)
        colored_print("✓ Ngrok est installé (ou accessible via npx)", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"✗ Erreur en lançant ngrok: {e}", "red")
        return None

    # Authentification ngrok
    try:
        colored_print("Authentification ngrok...", "blue")
        if use_npx:
            subprocess.run(["npx", "ngrok", "authtoken", ngrok_token], check=True)
        else:
            subprocess.run([ngrok_path, "authtoken", ngrok_token], check=True)
        colored_print("✓ Authentification ngrok réussie", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"✗ Erreur authentification ngrok: {e}", "red")
        return None

    # Démarrage de ngrok
    try:
        colored_print("Démarrage du tunnel ngrok...", "blue")
        # Start ngrok (either global binary or via npx)
        if use_npx:
            proc = subprocess.Popen([
                "npx", "ngrok", "http", "5000", "--log=stdout"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        else:
            proc = subprocess.Popen([
                ngrok_path, "http", "5000", "--log=stdout"
            ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)

        # Poll the local API for up to 30 attempts (30s) to wait for ngrok to be ready
        max_attempts = 30
        ngrok_url = None
        for attempt in range(1, max_attempts + 1):
            try:
                response = requests.get('http://localhost:4040/api/tunnels', timeout=2)
                if response.status_code == 200:
                    tunnels = response.json().get("tunnels", [])
                    for tunnel in tunnels:
                        if tunnel.get("proto") == "https":
                            ngrok_url = tunnel["public_url"]
                            colored_print(f"✓ Tunnel ngrok actif: {ngrok_url}", "green")
                            break
                if ngrok_url:
                    break
            except Exception as ex:
                # API not ready yet
                if attempt == max_attempts:
                    colored_print(f"[ERREUR] Impossible de contacter l'API ngrok après {max_attempts} tentatives: {ex}", "red")
            time.sleep(1)

        # Teste la connectivité réelle à l'URL ngrok
        if ngrok_url:
            try:
                test_response = requests.get(ngrok_url + "/", timeout=5)
                if test_response.status_code == 200:
                    colored_print(f"✓ Connectivité OK sur {ngrok_url}", "green")
                    return ngrok_url
                else:
                    colored_print(f"[ERREUR] Réponse inattendue ({test_response.status_code}) sur {ngrok_url}", "red")
            except Exception as e:
                colored_print(f"[ERREUR] Impossible de joindre {ngrok_url} : {e}", "red")

        # Si ngrok échoue, fallback automatique à localtunnel
        colored_print("[INFO] Fallback automatique : lancement de localtunnel sur le port 5000...", "yellow")
        try:
            # Vérifie que localtunnel est installé
            lt_path = shutil.which("lt") or shutil.which("npx")
            if lt_path:
                # Utilise npx si localtunnel n'est pas installé globalement
                if shutil.which("lt"):
                    lt_command = ["lt", "--port", "5000", "--print-requests"]
                else:
                    lt_command = ["npx", "localtunnel", "--port", "5000", "--print-requests"]
                lt_proc = subprocess.Popen(lt_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
                # Lecture de l'URL localtunnel dans la sortie
                for i in range(30):
                    line = lt_proc.stdout.readline()
                    if "your url is:" in line:
                        lt_url = line.split("your url is:")[-1].strip()
                        colored_print(f"✓ Tunnel localtunnel actif: {lt_url}", "green")
                        return lt_url
                    time.sleep(1)
                colored_print("[ERREUR] Impossible de récupérer l'URL localtunnel.", "red")
                return None
            else:
                colored_print("[FATAL] localtunnel n'est pas installé. Installe-le avec 'npm install -g localtunnel' ou 'npx localtunnel'", "red")
                return None
        except Exception as e:
            colored_print(f"[FATAL] Erreur lors du lancement de localtunnel: {e}", "red")
            return None

    except Exception as e:
        colored_print(f"✗ Erreur démarrage ngrok: {e}", "red")
        return None


def update_backend_urls(mobile_app_folder, ngrok_url=None):
    """
    Met à jour uniquement EXPO_PUBLIC_NGROK_BACKEND_URL dans le .env si ngrok_url fourni.
    """
    env_file_path = os.path.join(mobile_app_folder, '.env')
    try:
        if os.path.exists(env_file_path):
            with open(env_file_path, 'r') as f:
                lines = f.readlines()
        else:
            lines = []

        updated_lines = []
        ngrok_var_found = False

        for line in lines:
            if line.startswith('EXPO_PUBLIC_NGROK_BACKEND_URL=') and ngrok_url:
                updated_lines.append(f'EXPO_PUBLIC_NGROK_BACKEND_URL={ngrok_url}\n')
                ngrok_var_found = True
            else:
                updated_lines.append(line)

        if ngrok_url and not ngrok_var_found:
            updated_lines.append(f'\nEXPO_PUBLIC_NGROK_BACKEND_URL={ngrok_url}\n')

        with open(env_file_path, 'w') as f:
            f.writelines(updated_lines)

        if ngrok_url:
            colored_print(f"✓ EXPO_PUBLIC_NGROK_BACKEND_URL mis à jour : {ngrok_url}", "green")

        return True

    except Exception as e:
        colored_print(f"✗ Erreur mise à jour .env: {e}", "red")
        return False


def handle_app(mobile_app_folder, install_app=False, sudo=False, no_cache=False, tunnel=False):
    """
    Gère l'application mobile :
    - dev + tunnel => ngrok + Expo tunnel
    - dev seul     => ngrok + Expo normal
    - prod + tunnel => Expo tunnel (sans ngrok)
    - prod seul    => Expo normal
    """
    colored_print("Starting mobile app operations...", "blue")

    try:
        env_data = load_env_file(os.path.join(mobile_app_folder, ".env") )
    except FileNotFoundError:
        try:
            env_data = load_env_file(
                os.path.join("..", mobile_app_folder, ".env")
            )
        except FileNotFoundError:
            colored_print("Erreur : fichier .env introuvable", "red")

    env = env_data["EXPO_PUBLIC_ENV"]
    ngrok_url = None

    if env == "development":
        colored_print("⚙️ Mode développement détecté", "blue")
        # Toujours lancer ngrok et mettre à jour l'URL backend, même en mode tunnel
        ngrok_url = setup_ngrok(mobile_app_folder)
        if ngrok_url:
            update_backend_urls(mobile_app_folder, ngrok_url)
        else:
            colored_print("⚠️ Échec de la configuration ngrok", "yellow")
        if tunnel:
            colored_print("✅ Tunnel mode activé (ngrok + Expo tunnel)", "blue")

    elif env == "production":
        colored_print("✅ Mode production détecté (pas de ngrok)", "blue")
        if tunnel:
            colored_print("📡 Expo PROD en mode TUNNEL (sans ngrok)", "green")

    else:
        colored_print("❌ Erreur : variable ENV doit être 'development' ou 'production'", "red")
        return None

    # Se placer dans le dossier app mobile
    change_directory(mobile_app_folder)

    # Vérif / install des dépendances
    package_lock_exists = os.path.exists("package-lock.json")
    node_modules_exists = os.path.isdir("node_modules")

    if install_app:
        try:
            if package_lock_exists:
                os.remove("package-lock.json")
                colored_print("Removed package-lock.json", "yellow")

            if node_modules_exists:
                shutil.rmtree("node_modules")
                colored_print("Removed node_modules directory", "yellow")

            colored_print("Installing dependencies using npm...", "blue")
            is_windows = platform.system() == "Windows"
            command = ["sudo", "npm", "install"] if sudo and not is_windows else ["npm", "install"]
            if no_cache:
                command.append("--no-cache")
            subprocess.run(command, check=True, shell=is_windows)
            colored_print("Dependencies installed successfully!", "green")
        except (FileNotFoundError, subprocess.CalledProcessError) as e:
            colored_print(f"Failed to install dependencies: {e}", "red")
            return None
    else:
        if not (package_lock_exists and node_modules_exists):
            colored_print("Dependencies not found. Please run with --install-app", "red")
            return None
        else:
            colored_print("Dependencies detected. Skipping npm install.", "blue")

    # Lancement Expo
    try:
        is_windows = platform.system() == "Windows"

        if env == "development":
            if tunnel:
                command = ["npx", "expo", "start", "--tunnel"]
                colored_print("📡 Expo DEV en mode TUNNEL + ngrok", "green")
            else:
                command = ["npm", "start"]
                colored_print("📱 Expo DEV en mode LAN + ngrok", "green")

        elif env == "production":
            if tunnel:
                command = ["npx", "expo", "start", "--tunnel"]
                colored_print("📡 Expo PROD en mode TUNNEL (sans ngrok)", "green")
            else:
                command = ["npm", "start"]
                colored_print("📱 Expo PROD en mode LAN", "green")

        process = subprocess.Popen(
            command,
            stdout=sys.stdout,
            stderr=sys.stderr,
            universal_newlines=True,
            shell=is_windows
        )

        return process

    except Exception as e:
        colored_print(f"Failed to start mobile app: {e}", "red")
        return None
