
import sys
import os
import pytest

# Ajoute le répertoire de l'application au chemin Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client
