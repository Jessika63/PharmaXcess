# Documentation de la stratégie de test

## Vue d'ensemble
Ce document décrit la stratégie de test pour le projet PharmaXcess, couvrant à la fois les composants backend et frontend.

## Tests Backend

### Frameworks
- **Exécuteur de tests** : `pytest`
- **Mocking** : `unittest.mock` ou `pytest-mock`

### Types de Tests
1.  **Tests Unitaires** :
    - Testent les fonctions individuelles et les classes de manière isolée.
    - Exemple : Tester la fonction de calcul de distance `haversine`.
2.  **Tests d'Intégration** :
    - Testent l'interaction entre différents modules ou avec la base de données.
    - Exemple : Tester le endpoint `/get_pharmacies` avec une base de données de test.

### Exécution des Tests
```bash
# Lancer tous les tests
pytest

# Lancer un fichier de test spécifique
pytest tests/test_backend.py

# Via le script de lancement (recommandé pour inclure la configuration de l'environnement)
python launch.py --test
```

## Tests Frontend

### Frameworks
- **Exécuteur de tests** : `Jest`
- **E2E** : `Cypress`

### Types de Tests
1.  **Tests de Composants** :
    - Vérifient que les composants UI individuels s'affichent correctement et gèrent les interactions utilisateur.
    - Exemple : Tester le comportement de la modale `InsufficientStock`.
2.  **Tests de Snapshot** :
    - Assurent que l'UI ne change pas de manière inattendue.

### Exécution des Tests
```bash
# Lancer tous les tests
npm test

# Lancer avec couverture
npm test -- --coverage
```

## Intégration Continue
Les tests sont lancés automatiquement à chaque push sur le dépôt dans le cadre du pipeline CI/CD. Voir la [Documentation CI/CD](../cicd/fr/explanation.md) pour plus de détails.
