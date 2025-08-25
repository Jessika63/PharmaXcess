
import pymysql
from dotenv import load_dotenv
import os

# Load environment variables from the .env file
load_dotenv()

# Retrieve database connection details from environment variables
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')

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
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
    )
