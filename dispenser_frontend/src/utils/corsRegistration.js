/**
 * Utilitaire pour gérer l'enregistrement CORS automatique
 */
import config from '../config';

class CORSRegistration {
  constructor() {
    this.isRegistered = false;
    this.registrationPromise = null;
  }

  /**
   * Enregistre l'origine actuelle auprès du backend
   * @returns {Promise<boolean>} True si l'enregistrement a réussi
   */
  async registerOrigin() {
    // Si déjà enregistré, retourner true
    if (this.isRegistered) {
      return true;
    }

    // Si une tentative d'enregistrement est en cours, attendre qu'elle se termine
    if (this.registrationPromise) {
      return await this.registrationPromise;
    }

    // Créer une nouvelle promesse d'enregistrement
    this.registrationPromise = this._performRegistration();

    try {
      const result = await this.registrationPromise;
      this.isRegistered = result;
      return result;
    } finally {
      this.registrationPromise = null;
    }
  }

  /**
   * Effectue l'enregistrement CORS
   * @private
   */
  async _performRegistration() {
    try {
      const currentOrigin = window.location.origin;
      const registrationUrl = `${config.backendUrl}${config.cors.registerEndpoint}`;

      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'X-Secret-Key': config.cors.secretKey,
          'Origin': currentOrigin,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        config.cors.isRegistered = true;
        return true;
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Erreur de parsing de la réponse' };
        }
        console.error('Erreur lors de l\'enregistrement CORS:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: registrationUrl,
          headers: {
            'X-Secret-Key': config.cors.secretKey,
            'Origin': currentOrigin
          }
        });
        return false;
      }
    } catch (error) {
      console.error('Erreur réseau lors de l\'enregistrement CORS:', error);
      return false;
    }
  }

  /**
   * Vérifie si l'origine est enregistrée
   * @returns {boolean}
   */
  getRegistrationStatus() {
    return this.isRegistered;
  }

  /**
   * Réinitialise le statut d'enregistrement (utile pour les tests)
   */
  resetRegistration() {
    this.isRegistered = false;
    this.registrationPromise = null;
    config.cors.isRegistered = false;
  }
}

// Instance singleton
const corsRegistration = new CORSRegistration();

export default corsRegistration;
