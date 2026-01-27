# Launch

You can launch both backend and frontend part with the **launching script**

With this **launching script** you can launch:

- some **verification** to make sure everything will works.
- the **backend** that launch also the database.
- the **frontend** to access to the website.
- the **mobile app** to test on mobile.
- the **backend test** to see if every backend root is work.
- an **update** of the database to update the database.
- export the database **dump**.
- see **logs** of different parts.
- manage **build and installation** of dependencies.
- manage **deployment** and operations on the remote server.

Or you can also **stop** every containers, remove them, remove all images and volumes.

## Prerequisites

You need to install:

- Python: 3.12.8
- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

## Launching option

### Verification, Backend, Frontend & Mobile App

To launch the verification, the backend, the frontend and the mobile app at the same time you need to use this command:

```bash
python launch.py --all
```

This command will launch in order:
1. Verifications
2. Backend (and database)
3. Frontend
4. Mobile App

### The verification

To launch the verification you need to use this command:

```bash
python launch.py --verif
```

It is recommended to always use the flag **--verif** to be sure to have all files needed for launching everything else.

### Backend only

To launch the backend you need to use this command:

```bash
python launch.py --back
```

### Frontend only

To launch the frontend you need to use this command:

```bash
python launch.py --front
```

### Backend test

To launch the backend test you need to use this command:

```bash
python launch.py --test
```

Be sure to combine this flag with the backend flag or the all flag

### Update the database

To launch the update of the database you need to use this command:

```bash
python launch.py --update UPDATE_FUNCTION
```

Replace UPDATE_FUNCTION by the update function you want

### Export dump

To export the database dump you need to use this command:

```bash
python launch.py --dump
```

Be sure to combine this flag with the backend flag

### Mobile App only

To launch the mobile app only you need to use this command:

```bash
python launch.py --app
```

### Advanced Operations

To launch verification, backend, frontend, mobile app and tests in sequence:

```bash
python launch.py --combo
```

To restart the application (stop everything then launch everything):

```bash
python launch.py --restart
```

### See Logs

To see logs for a specific part or everything:

```bash
python launch.py --see-log every
```

Available options are: `back`, `front`, `app`, `every`.

### Build & Install Options

You can force rebuild or dependency installation:

- `--no-cache-back`: Build Backend without Docker cache.
- `--no-cache-front`: Build Frontend without Docker cache.
- `--no-cache-app`: Install mobile app dependencies without cache.
- `--install-front`: Install frontend dependencies with npm.
- `--install-app`: Install mobile app dependencies with npm.
- `--build-test`: Build Test Docker images before running.
- `--sudo`: Use sudo for npm commands (frontend/app).
- `--tunnel`: Start Expo in tunnel mode for mobile app.
- `--origins`: List registered frontend origins.

### Server Operations

These commands are used for deployment on the remote server (VM):

- `--deploy-back`: Deploy backend to remote server.
- `--exec-server [files...]`: Transfer and execute Python files on the remote server.
- `--clean-server`: Clean Docker and fully update the remote server.

### Stop everything

To launch the down you need to use this command:

```bash
python launch.py --down
```

To launch the backend test you need to use this command:

### Help

For any other help you can use the help command:

```bash
python launch.py --help
```

Or use the launch script without arguments:

```bash
python launch.py
```

## Back to general **distributeur** documentation

The general **distributeur** documentation is available at [here](Readme.md)
