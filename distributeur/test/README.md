
# How to write a test

Tests help validate that each route works as expected. To add a test to the application, follow these steps:

## Step 1: Create a test file

In the `test/` directory, create a test file for the corresponding route. If you're testing the `update_doctor` route, name the file `test_update_doctor.py`.

## Step 2: Import necessary modules

Make sure to import `pytest` and the Flask test client:

```python
import pytest
from app import app
```

## Step 3: Write a test for the route

Use the appropriate method (client.get(), client.post(), etc.) to test the route. For example, to test updating a doctor:

```python
def test_update_doctor_success(client):
    response = client.put('/update_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'frpp': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    })
    assert response.status_code == 200
    assert b'Doctor updated successfully' in response.data
```

## Step 4: Add tests for error cases

Also, test scenarios where the data is incorrect or fields are missing:

```python
def test_update_doctor_missing_field(client):
    response = client.put('/update_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General'
    })
    assert response.status_code == 400
    assert b'Missing frpp field' in response.data
```

## Step 5: Run the tests

To run the tests with Docker, use the following command:

```bash
docker-compose run test
```
