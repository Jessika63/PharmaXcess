
import subprocess
import time
from typing import List, Dict, Any

from helpers.env_functions.load_env_file import load_env_file
from helpers.colored_print import colored_print
from helpers.start_containers import start_containers


def verify_database_is_ready(
    db_container_name: str,
    root_password: str,
    db_name: str,
    nb_of_retry: int = 10,
    wait_seconds: int = 60
) -> bool:
    """
    Vérifie qu'une DB MySQL dans un container Docker est prête.
    Redémarre les containers une seule fois si DB vide au premier essai.
    """
    if not root_password:
        colored_print("MYSQL root password not provided in environment.", "red")
        return False

    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
        return False

    # Vérifier que le container tourne
    result = subprocess.run(
        ["docker", "ps", "--filter", f"name={db_container_name}", "--filter", "status=running", "--format", "{{.Names}}"],
        capture_output=True, text=True
    )
    running = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    if db_container_name not in running:
        colored_print(f"Database container '{db_container_name}' is NOT running!", "red")
        return False

    last_error = None
    containers_restarted = False

    for attempt in range(1, nb_of_retry + 1):
        colored_print(f"--- Vérification {attempt}/{nb_of_retry} pour '{db_name}' ---", "blue")

        # Ping MySQL
        try:
            ping = subprocess.run(
                ["docker", "exec", db_container_name, "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p" + root_password],
                capture_output=True, text=True
            )
            if "mysqld is alive" not in (ping.stdout or ""):
                last_error = (ping.stdout or "") + (ping.stderr or "")
                colored_print(f"Ping MySQL failed: {last_error}", "yellow")
                if attempt < nb_of_retry:
                    colored_print(f"⏳ Attente {wait_seconds}s avant retry...", "yellow")
                    time.sleep(wait_seconds)
                continue
            colored_print("✅ MySQL répond au ping", "green")
        except Exception as e:
            last_error = str(e)
            colored_print(f"Erreur ping MySQL: {e}", "yellow")
            if attempt < nb_of_retry:
                time.sleep(wait_seconds)
            continue

        # Vérifier tables
        try:
            show = subprocess.run(
                ["docker", "exec", db_container_name, "mysql", "-uroot", "-p" + root_password, "-e", f"USE {db_name}; SHOW TABLES;"],
                capture_output=True, text=True
            )
            stdout = (show.stdout or "").strip()
            lines = [l.strip() for l in stdout.splitlines() if l.strip()]
            if lines and lines[0].lower().startswith("tables_in"):
                tables = lines[1:]
            else:
                tables = lines

            if tables:
                colored_print(f"✅ La DB '{db_name}' contient {len(tables)} table(s).", "green")
                return True
            else:
                colored_print(f"⚠️ La DB '{db_name}' est vide.", "yellow")
                if not containers_restarted:
                    colored_print("♻️ Redémarrage des containers (start_containers no_cache=False)...", "blue")
                    start_containers(no_cache=False)
                    containers_restarted = True

        except Exception as e:
            last_error = str(e)
            colored_print(f"Erreur lors du SHOW TABLES: {e}", "yellow")

        if attempt < nb_of_retry:
            colored_print(f"⏳ Attente {wait_seconds}s avant la prochaine tentative...", "yellow")
            time.sleep(wait_seconds)

    colored_print(f"❌ La DB '{db_name}' est toujours vide ou inaccessible après {nb_of_retry} tentatives.", "red" if last_error is None else "yellow")
    if last_error:
        colored_print(f"Dernière erreur connue: {last_error}", "yellow")
    return False


def verify_databases_are_up(db_configs: List[Dict[str, Any]], nb_of_retry: int = 5, wait_seconds: int = 60) -> None:
    """
    Vérifie plusieurs bases listées dans db_configs.
    db_configs: liste de dicts contenant au minimum 'container_name' et éventuellement 'env_prefix' et 'name'.
    """
    colored_print(f"Vérification de {len(db_configs)} base(s) de données...", "blue")
    env_data = load_env_file(".env")

    for db_cfg in db_configs:
        container_name = db_cfg.get("container_name")
        env_prefix = db_cfg.get("env_prefix", "")
        cfg_name = db_cfg.get("name", None)

        root_password_key = f"{env_prefix}MYSQL_ROOT_PASSWORD"
        root_password = env_data.get(root_password_key, env_data.get("MYSQL_ROOT_PASSWORD"))

        # determine db name: préfixé dans .env ou fallback au champ "name" du config
        db_name = env_data.get(f"{env_prefix}MYSQL_DATABASE", env_data.get("MYSQL_DATABASE", cfg_name))

        if not container_name:
            colored_print("Skipping a DB entry without container_name.", "yellow")
            continue

        colored_print(f"➡️ Vérification complète pour '{db_name}' (container: '{container_name}')", "blue")
        ok = verify_database_is_ready(
            db_container_name=container_name,
            root_password=root_password,
            db_name=db_name,
            nb_of_retry=nb_of_retry,
            wait_seconds=wait_seconds
        )

        if not ok:
            colored_print(f"Attention: la vérification de '{db_name}' a échoué.", "yellow")
        # else OK -> nothing to do
