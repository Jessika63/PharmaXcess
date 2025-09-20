# Solution CORS Dynamique - PharmaXcess

Cette solution permet de gérer automatiquement les origines CORS sans avoir à redémarrer le serveur backend à chaque ajout d'un nouveau frontend.

## 🚀 Fonctionnalités

- ✅ Enregistrement automatique des origines CORS
- ✅ Aucun redémarrage du serveur nécessaire
- ✅ Sécurisé par clé secrète
- ✅ Compatible avec React JS et React Native
- ✅ Persistance des origines autorisées
- ✅ Interface d'administration (debug)

## 📁 Structure des fichiers

### Backend (Flask)
- `backend/app.py` - Middleware CORS dynamique et endpoints
- `backend/cors_config.py` - Configuration CORS
- `backend/allowed_origins.json` - Fichier de persistance des origines (créé automatiquement)

### Frontend Distributeur (React JS)
- `dispenser_frontend/src/config.js` - Configuration mise à jour
- `dispenser_frontend/src/utils/corsRegistration.js` - Utilitaire d'enregistrement
- `dispenser_frontend/src/hooks/useCORSRegistration.js` - Hook React
- `dispenser_frontend/src/App.js` - Intégration de l'enregistrement automatique

### Frontend App (React Native)
- `pharmaXcess_app/config.ts` - Configuration TypeScript
- `pharmaXcess_app/utils/corsRegistration.ts` - Utilitaire d'enregistrement
- `pharmaXcess_app/hooks/useCORSRegistration.ts` - Hook React Native
- `pharmaXcess_app/components/CORSLoadingScreen.tsx` - Écran de chargement
- `pharmaXcess_app/App.tsx` - Intégration de l'enregistrement automatique

## 🔧 Configuration

### Clé secrète

La clé secrète doit être identique dans tous les frontends.

## 🚀 Utilisation

### 1. Démarrage du backend

```bash
python launch.py --back
```

Le backend démarre sans aucune origine CORS configurée.

### 2. Démarrage des frontends

#### Frontend Distributeur (React JS)
```bash
python launch.py --front
```

#### Frontend App (React Native)
```bash
cd pharmaXcess_app
npm start
```

### 3. Enregistrement automatique

Dès qu'un frontend se lance :
1. Il détecte automatiquement son origine
2. Il s'enregistre auprès du backend avec la clé secrète
3. Le backend l'ajoute à sa liste d'origines autorisées
4. L'application se lance normalement

## 🔍 Endpoints d'administration

### Lister les origines autorisées
```bash
python launch.py --origins
```

## 🔒 Sécurité

### Recommandations de production

1. **Changez la clé secrète** :
   ```env
   CORS_SECRET_KEY=votre_cle_secrete_tres_longue_et_complexe_2024
   ```

2. **Utilisez HTTPS** :
   - Backend : `https://api.votre-domaine.com`
   - Frontends : `https://app.votre-domaine.com`

3. **Rate limiting** : Ajoutez un rate limiting sur l'endpoint `/register-origin`

4. **Monitoring** : Surveillez les logs d'enregistrement des origines

## 🐛 Dépannage

### Problème : "Origin not allowed"

1. Vérifiez que la clé secrète est identique partout
2. Vérifiez que l'enregistrement CORS s'est bien passé
3. Consultez les logs du backend

### Problème : "Unauthorized"

1. Vérifiez la clé secrète dans les headers
2. Vérifiez que la variable d'environnement `CORS_SECRET_KEY` est définie

### Problème : Frontend ne se connecte pas

1. Vérifiez que le backend est démarré
2. Vérifiez l'URL du backend dans la configuration
3. Vérifiez la connectivité réseau

## 📊 Monitoring

### Logs du backend

Le backend log automatiquement :
- Les nouvelles origines enregistrées
- Les origines supprimées
- Les erreurs d'authentification

### Fichier de persistance

Le fichier `allowed_origins.json` contient la liste des origines autorisées :

```json
[
  "http://localhost:3000",
  "http://192.168.1.100:3000",
  "http://localhost:19006"
]
```

## 🔄 Workflow de développement

1. **Nouveau frontend** : Ajoutez simplement la configuration CORS
2. **Nouvelle origine** : Elle s'enregistre automatiquement au premier lancement
3. **Suppression** : Utilisez l'endpoint `/remove-origin` si nécessaire
4. **Redémarrage** : Aucun redémarrage nécessaire !

## 🎯 Avantages

- ⚡ **Rapide** : Aucun redémarrage du serveur
- 🔒 **Sécurisé** : Authentification par clé secrète
- 🔄 **Automatique** : Enregistrement transparent
- 📱 **Multi-plateforme** : React JS + React Native
- 💾 **Persistant** : Survit aux redémarrages du serveur
- 🛠️ **Administrable** : Endpoints de gestion

Cette solution élimine complètement le besoin de redémarrer le serveur à chaque ajout de frontend !
