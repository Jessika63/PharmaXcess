import pytest

# Test case for a successful text reading
@pytest.mark.order(2) # LOX n°2
def test_read_text_success(client, mocker):
    """
    Test case for a successful text reading.
    """
    # Simulate the command output with a successful text read
    mock_result = mocker.Mock()
    mock_result.returncode = 0  # Return code 0 indicates success
    mock_result.stdout = "Read text successfully"
    mock_result.stderr = ""

    # Mock the subprocess.run function to return the simulated result
    mocker.patch('subprocess.run', return_value=mock_result)

    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "P"
    }
    # Perform a POST request to the /extractText route
    response = client.post('/extractText', json=json_data)

    # Check that the response status code is 200 and that the message is correct
    assert response.status_code == 200
    data = response.get_json()
    assert data['output'] == "Read text successfully"


# Test case for a script failure while reading text
@pytest.mark.order(2) # LOX n°2
def test_read_text_script_failure(client, mocker):
    """
    Test case for a script failure while reading text.
    """
    # Simulate the command output with an error during the text read
    mock_result = mocker.Mock()
    mock_result.returncode = 1  # Return code 1 indicates failure
    mock_result.stdout = ""
    mock_result.stderr = "Error occurred while reading the image"

    # Mock the subprocess.run function to return the simulated result
    mocker.patch('subprocess.run', return_value=mock_result)

    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "P"
    }
    # Perform a POST request to the /extractText route
    response = client.post('/extractText', json=json_data)

    # Check that the response status code is 500 and the error message is correct
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Error occurred while reading the image"


# Test case for handling an exception during the command execution
@pytest.mark.order(2) # LOX n°2
def test_read_text_exception(client, mocker):
    """
    Test case for handling an exception during the command execution.
    """
    # Simulate an exception during the execution of the command
    mocker.patch('subprocess.run', side_effect=Exception("Unexpected error"))

    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "P"
    }
    # Perform a POST request to the /extractText route
    response = client.post('/extractText', json=json_data)

    # Check that the response status code is 500 and the exception message is returned
    assert response.status_code == 500
    data = response.get_json()
    assert data['error'] == "Unexpected error"

@pytest.mark.order(2) # LOX n°2
def test_read_text_missing_fields(client):
    """
    Test case for missing required fields in the request.
    """
    # Missing base64_image
    json_data = {"type": "P"}
    response = client.post('/extractText', json=json_data)
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == 'base64_image and type are required'

    # Missing type
    json_data = {"base64_image": "data:image/jpeg;base64,aGVsbG8="}
    response = client.post('/extractText', json=json_data)
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == 'base64_image and type are required'

@pytest.mark.order(2) # LOX n°2
def test_read_text_invalid_doc_type(client):
    """
    Test case for invalid document type in the request.
    """
    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "X"
    }
    response = client.post('/extractText', json=json_data)
    assert response.status_code == 400
    data = response.get_json()
    assert data['error'] == 'Invalid document type'

@pytest.mark.order(2) # LOX n°2
def test_read_text_non_json_stdout(client, mocker):
    """
    Test case for non-JSON stdout from the subprocess.
    """
    # Simulate the command output with non-JSON stdout
    mock_result = mocker.Mock()
    mock_result.returncode = 0
    mock_result.stdout = "This is not JSON!"
    mock_result.stderr = ""
    mocker.patch('subprocess.run', return_value=mock_result)
    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "P"
    }
    response = client.post('/extractText', json=json_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data['output'] == "This is not JSON!"

@pytest.mark.order(2) # LOX n°2
def test_read_text_json_stdout(client, mocker):
    """
    Test case for valid JSON stdout from the subprocess.
    """
    # Simulate the command output with valid JSON stdout
    mock_result = mocker.Mock()
    mock_result.returncode = 0
    mock_result.stdout = '{"foo": "bar"}'
    mock_result.stderr = ""
    mocker.patch('subprocess.run', return_value=mock_result)
    json_data = {
        "base64_image": "data:image/jpeg;base64,aGVsbG8=",
        "type": "P"
    }
    response = client.post('/extractText', json=json_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data['output'] == {"foo": "bar"}
