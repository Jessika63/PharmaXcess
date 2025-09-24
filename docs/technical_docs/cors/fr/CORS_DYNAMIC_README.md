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

### Dispenser Frontend (React JS)
- `dispenser_frontend/src/config.js` - Updated configuration
- `dispenser_frontend/src/utils/corsRegistration.js` - Registration utility
- `dispenser_frontend/src/hooks/useCORSRegistration.js` - React hook
- `dispenser_frontend/src/App.js` - Automatic registration integration

### App Frontend (React Native)
- `pharmaXcess_app/config.ts` - TypeScript configuration
- `pharmaXcess_app/utils/corsRegistration.ts` - Registration utility
- `pharmaXcess_app/hooks/useCORSRegistration.ts` - React Native hook
- `pharmaXcess_app/components/CORSLoadingScreen.tsx` - Loading screen
- `pharmaXcess_app/App.tsx` - Automatic registration integration

## 🔧 Configuration

### Secret Key

The secret key must be the same across all frontends.

## 🚀 Usage

### 1. Start the backend

```bash
python launch.py --back
```

The backend starts with no CORS origins configured.

### 2. Start the frontends

#### Dispenser Frontend (React JS)
```bash
python launch.py --front
```

#### App Frontend (React Native)
```bash
python launch.py --app
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
