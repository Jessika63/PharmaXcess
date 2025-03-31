
# Frontend

## Prerequisites

You need to install:

- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

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
