
import os
import subprocess
import sys
import argparse
from dotenv import load_dotenv

def log(msg):
    print(msg, flush=True)

# -----------------------------
# Charger le .env explicitement
# -----------------------------
DOTENV_PATH = os.path.join(os.path.dirname(__file__), "../../.env")
if not os.path.isfile(DOTENV_PATH):
    log(f"❌ Fichier .env introuvable : {DOTENV_PATH}")
    sys.exit(1)

load_dotenv(DOTENV_PATH)
log(f"✅ .env chargé depuis {DOTENV_PATH}")

# -----------------------------
# Fonctions utilitaires
# -----------------------------
def get_container_ip(container_name):
    """Récupère l'IP d'un conteneur Docker"""
    cmd = ["docker", "inspect", "-f", "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}", container_name]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"❌ Impossible de récupérer l'IP du container {container_name}: {result.stderr}")
        sys.exit(1)
    ip = result.stdout.strip()
    log(f"ℹ️ IP du container {container_name} : {ip}")
    return ip

def allow_ip_in_mysql(db_container, db_name, db_user, db_password, allowed_ip):
    """
    Ajoute un utilisateur MySQL ou met à jour les privilèges pour autoriser l'IP donnée.
    """
    sql = f"""
    CREATE USER IF NOT EXISTS '{db_user}'@'{allowed_ip}' IDENTIFIED BY '{db_password}';
    GRANT ALL PRIVILEGES ON {db_name}.* TO '{db_user}'@'{allowed_ip}';
    FLUSH PRIVILEGES;
    """
    log(f"🔹 Ajout de l'IP {allowed_ip} dans MySQL ({db_container})...")
    cmd = ["docker", "exec", "-i", db_container, "mysql", "-uroot", f"-p{os.getenv('MYSQL_ROOT_PASSWORD')}", "-e", sql]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"❌ Erreur lors de la configuration MySQL: {result.stderr}")
        sys.exit(1)
    log(f"✅ IP {allowed_ip} autorisée pour l'utilisateur {db_user} sur la base {db_name}.")

# -----------------------------
# Fonction principale
# -----------------------------
def docker_launcher(main_script: str, additional_scripts=None,
                     container_name="distributeur-backend-app",
                     db_container="app-backend-db"):
    additional_scripts = additional_scripts or []

    # Étape 1 : récupérer l'IP du container backend
    backend_ip = get_container_ip(container_name)

    # Étape 2 : autoriser cette IP dans MySQL
    DB_USER = os.getenv("APP_DB_USER")
    DB_PASSWORD = os.getenv("APP_DB_PASSWORD")
    DB_NAME = os.getenv("APP_DB_NAME")
    if not all([DB_USER, DB_PASSWORD, DB_NAME]):
        log("❌ Variables d'environnement MySQL manquantes (APP_DB_USER, APP_DB_PASSWORD, APP_DB_NAME).")
        sys.exit(1)
    allow_ip_in_mysql(db_container, DB_NAME, DB_USER, DB_PASSWORD, backend_ip)

    # Étape 3 : copier les scripts
    all_scripts = [main_script] + additional_scripts
    base_dir = "/home/ubuntu/PharmaXcess/backend/scripts"

    for script in all_scripts:
        if not os.path.isfile(script):
            log(f"❌ Fichier introuvable : {script}")
            sys.exit(1)

        rel_path = os.path.relpath(script, base_dir)
        docker_target = f"/app/scripts/{rel_path.replace(os.sep, '/')}"

        log(f"📤 Copie du script {script} dans le conteneur {container_name} → {docker_target} ...")
        copy_cmd = ["docker", "cp", script, f"{container_name}:{docker_target}"]
        result = subprocess.run(copy_cmd, capture_output=True, text=True)
        if result.returncode != 0:
            log(f"❌ Erreur lors de la copie: {result.stderr}")
            sys.exit(1)
        log(f"✅ {script} copié avec succès.")

    # Étape 4 : exécuter le script principal avec les autres comme arguments
    main_rel_path = os.path.relpath(main_script, base_dir)
    docker_main_target = f"/app/scripts/{main_rel_path.replace(os.sep, '/')}"
    docker_args = [f"/app/scripts/{os.path.relpath(s, base_dir).replace(os.sep, '/')}" for s in additional_scripts]

    log(f"▶️ Lancement du script {docker_main_target} dans le conteneur avec les autres scripts en argument...")
    exec_cmd = ["docker", "exec", "-it", container_name, "python3", docker_main_target] + docker_args
    subprocess.run(exec_cmd)

# -----------------------------
# Entry point
# -----------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Docker launcher for Python scripts")
    parser.add_argument("main_script", help="Chemin du script principal à copier et exécuter dans Docker")
    parser.add_argument(
        "additional_scripts",
        nargs="*",
        help="Liste optionnelle de scripts supplémentaires à copier dans le conteneur"
    )
    args = parser.parse_args()

    docker_launcher(args.main_script, args.additional_scripts)
