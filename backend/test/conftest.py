
import sys
import os
import pytest
from unittest.mock import MagicMock

# Mock missing dependencies
sys.modules["cv2"] = MagicMock()
sys.modules["pyzbar"] = MagicMock()
sys.modules["pyzbar.pyzbar"] = MagicMock()

# Set CORS_SECRET_KEY before importing app module
os.environ.setdefault('CORS_SECRET_KEY', 'test_secret_key_default')

# Add the application directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

import config

@pytest.fixture(scope="session", autouse=True)
def setup_doctors_dicts_and_data_for_tests():
    """
    Objectif: Pytest fixture that automatically sets up doctor dictionaries and test data for the entire test session, and verifies the global state is valid.

    Parameters:
        - None

    Return Value:
        - None: This fixture does not return a value but raises an assertion error if global verification fails.
    """
    assert config.global_verification() is True

@pytest.fixture
def client():
    """
    Objectif: Pytest fixture that provides a test client for the Flask application.

    Parameters:
        - None

    Return Value:
        - client: Flask test client instance for making HTTP requests in tests. (FlaskClient)
    """
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def mock_db_connection(mocker):
    """
    Objectif: Mock the database connection globally to prevent actual DB connection attempts.
    """
    mock_conn = mocker.Mock()
    mock_cursor = mocker.Mock()
    mock_conn.cursor.return_value = mock_cursor
    mock_cursor.__enter__ = mocker.Mock(return_value=mock_cursor)
    mock_cursor.__exit__ = mocker.Mock(return_value=None)
    
    # Ensure cursor methods return serializable data (list/dict)
    mock_cursor.fetchall.return_value = []
    mock_cursor.fetchone.return_value = {}
    mock_cursor.lastrowid = 1
    mock_cursor.rowcount = 0
    
    # Mocking pymysql.connect in db_app module
    mocker.patch('db_app.pymysql.connect', return_value=mock_conn)
    return mock_conn
