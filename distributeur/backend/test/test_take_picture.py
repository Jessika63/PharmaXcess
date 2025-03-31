
import pytest

# Test case for successfully taking a picture
@pytest.mark.order(1) # LOX n°2
def test_take_picture_success(client, mocker):
    # Simulate a successful picture capture by patching subprocess.run
    mocker.patch('subprocess.run', return_value=mocker.Mock(returncode=0, stdout='Picture taken successfully'))

    # Perform a POST request to the /take_picture route
    response = client.post('/take_picture')

    # Check that the response status code is 200 and the success message is in the response
    assert response.status_code == 200
    assert b'Picture taken successfully' in response.data


# Test case for a script error when trying to take a picture
@pytest.mark.order(1) # LOX n°2
def test_take_picture_script_error(client, mocker):
    # Simulate a script error by patching subprocess.run to return a non-zero returncode and error message
    mocker.patch('subprocess.run', return_value=mocker.Mock(returncode=1, stderr='Camera error'))

    # Perform a POST request to the /take_picture route
    response = client.post('/take_picture')

    # Check that the response status code is 500 and the error message is in the response
    assert response.status_code == 500
    assert b'Camera error' in response.data


# Test case for handling unexpected exceptions when trying to take a picture
@pytest.mark.order(1) # LOX n°2
def test_take_picture_unexpected_exception(client, mocker):
    # Simulate an unexpected exception during the execution of the script
    mocker.patch('subprocess.run', side_effect=Exception('Unexpected error'))

    # Perform a POST request to the /take_picture route
    response = client.post('/take_picture')

    # Check that the response status code is 500 and the unexpected error message is in the response
    assert response.status_code == 500
    assert b'Unexpected error' in response.data
