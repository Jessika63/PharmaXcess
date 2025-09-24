
/**
 * Utilitaire CORS simplifié
 */
import config from '../config';

class CORSRegistration {
  private isRegistered: boolean = false;
  private registrationPromise: Promise<boolean> | null = null;

  async registerOrigin(): Promise<boolean> {
    if (this.isRegistered) return true;
    if (this.registrationPromise) return await this.registrationPromise;

    this.registrationPromise = this._performRegistration();

    try {
      const result = await this.registrationPromise;
      this.isRegistered = result;
      return result;
    } finally {
      this.registrationPromise = null;
    }
  }

  private async _performRegistration(): Promise<boolean> {
    try {
      const registrationUrl = `${config.backendUrl}${config.corsEndpoint}`;

      console.log('🌐 Envoi requête CORS à:', registrationUrl);

      const response = await fetch(registrationUrl, {
        method: 'POST',
        headers: {
          'X-Secret-Key': config.corsSecretKey,
          'Origin': 'pharmaxcess://mobile-app',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ CORS enregistré avec succès');
        return true;
      } else {
        const errorText = await response.text();
        console.log('❌ Erreur serveur:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.log('🌐 Erreur réseau:', error);
      return false;
    }
  }

  getRegistrationStatus(): boolean {
    return this.isRegistered;
  }

  resetRegistration(): void {
    this.isRegistered = false;
    this.registrationPromise = null;
  }
}

const corsRegistration = new CORSRegistration();
export default corsRegistration;
