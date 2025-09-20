import os
import argparse
import subprocess
import signal
import sys
import threading
import time

from launch_files.helpers.config.load_config_file import load_config_file
from launch_files.scripts.handle_verif import handle_verif
from launch_files.scripts.handle_back import handle_back
from launch_files.scripts.handle_front import handle_front
from launch_files.scripts.handle_test import handle_test
from launch_files.scripts.handle_update import handle_update
from launch_files.scripts.handle_down import handle_down
from launch_files.scripts.handle_dump import handle_dump
from launch_files.scripts.handle_export import handle_export_images
from launch_files.scripts.handle_import import handle_import_images
from launch_files.scripts.handle_logs import handle_logs
from launch_files.scripts.handle_origins import handle_origins

# Variables globales pour la gestion des processus
active_processes = []
shutdown_requested = False

def signal_handler(sig, frame):
    """Gestionnaire de signal pour arrêt propre"""
    global shutdown_requested
    print('\n🛑 Arrêt en cours...')
    shutdown_requested = True

    # Arrêter tous les processus actifs
    for proc in active_processes:
        if proc and proc.poll() is None:  # Si le processus est encore en cours
            print(f"   Arrêt du processus {proc.pid}...")
            try:
                proc.terminate()  # Signal SIGTERM
                # Attendre 5 secondes pour un arrêt propre
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"   Force l'arrêt du processus {proc.pid}...")
                proc.kill()  # Signal SIGKILL si nécessaire
            except Exception as e:
                print(f"   Erreur lors de l'arrêt du processus {proc.pid}: {e}")

    print("✅ Arrêt terminé")
    sys.exit(0)


# Configuration des signaux
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Main script
if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Utility script with multiple operations.")
    parser.add_argument("--verif", action="store_true", help="Run verification steps.")
    parser.add_argument("--back", action="store_true", help="Run backend-related operations.")
    parser.add_argument("--test", action="store_true", help="Run tests.")
    parser.add_argument("--front", action="store_true", help="Run frontend-related operations.")
    parser.add_argument(
        "--all", action="store_true", help="Run the whole application except for tests."
    )
    parser.add_argument("--update", type=str, help="Function to update the database.")
    parser.add_argument("--down", action="store_true",
        help="Function to stop the containers, remove the images, and remove the volumes."
    )
    parser.add_argument("--dump", action="store_true",
        help="Function to export the database dump."
    )
    parser.add_argument("--export-images", type=str, help="Export backend and database Docker images to a tar file (provide output tar path).")
    parser.add_argument("--import-images", type=str, help="Import backend and database Docker images from a tar file (provide input tar path).")
    parser.add_argument("--container-name", type=str, default="distributeur-backend-app", help="For export: container to export. For import: name for the new image (default: distributeur-backend-app)")
    parser.add_argument("--combo", action="store_true", help="Run verif, back, front, and test in sequence.")
    parser.add_argument("--restart", action="store_true",
        help="Function to run down and then all to stop and start again the application."
    )
    parser.add_argument("--no-cache-back", action="store_true",
        help="Build Backend Docker images without using cache."
    )
    parser.add_argument("--no-cache-front", action="store_true",
        help="Build Frontend Docker images without using cache."
    )
    parser.add_argument("--install-front", action="store_true",
        help="Install frontend dependencies with npm before starting the containers."
    )
    parser.add_argument("--build-test", action="store_true",
        help="Build Test Docker images before running."
    )
    parser.add_argument("--see-log", type=str, choices=["back", "front", "every"],
        help="Stream Docker logs: 'back' for backend, 'front' for frontend, 'every' for both."
    )
    parser.add_argument("--origins", action="store_true", help="List registered frontend origins")

    # Parse arguments
    args = parser.parse_args()

    # Paths
    backend_folder = "backend"
    frontend_folder = "dispenser_frontend"
    env_file_path = os.path.join(backend_folder, ".env")
    back_app_container_name = "distributeur-backend-app"
    back_app_image_name = "phx-backend-app"
    back_test_container_name = "distributeur-backend-test"
    front_app_container_name = "distributeur-frontend-app"

    # Load configuration
    config = load_config_file()

    # Extract database configurations
    db_configs = config["databases"]

    # Execute operations based on flags
    if any(vars(args).values()):
        # Combo ou All ou Restart
        if args.combo or args.all or args.restart:
            if args.restart:
                handle_down()

            # Vérification + Backend
            handle_verif(
                env_file_path, config["required_env_keys"], backend_folder, db_configs
            )
            handle_back(
                backend_folder, db_configs, back_app_container_name, no_cache=args.no_cache_back
            )
            handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front)

            if args.combo or args.restart:
                # Tests don't need a database, so we pass None
                handle_test(backend_folder, None, back_app_container_name, build_first=args.build_test)
        else:
            if args.verif:
                handle_verif(
                    env_file_path, config["required_env_keys"], backend_folder, db_configs
                )
            if args.all:
                handle_verif(
                    env_file_path, config["required_env_keys"], backend_folder, db_configs
                )
                handle_back(
                    backend_folder, db_configs, back_app_container_name, no_cache=args.no_cache_back
                )
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front)
            if args.back:
                handle_back(
                    backend_folder, db_configs, back_app_container_name, no_cache=args.no_cache_back
                )
            if args.front:
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front)
            if args.test:
                # Tests don't need a database, so we pass None
                handle_test(backend_folder, None, back_app_container_name, build_first=args.build_test)
            if args.update:
                update_function = args.update
                # Use the app database configuration for updates
                app_db_config = next((db for db in db_configs if db["name"] == "app_db"), db_configs[0])
                handle_update(update_function, app_db_config["container_name"], backend_folder)
            if args.dump:
                # Use the app database configuration for dumps
                app_db_config = next((db for db in db_configs if db["name"] == "app_db"), db_configs[0])
                handle_dump(backend_folder, app_db_config["container_name"], back_app_container_name)
            if args.export_images:
                handle_export_images(args.export_images, [back_app_image_name, "mysql:5.7"])
            if args.import_images:
                # Use the app database configuration for imports
                app_db_config = next((db for db in db_configs if db["name"] == "app_db"), db_configs[0])
                handle_import_images(args.import_images, back_app_image_name, back_app_container_name, app_db_config["container_name"])
            if args.down:
                handle_down()
            if args.see_log:
                handle_logs(args.see_log, back_app_container_name, front_app_container_name, active_processes, shutdown_requested)
            if args.origins:
                handle_origins(backend_folder)
    else:
        parser.print_help()
        exit(1)
