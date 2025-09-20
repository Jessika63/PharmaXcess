/**
 * Configuration pour l'application PharmaXcess
 */
export interface CORSConfig {
  secretKey: string;
  registerEndpoint: string;
  isRegistered: boolean;
}

export interface AppConfig {
  backendUrl: string;
  cors: CORSConfig;
}

console.log('CORS_SECRET_KEY from env:', process.env.EXPO_PUBLIC_CORS_SECRET_KEY);

const config: AppConfig = {
  // Configuration du backend
  backendUrl: 'http://localhost:5000',

  // Configuration CORS dynamique
  cors: {
    secretKey: process.env.EXPO_PUBLIC_CORS_SECRET_KEY,
    registerEndpoint: '/register-origin',
    isRegistered: false
  }
};

export default config;
