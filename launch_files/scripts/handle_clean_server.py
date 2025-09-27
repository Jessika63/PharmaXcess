
import os
import subprocess
from launch_files.helpers.colored_print import colored_print

def handle_clean_server():
    """
    Nettoie et met à jour complètement le serveur distant :
    - Nettoyage Docker (containers/images/volumes/networks)
    - Mise à jour complète des paquets
    - Suppression des paquets inutiles
    - Vérification espace disque
    """
    remote = "ubuntu@57.128.57.96"

    commands = [
        # Nettoyage Docker
        "docker system prune -af --volumes",
        "docker builder prune -af",
        "docker network prune -f",

        # Mise à jour système
        "sudo apt-get update -y",
        "sudo apt-get upgrade -y",
        "sudo apt-get dist-upgrade -y",
        "sudo apt-get autoremove -y",
        "sudo apt-get autoclean -y",
        "sudo apt-get clean",

        # Vérification disque et conteneurs
        "df -h",
        "docker ps -a"
    ]

    colored_print("🚀 Nettoyage complet du serveur en cours...", "blue")

    ssh_command = [
        "ssh",
        "-t",
        remote,
        " && ".join(commands)
    ]

    result = subprocess.run(ssh_command, shell=False)

    if result.returncode == 0:
        colored_print("✅ Nettoyage et mise à jour du serveur terminés avec succès.", "green")
    else:
        colored_print(f"❌ Erreur lors du nettoyage (code {result.returncode}).", "red")
