
import subprocess
import os
import shutil
from helpers.colored_print import colored_print

def clean_project():
    """
    Supprime les fichiers/dossiers inutiles avant déploiement :
    - __pycache__
    - *.pyc
    - .pytest_cache
    - .DS_Store
    """
    for root, dirs, files in os.walk(".", topdown=True):
        # On ignore le dossier .git
        if ".git" in dirs:
            dirs.remove(".git")

        # Suppression des dossiers __pycache__ et .pytest_cache
        for d in dirs:
            if d in ["__pycache__", ".pytest_cache"]:
                full_path = os.path.join(root, d)
                try:
                    shutil.rmtree(full_path)
                    colored_print(f"🧹 Dossier supprimé : {full_path}", "violet")
                except Exception as e:
                    colored_print(f"⚠️ Impossible de supprimer {full_path} : {e}", "yellow")

        # Suppression des fichiers inutiles
        for f in files:
            if f.endswith(".pyc") or f == ".DS_Store":
                full_path = os.path.join(root, f)
                try:
                    os.remove(full_path)
                    colored_print(f"🧹 Fichier supprimé : {full_path}", "violet")
                except Exception as e:
                    colored_print(f"⚠️ Impossible de supprimer {full_path} : {e}", "yellow")


def handle_deploy_back():
    try:
        remote = "ubuntu@57.128.57.96"
        remote_path = "/home/ubuntu/PharmaXcess"

        colored_print("🚀 Début du déploiement du backend sur la VM...", "blue")

        # Étape 0 : Nettoyage local
        colored_print("🧹 Nettoyage des fichiers inutiles avant déploiement...", "blue")
        clean_project()

        # Étape 1 : envoi des fichiers
        colored_print("📤 Envoi des fichiers (launch.py, launch_config.json, backend, launch_files)...", "blue")
        result = subprocess.run([
            "scp", "-i", "~/.ssh/id_rsa", "-r",
            "launch.py", "launch_config.json", "backend", "launch_files",
            f"{remote}:{remote_path}"
        ], capture_output=True, text=True)

        if result.returncode == 0:
            colored_print("✅ Fichiers transférés avec succès.", "green")
        else:
            colored_print(f"❌ Échec du transfert des fichiers.\n{result.stderr}", "red")

        # Étape 2 : connexion SSH + config ENV + lancement backend
        colored_print("🔗 Connexion SSH au serveur distant...", "blue")
        ssh_command = f"""
        ssh {remote} 'cd {remote_path} && \
        echo "➡️ Passage en mode production dans backend/.env" && \
        sed -i "s/^ENV=.*/ENV=production/" backend/.env && \
        echo "⚡ Lancement du backend en mode production avec logs..." && \
        python3 launch.py --back --see-log back'
        """
        result = subprocess.run(ssh_command, shell=True, capture_output=True, text=True)

        if result.returncode == 0:
            colored_print("✅ Backend déployé et démarré avec succès.", "green")
        else:
            colored_print(f"❌ Erreur lors de l'exécution sur la VM.\n{result.stderr}", "red")

        colored_print("🏁 Fin du processus de déploiement.", "blue")

    except subprocess.CalledProcessError as e:
        colored_print(f"❌ Erreur critique lors du déploiement : {e}", "red")
    except Exception as e:
        colored_print(f"⚠️ Exception inattendue : {e}", "yellow")
