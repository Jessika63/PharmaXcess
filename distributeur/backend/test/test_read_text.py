
import pytest

@pytest.mark.order(2) # LOX n°2
def test_read_text_success(client, mocker):
    # Simuler la sortie de la commande avec une lecture réussie
    mock_result = mocker.Mock()
    mock_result.returncode = 0
    mock_result.stdout = "Read text successfully"
    mock_result.stderr = ""

    # Mock la fonction subprocess.run
    mocker.patch('subprocess.run', return_value=mock_result)

    # Effectuer une requête POST à la route /read_text
    response = client.post('/read_text')

    # Vérifier que le statut est bien 200 et que le texte est présent dans la réponse
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == "Text read successfully"
    assert data['output'] == "Read text successfully"

@pytest.mark.order(2) # LOX n°2
def test_read_text_script_failure(client, mocker):
    # Simuler une sortie de commande avec une erreur
    mock_result = mocker.Mock()
    mock_result.returncode = 1
    mock_result.stdout = ""
    mock_result.stderr = "Error occurred while reading the image"

    # Mock la fonction subprocess.run
    mocker.patch('subprocess.run', return_value=mock_result)

    # Effectuer une requête POST à la route /read_text
    response = client.post('/read_text')

    # Vérifier que le statut est bien 500 et que l'erreur est présente dans la réponse
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Error occurred while reading the image"

@pytest.mark.order(2) # LOX n°2
def test_read_text_exception(client, mocker):
    # Simuler une exception lors de l'exécution de la commande
    mocker.patch('subprocess.run', side_effect=Exception("Unexpected error"))

    # Effectuer une requête POST à la route /read_text
    response = client.post('/read_text')

    # Vérifier que le statut est bien 500 et que le message d'erreur est présent dans la réponse
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Unexpected error"
