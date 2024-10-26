# PharmaXcess

*(description coming soon)*

## Table of Contents

- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Client Setup](#client-setup) *(coming soon)*
- [Additional Notes](#additional-notes)

## Prerequisites

To initialize the server, you need: 
- **npm**
- **Docker**

## Server Setup

### Step 1: Set Up MySQL with Docker

To set up MySQL using Docker, you can use the following command:

```sh
docker-compose up -d
```
This command will automatically pull the latest MySQL image if it is not already available on your machine.

>Note: You can manually pull the MySQL image with the command below, but it is not necessary if you use docker-compose:

```sh
docker pull mysql:latest
```

### Step 2: Create the `.env` File

You must create a `.env` file in the `web_server/` directory.

>**Important:** Do not push this `.env` file to your version control system!

### Step 3: Install Dependencies

After setting up the MySQL service, navigate to the `web_server/` directory and install the necessary dependencies:

```sh
cd web_server/
npm install
```

### Step 4: Run the Project

```sh
npm run start
```

## Client Setup *(coming soon)*

## Additional Notes

- Make sure Docker is running before executing the commands to set up the MySQL container.
- If you make changes to the `.env` file, ensure that you restart the application to apply the new configuration.