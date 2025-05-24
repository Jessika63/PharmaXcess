
import os
import argparse

from launch_distributeur.helpers.config.load_config_file import load_config_file
from launch_distributeur.scripts.handle_verif import handle_verif
from launch_distributeur.scripts.handle_back import handle_back
from launch_distributeur.scripts.handle_front import handle_front
from launch_distributeur.scripts.handle_test import handle_test
from launch_distributeur.scripts.handle_update import handle_update
from launch_distributeur.scripts.handle_down import handle_down
from launch_distributeur.scripts.handle_dump import handle_dump

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

    # Parse arguments
    args = parser.parse_args()

    # Paths
    backend_folder = "backend"
    frontend_folder = "frontend"
    env_file_path = os.path.join(backend_folder, ".env")
    db_container_name = "distributeur-backend-db"
    back_app_container_name = "distributeur-backend-app"
    back_test_container_name = "distributeur-backend-test"
    front_app_container_name = "distributeur-frontend-app"

    # Load configuration
    config = load_config_file()

    # Execute operations based on flags
    if any(vars(args).values()):
        if args.all:
            handle_verif(
                env_file_path, config["required_env_keys"], backend_folder, config["db_dump_date"]
            )
            handle_back(
                backend_folder, config["db_dump_date"], db_container_name, back_app_container_name
            )
            handle_front(frontend_folder, front_app_container_name)
        if args.verif:
            handle_verif(
                env_file_path, config["required_env_keys"], backend_folder, config["db_dump_date"]
            )
        if args.back:
            handle_back(
                backend_folder, config["db_dump_date"], db_container_name, back_app_container_name
            )
        if args.test:
            handle_test(backend_folder, db_container_name, back_app_container_name)
        if args.front:
            handle_front(frontend_folder, front_app_container_name)
        if args.update:
            update_function = args.update
            handle_update(update_function, db_container_name, backend_folder)
        if args.down:
            handle_down()
        if args.dump:
            handle_dump(backend_folder, db_container_name, back_app_container_name)
    else:
        parser.print_help()
        exit(1)
