import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { useNavigate } from "react-router-dom";
import config from '../../../config';
import { usePrescription } from '../../../context/PrescriptionContext';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers'; 

function StepCarteIdentite({ goToNextStep, goBackStep }) {
  useAutoVoiceOver(voiceOverTexts.scanCarteIdentite);
  const { speak } = useVoiceOver();
  const { updatePrescriptionData } = usePrescription(); 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScannerView, setShowScannerView] = useState(false); 
  const [currentSide, setCurrentSide] = useState(null); 
  const [statusSides, setStatusSides] = useState({ R: null, V: null }); // null, "valid", "invalid"
  
  const [focusedIndex, setFocusedIndex] = useState(0);
  const backButtonSelectionRef = useRef(null);
  const backButtonScannerRef = useRef(null);
  const scanButtonRef = useRef(null);
  const buttonRefs = useRef([]);
  const navigate = useNavigate();

  // Fonction pour ouvrir le scanner pour un côté spécifique
  const openScannerForSide = (side) => {
    setCurrentSide(side);
    setShowScannerView(true);
    setError('');
    setFocusedIndex(0); // Reset focus to back button
  };

  const closeScannerView = () => {
    setShowScannerView(false);
    setCurrentSide(null);
    setError('');
    setLoading(false);
  };

  // Fonction pour scanner (appel API)
  const performScan = async () => {
    const docType = currentSide === 'recto' ? 'R' : 'V';
    
    try {
      setLoading(true);
      setError("");
      console.log(`🖨️ Lancement scanner pour ${currentSide} (${docType})...`);

      const formData = new FormData();
      formData.append("doc_type", docType);

      const res = await fetch(`${config.backendUrl}/api/scanner/scan`, {
        method: "POST",
        body: formData
      });

      const responseText = await res.text();
      console.log("📋 Réponse brute:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Réponse non-JSON: ${responseText.substring(0, 100)}`);
      }

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${data.error || responseText}`);
      }

      if (!data.success) {
        const errorMsg = data.error || "Échec du scan";
        console.error("❌ Erreur backend:", errorMsg);
        
        // Message d'erreur spécifique
        if (errorMsg.includes("recto") || errorMsg.includes("carte d'identité")) {
          setError(`Le document scanné ne semble pas être un ${currentSide === 'recto' ? 'recto' : 'verso'} valide. Vérifiez que :
            - La carte est bien orientée
            - Le document est bien une carte d'identité française
            - La carte est correctement placée sur le scanner`);
        } else {
          setError(`Erreur: ${errorMsg}`);
        }
        
        // Marquer ce côté comme invalide
        setStatusSides(prev => ({ ...prev, [docType]: "invalid" }));
        return;
      }

      // Sauvegarder les données
      const carteData = {};

      if (data.nom) carteData.nom = data.nom;
      if (data.prenom) carteData.prenom = data.prenom;
      if (data.date_naissance) carteData.dateNaissance = data.date_naissance;
      if (data.numero_identite) carteData.numeroIdentite = data.numero_identite;
      if (data.extracted_text) carteData.extractedText = data.extracted_text;


      // Mettre à jour le contexte avec les données pour ce côté
      updatePrescriptionData(prev => ({
        carteIdentite: {
          ...(prev?.carteIdentite || {}),
          ...carteData,
          [`${currentSide}Scanned`]: true
        }
      }));


      // Sauvegarder dans localStorage
      const existingData = JSON.parse(localStorage.getItem('carteIdentite') || '{}');
      localStorage.setItem('carteIdentite', JSON.stringify({
        ...existingData,
        ...carteData,
        [`${currentSide}Scanned`]: true
      }));

      // Marquer ce côté comme validé
      setStatusSides(prev => ({ ...prev, [docType]: "valid" }));
      
      // Fermer la vue scanner après succès
      setTimeout(() => {
        closeScannerView();
      }, 1000);

    } catch (err) {
      console.error("❌ Erreur complète:", err);
      setError(`Échec du scan: ${err.message}`);
      setStatusSides(prev => ({ ...prev, [docType]: "invalid" }));
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si les deux côtés sont validés
  useEffect(() => {
    if (statusSides.R === "valid" && statusSides.V === "valid") {
      // Attendre un peu avant de passer à l'étape suivante
      setTimeout(() => {
        goToNextStep();
      }, 1500);
    }
  }, [statusSides, goToNextStep]);

  // Navigation clavier - Vue sélection
  useEffect(() => {
    if (!showScannerView) {
      const handleKeyDown = (e) => {
        if (["ArrowLeft", "ArrowRight", "Enter", "Tab"].includes(e.key)) {
          e.preventDefault();
          
          if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
            setFocusedIndex(prev => (prev + 1) % 3); // 3 éléments: back + 2 cartes
          } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
            setFocusedIndex(prev => (prev - 1 + 3) % 3);
          } else if (e.key === "Enter") {
            if (focusedIndex === 0 && backButtonSelectionRef.current) {
              backButtonSelectionRef.current.click();
            } else if (focusedIndex === 1 && buttonRefs.current[0]) {
              buttonRefs.current[0].click();
            } else if (focusedIndex === 2 && buttonRefs.current[1]) {
              buttonRefs.current[1].click();
            }
          }
        }
      };
      
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showScannerView, focusedIndex]);

  // Navigation clavier - Vue scanner
  useEffect(() => {
    if (showScannerView) {
      const handleKeyDown = (e) => {
        if (["ArrowLeft", "ArrowRight", "Enter", "Escape", "Tab"].includes(e.key)) {
          e.preventDefault();
          
          if (e.key === "Escape") {
            closeScannerView();
          } else if (e.key === "Enter") {
            if (focusedIndex === 0 && backButtonScannerRef.current) {
              backButtonScannerRef.current.click();
            } else if (focusedIndex === 1 && scanButtonRef.current && !loading) {
              scanButtonRef.current.click();
            }
          } else if (e.key === "ArrowRight" || (e.key === "Tab" && !e.shiftKey)) {
            setFocusedIndex(prev => Math.min(prev + 1, 1)); // max 2 éléments
          } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
            setFocusedIndex(prev => Math.max(prev - 1, 0));
          }
        }
      };
      
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showScannerView, focusedIndex, loading]);

  // Gestion du focus
  useEffect(() => {
    if (showScannerView) {
      if (focusedIndex === 0 && backButtonScannerRef.current) {
        backButtonScannerRef.current.focus();
      } else if (focusedIndex === 1 && scanButtonRef.current && !loading) {
        scanButtonRef.current.focus();
      }
    } else {
      if (focusedIndex === 0 && backButtonSelectionRef.current) {
        backButtonSelectionRef.current.focus();
      } else if (focusedIndex === 1 && buttonRefs.current[0]) {
        buttonRefs.current[0].focus();
      } else if (focusedIndex === 2 && buttonRefs.current[1]) {
        buttonRefs.current[1].focus();
      }
    }
  }, [showScannerView, focusedIndex, loading]);

  // Fonction pour afficher le statut d'un côté
  const renderStatus = (side) => {
    const docType = side === 'recto' ? 'R' : 'V';
    if (statusSides[docType] === "valid") {
      return <p className="text-green-600 font-semibold mt-2">✔ Vérifié</p>;
    }
    if (statusSides[docType] === "invalid") {
      return <p className="text-red-600 font-semibold mt-2">❌ Refusé</p>;
    }
    return null;
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {showScannerView ? (
        // Vue Scanner
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                ref={backButtonScannerRef}
                onClick={closeScannerView}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 ? 'ring-2 ring-pink-300' : ''}`}
                {...createVoiceOverHandlers(speak)}
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">
                Scan {currentSide === 'recto' ? 'Recto' : 'Verso'} - Carte d'identité
              </h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-8">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8">
                <config.icons.idCard className="text-4xl text-black" />
              </div>
              <p className="text-2xl text-black mb-4 font-semibold">
                Veuillez insérer le {currentSide === 'recto' ? 'recto' : 'verso'} de votre carte d'identité
              </p>
              <p className="text-xl text-black">
                dans le scanner présent sur la machine
              </p>
            </div>

            {/* Bouton scanner - seulement si pas déjà validé */}
            {statusSides[currentSide === 'recto' ? 'R' : 'V'] !== "valid" && !loading && (
              <button
                ref={scanButtonRef}
                onClick={performScan}
                className={`px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300
                  ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
                {...createVoiceOverHandlers(speak)}
              >
                LANCER LE SCAN
              </button>
            )}

            {loading && (
              <p className="text-gray-700 font-medium text-xl animate-pulse mt-4">
                Scan en cours, veuillez patienter...
              </p>
            )}

            {error && (
              <div className="text-red-600 font-semibold text-lg mt-4 max-w-md text-center">
                {error}
              </div>
            )}

            {statusSides[currentSide === 'recto' ? 'R' : 'V'] === "valid" && (
              <div className="text-green-600 font-semibold text-xl mt-4 max-w-md">
                {currentSide === 'recto' ? 'Recto' : 'Verso'} scanné avec succès !
              </div>
            )}
          </div>
        </>
      ) : (
        // Vue Sélection
        <>
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                ref={backButtonSelectionRef}
                onClick={goBackStep}
                tabIndex={0}
                className={`flex items-center text-black hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300 focus:rounded-lg
                  ${focusedIndex === 0 ? 'ring-2 ring-pink-300' : ''}`}
                {...createVoiceOverHandlers(speak)}
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan carte d'identité</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez le côté de la carte d'identité à scanner
            </h2>

            <div className="flex gap-8 max-w-5xl w-full mb-8">
              {/* Carte Recto */}
              <div className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px] transition-all
                ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.idCard className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Recto</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le recto de votre carte
                </p>
                {renderStatus('recto')}
                <button
                  ref={el => buttonRefs.current[0] = el}
                  onClick={() => openScannerForSide('recto')}
                  tabIndex={0}
                  className={`bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 mt-4 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${focusedIndex === 1 ? 'scale-105' : ''}`}
                  {...createVoiceOverHandlers(speak)}
                >
                  CHOISIR
                </button>
              </div>

              {/* Carte Verso */}
              <div className={`flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px] transition-all
                ${focusedIndex === 2 ? 'ring-2 ring-pink-300 scale-105' : ''}`}>
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.idCard className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Verso</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le verso de votre carte
                </p>
                {renderStatus('verso')}
                <button
                  ref={el => buttonRefs.current[1] = el}
                  onClick={() => openScannerForSide('verso')}
                  tabIndex={0}
                  className={`bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 mt-4 focus:outline-none focus:ring-2 focus:ring-pink-300
                    ${focusedIndex === 2 ? 'scale-105' : ''}`}
                  {...createVoiceOverHandlers(speak)}
                >
                  CHOISIR
                </button>
              </div>
            </div>

            {/* Message quand les deux côtés sont validés */}
            {statusSides.R === "valid" && statusSides.V === "valid" && (
              <div className="text-green-600 font-semibold text-xl mt-4">
                ✓ Carte d'identité entièrement vérifiée
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StepCarteIdentite;