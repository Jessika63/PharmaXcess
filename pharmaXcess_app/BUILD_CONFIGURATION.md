# Configuration des Builds APK

## Variables d'environnement

### Fichier .env (pour le développement local)

Le fichier `.env` à la racine de `pharmaXcess_app` contient les variables suivantes:

```bash
# Clé secrète pour CORS
EXPO_PUBLIC_CORS_SECRET_KEY='phx_sec_cGh4X3NlY183RSM5d0A0SyRxRiFwTDIldlI1JmNYKno4YlkrZDNtVTZeblNfalRmRC1IKFApVz1Re0d9W0FdQjtOOlY8Qz5aP3hK'

# URL Ngrok pour le développement local
EXPO_PUBLIC_NGROK_BACKEND_URL=https://dorie-nonerodent-unyieldingly.ngrok-free.dev

# URL du serveur de production
EXPO_PUBLIC_BACKEND_URL=http://57.128.57.96:5000

# Token Ngrok
NGROK_TOKEN=336CULWD3QrMo1vTpDuIQ7jPIuC_3FwKkcq8X9UXha3hf169U

# Environnement actuel (development ou production)
EXPO_PUBLIC_ENV=production
```

⚠️ **Important**: Le fichier `.env` n'est utilisé que pour le développement local (`npx expo start`). Pour les builds APK, les variables d'environnement doivent être définies dans `eas.json`.

### Configuration eas.json (pour les builds APK)

Les variables d'environnement sont maintenant directement intégrées dans `eas.json` pour chaque profil de build. Cela garantit qu'elles sont incluses dans l'APK compilé.

## Comportement selon l'environnement

### Mode Development (`EXPO_PUBLIC_ENV=development`)
- Utilise `EXPO_PUBLIC_NGROK_BACKEND_URL` en priorité
- Idéal pour le développement local avec ngrok
- Logs de débogage activés

### Mode Production (`EXPO_PUBLIC_ENV=production`)
- Utilise `EXPO_PUBLIC_BACKEND_URL`
- Pointe vers le serveur distant (57.128.57.96:5000)
- **C'est ce mode qui doit être utilisé pour les builds APK**

## Configuration des builds (eas.json)

### Build Development
```bash
eas build --profile development --platform android --local
```
- Utilise `EXPO_PUBLIC_ENV=development`
- Pour les tests en développement

### Build Preview (Recommandé pour APK)
```bash
eas build --profile preview --platform android --local
```
- Utilise `EXPO_PUBLIC_ENV=production`
- Utilise `EXPO_PUBLIC_BACKEND_URL=http://57.128.57.96:5000`
- Pour les tests avant la production finale
- **✅ Recommandé pour les builds APK de test**

### Build Production
```bash
eas build --profile production --platform android --local
```
- Utilise `EXPO_PUBLIC_ENV=production`
- Pour les releases finales

## Important pour les builds APK

⚠️ **Avant de builder un APK:**

1. **Vérifiez `eas.json`**: Les variables d'environnement doivent être définies dans la section `env` du profil de build
2. **Vérifiez l'URL backend**: Assurez-vous que `EXPO_PUBLIC_BACKEND_URL` pointe vers le bon serveur
3. **Serveur accessible**: Le serveur doit être accessible depuis internet (pas localhost)
4. **Clé CORS**: La clé `EXPO_PUBLIC_CORS_SECRET_KEY` doit correspondre à celle du backend

## Mise à jour de l'URL backend

Si vous devez changer l'URL du backend:

1. Éditez le fichier `eas.json`
2. Modifiez `EXPO_PUBLIC_BACKEND_URL` dans les sections `env` des profils `preview` et `production`
3. Rebuild l'APK avec `eas build --profile preview --platform android --local`

**Exemple dans eas.json:**
```json
{
  "build": {
    "preview": {
      "env": {
        "EXPO_PUBLIC_BACKEND_URL": "http://NOUVELLE_IP:PORT"
      }
    }
  }
}
```

## Vérification

Dans le code (`config.ts`), la configuration est sélectionnée ainsi:
```typescript
const backendUrl =
  env === 'production'
    ? process.env.EXPO_PUBLIC_BACKEND_URL           // URL serveur distant
    : process.env.EXPO_PUBLIC_NGROK_BACKEND_URL     // URL ngrok local
```

En mode `__DEV__`, les logs affichent la configuration active dans la console.

## Résolution des problèmes

Si vous voyez dans les logs Android:
```
W ReactNativeJS: ⚠️ Warning: backendUrl is not set
```

Cela signifie que les variables d'environnement n'ont pas été incluses dans le build. Vérifiez que:
1. Les variables sont bien définies dans `eas.json` sous `env` pour le profil utilisé
2. Vous avez rebuild l'APK après modification de `eas.json`
