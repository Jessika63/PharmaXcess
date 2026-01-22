# Frontend

## Prérequis

Vous devez installer :

- Docker : 27.2.0
- Docker Compose : v2.29.2

### Installation

Vous pouvez installer tous les prérequis avec [ce script](../prerequisites/install_prerequisites.sh) ou suivre [ce readme](../prerequisites/Prerequisites_fr.md)

## Lancement

### [ÉTAPE 1] installer les paquets

Pour installer toutes les dépendances dans package.json, vous devez utiliser cette commande :

```bash
npm install
```

### [ÉTAPE 2] lancer docker

Pour lancer le front-end, vous devez utiliser cette commande :

```bash
docker-compose up --build
```

#### Si vous rencontrez ce type d'erreur

```bash
react-app-distributeur@0.1.0 start /app
> react-scripts start
sh: 1: react-scripts: not found
```

voici comment résoudre :

```bash
rm -rf node_modules package-lock.json
npm install
docker-compose down
docker-compose up --build
```

### terminé

votre app devrait tourner, 'bon dev !'

## Retour à la documentation du projet

La documentation générale du projet est disponible à la racine `Readme_fr.md`.

## Configuration du code

### répertoire /pages

Chaque écran de l'application est organisé dans le répertoire 'pages' :

- **starting_page.js** => Page d'accueil principale avec le logo PharmaXcess et les options de navigation
- **documents_checking.js** => Page pour scanner les 3 documents requis : ID, carte vitale et ordonnance. Utilise camera_component et modal_camera pour l'affichage
- **non_prescription_drugs.js** => Liste tous les médicaments récupérés depuis l'API backend avec des options de filtrage. Utilise modal_standard pour l'affichage des médicaments et le traitement du paiement
- **insufficient_stock.js** => Gère les cas où le stock de médicaments est insuffisant. Offre des options pour précommander ou trouver des pharmacies à proximité avec sélection du mode de transport
- **drug_stores_available.js** => Affiche toutes les pharmacies autour de la localisation de l'utilisateur avec calculs de distance
- **DirectionsMapPage.js** => Carte interactive montrant l'itinéraire vers la pharmacie sélectionnée avec différents modes de transport (marche, vélo, transports en commun, voiture)
- **preorder.js** => Page pour précommander des médicaments quand le stock est insuffisant

### répertoire /components

Le répertoire 'components' contient des composants UI réutilisables :

- **camera_component.js** => Interface caméra pour le scan de documents avec capture photo, fonctionnalité de reprise et affichage graphique
- **modal_standard.js** => Composant modal standard utilisé pour l'affichage des médicaments et les popups généraux
- **modal_camera.js** => Modal spécialisé pour l'affichage caméra uniquement
- **ErrorPage.js** => Composant d'affichage d'erreur pour gérer les erreurs de l'application

### répertoire /utils

Fonctions utilitaires et hooks :

- **fetchWithTimeout.js** => Fonction fetch améliorée avec gestion du timeout
- **useInactivityRedirect.js** => Hook React pour détecter l'inactivité utilisateur et rediriger vers la page d'accueil

### Styles

- **Tailwind CSS** est le framework de style principal utilisé dans tout le projet
- **Fichiers CSS** dans `/components/pages/css/` contiennent des styles spécifiques pour des pages individuelles
- **Styles globaux** sont définis dans `App.css` et `index.css`

### Fonctionnalités Clés

- **Navigation Clavier** : Accessibilité complète au clavier avec navigation par flèches et sélection par Entrée
- **Design Responsif** : Design mobile-first avec interface adaptée au tactile
- **Localisation Temps Réel** : Intégration GPS pour trouver les pharmacies à proximité
- **Cartes Interactives** : Intégration Leaflet.js pour la visualisation d'itinéraires
- **Scan de Documents** : Intégration caméra pour la vérification de documents
- **Traitement de Paiement** : Flux de paiement simulé avec validation de stock
- **Détection d'Inactivité** : Redirection automatique vers la page d'accueil après inactivité

### Dépendances

- **React 18.3.1** - Framework principal
- **React Router DOM 6.27.0** - Routage côté client
- **React Icons 5.5.0** - Bibliothèque d'icônes
- **Leaflet 1.9.4** - Cartes interactives
- **React Leaflet 4.2.1** - Wrapper React pour Leaflet
- **Tailwind CSS 3.3.0** - Framework CSS utilitaire
- **@mapbox/polyline 1.2.1** - Décodage de polylignes
- **@react-google-maps/api 2.20.7** - Intégration Google Maps
- **@stripe/react-stripe-js 3.9.0** & **@stripe/stripe-js 7.8.0** - Intégration paiement Stripe
- **web-vitals 2.1.4** - Métriques de performance
- **brace-expansion 4.0.1** - Utilitaire d'expansion de chaînes
- **Bibliothèques de Test** - Jest DOM, React Testing Library, User Event

#### Si vous devez modifier des dépendances

Si vous devez ajouter, supprimer ou mettre à jour des paquets (par exemple, changer des versions dans package.json), suivez ces étapes :

```bash
python launch.py --down
cd frontend/
rm -rf node_modules package-lock.json
```

Puis faites votre modification dans package.json

```bash
npm install
cd ..
python launch.py --all
```

## Configuration

### Fichier de Configuration Principal

- **`src/config.js`** - Fichier de configuration central contenant :
  - **URL Backend** : Configuration de l'endpoint API (`backendUrl: 'http://57.128.57.96:5000'`)
  - **Style UI** : Couleurs, polices, styles de boutons, ombres et transitions
  - **Icônes** : Toutes les icônes React utilisées dans l'application
  - **Classes de Mise en page** : Configurations communes de mise en page et d'espacement
  - **Styles de Modal** : Styles de l'overlay et du contenu pour les modales
  - **Styles de Composant** : Combinaisons de styles prédéfinis pour boutons et composants

### Configuration de Build

- **`tailwind.config.js`** - Configuration Tailwind CSS pour le style personnalisé
- **`postcss.config.js`** - Configuration de traitement PostCSS
- **`package.json`** - Dépendances du projet et configuration des scripts

### Configuration d'Environnement

- **`docker-compose.yml`** - Configuration des conteneurs Docker avec variables d'environnement
- **`Dockerfile`** - Configuration de build du conteneur

Le fichier `config.js` est importé dans toute l'application pour maintenir un style et une configuration cohérents à travers tous les composants.
