
#!/bin/bash

# Détecter l'OS
OS=$(uname -s)
echo "Detected OS: $OS"

# Vérifier si le flag --accept-all-change est présent
ACCEPT_ALL=false
for arg in "$@"; do
    if [ "$arg" == "--accept-all-change" ]; then
        ACCEPT_ALL=true
    fi
done

# Fonction pour demander confirmation
ask_user() {
    local message="$1"
    if [ "$ACCEPT_ALL" = true ]; then
        return 0
    fi
    read -p "$message [y/N]: " response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

# Fonction pour installer un paquet selon l'OS
install_package() {
    local package="$1"
    if [[ "$OS" == "Linux" ]]; then
        if command -v apt &>/dev/null; then
            sudo apt update && sudo apt install -y "$package"
        elif command -v dnf &>/dev/null; then
            sudo dnf install -y "$package"
        fi
    elif [[ "$OS" == "Darwin" ]]; then
        brew install "$package"
    elif [[ "$OS" =~ MINGW.* || "$OS" =~ CYGWIN.* ]]; then
        winget install --silent "$package"
    fi
}

# Fonction de vérification et installation
check_and_install() {
    local name="$1"
    local command="$2"
    local install_cmd="$3"
    local install_version="$4"
    local version_pattern="$5"

    if command -v "$command" &>/dev/null; then
        local CURRENT_VERSION=$("$command" --version | grep -oE "$version_pattern" | head -n 1)
        echo "$name is already installed: $CURRENT_VERSION"

        if [[ "$CURRENT_VERSION" == "$install_version" ]]; then
            echo "$name is up to date."
            return
        fi

        if ask_user "Do you want to install $name version $install_version?"; then
            echo "Installing $name version $install_version..."
            eval "$install_cmd"
            local NEW_VERSION=$("$command" --version | grep -oE "$version_pattern" | head -n 1)
            echo "Updated $name version: $NEW_VERSION"
        fi
    else
        echo "No version of $name is installed."
        if ask_user "Do you want to install $name version $install_version?"; then
            echo "Installing $name version $install_version..."
            eval "$install_cmd"
            echo "$name version $install_version has been installed."
        fi
    fi
}

# Versions cibles
PYTHON_VERSION="3.12.9"
PIP_VERSION="24.3.1"
DOCKER_VERSION="27.2.0"
DOCKER_COMPOSE_VERSION="v2.29.2"

# Installation des programmes
check_and_install "Python" "python" "install_package python3" "$PYTHON_VERSION" "([0-9]+\.[0-9]+\.[0-9]+)"
check_and_install "pip" "pip" "python -m ensurepip --default-pip" "$PIP_VERSION" "([0-9]+\.[0-9]+\.[0-9]+)"
check_and_install "Docker" "docker" "install_package docker" "$DOCKER_VERSION" "([0-9]+\.[0-9]+\.[0-9]+)"
check_and_install "Docker Compose" "docker-compose" "install_package docker-compose" "$DOCKER_COMPOSE_VERSION" "v[0-9]+\.[0-9]+\.[0-9]+"

echo "Installation process complete."
