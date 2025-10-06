
import subprocess
from datetime import datetime
import os
import re
from typing import Dict, Optional

from helpers.colored_print import colored_print
from helpers.change_directory import change_directory
from helpers.verify.verify_database_is_up import verify_databases_are_up
from helpers.verify.verify_backend_is_up import verify_backend_is_up
from helpers.env_functions.load_env_file import load_env_file
from helpers.config.update_json_config import update_json_config


def _sql_escape_single_quote(s: str) -> str:
    return s.replace("'", "''") if s is not None else ""


def _parse_env_content(content: str) -> Dict[str, str]:
    out = {}
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip()
        if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')):
            v = v[1:-1]
        out[k] = v
    return out


def _extract_db_name_from_dumpfile(filename: str, today: str) -> Optional[str]:
    m = re.match(rf"database_dump_px_(?P<name>.+)_{re.escape(today)}\.sql$", filename)
    return m.group("name") if m else None


def fix_dump_footer_local(local_path: str, db_name: str, db_user: str, db_password: str) -> bool:
    db_user_escaped = _sql_escape_single_quote(db_user)
    db_password_escaped = _sql_escape_single_quote(db_password)
    expected_footer = (
        f"CREATE USER '{db_user_escaped}'@'%' IDENTIFIED BY '{db_password_escaped}';\n"
        f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{db_user_escaped}'@'%';\n"
        f"FLUSH PRIVILEGES;\n"
    )
    try:
        with open(local_path, "r", encoding="utf-8", errors="replace") as fh:
            content = fh.read()
    except Exception as e:
        colored_print(f"❌ Could not read dump file {local_path}: {e}", "red")
        return False

    if expected_footer.strip() in content:
        colored_print(f"ℹ️ Footer already correct in {local_path}", "blue")
        return False

    marker = "-- Dump completed on"
    pos = content.rfind(marker)
    cut = content.find("\n", pos) + 1 if pos != -1 else len(content)
    new_content = content[:cut].rstrip() + "\n\n" + expected_footer

    try:
        with open(local_path, "w", encoding="utf-8") as fh:
            fh.write(new_content)
        colored_print(f"🔧 Fixed footer in {os.path.basename(local_path)} (db: {db_name})", "green")
        return True
    except Exception as e:
        colored_print(f"❌ Could not write corrected footer to {local_path}: {e}", "red")
        return False


def _get_remote_env(remote_user: str, remote_host: str, remote_base_path: str) -> Dict[str, str]:
    try:
        cmd = ["ssh", f"{remote_user}@{remote_host}", f"cat {remote_base_path}/backend/.env"]
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        colored_print(f"✅ Retrieved remote .env from {remote_host}", "green")
        return _parse_env_content(p.stdout)
    except Exception as e:
        colored_print(f"⚠️ Could not retrieve remote .env: {e}", "yellow")
        return {}


def _get_remote_container_env(remote_user: str, remote_host: str, container_name: str) -> Dict[str, str]:
    try:
        cmd = ["ssh", f"{remote_user}@{remote_host}", "docker", "exec", container_name, "printenv"]
        p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        colored_print(f"✅ Retrieved environment from container {container_name}", "green")
        return _parse_env_content(p.stdout)
    except Exception as e:
        colored_print(f"⚠️ Could not retrieve container env for {container_name}: {e}", "yellow")
        return {}


def handle_dump(
    backend_folder,
    db_configs,
    back_app_container_name,
    target_db_name=None,
    remote=False,
    remote_user="ubuntu",
    remote_host="57.128.57.96",
    remote_base_path="/home/ubuntu/PharmaXcess"
):
    colored_print("🔹 Starting handle_dump...", "blue")
    today = datetime.now().strftime("%d_%m_%Y")
    dumped_files = []

    try:
        env_path = os.path.join("backend", ".env")
        local_env = load_env_file(env_path)
        colored_print("✅ Loaded local .env file", "green")
    except Exception as e:
        local_env = {}
        colored_print(f"⚠️ Could not load local .env file: {e}", "yellow")

    if remote:
        colored_print(f"🔗 Running remote dump command on {remote_host}", "blue")
        remote_cmd = f"cd {remote_base_path} && python3 launch.py --dump"
        if target_db_name:
            remote_cmd += f" {target_db_name}"
        try:
            subprocess.run(["ssh", f"{remote_user}@{remote_host}", remote_cmd], check=True)
            colored_print("✅ Remote dump command executed", "green")
        except subprocess.CalledProcessError as e:
            colored_print(f"❌ Remote dump command failed: {e}", "red")
            return

        remote_env = _get_remote_env(remote_user, remote_host, remote_base_path)

        for db in db_configs:
            if target_db_name and db["name"] != target_db_name:
                continue
            dump_file = f"database_dump_px_{db['name']}_{today}.sql"
            remote_file_path = f"{remote_base_path}/backend/{dump_file}"
            local_target = os.path.join("backend", dump_file)
            # Vérification si le fichier existe réellement sur le serveur
            check_cmd = ["ssh", f"{remote_user}@{remote_host}", "ls", remote_file_path]
            result = subprocess.run(check_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode != 0:
                colored_print(f"❌ Remote dump file not found: {remote_file_path}", "red")
                continue
            colored_print(f"✅ Remote dump file exists: {remote_file_path}", "green")

            try:
                subprocess.run(["scp", f"{remote_user}@{remote_host}:{remote_file_path}", local_target], check=True)
                colored_print(f"📥 Successfully copied {dump_file} to local {local_target}", "green")
            except subprocess.CalledProcessError as e:
                colored_print(f"❌ Failed to scp {dump_file}: {e}", "red")
                continue

            db_user = (local_env.get(f"{db.get('env_prefix','')}DB_USER") or local_env.get("DB_USER") or "").strip()
            db_password = (local_env.get(f"{db.get('env_prefix','')}DB_PASSWORD") or local_env.get("DB_PASSWORD") or "").strip()
            if not db_user or not db_password:
                db_user = (remote_env.get(f"{db.get('env_prefix','')}DB_USER") or remote_env.get("DB_USER") or db_user).strip()
                db_password = (remote_env.get(f"{db.get('env_prefix','')}DB_PASSWORD") or remote_env.get("DB_PASSWORD") or db_password).strip()

            if db_user and db_password:
                fix_dump_footer_local(local_target, db["name"], db_user, db_password)
            else:
                colored_print(f"⚠️ No DB credentials found for '{db['name']}'", "yellow")

            dumped_files.append(local_target)

    else:
        colored_print("🔹 Running local dump...", "blue")
        change_directory(backend_folder)
        if db_configs:
            verify_databases_are_up(db_configs, nb_of_retry=10)
        verify_backend_is_up(back_app_container_name, backend_folder, nb_of_retry=10)

        env_data = local_env or load_env_file(".env")

        for db_config in db_configs:
            if target_db_name and db_config["name"] != target_db_name:
                continue
            db_name = db_config["name"]
            db_container_name = db_config["container_name"]
            env_prefix = db_config.get("env_prefix", "")
            db_user = (env_data.get(f"{env_prefix}DB_USER") or env_data.get("DB_USER")).strip()
            db_password = (env_data.get(f"{env_prefix}DB_PASSWORD") or env_data.get("DB_PASSWORD")).strip()
            root_pw = env_data.get(f"{env_prefix}MYSQL_ROOT_PASSWORD") or env_data.get("MYSQL_ROOT_PASSWORD")

            if not db_user or not db_password:
                colored_print(f"❌ db_user or db_password not set for {db_name}", "red")
                continue

            dump_file_name = f"database_dump_px_{db_name}_{today}.sql"
            dump_dir = os.path.dirname(dump_file_name)
            if dump_dir:
                os.makedirs(dump_dir, exist_ok=True)

            try:
                header = f"CREATE DATABASE IF NOT EXISTS `{db_name}`;\nUSE `{db_name}`;\n\n"
                footer = (
                    f"CREATE USER '{_sql_escape_single_quote(db_user)}'@'%' IDENTIFIED BY '{_sql_escape_single_quote(db_password)}';\n"
                    f"GRANT ALL PRIVILEGES ON `{db_name}`.* TO '{_sql_escape_single_quote(db_user)}'@'%';\n"
                    f"FLUSH PRIVILEGES;\n"
                )

                colored_print(f"🌍 Current working directory: {os.getcwd()}", "blue")
                colored_print(f"📄 Will create dump at: {dump_file_name}", "blue")

                dump_proc = subprocess.run(
                    ["docker", "exec", "-i", db_container_name,
                     "mysqldump", "-uroot", f"-p{root_pw}",
                     "--databases", db_name,
                     "--routines",
                     "--triggers",
                     "--single-transaction"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )

                if dump_proc.returncode != 0:
                    colored_print(f"❌ Dump failed for '{db_name}': {dump_proc.stderr.strip()}", "red")
                    continue

                if not dump_proc.stdout.strip():
                    colored_print(f"⚠️ Dump for '{db_name}' is empty!", "yellow")

                with open(dump_file_name, "w", encoding="utf-8") as f:
                    f.write(header)
                    f.write(dump_proc.stdout)
                    f.write("\n" + footer)

                colored_print(f"✅ Full dump created for '{db_name}'", "green")
                dumped_files.append(dump_file_name)

            except Exception as ex:
                colored_print(f"❌ Unexpected error for '{db_name}': {ex}", "red")

    # --- Update configs ---
    db_configs_to_update = [d for d in db_configs if not target_db_name or d["name"] == target_db_name]
    current_dir = os.getcwd()
    base_dir = current_dir if current_dir.endswith("backend") else os.path.join(current_dir, "backend")
    launch_config_path = os.path.abspath(os.path.join(base_dir, "../launch_config.json"))
    leak_config_path = os.path.abspath(os.path.join(base_dir, "scripts/leak_checker/config.json"))

    # Mettre à jour launch_config.json
    for db_config in db_configs_to_update:
        update_json_config(
            launch_config_path,
            ["verification_settings", "databases"],
            today,
            mode="change",
            db_name=db_config["name"]
        )

    # Supprimer le dossier du chemin pour leak_config_path
    dumped_files_basename = [os.path.basename(f) for f in dumped_files]

    update_json_config(leak_config_path, ["ignore_files"], dumped_files_basename, mode="update")
    colored_print("✅ Dump process completed successfully!", "green")
