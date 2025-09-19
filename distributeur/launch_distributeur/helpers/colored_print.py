# Function to print with colors
import datetime

def colored_print(message, color):
    """
    Objectif: Prints a colored and prefixed message to the terminal with a timestamp, with optional debug log filtering and error termination.

    Parameters:
        - message: The text content to be displayed. (String)
        - color: The color/severity level of the message ('red', 'yellow', 'green', 'blue', 'violet'). (String)

    Return Value:
        - None: This function does not return a value but may terminate the program with exit code 1 for 'red' messages. (NoneType)
    """
    from config.load_config_file import load_config_file # Importing here to avoid circular imports

    if color == 'blue' and load_config_file()["debug_logs"] == "no":
        return
    colors = {
        "red": "\033[91m",
        "yellow": "\033[93m",
        "green": "\033[92m",
        "blue": "\033[94m",
        "violet": "\033[95m",
        "reset": "\033[0m",
    }

    prefixes = {
        "red": "[ERROR]: ",
        "yellow": "[WARNING]: ",
        "green": "[SUCCESS]: ",
        "blue": "[INFO]: ",
        "violet": "[DEBUG]: ",
    }

    prefix = prefixes.get(color, "")
    color_code = colors.get(color, colors["reset"])
    reset_code = colors["reset"]
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"{color_code}[{timestamp}] {prefix}{message}{reset_code}")

    if color == "red":
        exit(1)
