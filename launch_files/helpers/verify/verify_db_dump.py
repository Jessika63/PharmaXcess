
import os
import re
from colored_print import colored_print


def verify_db_dump(dump_folder, expected_date, expected_dumps=None):
    """
    Objectif: Verifies the presence of the expected database dump file in the
    specified folder and checks for other unexpected dump files.

    Parameters:
        - dump_folder: Path to the directory containing database dump files. (String)
        - expected_date: Expected date of the database dump file in 'DD_MM_YYYY' format. (String)
        - expected_dumps: List of all valid dump filenames (List of Strings)

    Return Value:
        - None: This function does not return a value but prints verification
          results and warnings. (NoneType)
    """
    colored_print("Verifying database dump file", "blue")

    if not expected_date or expected_date.strip() == "":
        colored_print("No expected dump date provided.", "yellow")
        return

    # Construct the expected filename
    expected_file_pattern = f"database_dump_px_{expected_date}.sql"
    dump_file_path = os.path.join(dump_folder, expected_file_pattern)

    # Ensure folder exists and is valid
    if not os.path.exists(dump_folder):
        colored_print(f"The dump folder '{dump_folder}' does not exist!", "red")
        return
    if not os.path.isdir(dump_folder):
        colored_print(f"The path '{dump_folder}' is not a directory!", "red")
        return

    # Check for the expected dump file
    try:
        if not os.path.exists(dump_file_path):
            colored_print(f"The expected dump file '{expected_file_pattern}' is missing!", "yellow")
        else:
            colored_print("Correct database dump file is present!", "green")
    except PermissionError:
        colored_print(f"Permission denied when accessing '{dump_file_path}'!", "red")
        return
    except Exception as e:
        colored_print(f"Unexpected error when checking dump file: {e}", "red")
        return

    # List and warn about truly unexpected dumps
    try:
        all_dumps = [
            f for f in os.listdir(dump_folder)
            if re.match(r"database_dump_px_\d{2}_\d{2}_\d{4}\.sql", f)
        ]

        if expected_dumps is None:
            expected_dumps = [expected_file_pattern]

        unexpected_dumps = [f for f in all_dumps if f not in expected_dumps]

        if unexpected_dumps:
            colored_print(f"Unexpected dump files found: {', '.join(unexpected_dumps)}", "yellow")
    except Exception as e:
        colored_print(f"Error listing dump files: {e}", "red")
