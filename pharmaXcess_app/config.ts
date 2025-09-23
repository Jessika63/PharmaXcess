
export interface AppConfig {
  backendUrl: string;
  corsSecretKey: string;
  corsEndpoint: string;
}

// Configuration qui utilise les variables EXPO_PUBLIC_*
const config: AppConfig = {
  backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL,
  corsSecretKey: process.env.EXPO_PUBLIC_CORS_SECRET_KEY,
  corsEndpoint: '/register-origin'
};

// Log de débogage
if (__DEV__) {
  console.log('🔧 Configuration PharmaXcess:', {
    backendUrl: config.backendUrl,
    hasSecretKey: !!config.corsSecretKey && config.corsSecretKey !== 'default-secret-key',
    secretKeyLength: config.corsSecretKey?.length,
    mode: 'development'
  });
}

export default config;
