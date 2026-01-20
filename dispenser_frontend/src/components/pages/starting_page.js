import React, { useRef, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import config from '../../config';
import ErrorPage from '../ErrorPage';

function StartingPage() {
  const prescriptionButtonRef = useRef(null);
  const nonPrescriptionButtonRef = useRef(null);

  const [focusedIndex, setFocusedIndex] = useState(null); 
  const [hoveredCard, setHoveredCard] = useState(null); 


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
          resolve(detected);
        }
      };

      // Test 1: Check common APIs
      if (window.adsbygoogle === undefined || window.adblock === true) {
        detected = true;
      }
      completeTest();

      // Test 2: Check CSS classes
      const testElement = document.createElement('div');
      testElement.className = 'ad-unit ad-box ad-container adsbox';
      testElement.style.cssText = 'position:absolute;top:-1000px;left:-1000px;width:1px;height:1px;';
      document.body.appendChild(testElement);

      setTimeout(() => {
        // Check if the element has been modified by a blocker
        const isHidden = testElement.offsetHeight === 0 ||
                        testElement.offsetWidth === 0 ||
                        testElement.style.display === 'none';

        if (isHidden) {
          detected = true;
        }
        document.body.removeChild(testElement);
        completeTest();
      }, 100);

      // Test 3: Check a request to an advertising file
      fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      })
      .then(response => {
        // Even if the response is OK, check if the content has been modified
        if (!response.ok) {
          detected = true;
        }
      })
      .catch(() => {
        detected = true;
      })
      .finally(completeTest);

      // Security timeout
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

      // Frontal blocker detection
      let adBlockDetected = false;
      try {
        adBlockDetected = await detectAdBlock();
      } catch (adBlockError) {
        console.error('Erreur de détection AdBlock:', adBlockError);
      }

      // Add a timestamp to avoid browser caching
      const timestamp = new Date().getTime();

      // Send the info to the backend with forceRefresh parameter
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

      // If the server does not respond
      if (!response) {
        throw new Error("Le serveur ne répond pas. Veuillez réessayer plus tard.");
      }

      // HTTP error handling
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

      // Verifying the response
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

    if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => prevIndex === null ? 0 : (prevIndex + 1) % 2);
    } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => prevIndex === null ? 1 : (prevIndex - 1 + 2) % 2); 

    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndex === 0) {
        navigate("/documents-flow");
      } else if (focusedIndex === 1) {
        navigate('/non-prescription-drugs');
      }
    }
  }, [focusedIndex, navigate, vpnStatus.isVPN]);

  useEffect(() => {
    const refs = [prescriptionButtonRef, nonPrescriptionButtonRef];
    if (focusedIndex !== null && refs[focusedIndex] && refs[focusedIndex].current) {
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
        <div className="text-2xl">
          Vérification de sécurité en cours...
        </div>
        <div className="mt-4 animate-pulse">
          Veuillez patienter
        </div>
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
    <div className={`bg-background_color w-full min-h-screen flex flex-col items-center overflow-hidden pt-12`}>
      {/* Logo */} 
      <div className="flex justify-center items-center mb-8">
        <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-72 h-auto" />
      </div>

      {/* Welcome Text and Subtitle */}
      <h1 className="text-4xl font-bold text-black mb-2">Bienvenue</h1>
      <p className="text-xl font-semibold text-black mb-12">Choisissez votre service</p>

      {/* Container for both cards - side by side */}
      <div className="flex flex-row justify-center items-stretch gap-8 w-full px-12"> 

      {/* Card 'With Prescription' */} 
      <Link 
        to="/documents-flow" 
        ref={prescriptionButtonRef}
        tabIndex={0}
        onMouseEnter={() => setHoveredCard(0)} 
        onMouseLeave={() => setHoveredCard(null)} 
        className={`flex-1 max-w-md h-64 flex flex-col items-center justify-center p-8 
          ${config.borderRadiux.xl} ${config.shadows.md} 
          bg-white ${config.textColors.black}
          transition-transform duration-300 ease-in-out 
          ${config.focusStates.ring} cursor-pointer`}
        style={{ transform: hoveredCard === 0 || focusedIndex === 0 ? 'scale(1.05)' : 'scale(1)' }} 
      >
        {/* Icon in gray circle */} 
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6"> 
          <config.icons.filePrescription className="text-2xl text-gray-600" /> 
        </div>
        {/* Title  */}
        <p className="text-lg font-semibold text-center mb-2"> 
          Vous avez une ordonnance<br />médicale à traiter 
        </p> 
        {/* Subtitle  */}
        <p className="text-sm text-gray-500"> 
          Continuer avec ordonnance 
        </p> 
      </Link>

      {/* Card 'Without Prescription'  */}
      <Link 
        to="/non-prescription-drugs" 
        ref={nonPrescriptionButtonRef}
        tabIndex={0}
        onMouseEnter={() => setHoveredCard(1)}
        onMouseLeave={() => setHoveredCard(null)}
        className={`flex-1 max-w-md h-64 flex flex-col items-center justify-center p-8 
          ${config.borderRadius.xl} ${config.shadows.md}
          bg-white ${config.textColors.black}
          transition-transform duration-300 ease-in-out
          ${config.focusStates.ring} cursor-pointer`}
        style={{ transform: hoveredCard === 1 || focusedIndex === 1 ? 'scale(1.05)' : 'scale(1)' }}
      >
        {/* Icon in gray circle */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
          <config.icons.cart className="text-2xl text-gray-600"/>
        </div>
        {/* Title  */}
        <p className="text-lg font-semibold text-center mb-2"> 
          Achat libre de médicaments<br />disponibles
        </p>
        {/* Subtitle  */}
        <p className="text-sm text-gray-500"> 
          Continuer sans ordonnance
        </p>

        </Link>
      </div>
    </div>
  );
}

export default StartingPage;
