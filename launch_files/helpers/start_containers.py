
import os
import subprocess
from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message
from helpers.env_functions.load_env_file import load_env_file


# === Chargement de l'environnement ===
env_path = os.path.join(os.path.dirname(__file__), "../../backend/.env")
env_vars = load_env_file(env_path)

# === Détermination de la commande Docker Compose selon l'environnement ===
ENV = env_vars.get("ENV", "").lower()

if ENV == "development":
    DOCKER_CMD = ["docker-compose"]
elif ENV == "production":
    DOCKER_CMD = ["docker", "compose"]
else:
    raise ValueError(f"ENV='{ENV}' is not valid. Must be 'development' or 'production'.")


def run_docker_command(cmd_list):
    """
    Exécute une commande Docker Compose adaptée à l'environnement courant.
    Affiche la commande exécutée pour le débogage.
    """
    # Aplatir les sous-listes potentielles (évite les TypeError)
    flat_cmd = []
    for item in cmd_list:
        if isinstance(item, list):
            flat_cmd.extend(item)
        else:
            flat_cmd.append(str(item))  # Convertir toute entrée en chaîne

    full_cmd = DOCKER_CMD + flat_cmd

    # Affichage lisible pour debug
    colored_print(f"→ Running command: {' '.join(full_cmd)}", "yellow")

    try:
        subprocess.run(full_cmd, check=True)
    except FileNotFoundError:
        colored_print("❌ Docker or Docker Compose is not installed or not found in the PATH", "red")
        raise
    except subprocess.CalledProcessError as e:
        colored_print(f"❌ The command failed : {' '.join(full_cmd)}", "red")
        raise e


def start_containers(no_cache=False, build_args=None):
    """
    Objectif:
        Lance les conteneurs Docker en utilisant docker-compose / docker compose,
        avec ou sans cache de build.

    Paramètres:
        - no_cache (bool): Si True, reconstruit sans cache avant de démarrer les conteneurs.
        - build_args (list): Liste d'arguments additionnels à passer au build (ex: ["--build-arg", "KEY=value"]).
    """
    try:
        if no_cache:
            colored_print("Starting containers without cache...", "blue")
            cmd = ["build", "--no-cache"]
            if build_args:
                cmd += build_args
            run_docker_command(cmd)
            run_docker_command(["up", "-d"])

        else:
            colored_print("Starting containers with cache...", "blue")
            if build_args:
                run_docker_command(["build"] + build_args)
                run_docker_command(["up", "-d"])
            else:
                run_docker_command(["up", "--build", "-d"])

        colored_print("✅ Containers started successfully!", "green")

    except subprocess.CalledProcessError:
        colored_print("❌ An error occurred while launching the containers.", "red")
        colored_print(troubleshooting_message, "red")
    except Exception as e:
        colored_print(f"❌ Unexpected error : {e}", "red")
