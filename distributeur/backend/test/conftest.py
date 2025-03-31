
import sys
import os
import pytest

# Add the application directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

import config

@pytest.fixture(scope="session", autouse=True)
def setup_doctors_dicts_and_data_for_tests():
    assert config.global_verification() is True

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client
