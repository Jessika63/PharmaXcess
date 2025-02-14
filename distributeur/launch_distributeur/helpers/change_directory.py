
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
            if (
                (os.path.abspath(os.getcwd()) == os.path.abspath(dir_path))
                or
                (os.path.basename(os.path.dirname(os.path.abspath(dir_path))) == dir_path)
            ):
                colored_print(f"Already in the directory '{dir_path}'.", "green")
                return True, None
            colored_print(f"Trying to change directory to '{dir_path}'...", "blue")
            os.chdir(dir_path)
            return True, None
        except FileNotFoundError:
            return (
                False, (
                    f"Directory '{dir_path}' not found in the current working directory '{os.getcwd()}'.",
                    "yellow"
                )
            )
        except PermissionError:
            colored_print(f"Insufficient permissions to access '{dir_path}'!", "red")
        except NotADirectoryError:
            colored_print(f"'{dir_path}' is not a directory!", "red")
        except OSError as e:
            colored_print(f"OS error when accessing '{dir_path}': {e.strerror} (errno: {e.errno})", "red")
        except Exception as e:
            colored_print(f"Unexpected error when changing directory to '{dir_path}': {e}", "red")
        return False, None

    # Attempt to change to the target directory
    (change_result, change_error) = try_change(target_folder)
    if change_result is True:
        return

    # If not successful, attempt to change to the parent directory if it exists
    parent_dir = os.path.abspath(os.path.join("..", target_folder))
    (parent_change_result, parent_change_error) = os.path.exists("..") and try_change(parent_dir)
    if parent_change_result is True:
        return

    # If not successful in any way, exit with an error message
    if change_error is not None:
        (change_message, change_color_message) = change_error
        colored_print(change_message, change_color_message)
    if parent_change_error is not None:
        (parent_change_message, parent_change_color_message) = parent_change_error
        colored_print(parent_change_message, parent_change_color_message)

    # If both attempts fail, exit with an error
    colored_print(f"Unable to change to '{target_folder}' or '{parent_dir}'!", "red")
