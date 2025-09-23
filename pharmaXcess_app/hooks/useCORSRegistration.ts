
import { useEffect, useState } from 'react';
import corsRegistration from '../utils/corsRegistration';

export const useCORSRegistration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeCORS();
  }, []);

  const initializeCORS = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await corsRegistration.registerOrigin();
      setIsRegistered(success);

      if (!success) {
        setError('Échec enregistrement CORS');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
      setIsRegistered(false);
    } finally {
      setIsLoading(false);
    }
  };

  const retry = async () => {
    corsRegistration.resetRegistration();
    await initializeCORS();
  };

  return {
    isRegistered,
    isLoading,
    error,
    retry
  };
};
