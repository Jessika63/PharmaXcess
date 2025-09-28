
import subprocess
import threading
import time
import sys
import os

def stream_logs_improved(container_name, active_processes, shutdown_requested):
    """
    Objectif: Stream logs for a single container with improved signal handling.

    Parameters:
        - container_name: Name of the Docker container to stream logs from. (String)
        - active_processes: List to track active processes for cleanup. (List)
        - shutdown_requested: Flag indicating if shutdown was requested. (Boolean)

    Return Value:
        - None: This function does not return a value but streams logs and manages cleanup. (NoneType)
    """
    try:
        print(f"📋 Affichage des logs pour {container_name}...")
        print("   Appuyez sur Ctrl+C pour arrêter")

        # Créer le processus
        proc = subprocess.Popen(
            ["docker", "logs", "-f", container_name],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )

        # Ajouter à la liste des processus actifs
        active_processes.append(proc)

        # Lire les logs en temps réel
        while not shutdown_requested and proc.poll() is None:
            try:
                line = proc.stdout.readline()
                if line:
                    print(line.rstrip())
                else:
                    time.sleep(0.1)  # Petite pause pour éviter la surcharge CPU
            except KeyboardInterrupt:
                break

    except Exception as e:
        print(f"❌ Erreur lors de l'affichage des logs: {e}")
    finally:
        # Nettoyer le processus
        if proc in active_processes:
            active_processes.remove(proc)
        if proc and proc.poll() is None:
            proc.terminate()

def stream_logs_multiple(container_names, active_processes, shutdown_requested):
    """
    Objectif: Stream logs for multiple containers simultaneously.

    Parameters:
        - container_names: List of Docker container names to stream logs from. (List)
        - active_processes: List to track active processes for cleanup. (List)
        - shutdown_requested: Flag indicating if shutdown was requested. (Boolean)

    Return Value:
        - None: This function does not return a value but streams logs and manages cleanup. (NoneType)
    """
    threads = []

    def stream_single(container_name):
        stream_logs_improved(container_name, active_processes, shutdown_requested)

    try:
        print(f"📋 Affichage des logs pour: {', '.join(container_names)}")
        print("   Appuyez sur Ctrl+C pour arrêter")

        # Créer un thread pour chaque conteneur
        for container_name in container_names:
            thread = threading.Thread(target=stream_single, args=(container_name,))
            thread.daemon = True
            thread.start()
            threads.append(thread)

        # Attendre que tous les threads se terminent
        for thread in threads:
            thread.join()

    except KeyboardInterrupt:
        print("\n🛑 Arrêt demandé par l'utilisateur")
    except Exception as e:
        print(f"❌ Erreur lors de l'affichage des logs: {e}")

def stream_process_logs(process, process_name, active_processes, shutdown_requested):
    """
    Stream logs from a subprocess directly - VERSION AMÉLIORÉE
    Stream logs from a subprocess directly.
    """
    try:
        print(f"📋 Affichage des logs pour {process_name}...")
        print("   Appuyez sur Ctrl+C pour arrêter")

        active_processes.append(process)

        # Attendre simplement que le processus se termine
        # Les logs sont déjà affichés en direct via stdout/stderr
        while not shutdown_requested and process.poll() is None:
            try:
                time.sleep(0.5)  # Réduire la charge CPU
            except KeyboardInterrupt:
                break

    except Exception as e:
        print(f"❌ Erreur lors de l'affichage des logs: {e}")
    finally:
        if process in active_processes:
            active_processes.remove(process)

def stream_server_logs(remote_command, active_processes, shutdown_requested):
    """
    Se connecte au serveur et exécute une commande pour afficher les logs.
    """
    remote = "ubuntu@57.128.57.96"
    ssh_key = os.path.expanduser("~/.ssh/id_rsa")

    try:
        print(f"🔗 Connexion au serveur {remote} ...")
        print(f"📋 Exécution distante: {remote_command}")
        print("   Appuyez sur Ctrl+C pour arrêter")

        proc = subprocess.Popen(
            ["ssh", "-i", ssh_key, remote, remote_command],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            encoding="utf-8",   # 🔥 Forcer UTF-8
            errors="replace",   # 🔥 Évite les crashs si caractère illisible
            bufsize=1
        )

        active_processes.append(proc)

        while not shutdown_requested and proc.poll() is None:
            try:
                line = proc.stdout.readline()
                if line:
                    print(line.rstrip())
                else:
                    time.sleep(0.1)
            except KeyboardInterrupt:
                break

    except Exception as e:
        print(f"❌ Erreur lors de l'affichage des logs serveur: {e}")
    finally:
        if proc in active_processes:
            active_processes.remove(proc)
        if proc and proc.poll() is None:
            proc.terminate()
        print("🔌 Connexion au serveur fermée.")


def handle_logs(log_type, back_app_container_name, front_app_container_name, mobile_app_process, active_processes, shutdown_requested):
    """
    Objectif: Handles log streaming based on the specified log type.

    Parameters:
        - log_type: Type of logs to stream ("back", "front", "app", "server", or "every"). (String)
        - back_app_container_name: Name of the backend application container. (String)
        - front_app_container_name: Name of the frontend application container. (String)
        - mobile_app_process: Process object for the mobile app. (Process)
        - active_processes: List to track active processes for cleanup. (List)
        - shutdown_requested: Flag indicating if shutdown was requested. (Boolean)

    Return Value:
        - None: This function does not return a value but streams logs based on the log type. (NoneType)
    """
    if log_type == "back":
        stream_logs_improved(back_app_container_name, active_processes, shutdown_requested)

    elif log_type == "front":
        stream_logs_improved(front_app_container_name, active_processes, shutdown_requested)

    elif log_type == "app":
        if mobile_app_process:
            stream_process_logs(mobile_app_process, "mobile app", active_processes, shutdown_requested)
        else:
            print("❌ Aucun processus d'application mobile en cours d'exécution")

    elif log_type == "server":
        # Ici on appelle le même script côté serveur, mais avec --see-log back
        remote_command = "cd /home/ubuntu/PharmaXcess && python3 -u launch.py --see-log back"
        stream_server_logs(remote_command, active_processes, shutdown_requested)

    elif log_type == "every":
        # Lancer les logs pour back, front, app mobile et serveur en parallèle
        threads = []

        # Logs back & front
        for container in [back_app_container_name, front_app_container_name]:
            thread = threading.Thread(target=stream_logs_improved, args=(container, active_processes, shutdown_requested))
            thread.start()
            threads.append(thread)

        # Logs mobile app
        if mobile_app_process:
            thread = threading.Thread(target=stream_process_logs, args=(mobile_app_process, "mobile app", active_processes, shutdown_requested))
            thread.start()
            threads.append(thread)

        # Logs server distant
        remote_command = "cd /home/ubuntu/PharmaXcess && python3 -u launch.py --see-log back"
        thread = threading.Thread(target=stream_server_logs, args=(remote_command, active_processes, shutdown_requested))
        thread.start()
        threads.append(thread)

        # Attendre que tous les threads se terminent
        for thread in threads:
            thread.join()
