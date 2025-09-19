import pymysql
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Retrieve database connection details from environment variables
DOCTORS_DB_HOST = os.getenv('DOCTORS_DB_HOST')
DOCTORS_DB_USER = os.getenv('DOCTORS_DB_USER')
DOCTORS_DB_PASSWORD = os.getenv('DOCTORS_DB_PASSWORD')
DOCTORS_DB_NAME = os.getenv('DOCTORS_DB_NAME')

# Function to establish a connection to the database
def get_connection():
    """
    Objectif: Establish and return a connection to the MySQL database using predefined credentials.

    Parameters:
        - None

    Return Value:
        - connection: A live database connection object for executing queries. (pymysql.connections.Connection)
    """
    # Return the connection object using the provided database credentials
    return pymysql.connect(
        host=DOCTORS_DB_HOST,
        user=DOCTORS_DB_USER,
        password=DOCTORS_DB_PASSWORD,
        database=DOCTORS_DB_NAME,
    )
