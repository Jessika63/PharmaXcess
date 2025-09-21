#!/bin/bash
# ============================================================
# Full Frontend + Backend Deployment (PC -> Raspberry Pi)
# ============================================================

# --- CONFIGURATION ---
RPI_USER="pharmaxcess"                  # Raspberry Pi username
FRONT_PATH="./dispenser_frontend"       # Local path to dispenser frontend
BACK_PATH="./backend"                   # Local path to backend
CONTAINER_NAME="my-frontend"           # Docker container name
DOCKER_PORT=3000                        # Port to access frontend on Raspberry Pi
BACKEND_PORT=5000                        # Backend port on PC

# --- IP DETECTION ---
echo "Detecting Raspberry Pi IP on the local network..."
read -p "Enter the current Raspberry Pi IP: " RPI_IP
PC_BACK_IP=$(hostname -I | awk '{print $1}')
echo "Raspberry IP: $RPI_IP"
echo "PC Backend IP detected: $PC_BACK_IP"

# ============================================================
# 1. Update frontend configuration
# ============================================================

# Update or create .env file
echo "Updating frontend .env file..."
FRONT_ENV="$FRONT_PATH/.env"
echo "REACT_APP_BACKEND_URL=http://$PC_BACK_IP:$BACKEND_PORT" > "$FRONT_ENV"
echo "Frontend .env updated with BACKEND_URL=http://$PC_BACK_IP:$BACKEND_PORT"

# Update config.js with backend URL
CONFIG_JS="$FRONT_PATH/src/config.js"
if [ -f "$CONFIG_JS" ]; then
    sed -i "s|backendUrl: '.*'|backendUrl: 'http://$PC_BACK_IP:$BACKEND_PORT'|g" "$CONFIG_JS"
    echo "Frontend config.js updated"
else
    echo "config.js not found, creating a new one..."
    echo "const config = { backendUrl: 'http://$PC_BACK_IP:$BACKEND_PORT' };" > "$CONFIG_JS"
fi

# ============================================================
# 3. Build the frontend
# ============================================================
echo "Building frontend..."

FRONT_ABS_PATH=$(realpath "$FRONT_PATH")  # Convert to absolute path

# Clean node_modules, package-lock, and cache
echo "Cleaning node_modules, package-lock, and cache..."
sudo rm -rf "$FRONT_ABS_PATH/node_modules" "$FRONT_ABS_PATH/package-lock.json" "$FRONT_ABS_PATH/node_modules/.cache"

# Ensure current user owns the folder
sudo chown -R $(whoami):$(whoami) "$FRONT_ABS_PATH"

# Remove ESLint cache if it exists
rm -f "$FRONT_ABS_PATH/node_modules/.cache/.eslintcache"

# Enter frontend folder
cd "$FRONT_ABS_PATH" || exit

# Install dependencies
npm install --legacy-peer-deps

# Build frontend without ESLint cache
npm run build -- --no-cache || { echo "Frontend build failed"; exit 1; }
cd - || exit

# ============================================================
# 4. Copy frontend build to Raspberry Pi
# ============================================================
echo "Copying build to Raspberry Pi..."
ssh "$RPI_USER@$RPI_IP" "mkdir -p ~/build/dispenser_frontend"
scp -r "$FRONT_PATH/build/"* "$RPI_USER@$RPI_IP:~/build/dispenser_frontend/"

# ============================================================
# 5. Launch Docker container on Raspberry Pi
# ============================================================
echo "Stopping old Docker container..."
ssh "$RPI_USER@$RPI_IP" "
if docker ps -a --format '{{.Names}}' | grep -Eq '^${CONTAINER_NAME}\$'; then
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

echo 'Launching new nginx container...'
docker run -d --name $CONTAINER_NAME -p $DOCKER_PORT:80 \
    -v ~/build/dispenser_frontend:/usr/share/nginx/html:ro \
    nginx
"

echo "Deployment complete!"
echo "Access the frontend at: http://$RPI_IP:$DOCKER_PORT"
