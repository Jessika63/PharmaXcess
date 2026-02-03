
export interface AppConfig {
  backendUrl: string;
  corsSecretKey: string;
  corsEndpoint: string;
}

// Récupérer l'ENV côté frontend
const env = process.env.EXPO_PUBLIC_ENV || 'development';

const backendUrl =
  env === 'production'
    ? process.env.EXPO_PUBLIC_BACKEND_URL || ''
    : process.env.EXPO_PUBLIC_NGROK_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

const config: AppConfig = {
  backendUrl,
  corsSecretKey: process.env.EXPO_PUBLIC_CORS_SECRET_KEY || '',
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

if (!config.backendUrl) {
  console.warn(
    '⚠️ Warning: backendUrl is not set. Please check your environment variables.'
  );
}

export default config;
