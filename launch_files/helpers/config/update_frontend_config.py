
import os
from colored_print import colored_print

def update_frontend_config(location):
    """
    Objective: Updates the frontend configuration file `config.js` to switch the default location
    (Epitech_Paris or Epitech_Lyon) based on the given parameter.
    Parameters:
        - location: 'paris' or 'lyon'
    """

    current_dir = os.getcwd()
    colored_print(f"Current directory: {current_dir}", "blue")

    config_path = os.path.join(current_dir, 'src', 'config.js')
    colored_print(f"Looking for config file at: {config_path}", "blue")

    if not os.path.exists(config_path):
        colored_print(f"Config file not found at: {config_path}", "red")
        files = os.listdir(current_dir)
        colored_print(f"Files in current directory: {files}", "blue")
        return

    try:
        with open(config_path, 'r', encoding='utf-8') as file:
            content = file.read()
    except UnicodeDecodeError:
        colored_print("⚠️ Could not decode config.js with UTF-8. Trying cp1252...", "yellow")
        with open(config_path, 'r', encoding='cp1252') as file:
            content = file.read()

    if location == 'lyon':
        content = content.replace(
            'Default_Location: Epitech_Paris,',
            'Default_Location: Epitech_Lyon,'
        )
    else:
        content = content.replace(
            'Default_Location: Epitech_Lyon,',
            'Default_Location: Epitech_Paris,'
        )

    with open(config_path, 'w', encoding='utf-8') as file:
        file.write(content)

    colored_print(f"Configuration updated for location: {location}", "green")
