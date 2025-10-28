# PharmaXcess Web Server

This folder contains the **backend (server)** of the PharmaXcess application.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Useful Commands](#useful-commands)
- [Directory Structure](#directory-structure)

## Overview

The backend is containerized into two services:
- `db` → PostgreSQL + PostGIS (database)
- `server` → Spring Boot application

Two Docker Compose configurations are provided:
- `docker-compose.dev.yml` → for local development
- `docker-compose.prod.yml` → for production-like environments

## Prerequisites

- **Docker** >= 20.10 (tested with 20.10.17)
- **Docker Compose CLI v2** (integrated with Docker, tested with v2.6.0)
- **Java 17** (optional, if you want to run the app locally outside Docker)
- Basic understanding of Docker commands

> Make sure Docker is running before starting the containers.

## Environment Variables

Before running the server, you need to create a `.env` file in the same directory as the `.env.example` file (at the root of `web_server/`).

Use the `.env.example` file as a reference - it documents all the required environment variables and their purpose.
You can simply copy it and update the values to match your local setup:

```sh
cp .env.example .env
```

Then open `.env` and fill in your configuration (database credentials, ports, JWT secret, etc.).

> ⚠️ Note:
> - The `.env` file must not be committed to version control.
> - Update your containers or restart them after modifying environment variables.

## Development Setup

Use the **development compose file** to build and run the app locally with hot reload and Maven cache.

```sh
docker compose -f docker-compose.dev.yml up
```

This will:
- Start the **PostgreSQL/PostGIS** database
- Start the **Spring Boot server** using the `entrypoint.sh` script
- Mount your source code for live recompilation

> ⚠️ **Important for Windows users**
>
> The `entrypoint.sh` script **must be executed in a Linux-compatible environment** (e.g., WSL2, Docker Desktop with Linux engine).
>
> Also, make sure the file uses **LF (Unix)** line endings - not **CRLF (Windows)**. If you edited it with Windows tools (e.g., VS Code, Notepad++), convert it.

### Rebuild images (if you change Dockerfile or dependencies)
```sh
docker compose -f docker-compose.dev.yml up --build
```
### Stop services
```sh
docker compose -f docker-compose.dev.yml down
```

## Production Setup

Use the **production compose file** to simulate a real deployment:

```sh
docker compose -f docker-compose.prod.yml up -d
```

This will:
- Build a clean Spring Boot JAR using the `prod` stage of the Dockerfile
- Run both containers (no live mount, no Maven cache)
- Start the app with `SPRING_PROFILES_ACTIVE=prod`

### Stop and remove containers

```sh
docker compose -f docker-compose.prod.yml down
```

## Useful Commands

| Action                  | Command                                                                 |
| ----------------------- | ----------------------------------------------------------------------- |
| View logs (live)        | `docker compose logs -f <service>`                                      |
| Rebuild & restart       | `docker compose up --build`                                             |
| Stop all services       | `docker compose down`                                                   |
| Connect to DB shell     | `docker exec -it pharmaxcess-db psql -U $POSTGRES_USER -d $POSTGRES_DB` |
| List running containers | `docker ps`                                                             |

## Notes

- Always **restart** containers after changing the `.env` file
- The `dev` environment uses `entrypoint.sh` to auto-compile and run with Maven
- The `prod` environment runs directly from the built JAR file
- Use strong and long JWT secrets (≥ 32 bytes for HS256)
- For monitoring in production, `/actuator/health` endpoint is exposed internally for health checks

## Directory Structure

```pgsql
web_server/
├── database/
│   └── init.sql
├── server/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── pharmaxcess_server/
│   └── pom.xml
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```