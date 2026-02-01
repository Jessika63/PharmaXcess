# Lancement

Avec le **script de lancement** (`launch.py`), vous pouvez lancer :

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

---

## Prérequis

Vous devez installer :

- Python : 3.12.8
- Docker : 27.2.0
- Docker Compose : v2.29.2

### Installation

Vous pouvez installer tous les prérequis avec [ce script](./prerequisites/install_prerequisites.sh) ou suivre [ce readme](./prerequisites/Prerequisites_fr.md)

---

## Options de lancement

### Vérification, Backend, Frontend & App Mobile

Pour lancer la vérification, le backend, le frontend et l'application mobile en même temps, vous devez utiliser cette commande :

```bash
python launch.py --all
```

**Ce que cette commande fait :**

Cette commande exécute une séquence complète de démarrage de l'environnement de développement :

1. **Vérifications** : Contrôle que tous les fichiers de configuration nécessaires (`.env`, certificats, etc.) sont présents et valides.
2. **Backend (et base de données)** : Lance les conteneurs Docker pour le serveur API Flask et la base de données MySQL. Le backend sera accessible sur le port configuré (généralement `5000`).
3. **Frontend** : Démarre le serveur de développement Vue.js. L'interface web sera accessible sur `http://localhost:8080` (ou le port configuré).
4. **Application mobile** : Lance Expo pour l'application React Native, permettant de tester sur un émulateur ou un appareil physique.

**Cas d'utilisation :** C'est la commande recommandée pour démarrer rapidement tout l'environnement de développement.

---

### La vérification

Pour lancer la vérification, vous devez utiliser cette commande :

```bash
python launch.py --verif
```

**Ce que cette commande fait :**

Le script de vérification analyse votre environnement pour s'assurer que :

- Les fichiers `.env` requis existent et contiennent les variables nécessaires.
- Les certificats SSL/TLS sont présents si configurés.
- Les dépendances Docker sont correctement installées.
- Les ports requis sont disponibles et non utilisés par d'autres applications.
- Les fichiers de configuration des différents services sont valides.

**Conseil :** Il est recommandé de toujours utiliser le flag `--verif` pour être sûr d'avoir tous les fichiers nécessaires avant de lancer les autres composants.

---

### Backend seulement

Pour lancer le backend, vous devez utiliser cette commande :

```bash
python launch.py --back
```

**Ce que cette commande fait :**

Lance uniquement les services backend :

- **Conteneur MySQL** : Base de données relationnelle où sont stockées toutes les données de l'application.
- **Conteneur Flask API** : Serveur API REST qui gère toute la logique métier, l'authentification, et les interactions avec la base de données.

**Informations techniques :**

| Service | Port par défaut | Description |
|---------|----------------|-------------|
| API Flask | 5000 | Endpoints REST de l'application |
| MySQL | 3306 | Base de données relationnelle |

**Cas d'utilisation :** Utile lorsque vous développez uniquement sur le backend ou que vous souhaitez tester les API sans lancer le frontend.

---

### Frontend seulement

Pour lancer le frontend, vous devez utiliser cette commande :

```bash
python launch.py --front
```

**Ce que cette commande fait :**

Lance le serveur de développement Vue.js :

- **Hot-reload** : Les modifications de code sont automatiquement rechargées dans le navigateur.
- **Dev Server** : Serveur de développement Vite/Webpack avec sourcemaps pour le débogage.
- **Proxy API** : Les requêtes vers `/api` sont automatiquement redirigées vers le backend.

**Prérequis :** Le backend doit être lancé au préalable pour que l'application fonctionne correctement.

**Accès :** L'interface est accessible sur `http://localhost:8080` (ou le port configuré dans le fichier `.env`).

---

### Test Backend

Pour lancer le test backend, vous devez utiliser cette commande :

```bash
python launch.py --test
```

**Ce que cette commande fait :**

Exécute la suite de tests automatisés du backend :

- **Tests unitaires** : Vérifient le bon fonctionnement des fonctions et méthodes individuelles.
- **Tests d'intégration** : Vérifient que les différents composants communiquent correctement entre eux.
- **Tests des routes API** : Vérifient que chaque endpoint répond correctement avec les bons codes HTTP et formats de réponse.

**Exemple de combinaison :**

```bash
python launch.py --back --test
```

Cette commande lance d'abord le backend, puis exécute les tests une fois les services démarrés.

**Conseil :** Assurez-vous de combiner ce flag avec le flag `--back` ou `--all` pour que les tests s'exécutent sur un environnement fonctionnel.

---

### Mettre à jour la base de données

Pour lancer la mise à jour de la base de données, vous devez utiliser cette commande :

```bash
python launch.py --update UPDATE_FUNCTION
```

Remplacez `UPDATE_FUNCTION` par la fonction de mise à jour que vous souhaitez exécuter.

**Ce que cette commande fait :**

Exécute un script de migration ou de mise à jour spécifique sur la base de données :

- **Migrations de schéma** : Ajoute, modifie ou supprime des tables/colonnes.
- **Scripts de données** : Insère ou met à jour des données (seed data, corrections).
- **Scripts personnalisés** : Exécute des fonctions de maintenance définies dans le projet.

**Exemples de fonctions disponibles :**

```bash
# Exemple (les fonctions réelles dépendent de votre projet)
python launch.py --update migrate_users
python launch.py --update add_new_columns
python launch.py --update seed_training_data
```

**Attention :** Vérifiez toujours la fonction avant de l'exécuter sur un environnement de production.

---

### Exporter le dump

Pour exporter le dump de la base de données, vous devez utiliser cette commande :

```bash
python launch.py --dump
```

**Ce que cette commande fait :**

Crée une sauvegarde complète de la base de données MySQL :

- **Format** : Fichier SQL contenant la structure et les données.
- **Emplacement** : Le dump est généralement sauvegardé dans le dossier `backup/` ou le chemin configuré.
- **Contenu** : Inclut toutes les tables, données, index et contraintes.

**Prérequis :** Le backend (et donc le conteneur MySQL) doit être en cours d'exécution.

**Exemple de combinaison :**

```bash
python launch.py --back --dump
```

**Conseil :** Effectuez régulièrement des dumps de la base de données, notamment avant toute migration ou mise à jour majeure.

---

### Application Mobile seulement

Pour lancer l'application mobile uniquement, vous devez utiliser cette commande :

```bash
python launch.py --app
```

**Ce que cette commande fait :**

Lance l'environnement de développement Expo pour React Native :

- **Metro Bundler** : Serveur de bundling JavaScript pour l'application mobile.
- **QR Code** : Affiche un QR code scannable avec l'application Expo Go sur votre téléphone.
- **Émulateur** : Permet de lancer l'application sur un émulateur iOS/Android.

**Options de test :**

| Méthode | Description |
|---------|-------------|
| Expo Go (mobile) | Scannez le QR code avec l'app Expo Go |
| Émulateur Android | Appuyez sur `a` dans le terminal |
| Émulateur iOS | Appuyez sur `i` dans le terminal (macOS uniquement) |

**Prérequis :** Le backend doit être lancé et accessible depuis votre réseau.

---

### Opérations Avancées

#### Combo complet

Pour lancer la vérification, le backend, le frontend, l'application mobile puis les tests à la suite :

```bash
python launch.py --combo
```

**Ce que cette commande fait :**

Exécute une séquence complète incluant les tests :

1. Vérifications préalables
2. Démarrage du backend
3. Démarrage du frontend
4. Démarrage de l'application mobile
5. Exécution des tests automatisés

**Cas d'utilisation :** Idéal pour une vérification complète de l'environnement avant un déploiement ou une démonstration.

---

#### Redémarrage

Pour redémarrer l'application (tout arrêter puis tout relancer) :

```bash
python launch.py --restart
```

**Ce que cette commande fait :**

Effectue un cycle complet d'arrêt et de redémarrage :

1. **Arrêt** : Stoppe tous les conteneurs Docker en cours d'exécution.
2. **Nettoyage** : Supprime les conteneurs arrêtés (mais conserve les images et volumes).
3. **Redémarrage** : Relance tous les services comme avec `--all`.

**Cas d'utilisation :** Utile après une modification de configuration ou pour résoudre des problèmes d'état.

---

### Voir les Logs

Pour voir les logs d'une partie spécifique ou de tout :

```bash
python launch.py --see-log every
```

**Options disponibles :**

| Option | Description |
|--------|-------------|
| `back` | Affiche les logs du backend (API Flask + MySQL) |
| `front` | Affiche les logs du frontend (serveur de développement) |
| `app` | Affiche les logs de l'application mobile (Expo) |
| `every` | Affiche les logs de tous les services |

**Ce que les logs contiennent :**

- **Backend** : Requêtes HTTP, erreurs SQL, messages de débogage API.
- **Frontend** : Erreurs de compilation, warnings Vue.js, messages HMR.
- **App mobile** : Logs Expo, erreurs JavaScript, événements React Native.

**Conseil :** Utilisez `--see-log back` pour déboguer les problèmes d'API ou de base de données.

---

### Options de Construction et Installation

Vous pouvez forcer la reconstruction ou l'installation des dépendances :

| Flag | Description | Cas d'utilisation |
|------|-------------|-------------------|
| `--no-cache-back` | Construit le backend sans cache Docker | Après modification du Dockerfile ou des dépendances Python |
| `--no-cache-front` | Construit le frontend sans cache Docker | Après modification majeure des dépendances npm |
| `--no-cache-app` | Installe les dépendances de l'app mobile sans cache | Pour résoudre des problèmes de dépendances corrompues |
| `--install-front` | Installe les dépendances npm du frontend | Après `git pull` ou modification de `package.json` |
| `--install-app` | Installe les dépendances npm de l'app mobile | Après `git pull` ou modification de `package.json` |
| `--build-test` | Construit les images de test avant de lancer | Pour tester avec une nouvelle configuration |
| `--sudo` | Utilise sudo pour les commandes npm | Sur Linux si problèmes de permissions |
| `--tunnel` | Lance Expo en mode tunnel pour l'app mobile | Pour tester sur un réseau différent (hors LAN) |
| `--origins` | Liste les origines frontend enregistrées | Pour vérifier les configurations CORS |

**Exemples :**

```bash
# Reconstruction complète du backend
python launch.py --back --no-cache-back

# Installation des dépendances après un pull
python launch.py --front --install-front

# Test sur réseau externe avec tunnel
python launch.py --app --tunnel
```

---

### Opérations Serveur

Ces commandes sont utilisées pour le déploiement sur le serveur distant (VM) :

| Flag | Description | Détails |
|------|-------------|---------|
| `--deploy-back` | Déploie le backend sur le serveur | Transfère les fichiers, reconstruit les images Docker et redémarre les services |
| `--exec-server [fichiers...]` | Transfère et exécute des fichiers Python sur le serveur | Utile pour les scripts de maintenance ou de mise à jour |
| `--clean-server` | Nettoie Docker et met à jour complètement le serveur | Supprime les images/conteneurs non utilisés et met à jour les paquets système |

**Prérequis :** La connexion SSH au serveur doit être configurée dans les fichiers d'environnement.

**Exemples :**

```bash
# Déployer une nouvelle version du backend
python launch.py --deploy-back

# Exécuter un script de migration sur le serveur
python launch.py --exec-server backend/scripts/migration.py

# Nettoyer le serveur (libérer de l'espace disque)
python launch.py --clean-server
```

---

### Tout arrêter

Pour lancer l'arrêt (down), vous devez utiliser cette commande :

```bash
python launch.py --down
```

**Ce que cette commande fait :**

Arrête proprement tous les services de l'application :

- **Arrêt des conteneurs** : Stoppe tous les conteneurs Docker en cours d'exécution.
- **Suppression des conteneurs** : Supprime les conteneurs arrêtés pour libérer de l'espace.
- **Conservation des données** : Les volumes (données de la base de données) sont **conservés**.

**Attention :** Cette commande n'arrête pas les processus npm (frontend/app) s'ils ont été lancés en dehors de Docker.

---

### Aide

Pour toute autre aide, vous pouvez utiliser la commande help :

```bash
python launch.py --help
```

Ou utilisez le script de lancement sans arguments :

```bash
python launch.py
```

**Ce que vous obtenez :**

- Liste complète de tous les flags disponibles.
- Description courte de chaque option.
- Syntaxe d'utilisation et exemples.

---

## Retour à la documentation générale **distributeur**

La documentation générale **distributeur** est disponible [ici](Readme_fr.md)
