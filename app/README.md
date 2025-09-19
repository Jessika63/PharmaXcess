
# PharmaXcess App

*(description coming soon)*

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Client Setup](#client-setup) *(coming soon)*
- [Additional Notes](#additional-notes)

## Prerequisites

To initialize the server, you need:

- **Docker**

## Server Setup

### Step 1: Create the `.env` File

You must create a `.env` file in the `web_server/` directory.

>**Important:** Do not push this `.env` file to your version control system!

### Step 2: Set up and un the database and the server with Docker

To set up and run the database and server using Docker, you can use the following command:

```sh
docker-compose up
```

This command will automatically:

- Pull the latest MySQL image if it is not already available on your machine.
- Build the images for Node.js (version 16), the server, and the database if they are not already built.
- Run the respective containers for both the server and the database.

>Note: If you prefer to run individual containers separately, you can do so by specifying the container name in the command:

```sh
docker-compose up <container_name>
```

Make sure to replace `<container_name>` with the actual name of the container you want to run (db or server).

## Client Setup *(coming soon)*

## Additional Notes

- Ensure that the MySQL database container is running before the server container.
- If you make changes to the `.env` file, ensure that you restart the application to apply the new configuration.