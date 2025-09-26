
import os
import subprocess
from colored_print import colored_print
from troubleshooting_message_giver import troubleshooting_message
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

def start_containers(no_cache=False):
    try:
        if no_cache:
            colored_print("Starting containers without cache...", "blue")
            run_docker_command(["build", "--no-cache"])
            run_docker_command(["up", "-d"])
        else:
            colored_print("Starting containers with cache...", "blue")
            # Séparer build et up pour docker compose v2
            if isinstance(DOCKER_CMD, str):  # docker-compose
                run_docker_command(["up", "--build", "-d"])
            else:  # docker compose v2
                run_docker_command(["build"])
                run_docker_command(["up", "-d"])
        colored_print("Containers started successfully!", "green")
    except subprocess.CalledProcessError:
        colored_print(troubleshooting_message, "red")
