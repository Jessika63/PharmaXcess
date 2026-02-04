
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
    return new Promise((resolve) => {
      try {
        // Nettoyer l'URL pour éviter les doubles slashes
        const backendBase = config.backendUrl.replace(/\/$/, '');
        const registrationUrl = `${backendBase}${config.corsEndpoint}`;
        const testUrl = backendBase; // Test simple GET sur la racine

        console.log('🌐 Configuration:', {
          backendUrl: config.backendUrl,
          corsEndpoint: config.corsEndpoint,
          fullUrl: registrationUrl,
          testUrl: testUrl,
          hasSecretKey: !!config.corsSecretKey
        });

        // PREMIER TEST: Simple requête GET sur la racine pour vérifier connectivité
        console.log('🔍 Test de connectivité simple sur:', testUrl);
        const xhrTest = new XMLHttpRequest();
        
        xhrTest.timeout = 5000;
        
        xhrTest.onload = function() {
          console.log('✅ TEST CONNECTIVITÉ OK - Status:', xhrTest.status);
          console.log('Réponse:', xhrTest.responseText);
          
          // Maintenant qu'on sait que la connexion fonctionne, faisons la vraie requête CORS
          console.log('🌐 Envoi requête CORS via XMLHttpRequest à:', registrationUrl);
          
          const xhr = new XMLHttpRequest();
          xhr.timeout = 10000;
          
          xhr.onload = function() {
            console.log('✅ Réponse CORS reçue, status:', xhr.status);
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('✅ CORS enregistré avec succès');
              resolve(true);
            } else {
              console.log('❌ Erreur serveur CORS:', xhr.status, xhr.responseText);
              resolve(false);
            }
          };
          
          xhr.onerror = function() {
            console.log('❌ Erreur réseau sur requête CORS');
            console.log('Status:', xhr.status, 'ReadyState:', xhr.readyState);
            resolve(false);
          };
          
          xhr.ontimeout = function() {
            console.log('⏱️ Timeout sur requête CORS');
            resolve(false);
          };
          
          xhr.open('POST', registrationUrl, true);
          xhr.setRequestHeader('X-Secret-Key', config.corsSecretKey);
          xhr.setRequestHeader('Origin', 'pharmaxcess://mobile-app');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36');
          xhr.send();
        };

        xhrTest.onerror = function() {
          console.log('❌ TEST CONNECTIVITÉ ÉCHOUÉ - onerror');
          console.log('Status:', xhrTest.status, 'ReadyState:', xhrTest.readyState);
          console.log('🔴 Le backend n\'est pas accessible depuis l\'app');
          console.log('Vérifiez: VPN, proxy, paramètres réseau MIUI, firewall');
          resolve(false);
        };

        xhrTest.ontimeout = function() {
          console.log('⏱️ TEST CONNECTIVITÉ TIMEOUT');
          resolve(false);
        };

        xhrTest.open('GET', testUrl, true);
        xhrTest.setRequestHeader('User-Agent', 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36');
        xhrTest.send();
        
      } catch (error) {
        console.log('🌐 Exception lors de la création de la requête:', {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        resolve(false);
      }
    });
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
