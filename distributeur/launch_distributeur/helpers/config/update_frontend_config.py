
import os
from colored_print import colored_print

def update_frontend_config(location):
    """
    Objective: Updates the frontend configuration file `config.js` to switch the default location  (Epitech_Paris or Epitech_Lyon) based on the given parameter.

    Parameters:
        - location: The location to set in the configuration. Must be either 'paris' or 'lyon'. (String)

    Return Value:
        - None: This function does not return a value but prints colored status messages. If the `config.js` file is not found, the function stops after listing the files in the current working directory. (NoneType)
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

    with open(config_path, 'r') as file:
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

    with open(config_path, 'w') as file:
        file.write(content)

    colored_print(f"Configuration updated for location: {location}", "green")
