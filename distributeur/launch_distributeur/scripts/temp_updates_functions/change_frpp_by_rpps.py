
def change_frpp_by_rpps():
    """
    Function to rename the column 'frpp' to 'rpps' in the specified table.
    """

    return """
    ALTER TABLE doctors
    CHANGE frpp_code rpps_code VARCHAR(255) NOT NULL;
    """
