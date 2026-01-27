# Lancement

Vous pouvez lancer à la fois la partie backend et la partie frontend avec le **script de lancement** (`launch.py`)

Avec ce **script de lancement**, vous pouvez lancer :

- quelques **vérifications** pour vous assurer que tout fonctionnera.
- le **backend** qui lance également la base de données.
- le **frontend** pour accéder au site web.
- l'**application mobile** pour tester sur mobile.
- le **test backend** pour voir si toutes les routes backend fonctionnent (`python launch.py --test`).
- une **mise à jour** de la base de données pour mettre à jour la base de données.
- exporter le **dump** de la base de données.
- voir les **logs** des différentes parties.
- gérer la **construction et l'installation** des dépendances.
- gérer le **déploiement** et les opérations sur le serveur distant.

Ou vous pouvez aussi **arrêter** tous les conteneurs, les supprimer, supprimer toutes les images et volumes.

## Prérequis

Vous devez installer :

- Python : 3.12.8
- Docker : 27.2.0
- Docker Compose : v2.29.2

### Installation

Vous pouvez installer tous les prérequis avec [ce script](./prerequisites/install_prerequisites.sh) ou suivre [ce readme](./prerequisites/Prerequisites_fr.md)

## Options de lancement

### Vérification, Backend, Frontend & App Mobile

Pour lancer la vérification, le backend, le frontend et l'application mobile en même temps, vous devez utiliser cette commande :

```bash
python launch.py --all
```

Cette commande va lancer dans l'ordre :
1. Les vérifications
2. Le backend (et la base de données)
3. Le frontend
4. L'application mobile

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

### Application Mobile seulement

Pour lancer l'application mobile uniquement, vous devez utiliser cette commande :

```bash
python launch.py --app
```

### Opérations Avancées

Pour lancer la vérification, le backend, le frontend, l'application mobile puis les tests à la suite :

```bash
python launch.py --combo
```

Pour redémarrer l'application (tout arrêter puis tout relancer) :

```bash
python launch.py --restart
```

### Voir les Logs

Pour voir les logs d'une partie spécifique ou de tout :

```bash
python launch.py --see-log every
```

Les options disponibles sont : `back`, `front`, `app`, `every`.

### Options de Construction et Installation

Vous pouvez forcer la reconstruction ou l'installation des dépendances :

- `--no-cache-back` : Construit le backend sans cache Docker.
- `--no-cache-front` : Construit le frontend sans cache Docker.
- `--no-cache-app` : Installe les dépendances de l'app mobile sans cache.
- `--install-front` : Installe les dépendances npm du frontend.
- `--install-app` : Installe les dépendances npm de l'app mobile.
- `--build-test` :  Construit les images de test avant de lancer.
- `--sudo` : Utilise sudo pour les commandes npm (frontend/app).
- `--tunnel` : Lance Expo en mode tunnel pour l'app mobile.
- `--origins` : Liste les origines frontend enregistrées.

### Opérations Serveur

Ces commandes sont utilisées pour le déploiement sur le serveur distant (VM) :

- `--deploy-back` : Déploie le backend sur le serveur.
- `--exec-server [fichiers...]` : Transfère et exécute des fichiers Python sur le serveur.
- `--clean-server` : Nettoie Docker et met à jour complètement le serveur distant.

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
