# Lancement

Vous pouvez lancer à la fois la partie backend et la partie frontend avec le **script de lancement** (`launch.py`)

Avec ce **script de lancement**, vous pouvez lancer :

- quelques **vérifications** pour vous assurer que tout fonctionnera.
- le **backend** qui lance également la base de données.
- le **frontend** pour accéder au site web.
- le **test backend** pour voir si toutes les routes backend fonctionnent (`python launch.py --test`).
- une **mise à jour** de la base de données pour mettre à jour la base de données.
- exporter le **dump** de la base de données

Ou vous pouvez aussi **arrêter** tous les conteneurs, les supprimer, supprimer toutes les images et volumes.

## Prérequis

Vous devez installer :

- Python : 3.12.8
- Docker : 27.2.0
- Docker Compose : v2.29.2

### Installation

Vous pouvez installer tous les prérequis avec [ce script](./prerequisites/install_prerequisites.sh) ou suivre [ce readme](./prerequisites/Prerequisites_fr.md)

## Options de lancement

### Vérification, Backend & Frontend

Pour lancer la vérification, le backend et le frontend en même temps, vous devez utiliser cette commande :

```bash
python launch.py --all
```

### La vérification

Pour lancer la vérification, vous devez utiliser cette commande :

```bash
python launch.py --verif
```

Il est recommandé de toujours utiliser le flag **--verif** pour être sûr d'avoir tous les fichiers nécessaires pour lancer tout le reste.

### Backend seulement

Pour lancer le backend, vous devez utiliser cette commande :

```bash
python launch.py --back
```

### Frontend seulement

Pour lancer le frontend, vous devez utiliser cette commande :

```bash
python launch.py --front
```

### Test Backend

Pour lancer le test backend, vous devez utiliser cette commande :

```bash
python launch.py --test
```

Assurez-vous de combiner ce flag avec le flag backend ou le flag all

### Mettre à jour la base de données

Pour lancer la mise à jour de la base de données, vous devez utiliser cette commande :

```bash
python launch.py --update UPDATE_FUNCTION
```

Remplacez UPDATE_FUNCTION par la fonction de mise à jour que vous souhaitez

### Exporter le dump

Pour exporter le dump de la base de données, vous devez utiliser cette commande :

```bash
python launch.py --dump
```

Assurez-vous de combiner ce flag avec le flag backend

### Tout arrêter

Pour lancer l'arrêt (down), vous devez utiliser cette commande :

```bash
python launch.py --down
```

### Aide

Pour toute autre aide, vous pouvez utiliser la commande help :

```bash
python launch.py --help
```

Ou utilisez le script de lancement sans arguments :

```bash
python launch.py
```

## Retour à la documentation générale **distributeur**

La documentation générale **distributeur** est disponible [ici](Readme_fr.md)
