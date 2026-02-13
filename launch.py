
from modulefinder import test
import argparse
import subprocess
import signal
import sys

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
from launch_files.scripts.handle_app import handle_app
from launch_files.scripts.handle_deploy_back import handle_deploy_back
from launch_files.scripts.handle_exec_server import handle_exec_server
from launch_files.scripts.handle_clean_server import handle_clean_server

# Variables globales pour la gestion des processus
active_processes = []
mobile_app_process = None  # Nouvelle variable pour le processus de l'app mobile
shutdown_requested = False

def signal_handler(sig, frame):
    """Gestionnaire de signal pour arrêt propre"""
    global shutdown_requested, mobile_app_process
    print('\n🛑 Arrêt en cours...')
    shutdown_requested = True

    # Arrêter le processus de l'app mobile
    if mobile_app_process and mobile_app_process.poll() is None:
        print(f"   Arrêt du processus mobile app {mobile_app_process.pid}...")
        try:
            mobile_app_process.terminate()
            mobile_app_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            print(f"   Force l'arrêt du processus mobile app {mobile_app_process.pid}...")
            mobile_app_process.kill()
        except Exception as e:
            print(f"   Erreur lors de l'arrêt du processus mobile app: {e}")

    # Arrêter tous les processus actifs (Docker)
    for proc in active_processes:
        if proc and proc.poll() is None:
            print(f"   Arrêt du processus {proc.pid}...")
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"   Force l'arrêt du processus {proc.pid}...")
                proc.kill()
            except Exception as e:
                print(f"   Erreur lors de l'arrêt du processus {proc.pid}: {e}")

    print("✅ Arrêt terminé")
    sys.exit(0)

# Configuration des signaux
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

# Main script
if __name__ == "__main__":
    # Argument parser setup avec catégories
    parser = argparse.ArgumentParser(description="Utility script with multiple operations.")

    # Création des groupes
    main_group = parser.add_argument_group("Main Operations")
    database_group = parser.add_argument_group("Database Operations")
    docker_group = parser.add_argument_group("Docker Images Management")
    build_group = parser.add_argument_group("Build Options")
    log_group = parser.add_argument_group("Logging & Debugging")
    misc_group = parser.add_argument_group("Miscellaneous")
    server_group = parser.add_argument_group("Server Operations")

    # Main Operations
    main_group.add_argument("--verif", action="store_true", help="Run verification steps.")
    main_group.add_argument("--back", action="store_true", help="Run backend-related operations.")
    main_group.add_argument("--test", action="store_true", help="Run tests.")
    main_group.add_argument("--front", action="store_true", help="Run dispenser frontend-related operations.")
    main_group.add_argument("--app", action="store_true", help="Run the mobile app.")
    main_group.add_argument("--all", action="store_true", help="Run the whole application (app, front & back) except for tests.")
    main_group.add_argument("--combo", action="store_true", help="Run verif, back, front, app and test in sequence.")
    main_group.add_argument("--restart", action="store_true", help="Function to run down and then all to stop and start again the application.")

    # Database Operations
    database_group.add_argument("--update", type=str, help="Function to update the database.")
    database_group.add_argument(
        "--dump",
        nargs="?",         # permet 0 ou 1 argument (nom de la DB)
        const="all",       # si aucun argument, on met "all"
        help="Export database dump locally. Optionally provide a database name."
    )
    database_group.add_argument(
        "--remote-dump",
        nargs="?",         # permet 0 ou 1 argument (nom de la DB)
        const="all",
        help="Export database dump on remote server and retrieve via SCP."
    )

    # Docker Images Management
    docker_group.add_argument("--down", action="store_true", help="Stop containers, remove images and volumes.")
    docker_group.add_argument("--export-images", type=str, help="Export Docker images to tar file (provide output path).")
    docker_group.add_argument("--import-images", type=str, help="Import Docker images from tar file (provide input path).")
    docker_group.add_argument("--container-name", type=str, default="distributeur-backend-app", help="Container name for export/import operations.")

    # Build Options
    build_group.add_argument("--no-cache-back", action="store_true", help="Build Backend without Docker cache.")
    build_group.add_argument("--no-cache-front", action="store_true", help="Build Frontend without Docker cache.")
    build_group.add_argument("--no-cache-app", action="store_true", help="Install app dependencies without cache.")
    build_group.add_argument("--install-front", action="store_true", help="Install frontend dependencies with npm.")
    build_group.add_argument("--install-app", action="store_true", help="Install mobile app dependencies with npm.")
    build_group.add_argument("--build-test", action="store_true", help="Build Test Docker images before running.")
    build_group.add_argument("--location", type=str, choices=['paris', 'lyon'], default='lyon', help="Set the default location for the frontend (paris or lyon).")

    # Logging & Debugging
    log_group.add_argument("--see-log", type=str, choices=["back", "front", "app", "server", "every"], help="Stream logs for components.")
    log_group.add_argument("--origins", action="store_true", help="List registered frontend origins.")

    # Miscellaneous
    misc_group.add_argument("--sudo", action="store_true", help="Use sudo for npm install in frontend operations.")
    misc_group.add_argument("--tunnel", action="store_true", help="Start Expo in tunnel mode for mobile app.")

    server_group.add_argument("--deploy-back", action="store_true", help="Deploy backend to remote server (VM).")
    server_group.add_argument(
        "--exec-server",
        nargs='+',  # <-- permet plusieurs arguments
        help="Transfers and executes Python files on the remote server (VM). The first file is executed."
    )
    server_group.add_argument("--clean-server", action="store_true", help="Nettoie Docker et met à jour complètement le serveur distant.")

    # Parse arguments
    args = parser.parse_args()

    # Paths
    backend_folder = "backend"
    frontend_folder = "dispenser_frontend"
    mobile_app_folder = "pharmaXcess_app"

    # container names
    back_app_container_name = "distributeur-backend-app"
    back_test_container_name = "distributeur-backend-test"
    front_app_container_name = "distributeur-frontend-app"

    # image names
    back_app_image_name = "phx-backend-app"
    test_image_name = "distributeur-backend-test:latest"

    # db container name
    app_db_container_name = "app-backend-db"
    dispenser_db_container_name = "distributeur-backend-db"

    # Load configuration
    config = load_config_file()

    # Extract database configurations
    db_configs = config["databases"]
    env_configs = config["env_configs"]

    volumes=[
        "medicine_data"
    ]

    post_deploy_scripts = [
        [
            "backend/scripts/fill_app_db/docker_launcher.py",
            "backend/scripts/fill_app_db/fill_distributeurs_table.py"
        ]
    ]

    # Execute operations based on flags
    if any(vars(args).values()):
        # Combo ou All ou Restart
        if args.combo or args.all or args.restart:
            if args.restart:
                handle_down()

            # Vérification + Backend
            handle_verif(
                env_configs, backend_folder, db_configs
            )
            handle_back(
                backend_folder, db_configs, back_app_container_name, volumes, no_cache=args.no_cache_back, location=args.location
            )
            handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front, sudo=args.sudo)
            mobile_app_process = handle_app(mobile_app_folder, install_app=args.install_app, sudo=args.sudo, no_cache=args.no_cache_app, tunnel=args.tunnel)
            if mobile_app_process:
                active_processes.append(mobile_app_process)
            if args.combo or args.restart:
                # Tests don't need a database, so we pass None
                handle_test(backend_folder, None, back_app_container_name, build_first=args.build_test)
        else:
            if args.verif:
                handle_verif(
                    env_configs, backend_folder, db_configs
                )
            if args.all:
                handle_verif(
                    env_configs, backend_folder, db_configs
                )
                handle_back(
                    backend_folder, db_configs, back_app_container_name, volumes, no_cache=args.no_cache_back, location=args.location
                )
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front, sudo=args.sudo)
                mobile_app_process = handle_app(mobile_app_folder, install_app=args.install_app, sudo=args.sudo, no_cache=args.no_cache_app, tunnel=args.tunnel)
                if mobile_app_process:
                    active_processes.append(mobile_app_process)
            if args.back:
                handle_back(
                    backend_folder, db_configs, back_app_container_name, volumes, no_cache=args.no_cache_back, location=args.location
                )
            if args.front:
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front, install_front=args.install_front, sudo=args.sudo)
            if args.app:
                mobile_app_process = handle_app(mobile_app_folder, install_app=args.install_app, sudo=args.sudo, no_cache=args.no_cache_app, tunnel=args.tunnel)
                if mobile_app_process:
                    active_processes.append(mobile_app_process)
            if args.test:
                # Tests don't need a database, so we pass None
                handle_test(backend_folder, None, back_app_container_name, build_first=args.build_test)
            if args.update:
                update_function = args.update
                # Use the app database configuration for updates
                app_db_config = next((db for db in db_configs if db["name"] == "app_db"), db_configs[0])
                handle_update(update_function, app_db_config["container_name"], backend_folder)
            if args.dump:
                target_db = None if args.dump == "all" else args.dump
                handle_dump(
                    backend_folder,
                    db_configs,
                    back_app_container_name,
                    target_db_name=target_db,
                    remote=False
                )
            if args.remote_dump:
                target_db = None if args.remote_dump == "all" else args.remote_dump
                handle_dump(
                    backend_folder,
                    db_configs,
                    back_app_container_name,
                    target_db_name=target_db,
                    remote=True
                )
            if args.export_images:
                handle_export_images(args.export_images, [back_app_image_name, "mysql:5.7"])
            if args.import_images:
                # Use the app database configuration for imports
                app_db_config = next((db for db in db_configs if db["name"] == "app_db"), db_configs[0])
                handle_import_images(args.import_images, back_app_image_name, back_app_container_name, app_db_config["container_name"])
            if args.down:
                handle_down(
                    mobile_app_process,
                    containers=[
                        back_app_container_name,
                        front_app_container_name,
                        back_test_container_name,
                        app_db_container_name,
                        dispenser_db_container_name
                    ],
                    images=[
                        back_app_image_name,
                        test_image_name,
                        "mysql/mysql-server:5.7"
                    ],
                    volumes=volumes
                )
            if args.see_log:
                handle_logs(
                    args.see_log,
                    back_app_container_name,
                    front_app_container_name,
                    mobile_app_process,  # Passer le processus de l'app mobile
                    active_processes,
                    shutdown_requested
                )
            if args.origins:
                handle_origins(backend_folder)
            if args.deploy_back:
                handle_clean_server()
                handle_deploy_back()
                for script_group in post_deploy_scripts:
                    handle_exec_server(*script_group)
            if args.exec_server:
                handle_exec_server(*args.exec_server)  # On décompresse la liste
            if args.clean_server:
                handle_clean_server()
    else:
        parser.print_help()
        exit(1)
