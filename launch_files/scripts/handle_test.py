import os
import subprocess

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_databases_are_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file

# Charger le .env
env_path = os.path.join(os.path.dirname(__file__), "../../backend/.env")
env_vars = load_env_file(env_path)

# Déterminer la commande Docker Compose selon l'environnement
ENV = env_vars.get("ENV", "").lower()
if ENV == "development":
    DOCKER_CMD = "docker-compose"
elif ENV == "production":
    DOCKER_CMD = ["docker", "compose"]
else:
    raise ValueError(f"ENV='{ENV}' is not valid. Must be 'development' or 'production'.")

def run_docker_command(cmd_list):
    """Wrapper pour exécuter Docker Compose selon l'environnement"""
    if isinstance(DOCKER_CMD, str):
        full_cmd = [DOCKER_CMD] + cmd_list
    else:
        full_cmd = DOCKER_CMD + cmd_list
    subprocess.run(full_cmd, check=True)

def handle_test(backend_folder, db_configs, back_app_container_name, build_first=False):
    """
    Objectif: Prépare et exécute les tests dans un environnement Docker,
    en vérifiant que les bases de données et le backend sont bien démarrés.

    Parameters:
        - backend_folder: chemin vers le dossier backend (str)
        - db_configs: liste de dictionnaires de configuration des BDD (list)
        - back_app_container_name: nom du conteneur backend (str)
        - build_first: si True → reconstruit l'image de test avant exécution (bool)

    """
    colored_print("Preparing to run tests...", "green")

    # Step 0: Se placer dans backend/
    change_directory(backend_folder)

    # Step 1: Vérifier que toutes les DB sont up
    if db_configs:
        verify_databases_are_up(db_configs, nb_of_retry=10)

    # Step 2: Vérifier que le backend est up
    verify_backend_is_up(back_app_container_name, backend_folder, nb_of_retry=10)

    # Step 3: Build test image si demandé
    if build_first:
        try:
            colored_print("Building test image...", "blue")
            if isinstance(DOCKER_CMD, str):
                run_docker_command(["--profile", "test", "build", "test"])
            else:
                run_docker_command(["build", "--profile", "test", "test"])
            colored_print("Test image built successfully!", "green")
        except subprocess.CalledProcessError as e:
            colored_print(f"Failed to build test image: {e}", "red")
            return

    # Step 4: Lancer les tests
    try:
        colored_print("Running tests using Docker Compose...", "blue")
        if isinstance(DOCKER_CMD, str):
            run_docker_command(["--profile", "test", "run", "--rm", "test"])
        else:
            run_docker_command(["run", "--rm", "--profile", "test", "test"])
        colored_print("Tests completed successfully!", "green")
    except subprocess.CalledProcessError as e:
        colored_print(f"Tests failed: {e}", "red")
        raise
    except FileNotFoundError:
        colored_print(
            "Docker Compose command not found! Ensure Docker Compose is installed and in your PATH.",
            "red"
        )
    except Exception as e:
        colored_print(f"Unexpected error while running tests: {e}", "red")
