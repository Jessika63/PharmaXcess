
import os
import json

from helpers.colored_print import colored_print

def update_json_config(config_relative_path, key_path, value, mode="change"):
    """
    Objectif: Updates a JSON configuration file by modifying a value at a specified nested key path, with options for direct replacement or conditional list updates.

    Parameters:
        - config_relative_path: Relative path to the JSON configuration file from the script's directory. (String)
        - key_path: List of keys representing the nested path to the target value. (List of Strings)
        - value: New value to set at the specified key path. (Any JSON-serializable type)
        - mode: Operation mode - "change" for direct value replacement, "update" for conditional list merging. Defaults to "change". (String)

    Return Value:
        - None: This function does not return a value but may print status/error messages and write to the configuration file.
    """

    # Locate the configuration file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, config_relative_path)

    # Check if the configuration file exists
    if not os.path.exists(config_path):
        file_name = os.path.basename(config_path)
        colored_print(f"Configuration file '{file_name}' is missing!", "red")
        return

    # Load and update the JSON configuration file
    try:
        with open(config_path, "r") as file:
            config = json.load(file)

        # Navigate to the correct key and update its value
        temp = config
        for key in key_path[:-1]:
            if key not in temp:
                colored_print(f"Key '{key}' not found in configuration!", "red")
                return
            temp = temp[key]

        if mode == "change":
            # Replace the value directly (current behavior)
            temp[key_path[-1]] = value
        elif mode == "update":
            # Update the value conditionally (for config.json)
            if isinstance(temp[key_path[-1]], list) and isinstance(value, list):
                # Remove any item that starts with the first 38 characters of the new value
                temp[key_path[-1]] = [
                    item for item in temp[key_path[-1]]
                    if not item.startswith(value[0][:38])  # Check the first 38 characters
                ]
                # Merge lists without duplicates, keeping order
                for item in value:
                    if item not in temp[key_path[-1]]:
                        temp[key_path[-1]].append(item)
            else:
                temp[key_path[-1]] = value
    except json.JSONDecodeError as e:
        colored_print(f"Failed to parse configuration file: {e}", "red")
        return

    # Write the updated JSON configuration file with a blank line before and after
    with open(config_path, "w") as file:
        file.write("\n")  # Add a blank line before JSON data
        json.dump(config, file, indent=4)
        file.write("\n")  # Add a blank line after JSON data

    colored_print(f"{config_relative_path} updated successfully!", "green")
