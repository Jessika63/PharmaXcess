
import os
import json
from helpers.colored_print import colored_print


def update_json_config(config_relative_path, key_path, value, mode="change", db_name=None):
    """
    Objective:
    Update a JSON configuration file safely by changing values or updating lists.

    Parameters:
    - config_relative_path (str): Relative path to the JSON configuration file.
    - key_path (List[str]): Sequence of nested keys leading to the target value.
    - value (Any): The new value to set or append depending on the mode.
    - mode (str, optional): Either "change" to replace a value, or "update" to modify lists. Defaults to "change".
    - db_name (str, optional): Specific database name when updating dumps in `launch_config.json`.

    Behavior:
    - mode="change": Replaces the value at the specified key path.
    - mode="update": For lists, removes old database dumps (optionally filtered by db_name) and appends new ones.
    - If the key path or file does not exist, prints an error and exits safely.
    - Writes back the updated JSON with indentation for readability.

    Return Value:
    - None: The function performs in-place updates and prints status messages.
    """

    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, config_relative_path)

    if not os.path.exists(config_path):
        colored_print(f"❌ Configuration file '{os.path.basename(config_path)}' is missing!", "red")
        return

    try:
        with open(config_path, "r") as file:
            config = json.load(file)

        temp = config
        for key in key_path[:-1]:
            if key not in temp:
                colored_print(f"❌ Key '{key}' not found in configuration!", "red")
                return
            temp = temp[key]

        last_key = key_path[-1]

        # --- Cas spécial pour launch_config.json ---
        if last_key == "databases" and isinstance(temp[last_key], list) and db_name:
            found = False
            for db in temp[last_key]:
                if db.get("name") == db_name:
                    db["db_dump_date"] = value
                    found = True
                    break
            if not found:
                colored_print(f"⚠️ Database '{db_name}' not found in configuration!", "yellow")
                return

        else:
            # --- Cas général ---
            if mode == "change":
                temp[last_key] = value

            elif mode == "update":
                if isinstance(temp[last_key], list) and isinstance(value, list):
                    # Supprime seulement les anciens dumps correspondant à db_name si précisé
                    if db_name:
                        temp[last_key] = [
                            item for item in temp[last_key]
                            if not item.startswith(f"database_dump_px_{db_name}_")
                        ]
                    else:
                        # Sinon supprime tous les dumps
                        temp[last_key] = [
                            item for item in temp[last_key]
                            if not item.startswith("database_dump_px_")
                        ]

                    # Ajoute les nouveaux dumps
                    for item in value:
                        if item not in temp[last_key]:
                            temp[last_key].append(item)
                else:
                    temp[last_key] = value

        with open(config_path, "w") as file:
            file.write("\n")
            json.dump(config, file, indent=4)
            file.write("\n")

        colored_print(f"✅ Config file '{os.path.basename(config_path)}' updated successfully!", "green")

    except json.JSONDecodeError as e:
        colored_print(f"❌ Failed to parse configuration file: {e}", "red")
