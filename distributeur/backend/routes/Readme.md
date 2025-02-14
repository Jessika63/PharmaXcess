
# Routes explanation

## How to write a route

To add a new route in the Flask application, follow these steps:

### Step 1: Create a route file

In the `routes/` directory, create a Python file for your new route. As a convention, name the file according to the function of the route. For example, if you're adding a feature to update a doctor, you can create a file named `update_doctor.py`.

### Step 2: Import necessary modules

Each Flask route must have at least the following imports:

```python
from flask import Blueprint, request, jsonify
from db import get_db  # Make sure to import the DB connection or function
```

### Step 3: Declare the Blueprint

The Blueprint helps to modularize routes. Create a blueprint in your route file like this:

```python
update_doctor_bp = Blueprint('update_doctor', __name__)
```

### Step 4: Define the route

Use the @Blueprint.route() decorator to define the route, and implement the logic: Make sure to add a clear description to the route.

```python
@update_doctor_bp.route('/update_doctor', methods=['PUT'])
def update_doctor():
    """
    [Description]

    [Parameters]

    [Returns]
    """
    data = request.get_json()
    # Validate and process data
    # Update the database using get_db()
    return jsonify({"message": "Doctor updated successfully"}), 200
```

### Step 5: Register the route in app.py

To make Flask recognize your new route, register the Blueprint in the app.py file:

```python
Copier le code
from routes.update_doctor import update_doctor_bp

app.register_blueprint(update_doctor_bp)
```

### Step 6: Test the route

Follow this [Readme](../test/README.md)

## How to launch the routes

To get all information about the dependencies, the launching and more please refers to [this documentation](../README.md)
