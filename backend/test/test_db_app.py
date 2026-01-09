import pytest
import db_app
from unittest.mock import patch, MagicMock

def test_get_connection(mocker):
    """
    Objectif: Test that get_connection calls pymysql.connect with correct parameters from env.
    """
    # Mock env vars
    mocker.patch.dict('os.environ', {
        'APP_DB_HOST': 'localhost',
        'APP_DB_USER': 'test_user',
        'APP_DB_PASSWORD': 'test_password',
        'APP_DB_NAME': 'test_db'
    })
    
    # Reload module to pick up env vars if they are read at module level?
    # db_app reads them at module level: APP_DB_HOST = os.getenv(...)
    # So we need to patch the module level variables in db_app
    mocker.patch('db_app.APP_DB_HOST', 'localhost')
    mocker.patch('db_app.APP_DB_USER', 'test_user')
    mocker.patch('db_app.APP_DB_PASSWORD', 'test_password')
    mocker.patch('db_app.APP_DB_NAME', 'test_db')
    
    mock_connect = mocker.patch('db_app.pymysql.connect')
    
    db_app.get_connection()
    
    mock_connect.assert_called_once_with(
        host='localhost',
        user='test_user',
        password='test_password',
        database='test_db',
        cursorclass=db_app.pymysql.cursors.DictCursor
    )
