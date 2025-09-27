
import os
import subprocess
from launch_files.helpers.colored_print import colored_print

def handle_exec_server(*file_paths: str):
    """
    Transfert un ou plusieurs fichiers Python vers le serveur et exécute le premier,
    en passant les autres comme arguments.

    Parameters:
        - file_paths: chemins relatifs locaux des fichiers
                      (ex: backend/scripts/fill_app_db/partie1.py, backend/scripts/fill_app_db/partie2.py)
    """
    if not file_paths:
        colored_print("❌ Aucun fichier fourni pour l'exécution.", "red")
        return

    remote = "ubuntu@57.128.57.96"
    remote_base_path = "/home/ubuntu/PharmaXcess"

    # Copier tous les fichiers
    for file_path in file_paths:
        remote_file_path = f"{remote_base_path}/{file_path.replace(os.sep, '/')}"
        colored_print(f"📤 Transfert de {file_path} vers le serveur {remote}:{remote_file_path} ...", "blue")

        scp_command = [
            "scp",
            "-i", os.path.expanduser("~/.ssh/id_rsa"),
            "-r",
            file_path,
            f"{remote}:{remote_file_path}"
        ]
        result = subprocess.run(scp_command, capture_output=True, text=True)
        if result.returncode != 0:
            colored_print(f"❌ Échec du transfert du fichier {file_path}.\n{result.stderr}", "red")
            return
        colored_print(f"✅ {file_path} transféré avec succès.", "green")

    # Exécuter le premier fichier en passant les autres comme arguments
    first_file = file_paths[0]
    additional_files = file_paths[1:]  # reste de la liste
    remote_first_file_path = f"{remote_base_path}/{first_file.replace(os.sep, '/')}"

    # Construire la commande avec les autres fichiers en arguments
    additional_args = " ".join([f"{remote_base_path}/{f.replace(os.sep, '/')}" for f in additional_files])
    ssh_command = f"ssh -t {remote} 'python3 {remote_first_file_path} {additional_args}'"

    colored_print(f"🔗 Exécution du fichier {remote_first_file_path} sur le serveur avec les autres en arguments...", "blue")
    result_exec = subprocess.run(ssh_command, shell=True)

    if result_exec.returncode == 0:
        colored_print(f"✅ {first_file} exécuté avec succès sur le serveur.", "green")
    else:
        colored_print(f"❌ Erreur lors de l'exécution de {first_file} (code {result_exec.returncode})", "red")
