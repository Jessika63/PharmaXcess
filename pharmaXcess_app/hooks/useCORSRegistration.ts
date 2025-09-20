import { useEffect, useState } from 'react';
import corsRegistration from '../utils/corsRegistration';

interface CORSRegistrationState {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  retryRegistration: () => Promise<void>;
}

/**
 * Hook personnalisé pour gérer l'enregistrement CORS automatique dans React Native
 * @returns {CORSRegistrationState} État de l'enregistrement CORS
 */
export const useCORSRegistration = (): CORSRegistrationState => {
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeCORS = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const success = await corsRegistration.registerOrigin();
        setIsRegistered(success);

        if (!success) {
          setError('Échec de l\'enregistrement CORS');
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation CORS:', err);
        setError('Erreur lors de l\'enregistrement CORS');
        setIsRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeCORS();
  }, []);

  const retryRegistration = async (): Promise<void> => {
    corsRegistration.resetRegistration();
    setIsLoading(true);
    setError(null);

    try {
      const success = await corsRegistration.registerOrigin();
      setIsRegistered(success);

      if (!success) {
        setError('Échec de l\'enregistrement CORS');
      }
    } catch (err) {
      console.error('Erreur lors de la nouvelle tentative CORS:', err);
      setError('Erreur lors de l\'enregistrement CORS');
      setIsRegistered(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isRegistered,
    isLoading,
    error,
    retryRegistration
  };
};
