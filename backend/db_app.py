
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
        host=APP_DB_HOST,
        user=APP_DB_USER,
        password=APP_DB_PASSWORD,
        database=APP_DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )
