
# PharmaXcess Distributeur

## Description

These dispensers will serve two purposes. Once connected to the medication distribution system, they can dispense medication with or without a prescription:

- Without a prescription: Customers can select the desired medications and purchase them directly.
- With a prescription: Customers can scan their prescription, health insurance card, and ID card. The prescription will be processed, and the listed medications will be dispensed.

## Parts

We have divided the **distributeur** into two parts, the frontend and the backend

### Back-end

You can find all **Distributeur** **Backend** information [here](backend/README.md)

### Front-end

You can find all **Distributeur** **Frontend** information [here](frontend/README.md)

## Launch

You can launch both backend and frontend part with the **launching script**

With this **launching script** you can launch:

- some **verification** to make sure everything will works.
- the **backend** that launch also the database.
- the **frontend** to access to the website.
- the **backend test** to see if every backend root is work.
- an **update** of the database to update the database.

Or you can also **stop** every containers, remove them, remove all images and volumes.

### Prerequisites

You need to install:

- Python: 3.12.8
- Docker: 27.2.0
- Docker Compose: v2.29.2

#### Installation

##### Install Python

To ensure compatibility with this project, please install Python 3.12.8. Below are the download links for your operating system:

- [Windows](https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe)
- [macOS (Intel or Apple Silicon)](https://www.python.org/ftp/python/3.12.8/python-3.12.8-macosx10.9.pkg)
- [Linux (source code)](https://www.python.org/ftp/python/3.12.8/Python-3.12.8.tgz)

##### Install Docker

To ensure compatibility please install Docker 27.2.0. There is the download link:

- [Docker](https://www.docker.com/products/docker-desktop)

##### Install Docker Compose

- [Docker Compose](https://docs.docker.com/compose/install/)

#### Verify the Installation

##### Verify Python installation

After installation, verify the installed version by running the following command in your terminal:

```bash
python --version
```

This should output:

```bash
Python 3.12.8
```

##### Verify Docker installation

After installing Docker verify the versions using the following commands:

```bash
docker --version
```

The output should be:

```bash
Docker version 27.2.0, build 3ab4256
```

##### Verify Docker Compose installation

After installing Docker Compose, verify the versions using the following commands:

```bash
docker-compose --version
```

The output should be:

```bash
Docker Compose version v2.29.2-desktop.2
```

### Verification, Backend & Frontend

To launch the verification, the backend and the frontend at the same time you need to use this command:

```bash
python launch.py --all
```

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

## Back to general documentation

The general documentation is available at [here](../Readme.md)
