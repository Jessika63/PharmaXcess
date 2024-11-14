
import pytest

@pytest.mark.order(1) # LOX n°2
def test_take_picture_success(client, mocker):
    # Simuler une capture d'image réussie
    mocker.patch('subprocess.run', return_value=mocker.Mock(returncode=0, stdout='Picture taken successfully'))

    response = client.post('/take_picture')
    assert response.status_code == 200
    assert b'Picture taken successfully' in response.data

@pytest.mark.order(1) # LOX n°2
def test_take_picture_script_error(client, mocker):
    # Simuler une erreur lors de l'exécution du script
    mocker.patch('subprocess.run', return_value=mocker.Mock(returncode=1, stderr='Camera error'))

    response = client.post('/take_picture')
    assert response.status_code == 500
    assert b'Camera error' in response.data

@pytest.mark.order(1) # LOX n°2
def test_take_picture_unexpected_exception(client, mocker):
    # Simuler une exception inattendue lors de l'exécution du script
    mocker.patch('subprocess.run', side_effect=Exception('Unexpected error'))

    response = client.post('/take_picture')
    assert response.status_code == 500
    assert b'Unexpected error' in response.data
