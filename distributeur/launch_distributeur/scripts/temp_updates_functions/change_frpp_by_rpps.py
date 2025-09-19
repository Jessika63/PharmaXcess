
def change_frpp_by_rpps():
    """
    Objectif: Generates an SQL command to rename the column 'frpp_code' to 'rpps_code' in the 'doctors' table.

    Parameters:
        - None

    Return Value:
        - sql_command: The SQL ALTER TABLE command to perform the column renaming. (String)
    """

    return """
    ALTER TABLE doctors
    CHANGE frpp_code rpps_code VARCHAR(255) NOT NULL;
    """
