
#!/bin/bash

# Check if pre-commit is installed
if ! command -v pre-commit &> /dev/null
then
    echo "Pre-commit not found, installing..."
    pip install pre-commit
fi

# Install pre-commit hooks
pre-commit install
