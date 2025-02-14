
# Frontend

## Prerequisites

You need to install:

- Docker: 27.2.0
- Docker Compose: v2.29.2
- Node.js: v21.7.3

## Installation

### Install Docker

To ensure compatibility please install Docker 27.2.0. There is the download link:

- [Docker](https://www.docker.com/products/docker-desktop)

### Install Docker Compose

To ensure compatibility please install Docker v2.29.2 There is the download link:

- [Docker Compose](https://docs.docker.com/compose/install/)

### Install Node.js

To ensure compatibility with this project, please install Node.js v21.7.3. Below are the download links for your operating system:

- [Windows / macOS](https://nodejs.org/)
- Linux (Debian/Ubuntu):

    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```

- Linux (Arch Linux):

    ```bash
    sudo pacman -S nodejs npm
    ```

## Verify the Installation

### Verify Docker installation

After installing Docker verify the versions using the following commands:

```bash
docker --version
```

The output should be:

```bash
Docker version 27.2.0, build 3ab4256
```

### Verify Docker Compose installation

After installing Docker Compose, verify the versions using the following commands:

```bash
docker-compose --version
```

The output should be:

```bash
Docker Compose version v2.29.2-desktop.2
```

### Verify Node.js installation

After installing Node.js verify the versions using the following commands:

```bash
node -v
```

The output should be:

```bash
v21.7.3
```

You also need to verify the version of **npm** included in Node.js with this command:

```bash
npm -v
```

The output should be:

```bash
10.5.2
```

## Launching

### [STEP 1] install packages

To install all dependencies in package.json you need to use this command:

```bash
npm install
```

### [STEP 2] run docker

To run the front-end you need to use this command:

```bash
docker-compose up --build
```

#### If you encounter that kind of error

```bash
react-app-distributeur@0.1.0 start /app
> react-scripts start
sh: 1: react-scripts: not found
```

here is how to solve:

```bash
rm -rf node_modules package-lock.json
npm install
docker-compose down
docker-compose up --build
```

### finished

your app should be running, 'happy dev!'

## Back to general **distributeur** documentation

The general **distributeur** documentation is available at [here](../Readme.md)
