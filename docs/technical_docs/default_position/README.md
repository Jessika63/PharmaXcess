# Gestion de la position par défaut

## Backend

La route `/get_default_position` a été créée pour fournir une position par défaut lorsque la géolocalisation n'est pas disponible sur un PC.

### Configuration via le script de lancement

La position par défaut peut être configurée lors du lancement du backend avec le flag `--location` :

```bash
# Lancer avec Paris comme position par défaut (défaut)
python launch.py --back --location paris

# Lancer avec Lyon comme position par défaut
python launch.py --back --location lyon

# Lancer toute l'application avec Lyon
python launch.py --all --location lyon
```

Cette configuration définit la variable d'environnement `DEFAULT_LOCATION` qui est passée au conteneur Docker du backend.

### Endpoint

```
GET /get_default_position?location=<location>
```

### Paramètres (query parameters)

- `location` (optionnel) : Localisation spécifique pour cette requête
  - Valeurs possibles : `paris`, `lyon`
  - Si non fourni, utilise la valeur de la variable d'environnement `DEFAULT_LOCATION` (configurée au lancement)

### Réponse

```json
{
  "success": true,
  "position": {
    "lat": 48.815273,
    "lon": 2.363006,
    "name": "Epitech Kremlin-Bicêtre"
  },
  "message": "Default position returned: Epitech Kremlin-Bicêtre"
}
```

### Exemple d'appel

```javascript
// Utilise la position configurée au lancement du backend
fetch('http://localhost:5000/get_default_position')
  .then(response => response.json())
  .then(data => console.log(data.position));

// Surcharge avec une localisation spécifique
fetch('http://localhost:5000/get_default_position?location=lyon')
  .then(response => response.json())
  .then(data => console.log(data.position));
```

## Frontend - Utilisation

### 1. Import de l'utilitaire

```javascript
import { getPositionWithFallback, getPosition } from '../../utils/positionUtils';
```

### 2. Utilisation simple (recommandée)

Cette méthode essaie d'abord la géolocalisation, puis utilise la position par défaut du backend :

```javascript
const position = await getPosition();
const { lat, lon } = position;
```

### 3. Utilisation avec fallback complet

Cette méthode essaie :
1. Géolocalisation du navigateur
2. Position par défaut du backend
3. Position hardcodée dans le config (si le backend échoue)

```javascript
const position = await getPositionWithFallback('paris');
const { lat, lon } = position;
```

### 4. Exemple d'intégration dans drug_stores_available.js

**AVANT (code actuel) :**

```javascript
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchPharmacies(latitude, longitude);
    },
    (error) => {
      console.error("Position error :", error);
      alert("Cannot access to position. Make sure it is activated");
      setLoading(false);
    }
  );
} else {
  alert(`Position not supported...`);
  // Fallback to default location
  fetchPharmacies(config.Default_Location.lat, config.Default_Location.lon);
}
```

**APRÈS (code amélioré) :**

```javascript
import { getPositionWithFallback } from '../../utils/positionUtils';

// Dans useEffect ou fonction async
const position = await getPositionWithFallback('paris');
fetchPharmacies(position.lat, position.lon);
```

### 5. Exemple complet avec gestion d'erreur

```javascript
useEffect(() => {
  const initializeMap = async () => {
    try {
      setLoading(true);
      
      // Get position with automatic fallback
      const position = await getPositionWithFallback('paris');
      
      // Use the position
      await fetchPharmacies(position.lat, position.lon);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to get position:', error);
      setError('Unable to determine position');
      setLoading(false);
    }
  };
  
  initializeMap();
}, []);
```

## Avantages

✅ **Robustesse** : Plusieurs niveaux de fallback (géolocalisation → backend → config)  
✅ **Flexibilité** : Choix de la position par défaut (Paris, Lyon, etc.)  
✅ **Maintenabilité** : Positions par défaut centralisées dans le backend  
✅ **Logs clairs** : Affiche quelle méthode a été utilisée  
✅ **Pas de popup d'erreur** : Utilise automatiquement une position par défaut

## Tests

Des tests unitaires ont été créés dans :
- `backend/test/test_get_default_position.py`

Pour lancer les tests :

```bash
cd backend
pytest test/test_get_default_position.py -v
```
