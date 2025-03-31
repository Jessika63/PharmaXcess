# Launch

You can launch both backend and frontend part with the **launching script**

With this **launching script** you can launch:

- some **verification** to make sure everything will works.
- the **backend** that launch also the database.
- the **frontend** to access to the website.
- the **backend test** to see if every backend root is work.
- an **update** of the database to update the database.
- export the database **dump**

Or you can also **stop** every containers, remove them, remove all images and volumes.

## Prerequisites

You need to install:

- Python: 3.12.8
- Docker: 27.2.0
- Docker Compose: v2.29.2

### Installation

You can install all prerequisites with [this script](./prerequisites/install_prerequisites.sh) or follow [this readme](./prerequisites/Prerequisites.md)

## Launching option

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

### Export dump

To export the database dump you need to use this command:

```bash
python launch.py --dump
```

Be sure to combine this flag with the backend flag

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
