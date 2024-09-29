
# Comment écrire un test

Les tests permettent de valider que chaque route fonctionne comme prévu. Pour ajouter un test à l'application, suis les étapes suivantes :

## Étape 1: Créer un fichier de test

Dans le répertoire `test/`, crée un fichier de test pour la route correspondante. Si tu testes la route `update_doctor`, nomme le fichier `test_update_doctor.py`.

### Étape 2 : Importer les modules nécessaires

Assure-toi d'importer `pytest` et le client de test Flask :

```python
import pytest
from app import app
```

### Étape 3: Écrire un test pour la route

Utilise la méthode appropriée (client.get(), client.post(), etc.) pour tester la route. Par exemple, pour tester la mise à jour d'un docteur:

```python
def test_update_doctor_success(client):
    response = client.put('/update_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'frpp': '1234567890',
        'sector': 'General',
        'region': 'Ile-de-France'
    })
    assert response.status_code == 200
    assert b'Doctor updated successfully' in response.data
```

### Étape 4: Ajouter des tests pour les cas d'erreur

Teste aussi les scénarios où les données sont incorrectes ou où il manque des champs :

```python
def test_update_doctor_missing_field(client):
    response = client.put('/update_doctor', json={
        'first_name': 'John',
        'last_name': 'Doe',
        'sector': 'General'
    })
    assert response.status_code == 400
    assert b'Missing frpp field' in response.data
```

### Étape 5: Exécuter les tests

Pour exécuter les tests avec Docker, utilise la commande suivante :

```bash
docker-compose run test
```
