
import os
import re
from helpers.colored_print import colored_print

def verify_db_dump(dump_folder, db_name, expected_date):
    """
    Objectif: Vérifie la présence du fichier dump pour une base donnée et liste les autres dumps existants.

    Parameters:
        - dump_folder: dossier contenant les dumps (str)
        - db_name: nom de la base pour laquelle vérifier le dump (str)
        - expected_date: date attendue du dump au format 'DD_MM_YYYY' (str)

    Return Value:
        - None
    """
    colored_print(f"Verifying database dump for '{db_name}'...", "blue")

    if not expected_date or expected_date.strip() == "":
        colored_print(f"No dump date provided for '{db_name}', skipping verification.", "yellow")
        return

    expected_file_name = f"database_dump_px_{db_name}_{expected_date}.sql"
    dump_file_path = os.path.join(dump_folder, expected_file_name)

    # Vérification du dossier
    if not os.path.exists(dump_folder):
        colored_print(f"The dump folder '{dump_folder}' does not exist!", "red")
        return
    if not os.path.isdir(dump_folder):
        colored_print(f"The path '{dump_folder}' is not a directory!", "red")
        return

    # Vérification du fichier attendu
    if os.path.exists(dump_file_path):
        colored_print(f"Correct database dump '{expected_file_name}' is present!", "green")
    else:
        colored_print(f"The expected dump file '{expected_file_name}' is missing!", "yellow")

    # Lister les autres dumps pour **la même base**
    try:
        other_dumps = [
            f for f in os.listdir(dump_folder)
            if re.match(rf"database_dump_px_{db_name}_\d{{2}}_\d{{2}}_\d{{4}}\.sql", f)
            and f != expected_file_name
        ]
        if other_dumps:
            colored_print(f"Other dump files for '{db_name}' found: {', '.join(other_dumps)}", "yellow")
    except Exception as e:
        colored_print(f"Error listing dump files: {e}", "red")
