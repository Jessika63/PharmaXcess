import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import ErrorPage from '../ErrorPage';

function StartingPage() {
  const prescriptionButtonRef = useRef(null);
  const nonPrescriptionButtonRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(0);
  const [vpnStatus, setVpnStatus] = useState({
    loading: true,
    isVPN: false,
    error: null,
    details: null
  });
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);

  const detectAdBlock = () => {
    return new Promise((resolve) => {
      let detected = false;
      let testsCompleted = 0;
      const totalTests = 3;

      const completeTest = () => {
        testsCompleted++;
        if (testsCompleted === totalTests) {
          console.log('AdBlock detection result:', detected);
          resolve(detected);
        }
      };

      // Test 1: Vérifier les API communes
      if (window.adsbygoogle === undefined || window.adblock === true) {
        detected = true;
      }
      completeTest();

      // Test 2: Vérifier les classes CSS
      const testElement = document.createElement('div');
      testElement.className = 'ad-unit ad-box ad-container adsbox';
      testElement.style.cssText = 'position:absolute;top:-1000px;left:-1000px;width:1px;height:1px;';
      document.body.appendChild(testElement);
      
      setTimeout(() => {
        // Vérifier si l'élément a été modifié par un bloqueur
        const isHidden = testElement.offsetHeight === 0 || 
                        testElement.offsetWidth === 0 || 
                        testElement.style.display === 'none';
        
        if (isHidden) {
          detected = true;
        }
        document.body.removeChild(testElement);
        completeTest();
      }, 100);

      // Test 3: Vérifier une requête vers un fichier publicitaire (URL corrigée)
      fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      })
      .then(response => {
        // Même si la réponse est OK, vérifier si le contenu a été modifié
        if (!response.ok) {
          detected = true;
        }
      })
      .catch(() => {
        detected = true;
      })
      .finally(completeTest);

      // Timeout de sécurité
      setTimeout(() => {
        if (testsCompleted < totalTests) {
          testsCompleted = totalTests;
          resolve(detected);
        }
      }, 1000);
    });
  };

  // VPN Detection Function
  const checkVPN = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }

    try {
      setVpnStatus(prev => ({...prev, loading: true}));
  
      // Détection frontale du bloqueur
      let adBlockDetected = false;
      try {
        adBlockDetected = await detectAdBlock();
      } catch (adBlockError) {
        console.error('Erreur de détection AdBlock:', adBlockError);
      }
  
      // Ajouter un timestamp pour éviter le cache navigateur
      const timestamp = new Date().getTime();
      
      // Envoyer l'info au backend avec paramètre de forceRefresh
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${config.backendUrl}/check-vpn?t=${timestamp}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adBlockDetected: adBlockDetected,
          forceRefresh: !!(vpnStatus.error || vpnStatus.isVPN)
        }),
        signal: controller.signal
      });
  
      clearTimeout(timeout);
  
      // Si le serveur ne répond pas
      if (!response) {
        throw new Error("Le serveur ne répond pas. Veuillez réessayer plus tard.");
      }
  
      // Gestion des erreurs HTTP
      if (!response.ok) {
        let errorMessage = `Erreur HTTP: ${response.status}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          try {
            errorMessage = await response.text();
          } catch {
            errorMessage = "Erreur inconnue du serveur";
          }
        }
        
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
  
      // Vérification de la réponse
      if (!data) {
        throw new Error("Réponse serveur vide");
      }
      
      if (typeof data.isVPN === 'undefined') {
        throw new Error("Réponse serveur invalide: champ 'isVPN' manquant");
      }
  
      setVpnStatus({
        loading: false,
        isVPN: data.isVPN,
        error: null,
        details: {
          ip: data.ip || 'inconnue',
          checks: data.checksPerformed || 'inconnu',
          fallback: data.fallbackUsed || false,
          adblockDetected: data.adblockDetected || false,
          vpnDetected: data.vpnDetected || false,
          countryBlocked: data.countryBlocked || false
        }
      });
  
    } catch (error) {
      console.error('VPN check error:', error);
      
      let errorMessage = error.message || 'Erreur de vérification VPN';
      if (error.name === 'AbortError') {
        errorMessage = "La requête a expiré. Vérifiez votre connexion internet.";
      }
  
      setVpnStatus({
        loading: false,
        isVPN: false,
        error: errorMessage,
        details: null
      });
    }
  }, [retryCount]);

  useEffect(() => {
    checkVPN();
  }, [checkVPN]);

  const handleKeyDown = useCallback((event) => {
    if (vpnStatus.isVPN) {
      return;
    } // Block navigation if VPN detected

    if (event.key === "ArrowRight") {
      setFocusedIndex((prevIndex) => (prevIndex < 1 ? prevIndex + 1 : prevIndex));
    } else if (event.key === "ArrowLeft") {
      setFocusedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndex === 0) {
        navigate('/documents-checking');
      } else if (focusedIndex === 1) {
        navigate('/non-prescription-drugs');
      }
    }
  }, [focusedIndex, navigate, vpnStatus.isVPN]);

  useEffect(() => {
    const refs = [prescriptionButtonRef, nonPrescriptionButtonRef];
    if (refs[focusedIndex] && refs[focusedIndex].current) {
      refs[focusedIndex].current.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle loading state
  if (vpnStatus.loading) {
    return (
      <div className="bg-background_color w-full min-h-screen flex flex-col justify-center items-center">
        <div className="text-2xl">Vérification de sécurité en cours...</div>
        <div className="mt-4 animate-pulse">Veuillez patienter</div>
      </div>
    );
  }

  // Handle VPN detected state
  if (vpnStatus.isVPN) {
    let message = "Accès refusé : Problème de sécurité détecté";
    let details = "Pour des raisons de sécurité, votre accès a été refusé.";
    
    if (vpnStatus.details?.adblockDetected) {
        message = "Accès refusé : Bloqueur de publicités détecté";
        details = `Nous avons détecté que vous utilisez un bloqueur de publicités (comme uBlock Origin ou addBlock).
                \n\nPour des raisons de sécurité et de fonctionnement correct de notre système de paiement,
                les bloqueurs de publicités ne sont pas autorisés.
                \n\nVeuillez désactiver votre bloqueur de publicités pour accéder à nos services.`;
    } else if (vpnStatus.details?.vpnDetected) {
        message = "Accès refusé : VPN/Proxy détecté";
        details = `Pour des raisons de sécurité et conformément à notre politique de paiement,
                les connexions via VPN sont désactivées.
                \n\nIP détectée: ${vpnStatus.details?.ip || 'inconnue'}
                \n\nVeuillez désactiver votre VPN pour accéder à nos services.`;
    } else if (vpnStatus.details?.countryBlocked) {
        message = "Accès refusé : Pays non autorisé";
        details = `Votre pays (${vpnStatus.details?.country || 'inconnu'}) n'est pas autorisé à accéder à nos services.
                \n\nPour des raisons de conformité, nous ne pouvons pas vous permettre d'accéder à notre plateforme.`;
    }
    
    return (
        <ErrorPage message={`${message}\n\n${details}`}>
            {vpnStatus.details?.adblockDetected && (
                <button 
                    onClick={() => checkVPN(true)}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Réessayer la vérification
                </button>
            )}
        </ErrorPage>
    );
  }

  // Handle non-blocking VPN error
  if (vpnStatus.error) {
    return (
      <ErrorPage
        message={`Erreur lors de la vérification de sécurité\n\n${vpnStatus.error}\n\nVeuillez réessayer ou contacter le support.`} 
      />
    );
  }

  // Main page content
  return (
    <div className={`bg-background_color w-full min-h-screen flex flex-col justify-center items-center overflow-hidden`}>
      {/* Header */}
      <div className="w-4/5 h-40 flex justify-center items-center mb-12">
        {/* Logo */}
        <div className="flex justify-center items-center w-full">
          <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-96 h-24" />
        </div>
      </div>

      {/* Container for centering both buttons */}
      <div className={`flex flex-col items-center ${config.spacing.xxl} w-full`}>

        {/* Button 'Médicaments sous ordonnance' */}
        <Link to="/documents-checking" className="w-full flex justify-center">
          <div
            ref={prescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center ${config.borderRadius.xl} ${config.shadows.md} 
              ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.xl}
              ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
              ${focusedIndex === 0 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.prescription className="mr-6" />
            Médicaments avec ordonnance
          </div>
        </Link>

        {/* Button 'Médicaments sans ordonnance' */}
        <Link to="/non-prescription-drugs" className="w-full flex justify-center">
          <div
            ref={nonPrescriptionButtonRef}
            tabIndex={0}
            className={`w-2/5 h-40 flex items-center justify-center ${config.borderRadius.xl} ${config.shadows.md} 
              ${config.buttonColors.mainGradient} ${config.textColors.primary} ${config.fontSizes.xl}
              ${config.transitions.slow} ${config.buttonColors.mainGradientHover} ${config.focusStates.ring}
              ${focusedIndex === 1 ? config.scaleEffects.focus : ''}`}
          >
            <config.icons.pills className="mr-6" />
            Médicaments sans ordonnance
          </div>
        </Link>

      </div>
    </div>
  );
}

export default StartingPage;
