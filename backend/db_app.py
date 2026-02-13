
import pymysql
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Retrieve database connection details from environment variables
APP_DB_HOST = os.getenv('APP_DB_HOST')
APP_DB_USER = os.getenv('APP_DB_USER')
APP_DB_PASSWORD = os.getenv('APP_DB_PASSWORD')
APP_DB_NAME = os.getenv('APP_DB_NAME')

# Function to establish a connection to the database
def get_app_connection():
    """
    Objectif: Establish and return a connection to the MySQL database using predefined credentials.

    Parameters:
        - None

    Return Value:
        - connection: A live database connection object for executing queries. (pymysql.connections.Connection)
    """
    # Return the connection object using the provided database credentials.
    # Use reasonable timeouts and UTF-8 charset. If connection fails, retry a couple times.
    attempts = 0
    last_exc = None
    while attempts < 3:
        try:
            conn = pymysql.connect(
                host=APP_DB_HOST,
                user=APP_DB_USER,
                password=APP_DB_PASSWORD,
                database=APP_DB_NAME,
                cursorclass=pymysql.cursors.DictCursor,
                charset='utf8mb4',
                connect_timeout=10,
                read_timeout=60,
                write_timeout=60,
                autocommit=True,
            )
            return conn
        except Exception as e:
            last_exc = e
            attempts += 1
    # If we reach here, raise the last exception to be handled by caller
    raise last_exc
