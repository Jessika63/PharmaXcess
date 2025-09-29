
import subprocess
import os
import shutil
from helpers.colored_print import colored_print

def clean_project():
    for root, dirs, files in os.walk(".", topdown=True):
        if ".git" in dirs: dirs.remove(".git")
        for d in dirs:
            if d in ["__pycache__", ".pytest_cache"]:
                full_path = os.path.join(root, d)
                try: shutil.rmtree(full_path)
                except: pass
        for f in files:
            if f.endswith(".pyc") or f == ".DS_Store":
                full_path = os.path.join(root, f)
                try: os.remove(full_path)
                except: pass

def handle_deploy_back():
    remote = "ubuntu@57.128.57.96"
    remote_path = "/home/ubuntu/PharmaXcess"

    colored_print("Début du déploiement du backend sur la VM...", "blue")
    clean_project()

    colored_print("Envoi des fichiers sur la VM...", "blue")
    scp_cmd = ["scp", "-i", os.path.expanduser("~/.ssh/id_rsa"), "-r",
               "launch.py", "launch_config.json", "backend", "launch_files",
               f"{remote}:{remote_path}"]
    subprocess.run(scp_cmd, check=True)

    colored_print("Connexion SSH et modification du .env sur la VM...", "blue")
    ssh_env_cmd = (
        f"cd {remote_path} && "
        "sed -i '/^ENV=/d' backend/.env && "
        "echo 'ENV=production' >> backend/.env && "
        "cat backend/.env"
    )
    result = subprocess.run(["ssh", remote, ssh_env_cmd],
                            capture_output=True, text=True, encoding="utf-8")
    colored_print(f"Contenu du .env sur la VM :\n{result.stdout.strip()}", "green")

    colored_print("Arrêt du backend sur la VM...", "blue")
    ssh_down_cmd = f"cd {remote_path} && python3 launch.py --down"
    subprocess.run(["ssh", remote, ssh_down_cmd],
                   capture_output=True, text=True, encoding="utf-8")

    colored_print("Lancement du backend en production sur la VM...", "blue")
    ssh_back_cmd = (
        f"cd {remote_path} && "
        f"export $(grep -v '^#' backend/.env | xargs) && "
        f"python3 launch.py --back --no-cache-back"
    )
    subprocess.run(["ssh", remote, ssh_back_cmd], check=True)

    # 🔑 Extraire les infos DB du .env (côté VM)
    colored_print("Mise à jour des droits MySQL pour px_user...", "blue")
    ssh_db_cmd = (
        f"cd {remote_path} && "
        "export $(grep -v '^#' backend/.env | xargs) && "
        "docker exec -i app-backend-db mysql "
        "-u root -p$MYSQL_ROOT_PASSWORD "
        "-e \"GRANT ALL PRIVILEGES ON $APP_DB_NAME.* TO '$APP_DB_USER'@'%' IDENTIFIED BY '$APP_DB_PASSWORD'; FLUSH PRIVILEGES;\""
    )
    subprocess.run(["ssh", remote, ssh_db_cmd], check=True)

    colored_print("Déploiement terminé. Les logs sont dans back.log sur la VM.", "blue")
