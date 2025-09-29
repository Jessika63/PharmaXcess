# Dynamic CORS Solution - PharmaXcess

This solution automatically manages CORS origins without needing to restart the backend server every time a new frontend is added.

## 🚀 Features

- ✅ Automatic CORS origin registration
- ✅ No server restart required
- ✅ Secured with a secret key
- ✅ Compatible with React JS and React Native
- ✅ Persistence of allowed origins
- ✅ Admin/debug interface

## 📁 File Structure

### Backend (Flask)
- `backend/app.py` - Dynamic CORS middleware and endpoints
- `backend/cors_config.py` - CORS configuration

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
python launch.py --app
```

### 3. Automatic registration

As soon as a frontend launches:
1. It automatically detects its origin
2. It registers itself with the backend using the secret key
3. The backend adds it to its list of allowed origins
4. The app starts normally

## 🔍 Admin Endpoints

### List allowed origins
```bash
python launch.py --origins
```

## 🔒 Security

### Production Recommendations

1. **Change the secret key** :
   ```env
   CORS_SECRET_KEY=your_very_long_and_complex_secret_key_2024
   ```

2. **Use HTTPS** :
   - Backend : `https://api.votre-domaine.com`
   - Frontends : `https://app.votre-domaine.com`

3. **Rate limiting** : Add rate limiting to the `/register-origin` endpoint

4. **Monitoring** : Monitor the origin registration logs

## 🐛 Troubleshooting

### Issue: "Origin not allowed"

1. Check that the secret key matches everywhere
2. Check that CORS registration went through successfully
3. Check the backend logs

### Issue: "Unauthorized"

1. Check the secret key in the request headers
2. Make sure the `CORS_SECRET_KEY` environment variable is set

### Issue: Frontend not connecting

1. Verify that the backend is running
2. Verify the backend URL in the configuration
3. Check network connectivity

## 📊 Monitoring

### Backend logs

The backend automatically logs:
- Newly registered origins
- Removed origins
- Authentication errors

## 🔄 Development Workflow

1. **New frontend** : Simply add the CORS configuration
2. **New origin** : Automatically registered at first launch
3. **Removal** : Use the `/remove-origin` endpoint if needed
4. **Restart** : No restart required!

## 🎯 Advantages

- ⚡ **Fast** : No server restart needed
- 🔒 **Secure** : Secret key authentication
- 🔄 **Automatic** : Transparent registration
- 📱 **Cross-platform** : React JS + React Native
- 💾 **Persistent** : Survives server restarts
- 🛠️ **Manageable** : Admin endpoints

This solution completely removes the need to restart the server whenever a new frontend is added!
