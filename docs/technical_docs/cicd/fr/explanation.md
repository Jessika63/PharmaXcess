# Documentation du Pipeline CI/CD

## Vue d'ensemble
Ce document décrit le pipeline d'Intégration Continue et de Déploiement Continu (CI/CD) pour le projet PharmaXcess.
Le pipeline est conçu pour automatiser les processus de test et de déploiement, assurant la qualité du code et une livraison rapide.

## Étapes du Pipeline

### 1. Build (Construction)
L'étape de build compile l'application et prépare les artefacts pour les tests et le déploiement.

- **Déclencheur** : Push sur les branches `main` ou `develop`, ou Pull Requests.
- **Étapes** :
    - Checkout du code
    - Installation des dépendances (Backend : `pip install -r requirements.txt`, Frontend : `npm install`)
    - Linting (ex: `flake8`, `eslint`)

### 2. Test
L'étape de test exécute la suite de tests automatisés pour vérifier la correction du code.

- **Tests Backend** :
    - Tests unitaires
    - Tests d'intégration
    - Commande : `pytest` (ou équivalent) ou `python launch.py --test`

### 3. Deploy (Déploiement)
L'étape de déploiement déploie l'application vers l'environnement cible (Staging/Production).

- **Cible** : Raspberry Pi
- **Étapes** :
    - Construction des images Docker
    - Push vers le registre de conteneurs
    - Mise à jour du service / Déploiement sur le serveur

## Variables d'Environnement
Le pipeline nécessite que les secrets/variables d'environnement suivants soient configurés :

- `DATABASE_URL` : Chaîne de connexion à la base de données
- `SECRET_KEY` : Clé secrète de l'application
- `API_KEYS` : Clés API externes (ex: OpenRouteService)
- `DEPLOY_TOKEN` : Identifiants pour le déploiement

## Surveillance & Notifications
- Le statut du build est rapporté à GitHub.
- Les builds échoués déclenchent une alerte à l'équipe de développement.
