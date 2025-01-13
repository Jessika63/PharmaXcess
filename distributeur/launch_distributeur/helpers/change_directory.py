
import os

from colored_print import colored_print

def change_directory(target_folder):
    """
    Changes the current working directory to the specified folder or its parent folder if it exists.

    Args:
        target_folder (str): Path to the directory to change to.

    Raises:
        SystemExit: Exits the program with an appropriate error message if the operation fails.
    """
    def try_change(dir_path):
        """Helper function to attempt directory change."""
        try:
            if os.path.abspath(os.getcwd()) == os.path.abspath(dir_path):
                colored_print(f"Already in the directory '{dir_path}'.", "yellow")
                return True
            colored_print(f"Trying to change directory to '{dir_path}'...", "blue")
            os.chdir(dir_path)
            return True
        except FileNotFoundError:
            colored_print(
                f"Directory '{dir_path}' not found in the current working directory '{os.getcwd()}'.",
                "yellow"
            )
        except PermissionError:
            colored_print(f"Insufficient permissions to access '{dir_path}'!", "red")
        except NotADirectoryError:
            colored_print(f"'{dir_path}' is not a directory!", "red")
        except OSError as e:
            colored_print(f"OS error when accessing '{dir_path}': {e.strerror} (errno: {e.errno})", "red")
        except Exception as e:
            colored_print(f"Unexpected error when changing directory to '{dir_path}': {e}", "red")
        return False

    # Attempt to change to the target directory
    if try_change(target_folder):
        return

    # If not successful, attempt to change to the parent directory if it exists
    parent_dir = os.path.abspath(os.path.join("..", target_folder))
    if os.path.exists("..") and try_change(parent_dir):
        return

    # If both attempts fail, exit with an error
    colored_print(f"Unable to change to '{target_folder}' or '{parent_dir}'!", "red")
