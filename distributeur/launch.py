import os
import argparse
import subprocess

from launch_distributeur.helpers.config.load_config_file import load_config_file
from launch_distributeur.scripts.handle_verif import handle_verif
from launch_distributeur.scripts.handle_back import handle_back
from launch_distributeur.scripts.handle_front import handle_front
from launch_distributeur.scripts.handle_test import handle_test
from launch_distributeur.scripts.handle_update import handle_update
from launch_distributeur.scripts.handle_down import handle_down
from launch_distributeur.scripts.handle_dump import handle_dump
from launch_distributeur.scripts.handle_export import handle_export_images
from launch_distributeur.scripts.handle_import import handle_import_images

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
    parser.add_argument("--build-test", action="store_true",
        help="Build Test Docker images before running."
    )
    parser.add_argument("--see-log", type=str, choices=["back", "front", "every"],
        help="Stream Docker logs: 'back' for backend, 'front' for frontend, 'every' for both."
    )

    # Parse arguments
    args = parser.parse_args()

    # Paths
    backend_folder = "backend"
    frontend_folder = "frontend"
    env_file_path = os.path.join(backend_folder, ".env")
    db_container_name = "distributeur-backend-db"
    back_app_container_name = "distributeur-backend-app"
    back_app_image_name = "phx-backend-app"
    back_test_container_name = "distributeur-backend-test"
    front_app_container_name = "distributeur-frontend-app"

    # Load configuration
    config = load_config_file()

    # Execute operations based on flags
    if any(vars(args).values()):
        # Combo ou All ou Restart
        if args.combo or args.all or args.restart:
            if args.restart:
                handle_down()

            # Vérification + Backend
            handle_verif(
                env_file_path, config["required_env_keys"], backend_folder, config["db_dump_date"]
            )
            handle_back(
                backend_folder, config["db_dump_date"], db_container_name,
                back_app_container_name, no_cache=args.no_cache_back
            )
            handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front)

            if args.combo or args.restart:
                handle_test(backend_folder, db_container_name, back_app_container_name, build_first=args.build_test)
        else:
            if args.verif:
                handle_verif(
                    env_file_path, config["required_env_keys"], backend_folder, config["db_dump_date"]
                )
            if args.all:
                handle_verif(
                    env_file_path, config["required_env_keys"], backend_folder, config["db_dump_date"]
                )
                handle_back(
                    backend_folder, config["db_dump_date"], db_container_name, back_app_container_name, no_cache=args.no_cache_back
                )
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front)
            if args.back:
                handle_back(
                    backend_folder, config["db_dump_date"], db_container_name, back_app_container_name, no_cache=args.no_cache_back
                )
            if args.front:
                handle_front(frontend_folder, front_app_container_name, no_cache=args.no_cache_front)
            if args.test:
                handle_test(backend_folder, db_container_name, back_app_container_name, build_first=args.build_test)
            if args.update:
                update_function = args.update
                handle_update(update_function, db_container_name, backend_folder)
            if args.dump:
                handle_dump(backend_folder, db_container_name, back_app_container_name)
            if args.export_images:
                handle_export_images(args.export_images, [back_app_image_name, "mysql:5.7"])
            if args.import_images:
                handle_import_images(args.import_images, back_app_image_name, back_app_container_name, db_container_name)
            if args.down:
                handle_down()
            if args.see_log:
                def stream_logs(container_name):
                    subprocess.call(["docker", "logs", "-f", container_name])

                if args.see_log == "back":
                    stream_logs(back_app_container_name)
                elif args.see_log == "front":
                    stream_logs(front_app_container_name)
                elif args.see_log == "every":
                    processes = [
                        subprocess.Popen(["docker", "logs", "-f", back_app_container_name]),
                        subprocess.Popen(["docker", "logs", "-f", front_app_container_name]),
                    ]
                    for proc in processes:
                        proc.wait()
    else:
        parser.print_help()
        exit(1)
