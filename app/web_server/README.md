# PharmaXcess Web Server

This folder contains the **backend (server)** of the PharmaXcess application.  

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [Useful Commands](#useful-commands)
- [Notes](#notes)

## Prerequisites

- Docker >= 20.10 (tested with 20.10.17)
- Docker Compose CLI v2 (integrated with Docker, tested with v2.6.0)
- Basic knowledge of Docker commands is recommended
- Ensure Docker is running before starting the containers

## Environment Variables

> **Important**: Before running the server, you must create a `.env` file.

Create a `.env` file in the `web_server/` directory and follow the structure indicated in `.env.example`.

> ⚠️ Do not commit your `.env` file to version control.

## Running the Server

After creating the `.env` file, run the following command from the `web_server/` directory to start both the database and the server:

```sh
docker compose up
```

This will:
- Pull the latest PostgreSQL image if it’s not already available
- Build the Spring Boot server image if not already built
- Start both containers: the database and the server

To run only a specific container (e.g., only the database):

```sh
docker compose up <container_name>
```
Replace <container_name> with either `db` or `server`.

## Useful Commands

- Stop all services:
```sh
docker compose down
```

- Rebuild containers:
```sh
docker compose up --build
```

- View logs:
```sh
docker compose logs -f <container_name>
```

## Notes

- Restart the containers if you make changes to the **.env** file
- Ensure the `.env` file is created before starting the containers
- This README focuses only on running the server, not code structure and API documentation.