import { useEffect, useState } from 'react';
import corsRegistration from '../utils/corsRegistration';

/**
 * Hook personnalisé pour gérer l'enregistrement CORS automatique
 * @returns {Object} État de l'enregistrement CORS
 */
export const useCORSRegistration = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const retryRegistration = async () => {
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
