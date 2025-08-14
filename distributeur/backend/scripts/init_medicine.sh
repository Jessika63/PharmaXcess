#!/bin/bash

# Vérifier si le fichier existe déjà dans le volume
if [ ! -f /data/medicine_available.json ]; then
    echo "Initializing medicine data file in Docker volume..."

    # Copier depuis le répertoire de l'application (là où le fichier a été copié par COPY . /app)
    cp /app/medicine_available.json /data/

    echo "Medicine data file initialized in Docker volume"
    else
    echo "Using existing medicine data file in Docker volume"
    fi

# Exécuter la commande principale
exec "$@"
