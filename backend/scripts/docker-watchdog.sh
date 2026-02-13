#!/bin/bash

# Temps entre chaque vérification (en secondes)
INTERVAL=30

# Liste des conteneurs à surveiller
CONTAINERS=(
  "distributeur-backend-app"
  "app-backend-db"
  "distributeur-backend-db"
)

while true; do
  for CONTAINER in "${CONTAINERS[@]}"; do
    STATUS=$(docker inspect -f '{{.State.Status}}' "$CONTAINER" 2>/dev/null)

    if [ "$STATUS" != "running" ]; then
      echo "$(date) - $CONTAINER est DOWN (status=$STATUS) → restart"
      docker restart "$CONTAINER"
    fi
  done

  sleep $INTERVAL
done
