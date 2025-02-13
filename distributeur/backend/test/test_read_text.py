
import pytest

# Test case for a successful text reading
@pytest.mark.order(2) # LOX n°2
def test_read_text_success(client, mocker):
    # Simulate the command output with a successful text read
    mock_result = mocker.Mock()
    mock_result.returncode = 0  # Return code 0 indicates success
    mock_result.stdout = "Read text successfully"
    mock_result.stderr = ""

    # Mock the subprocess.run function to return the simulated result
    mocker.patch('subprocess.run', return_value=mock_result)

    # Perform a POST request to the /read_text route
    response = client.post('/read_text')

    # Check that the response status code is 200 and that the message is correct
    assert response.status_code == 200
    data = response.get_json()
    assert data['message'] == "Text read successfully"
    assert data['output'] == "Read text successfully"


# Test case for a script failure while reading text
@pytest.mark.order(2) # LOX n°2
def test_read_text_script_failure(client, mocker):
    # Simulate the command output with an error during the text read
    mock_result = mocker.Mock()
    mock_result.returncode = 1  # Return code 1 indicates failure
    mock_result.stdout = ""
    mock_result.stderr = "Error occurred while reading the image"

    # Mock the subprocess.run function to return the simulated result
    mocker.patch('subprocess.run', return_value=mock_result)

    # Perform a POST request to the /read_text route
    response = client.post('/read_text')

    # Check that the response status code is 500 and the error message is correct
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Error occurred while reading the image"


# Test case for handling an exception during the command execution
@pytest.mark.order(2) # LOX n°2
def test_read_text_exception(client, mocker):
    # Simulate an exception during the execution of the command
    mocker.patch('subprocess.run', side_effect=Exception("Unexpected error"))

    # Perform a POST request to the /read_text route
    response = client.post('/read_text')

    # Check that the response status code is 500 and the exception message is returned
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Unexpected error"
