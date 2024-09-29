
# Comment écrire une route

Pour ajouter une nouvelle route dans l'application Flask, suis les étapes suivantes :

## Étape 1: Créer un fichier de route

Dans le répertoire `routes/`, crée un fichier Python pour ta nouvelle route. Par convention, nomme le fichier en fonction de ce que fait la route. Par exemple, si tu ajoutes une fonctionnalité de mise à jour d'un docteur, tu peux créer un fichier `update_doctor.py`.

## Étape 2: Importer les modules nécessaires

Chaque route Flask doit avoir au minimum les imports suivants :

```python
from flask import Blueprint, request, jsonify
from db import get_db  # Assure-toi d'importer la fonction ou connexion DB
```

## Étape 3: Déclarer le Blueprint

Le `Blueprint` permet de modulariser les routes. Crée un blueprint dans ton fichier de route comme ceci :

```python
update_doctor_bp = Blueprint('update_doctor', __name__)
```

## Étape 4: Déclarer le Blueprint

Utilise le décorateur @Blueprint.route() pour définir la route, et implémente la logique de traitement :
Bien penser à ajouter une description claire à la rout.

```python
@update_doctor_bp.route('/update_doctor', methods=['PUT'])
def update_doctor():
    """
    [Description]

    [Parameters]

    [Returns]
    """
    data = request.get_json()
    # Valider et traiter les données
    # Mettre à jour la base de données avec get_db()
    return jsonify({"message": "Doctor updated successfully"}), 200
```

## Étape 5: Enregistrer la route dans app.py

Pour que Flask reconnaisse ta nouvelle route, enregistre le `Blueprint` dans le fichier `app.py`:

```python
from routes.update_doctor import update_doctor_bp

app.register_blueprint(update_doctor_bp)
```

## Étape 6: Tester la route

Suivre ce [Readme](../test/README.md)
