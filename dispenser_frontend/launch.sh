#!/bin/bash
# ~/launch.sh - Version corrigée

set -euo pipefail

# ==================== CONFIGURATION ====================
PROJECT_DIR="/home/pharmaxcess/dispenser/dispenser_frontend"
FLASK_SCRIPT="scanner_camera.py"
BACKEND_URL="http://57.128.57.96:5000"
NGROK_PORT=5000
LOG_FILE="/tmp/scanner_launch.log"
PID_DIR="/tmp/scanner_pids"
LAN_IP="10.180.55.168"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ==================== FONCTIONS UTILITAIRES ====================
log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}!${NC} $1" | tee -a "$LOG_FILE"
}

# ==================== NOUVELLE FONCTION : VÉRIFIE NPM ====================
check_and_fix_npm() {
    log "Vérification des dépendances npm..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -d "node_modules" ]; then
        warning "node_modules manquant, installation..."
        npm install
        if [ $? -eq 0 ]; then
            success "Dépendances npm installées"
        else
            error "Échec npm install"
            return 1
        fi
    else
        # Vérifie les modules critiques
        local missing_modules=()
        
        if [ ! -d "node_modules/react-router-dom" ]; then
            missing_modules+=("react-router-dom")
        fi
        
        if [ ! -d "node_modules/react" ]; then
            missing_modules+=("react")
        fi
        
        if [ ! -d "node_modules/react-dom" ]; then
            missing_modules+=("react-dom")
        fi
        
        if [ ${#missing_modules[@]} -gt 0 ]; then
            warning "Modules manquants: ${missing_modules[*]}"
            log "Installation des modules manquants..."
            npm install ${missing_modules[*]}
            if [ $? -eq 0 ]; then
                success "Modules manquants installés"
            else
                error "Échec installation modules"
                return 1
            fi
        else
            success "Toutes les dépendances npm sont présentes"
        fi
    fi
    
    return 0
}

# ==================== FONCTIONS EXISTANTES (modifiées) ====================
create_pid_dir() {
    mkdir -p "$PID_DIR"
}

save_pid() {
    local name="$1"
    local pid="$2"
    echo "$pid" > "$PID_DIR/$name.pid"
}

get_pid() {
    local name="$1"
    if [ -f "$PID_DIR/$name.pid" ]; then
        cat "$PID_DIR/$name.pid"
    else
        echo ""
    fi
}

kill_process() {
    local name="$1"
    local pid_file="$PID_DIR/$name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Arrêt de $name (PID: $pid)..."
            kill "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                warning "Forçage l'arrêt de $name..."
                kill -9 "$pid"
            fi
            success "$name arrêté"
        fi
        rm -f "$pid_file"
    fi
}

check_port() {
    local port="$1"
    if ss -tulpn 2>/dev/null | grep -q ":$port "; then
        return 0
    else
        return 1
    fi
}

# ==================== FONCTIONS PRINCIPALES ====================
start_backend() {
    log "Démarrage du backend Flask..."
    
    if check_port 5000; then
        warning "Le port 5000 est déjà utilisé"
        local pid=$(get_pid "flask")
        if [ -n "$pid" ]; then
            warning "Flask semble déjà tourner (PID: $pid)"
            return 0
        fi
    fi
    
    cd "$PROJECT_DIR"
    
    if [ ! -f "$FLASK_SCRIPT" ]; then
        error "Script Flask non trouvé: $FLASK_SCRIPT"
        return 1
    fi
    
    python3 "$FLASK_SCRIPT" > /tmp/flask.log 2>&1 &
    local flask_pid=$!
    
    sleep 3
    
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        save_pid "flask" "$flask_pid"
        success "Backend Flask démarré (PID: $flask_pid)"
        log "Logs: /tmp/flask.log"
    else
        error "Échec du démarrage de Flask"
        kill_process "flask"
        return 1
    fi
}

start_ngrok() {
    log "Démarrage de ngrok..."
    
    if check_port 4040; then
        warning "Ngrok semble déjà tourner (port 4040 utilisé)"
        return 0
    fi
    
    if ! check_port 5000; then
        error "Flask ne semble pas tourner. Démarrez-le d'abord avec --back"
        return 1
    fi
    
    ngrok http $NGROK_PORT > /tmp/ngrok.log 2>&1 &
    local ngrok_pid=$!
    save_pid "ngrok" "$ngrok_pid"
    
    log "Attente du démarrage de ngrok..."
    sleep 8
    
    local ngrok_url=""
    local attempts=0
    local max_attempts=10
    
    while [ $attempts -lt $max_attempts ] && [ -z "$ngrok_url" ]; do
        ngrok_url=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | \
                   jq -r '.tunnels[] | select(.proto == "https") | .public_url' 2>/dev/null || echo "")
        
        if [ -z "$ngrok_url" ]; then
            attempts=$((attempts + 1))
            sleep 2
        fi
    done
    
    if [ -n "$ngrok_url" ]; then
        success "Ngrok démarré (PID: $ngrok_pid)"
        log "URL ngrok: $ngrok_url"
        log "Logs: /tmp/ngrok.log"
        
        send_ngrok_url "$ngrok_url"
        log "Interface ngrok: http://127.0.0.1:4040"
    else
        error "Impossible de récupérer l'URL ngrok"
        return 1
    fi
}

send_ngrok_url() {
    local url="$1"
    log "Envoi de l'URL au serveur backend..."
    
    if [ -z "$BACKEND_URL" ]; then
        warning "BACKEND_URL non configuré, skip envoi"
        return 0
    fi
    
    local attempts=0
    local max_attempts=5
    
    while [ $attempts -lt $max_attempts ]; do
        if curl -s -X POST "$BACKEND_URL/api/pi/update_url" \
            -H "Content-Type: application/json" \
            -d "{\"url\":\"$url\"}" > /dev/null 2>&1; then
            success "URL envoyée avec succès au backend"
            echo "$url" > /tmp/last_ngrok_url.txt
            return 0
        else
            attempts=$((attempts + 1))
            warning "Échec envoi URL (tentative $attempts/$max_attempts)"
            sleep 3
        fi
    done
    
    error "Échec d'envoi de l'URL après $max_attempts tentatives"
    return 1
}

clean_node_modules() {
    log "Nettoyage des node_modules et package-lock.json..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Répertoire projet non trouvé: $PROJECT_DIR"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    kill_process "npm"
    
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        success "node_modules supprimé"
    else
        warning "node_modules non trouvé"
    fi
    
    if [ -f "package-lock.json" ]; then
        rm -f package-lock.json
        success "package-lock.json supprimé"
    else
        warning "package-lock.json non trouvé"
    fi
}

npm_install() {
    log "Installation des dépendances npm..."
    
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        error "package.json non trouvé"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Installation avec legacy-peer-deps pour éviter les conflits
    if npm install --legacy-peer-deps --no-audit --no-fund > /tmp/npm_install.log 2>&1; then
        success "npm install terminé avec succès"
        log "Logs: /tmp/npm_install.log"
    else
        error "Échec de npm install"
        return 1
    fi
}

npm_start() {
    log "Démarrage de l'application React..."
    
    # Vérifie et installe les dépendances d'abord
    if ! check_and_fix_npm; then
        error "Problème avec les dépendances npm"
        return 1
    fi
    
    if check_port 3000; then
        warning "Le port 3000 est déjà utilisé"
        local pid=$(get_pid "npm")
        if [ -n "$pid" ]; then
            warning "React semble déjà tourner (PID: $pid)"
            return 0
        fi
    fi
    
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        error "package.json non trouvé"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    # Démarrer React sur l'IP LAN
    log "Lancement React sur LAN: http://$LAN_IP:3000"
    
    # Crée un .env temporaire
    cat > .env.launch << EOF
HOST=$LAN_IP
PORT=3000
BROWSER=none
FAST_REFRESH=true
EOF
    
    # Exporte les variables
    export HOST="$LAN_IP"
    export PORT=3000
    
    npm start > /tmp/npm_start.log 2>&1 &
    local npm_pid=$!
    save_pid "npm" "$npm_pid"
    
    # Attente plus longue pour React
    log "Attente du démarrage React (15s)..."
    sleep 15
    
    # Vérification avec plusieurs tentatives
    local max_attempts=3
    local attempt=0
    local started=0
    
    while [ $attempt -lt $max_attempts ] && [ $started -eq 0 ]; do
        if curl -s --max-time 5 "http://$LAN_IP:3000" > /dev/null 2>&1; then
            started=1
            success "React démarré (PID: $npm_pid)"
            log "URL React LAN: http://$LAN_IP:3000"
            log "URL React local: http://localhost:3000"
            log "Logs: /tmp/npm_start.log"
            return 0
        else
            attempt=$((attempt + 1))
            if [ $attempt -lt $max_attempts ]; then
                log "Tentative $attempt/$max_attempts échouée, nouvelle tentative dans 5s..."
                sleep 5
            fi
        fi
    done
    
    if [ $started -eq 0 ]; then
        error "Échec du démarrage de React après $max_attempts tentatives"
        log "Dernières lignes des logs React:"
        tail -30 /tmp/npm_start.log
        
        # Vérifie si c'est une erreur de module
        if grep -q "Cannot find module" /tmp/npm_start.log; then
            error "Erreur de module détectée. Tentative de réinstallation..."
            kill_process "npm"
            sleep 2
            clean_node_modules
            npm_install
            log "Redémarrage de React après réinstallation..."
            return 1
        fi
        
        kill_process "npm"
        return 1
    fi
}

# ==================== AUTRES FONCTIONS ====================
show_status() {
    echo -e "\n${BLUE}=== ÉTAT DES SERVICES ===${NC}"
    echo
    
    # Flask
    if check_port 5000; then
        local flask_pid=$(get_pid "flask")
        if [ -n "$flask_pid" ]; then
            echo -e "${GREEN}✓${NC} Backend Flask: EN COURS (PID: $flask_pid)"
            echo "   URL: http://localhost:5000"
        else
            echo -e "${YELLOW}!${NC} Backend Flask: PORT UTILISÉ mais PID inconnu"
        fi
    else
        echo -e "${RED}✗${NC} Backend Flask: ARRÊTÉ"
    fi
    
    # Ngrok
    if check_port 4040; then
        local ngrok_pid=$(get_pid "ngrok")
        if [ -n "$ngrok_pid" ]; then
            echo -e "${GREEN}✓${NC} Ngrok: EN COURS (PID: $ngrok_pid)"
            local ngrok_url=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | \
                            jq -r '.tunnels[0].public_url' 2>/dev/null || echo "Non disponible")
            echo "   URL: $ngrok_url"
            echo "   Interface: http://127.0.0.1:4040"
        else
            echo -e "${YELLOW}!${NC} Ngrok: PORT UTILISÉ mais PID inconnu"
        fi
    else
        echo -e "${RED}✗${NC} Ngrok: ARRÊTÉ"
    fi
    
    # React
    if check_port 3000; then
        local npm_pid=$(get_pid "npm")
        if [ -n "$npm_pid" ]; then
            echo -e "${GREEN}✓${NC} React: EN COURS (PID: $npm_pid)"
            echo "   URL LAN: http://$LAN_IP:3000"
            echo "   URL local: http://localhost:3000"
        else
            echo -e "${YELLOW}!${NC} React: PORT UTILISÉ mais PID inconnu"
        fi
    else
        echo -e "${RED}✗${NC} React: ARRÊTÉ"
    fi
    
    # Dernière URL ngrok
    if [ -f "/tmp/last_ngrok_url.txt" ]; then
        echo -e "\n${BLUE}Dernière URL ngrok envoyée:${NC}"
        cat /tmp/last_ngrok_url.txt
    fi
    
    # Vérification dépendances React
    echo -e "\n${BLUE}Vérification dépendances React:${NC}"
    if [ -d "$PROJECT_DIR/node_modules" ]; then
        if [ -d "$PROJECT_DIR/node_modules/react-router-dom" ]; then
            echo -e "  ${GREEN}✓${NC} react-router-dom: PRÉSENT"
        else
            echo -e "  ${RED}✗${NC} react-router-dom: MANQUANT"
        fi
    else
        echo -e "  ${RED}✗${NC} node_modules: ABSENT"
    fi
    
    echo -e "\n${BLUE}Logs disponibles:${NC}"
    ls -la /tmp/*.log 2>/dev/null | awk '{print "  " $9 " (" $5 " bytes)"}' || echo "  Aucun log"
}

stop_all() {
    log "Arrêt de tous les services..."
    
    kill_process "npm"
    kill_process "ngrok"
    kill_process "flask"
    
    success "Tous les services arrêtés"
}

show_help() {
    cat << EOF

${BLUE}USAGE:${NC}
  ./launch.sh [OPTION]

${BLUE}OPTIONS:${NC}
  ${GREEN}--all${NC}        Tout démarrer (backend, ngrok, React)
  ${GREEN}--back${NC}       Démarrer seulement le backend Flask
  ${GREEN}--ngrok${NC}      Démarrer ngrok et envoyer l'URL au serveur
  ${GREEN}--start${NC}      Démarrer React (npm start)
  ${GREEN}--install${NC}    npm install (sans nettoyage)
  ${GREEN}--down${NC}       Supprimer node_modules et package-lock.json
  ${GREEN}--restart${NC}    --down + npm install + npm start
  ${GREEN}--stop${NC}       Arrêter tous les services
  ${GREEN}--status${NC}     Afficher l'état des services
  ${GREEN}--fix-deps${NC}   Réparer les dépendances npm
  ${GREEN}--check${NC}      Vérifier les dépendances système
  ${GREEN}--help${NC}       Afficher cette aide

${BLUE}EXEMPLES:${NC}
  ./launch.sh --fix-deps     # Réparer les dépendances React
  ./launch.sh --all          # Tout démarrer
  ./launch.sh --restart      # Redémarrer React
  ./launch.sh --status       # Vérifier l'état

${BLUE}CONFIGURATION:${NC}
  Projet: $PROJECT_DIR
  Backend: $BACKEND_URL
  IP LAN: $LAN_IP
  Port Flask: 5000
  Port React: 3000
  Port Ngrok: 4040

EOF
}

# ==================== POINT D'ENTRÉE ====================
main() {
    create_pid_dir
    
    case "${1:-}" in
        --all)
            log "Démarrage complet de tous les services..."
            start_backend
            start_ngrok
            npm_start
            show_status
            ;;
            
        --back)
            log "Démarrage du backend Flask..."
            start_backend
            ;;
            
        --ngrok)
            log "Démarrage de ngrok..."
            start_ngrok
            ;;
            
        --start)
            log "Démarrage de React..."
            npm_start
            ;;
            
        --install)
            log "Installation npm..."
            npm_install
            ;;
            
        --down)
            log "Nettoyage des dépendances Node.js..."
            clean_node_modules
            ;;
            
        --restart)
            log "Redémarrage complet de React..."
            clean_node_modules
            npm_install
            npm_start
            show_status
            ;;
            
        --fix-deps)
            log "Réparation des dépendances npm..."
            clean_node_modules
            npm_install
            check_and_fix_npm
            success "Dépendances réparées"
            ;;
            
        --stop)
            stop_all
            ;;
            
        --status)
            show_status
            ;;
            
        --check)
            check_and_fix_npm
            ;;
            
        --help|-h)
            show_help
            ;;
            
        *)
            error "Option invalide: ${1:-}"
            echo
            show_help
            exit 1
            ;;
    esac
}

# Point d'entrée
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    if [ ! -d "$PROJECT_DIR" ]; then
        error "Répertoire projet non trouvé: $PROJECT_DIR"
        exit 1
    fi
    
    main "$@"
fi