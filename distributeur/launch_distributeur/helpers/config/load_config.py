
import json
import os

# Function to load configuration
def load_config():
    """
    Load a JSON configuration file from the given path.

    :return: Parsed configuration as a dictionary
    """

    # Default configuration file path relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(script_dir, "../../../launch_config.json")

    from colored_print import colored_print # Importing here to avoid circular imports

    if not os.path.exists(config_path):
        file_name = os.path.basename(config_path)  # Extract just the file name
        colored_print(f"Configuration file '{file_name}' is missing !", "red")

    with open(config_path, "r") as file:
        try:
            config = json.load(file)
        except json.JSONDecodeError as e:
            colored_print(f"Failed to parse configuration file: {e}", "red")

    return config
