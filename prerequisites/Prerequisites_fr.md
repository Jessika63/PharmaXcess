# Prérequis

Pour installer tous les prérequis, vous pouvez suivre l'une des options suivantes :

## Option 1 : Script d'installation

Vous avez [ce script](./install_prerequisites.sh) qui installe tout ce dont vous avez besoin.

## Option 2 : Installation manuelle

Vous pouvez installer tout ce dont vous avez besoin manuellement en suivant les instructions.

### Installer Python

Pour assurer la compatibilité avec ce projet, veuillez installer Python 3.12.8. Ci-dessous les liens de téléchargement pour votre système d'exploitation :

- [Windows](https://www.python.org/ftp/python/3.12.8/python-3.12.8-amd64.exe)
- [macOS (Intel ou Apple Silicon)](https://www.python.org/ftp/python/3.12.8/python-3.12.8-macosx10.9.pkg)
- [Linux (code source)](https://www.python.org/ftp/python/3.12.8/Python-3.12.8.tgz)

### Installer Docker

Pour assurer la compatibilité, veuillez installer Docker 27.2.0. Voici le lien de téléchargement :

- [Docker](https://www.docker.com/products/docker-desktop)

### Installer Docker Compose

Pour assurer la compatibilité, veuillez installer Docker v2.29.2. Voici le lien de téléchargement :

- [Docker Compose](https://docs.docker.com/compose/install/)

## Vérifier l'Installation

### Vérifier l'installation de Python

Après l'installation, vérifiez la version installée en exécutant la commande suivante dans votre terminal :

```bash
python --version
```

Cela devrait afficher :

```bash
Python 3.12.8
```

### Vérifier l'installation de Docker

Après avoir installé Docker, vérifiez les versions en utilisant les commandes suivantes :

```bash
docker --version
```

La sortie devrait être :

```bash
Docker version 27.2.0, build 3ab4256
```

### Vérifier l'installation de Docker Compose

Après avoir installé Docker Compose, vérifiez les versions en utilisant les commandes suivantes :

```bash
docker-compose --version
```

La sortie devrait être :

```bash
Docker Compose version v2.29.2-desktop.2
```
