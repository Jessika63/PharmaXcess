
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
    nb_of_retry: int = 5,
    wait_seconds: int = 60
) -> bool:
    """
    Vérifie qu'une DB MySQL dans un container Docker est :
      1) accessible (mysqladmin ping)
      2) contient au moins 1 table

    Si la DB est vide → restart des containers (start_containers(no_cache=False)) puis réessaye.
    Attend `wait_seconds` entre chaque tentative.
    Renvoie True si ok, False sinon.
    """

    # Vérif minimal des paramètres
    if not root_password:
        colored_print("MYSQL root password not provided in environment.", "red")
        return False

    # 0) Vérifier que docker est installé (fatal)
    try:
        subprocess.run(["docker", "--version"], check=True, capture_output=True, text=True)
    except FileNotFoundError:
        colored_print("Docker command not found! Ensure Docker is installed and in your PATH.", "red")
        return False
    except Exception as e:
        colored_print(f"Erreur lors de la vérification de Docker: {e}", "red")
        return False

    # 1) Vérifier que le container tourne (fatal)
    try:
        result = subprocess.run(
            ["docker", "ps", "--filter", f"name={db_container_name}", "--filter", "status=running", "--format", "{{.Names}}"],
            capture_output=True, text=True
        )
        running = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        if db_container_name not in running:
            colored_print(f"Database container '{db_container_name}' is NOT running! Check logs with: docker logs {db_container_name}", "red")
            return False
    except Exception as e:
        colored_print(f"Erreur lors de la vérification du container: {e}", "red")
        return False

    last_error = None

    # Boucle de tentatives
    for attempt in range(1, nb_of_retry + 1):
        colored_print(f"--- Vérification {attempt}/{nb_of_retry} pour '{db_name}' dans '{db_container_name}' ---", "blue")

        # Step A : ping MySQL
        try:
            ping = subprocess.run(
                ["docker", "exec", db_container_name, "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p" + root_password],
                capture_output=True, text=True
            )
            out = (ping.stdout or "") + (ping.stderr or "")
            if "mysqld is alive" not in (ping.stdout or ""):
                last_error = out.strip()
                colored_print(f"Ping MySQL failed: {last_error}", "yellow")
                # attendre puis retry
                if attempt < nb_of_retry:
                    colored_print(f"⏳ Attente {wait_seconds}s avant retry...", "yellow")
                    time.sleep(wait_seconds)
                continue
            colored_print("✅ MySQL répond au ping", "green")
        except Exception as e:
            last_error = str(e)
            colored_print(f"Erreur lors du mysqladmin ping: {e}", "yellow")
            if attempt < nb_of_retry:
                colored_print(f"⏳ Attente {wait_seconds}s avant retry...", "yellow")
                time.sleep(wait_seconds)
            continue

        # Step B : vérifier qu'il y a des tables dans la DB
        try:
            show = subprocess.run(
                [
                    "docker", "exec", db_container_name, "mysql",
                    "-uroot", "-p" + root_password,
                    "-e", f"USE {db_name}; SHOW TABLES;"
                ],
                capture_output=True, text=True
            )

            stdout = (show.stdout or "").strip()
            stderr = (show.stderr or "").strip()

            # Cas d'erreur (ex: Unknown database)
            if show.returncode != 0:
                last_error = stderr or stdout
                # si base inconnue, on la considère comme "vide" pour relancer l'up/import
                colored_print(f"Erreur lors du SHOW TABLES (traite comme DB vide): {last_error}", "yellow")
                # restart below
            else:
                # parse des lignes non vides
                lines = [l.strip() for l in stdout.splitlines() if l.strip()]
                # parfois la 1ère ligne est "Tables_in_<dbname>" -> la supprimer
                if lines and lines[0].lower().startswith("tables_in"):
                    tables = lines[1:]
                else:
                    tables = lines

                if tables:
                    colored_print(f"✅ La DB '{db_name}' contient {len(tables)} table(s).", "green")
                    return True
                else:
                    colored_print(f"⚠️ La DB '{db_name}' est vide (0 table).", "yellow")

        except Exception as e:
            last_error = str(e)
            colored_print(f"Erreur lors de l'exécution du SHOW TABLES: {e}", "yellow")

        # Step C : si on arrive ici, DB ou tables pas prêtes -> restart containers et retry
        colored_print("♻️ Redémarrage des containers (start_containers no_cache=False)...", "blue")
        try:
            start_containers(no_cache=False)
        except Exception as e:
            # start_containers lève déjà des erreurs en interne ; on les logge mais on continue les retries
            colored_print(f"Erreur lors du redémarrage des containers: {e}", "yellow")

        if attempt < nb_of_retry:
            colored_print(f"⏳ Attente {wait_seconds}s avant la prochaine tentative...", "yellow")
            time.sleep(wait_seconds)

    # Fin des retries
    colored_print(f"❌ La DB '{db_name}' dans '{db_container_name}' est toujours vide ou inaccessible après {nb_of_retry} tentatives.", "red" if last_error is None else "yellow")
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
