
# Function to print with colors
def colored_print(message, color):
    """
    Print a message in the terminal with the specified color and prefix based on the type.

    :param message: The message to display.
    :param color: The color/type of the message ('red', 'yellow', 'green', 'blue').
    """

    from config.load_config_file import load_config_file # Importing here to avoid circular imports

    if color == 'blue' and load_config_file()["debug_logs"] == "no":
        return
    colors = {
        "red": "\033[91m",
        "yellow": "\033[93m",
        "green": "\033[92m",
        "blue": "\033[94m",
        "reset": "\033[0m",
    }

    prefixes = {
        "red": "[ERROR]: ",
        "yellow": "[WARNING]: ",
        "green": "[SUCCESS]: ",
        "blue": "[INFO]: ",
    }

    prefix = prefixes.get(color, "")
    color_code = colors.get(color, colors["reset"])
    reset_code = colors["reset"]

    print(f"{color_code}{prefix}{message}{reset_code}")

    if color == "red":
        exit(1)
