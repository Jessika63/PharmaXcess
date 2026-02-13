# Launch

With the **launching script** (`launch.py`), you can launch:

- some **verification** to make sure everything will work.
- the **backend** that also launches the database.
- the **frontend** to access the website.
- the **mobile app** to test on mobile.
- the **backend test** to see if every backend route works.
- an **update** of the database.
- export the database **dump**.
- see **logs** of different parts.
- manage **build and installation** of dependencies.
- manage **deployment** and operations on the remote server.

Or you can also **stop** all containers, remove them, remove all images and volumes.

---

## Prerequisites

You need to install:

- Python: 3.12.8
- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

---

## Launching options

### Verification, Backend, Frontend & Mobile App

To launch the verification, the backend, the frontend and the mobile app at the same time, use this command:

```bash
python launch.py --all
```

### Configurer la position par défaut

Vous pouvez configurer la position par défaut pour les cartes (utilisée quand la géolocalisation n'est pas disponible) avec le flag `--location` :

```bash
# Lancer avec Paris comme position par défaut (défaut)
python launch.py --all --location paris

# Lancer avec Lyon comme position par défaut
python launch.py --all --location lyon

# Ou uniquement le backend avec Lyon
python launch.py --back --location lyon
```

Ce paramètre configure la variable d'environnement `DEFAULT_LOCATION` dans le backend, qui détermine quelle position sera renvoyée par l'API `/get_default_position` lorsqu'aucun paramètre de localisation n'est fourni.

### The verification
**What this command does:**

This command executes a complete startup sequence of the development environment:

1. **Verifications**: Checks that all necessary configuration files (`.env`, certificates, etc.) are present and valid.
2. **Backend (and database)**: Starts Docker containers for the Flask API server and MySQL database. The backend will be accessible on the configured port (usually `5000`).
3. **Frontend**: Starts the Vue.js development server. The web interface will be accessible on `http://localhost:8080` (or the configured port).
4. **Mobile app**: Launches Expo for the React Native application, allowing testing on an emulator or physical device.

**Use case:** This is the recommended command to quickly start the entire development environment.

---

### Verification

To launch the verification, use this command:

```bash
python launch.py --verif
```

**What this command does:**

The verification script analyzes your environment to ensure that:

- Required `.env` files exist and contain the necessary variables.
- SSL/TLS certificates are present if configured.
- Docker dependencies are correctly installed.
- Required ports are available and not used by other applications.
- Configuration files for different services are valid.

**Tip:** It is recommended to always use the `--verif` flag to be sure you have all the files needed to launch everything else.

---

### Backend only

To launch the backend, use this command:

```bash
python launch.py --back
```

**What this command does:**

Launches only the backend services:

- **MySQL Container**: Relational database where all application data is stored.
- **Flask API Container**: REST API server that handles all business logic, authentication, and database interactions.

**Technical information:**

| Service | Default Port | Description |
|---------|-------------|-------------|
| Flask API | 5000 | Application REST endpoints |
| MySQL | 3306 | Relational database |

**Use case:** Useful when you are only developing on the backend or want to test APIs without launching the frontend.

---

### Frontend only

To launch the frontend, use this command:

```bash
python launch.py --front
```

**What this command does:**

Launches the Vue.js development server:

- **Hot-reload**: Code changes are automatically reloaded in the browser.
- **Dev Server**: Vite/Webpack development server with sourcemaps for debugging.
- **API Proxy**: Requests to `/api` are automatically redirected to the backend.

**Prerequisite:** The backend must be started beforehand for the application to work correctly.

**Access:** The interface is accessible on `http://localhost:8080` (or the port configured in the `.env` file).

---

### Backend test

To launch the backend tests, use this command:

```bash
python launch.py --test
```

**What this command does:**

Runs the backend automated test suite:

- **Unit tests**: Verify the correct operation of individual functions and methods.
- **Integration tests**: Verify that different components communicate correctly with each other.
- **API route tests**: Verify that each endpoint responds correctly with the right HTTP codes and response formats.

**Combination example:**

```bash
python launch.py --back --test
```

This command first launches the backend, then runs the tests once the services are started.

**Tip:** Make sure to combine this flag with the `--back` or `--all` flag so that tests run on a working environment.

---

### Update the database

To launch the database update, use this command:

```bash
python launch.py --update UPDATE_FUNCTION
```

Replace UPDATE_FUNCTION with the update function you want to execute.

**What this command does:**

Executes a specific migration or update script on the database:

- **Schema migrations**: Adds, modifies, or removes tables/columns.
- **Data scripts**: Inserts or updates data (seed data, corrections).
- **Custom scripts**: Executes maintenance functions defined in the project.

**Examples of available functions:**

```bash
# Example (actual functions depend on your project)
python launch.py --update migrate_users
python launch.py --update add_new_columns
python launch.py --update seed_training_data
```

**Warning:** Always verify the function before running it on a production environment.

---

### Export dump

To export the database dump, use this command:

```bash
python launch.py --dump
```

**What this command does:**

Creates a complete backup of the MySQL database:

- **Format**: SQL file containing structure and data.
- **Location**: The dump is usually saved in the `backup/` folder or the configured path.
- **Content**: Includes all tables, data, indexes, and constraints.

**Prerequisite:** The backend (and therefore the MySQL container) must be running.

**Combination example:**

```bash
python launch.py --back --dump
```

**Tip:** Regularly perform database dumps, especially before any migration or major update.

---

### Mobile App only

To launch the mobile app only, use this command:

```bash
python launch.py --app
```

**What this command does:**

Launches the Expo development environment for React Native:

- **Metro Bundler**: JavaScript bundling server for the mobile application.
- **QR Code**: Displays a scannable QR code with the Expo Go app on your phone.
- **Emulator**: Allows launching the application on an iOS/Android emulator.

**Testing options:**

| Method | Description |
|--------|-------------|
| Expo Go (mobile) | Scan the QR code with the Expo Go app |
| Android Emulator | Press `a` in the terminal |
| iOS Emulator | Press `i` in the terminal (macOS only) |

**Prerequisite:** The backend must be running and accessible from your network.

---

### Advanced Operations

#### Full Combo

To launch verification, backend, frontend, mobile app and then tests in sequence:

```bash
python launch.py --combo
```

**What this command does:**

Executes a complete sequence including tests:

1. Pre-launch verifications
2. Backend startup
3. Frontend startup
4. Mobile app startup
5. Automated test execution

**Use case:** Ideal for a complete environment check before a deployment or demonstration.

---

#### Restart

To restart the application (stop everything then launch everything):

```bash
python launch.py --restart
```

**What this command does:**

Performs a complete stop and restart cycle:

1. **Stop**: Stops all running Docker containers.
2. **Cleanup**: Removes stopped containers (but keeps images and volumes).
3. **Restart**: Relaunches all services as with `--all`.

**Use case:** Useful after a configuration change or to resolve state issues.

---

### See Logs

To see logs for a specific part or everything:

```bash
python launch.py --see-log every
```

**Available options:**

| Option | Description |
|--------|-------------|
| `back` | Displays backend logs (Flask API + MySQL) |
| `front` | Displays frontend logs (development server) |
| `app` | Displays mobile app logs (Expo) |
| `every` | Displays logs from all services |

**What logs contain:**

- **Backend**: HTTP requests, SQL errors, API debug messages.
- **Frontend**: Compilation errors, Vue.js warnings, HMR messages.
- **Mobile app**: Expo logs, JavaScript errors, React Native events.

**Tip:** Use `--see-log back` to debug API or database issues.

---

### Build & Install Options

You can force rebuild or dependency installation:

| Flag | Description | Use case |
|------|-------------|----------|
| `--no-cache-back` | Build Backend without Docker cache | After modifying Dockerfile or Python dependencies |
| `--no-cache-front` | Build Frontend without Docker cache | After major npm dependency changes |
| `--no-cache-app` | Install mobile app dependencies without cache | To resolve corrupted dependency issues |
| `--install-front` | Install frontend dependencies with npm | After `git pull` or `package.json` modification |
| `--install-app` | Install mobile app dependencies with npm | After `git pull` or `package.json` modification |
| `--build-test` | Build Test Docker images before running | To test with new configuration |
| `--sudo` | Use sudo for npm commands (frontend/app) | On Linux if permission issues occur |
| `--tunnel` | Start Expo in tunnel mode for mobile app | To test on different network (outside LAN) |
| `--origins` | List registered frontend origins | To check CORS configurations |

**Examples:**

```bash
# Full backend rebuild
python launch.py --back --no-cache-back

# Install dependencies after a pull
python launch.py --front --install-front

# Test on external network with tunnel
python launch.py --app --tunnel
```

---

### Server Operations

These commands are used for deployment on the remote server (VM):

| Flag | Description | Details |
|------|-------------|---------|
| `--deploy-back` | Deploy backend to remote server | Transfers files, rebuilds Docker images, and restarts services |
| `--exec-server [files...]` | Transfer and execute Python files on the remote server | Useful for maintenance or update scripts |
| `--clean-server` | Clean Docker and fully update the remote server | Removes unused images/containers and updates system packages |

**Prerequisite:** SSH connection to the server must be configured in the environment files.

**Examples:**

```bash
# Deploy a new version of the backend
python launch.py --deploy-back

# Execute a migration script on the server
python launch.py --exec-server backend/scripts/migration.py

# Clean the server (free disk space)
python launch.py --clean-server
```

---

### Stop everything

To launch the down (stop), use this command:

```bash
python launch.py --down
```

**What this command does:**

Properly stops all application services:

- **Stop containers**: Stops all running Docker containers.
- **Remove containers**: Removes stopped containers to free up space.
- **Data preservation**: Volumes (database data) are **preserved**.

**Warning:** This command does not stop npm processes (frontend/app) if they were started outside of Docker.

---

### Help

For any other help, you can use the help command:

```bash
python launch.py --help
```

Or use the launch script without arguments:

```bash
python launch.py
```

**What you get:**

- Complete list of all available flags.
- Short description of each option.
- Usage syntax and examples.

---

## Back to general **distributeur** documentation

The general **distributeur** documentation is available [here](Readme.md)
