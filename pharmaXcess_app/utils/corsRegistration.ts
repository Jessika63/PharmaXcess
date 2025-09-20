/**
 * Utilitaire pour gérer l'enregistrement CORS automatique dans React Native
 */
import config from '../config';

class CORSRegistration {
  private isRegistered: boolean = false;
  private registrationPromise: Promise<boolean> | null = null;

  /**
   * Enregistre l'origine actuelle auprès du backend
   * @returns {Promise<boolean>} True si l'enregistrement a réussi
   */
  async registerOrigin(): Promise<boolean> {
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
  private async _performRegistration(): Promise<boolean> {
    try {
      // Pour React Native, nous utilisons l'URL du backend comme origine
      // ou nous pouvons utiliser l'adresse IP de l'appareil
      const currentOrigin = `${config.backendUrl}/mobile-app`;
      const registrationUrl = `${config.backendUrl}${config.cors.registerEndpoint}`;

      console.log('Tentative d\'enregistrement CORS pour:', currentOrigin);
      console.log('Secret key from config:', config.cors.secretKey);

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
        console.log('Enregistrement CORS réussi:', data);
        config.cors.isRegistered = true;
        return true;
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de l\'enregistrement CORS:', errorData);
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
  getRegistrationStatus(): boolean {
    return this.isRegistered;
  }

  /**
   * Réinitialise le statut d'enregistrement (utile pour les tests)
   */
  resetRegistration(): void {
    this.isRegistered = false;
    this.registrationPromise = null;
    config.cors.isRegistered = false;
  }
}

// Instance singleton
const corsRegistration = new CORSRegistration();

export default corsRegistration;
