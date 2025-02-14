
# Prerequisites

To install all prerequisites you can follow one of the following options:

## Option 1: Install script

You have [this script](./install_prerequisites.sh) that install everything you need.

## Option 2: Manually installation

You can install everything you need manually by following the instructions.

### Install Python

To ensure compatibility with this project, please install Python 3.12.8. Below are the download links for your operating system:

- [Windows](https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe)
- [macOS (Intel or Apple Silicon)](https://www.python.org/ftp/python/3.12.8/python-3.12.8-macosx10.9.pkg)
- [Linux (source code)](https://www.python.org/ftp/python/3.12.8/Python-3.12.8.tgz)

### Install Docker

To ensure compatibility please install Docker 27.2.0. There is the download link:

- [Docker](https://www.docker.com/products/docker-desktop)

### Install Docker Compose

To ensure compatibility please install Docker v2.29.2 There is the download link:

- [Docker Compose](https://docs.docker.com/compose/install/)

## Verify the Installation

### Verify Python installation

After installation, verify the installed version by running the following command in your terminal:

```bash
python --version
```

This should output:

```bash
Python 3.12.8
```

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