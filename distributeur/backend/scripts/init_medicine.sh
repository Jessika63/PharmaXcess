#!/bin/bash

# Check if the file already exists in the volume
if [ ! -f /data/medicine_available.json ]; then
    echo "Initializing medicine data file in Docker volume..."

    # Copy from the application directory (where the file was copied by COPY . /app)
    cp /app/medicine_available.json /data/

    echo "Medicine data file initialized in Docker volume"
    else
    echo "Using existing medicine data file in Docker volume"
    fi

# Run the main command
exec "$@"
