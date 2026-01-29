import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import CameraComponent from '../../camera_component';
import ModalCamera from '../../modal_camera';
import config from '../../../config';
import useInactivityRedirect from '../../../utils/useInactivityRedirect';
import { usePrescription } from '../../../context/PrescriptionContext'; 

function StepCarteIdentite({ goToNextStep, goBackStep }) {
  const { updatePrescriptionData } = usePrescription(); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [currentDocType, setCurrentDocType] = useState(null);
  const [statusSides, setStatusSides] = useState({ R: null, V: null });
  const [showScannerView, setShowScannerView] = useState(false); 
  const [currentSide, setCurrentSide] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const focusedIndexRef = useRef(1); 
  
  const [focusedIndex, setFocusedIndex] = useState(1);
  const buttonsRef = useRef([]);
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  const openCameraForSide = (side) => {
    const docType = side === 'recto' ? 'R' : 'V';
    setCurrentDocType(docType);
    setCurrentSide(side); 
    setShowScannerView(true); 
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
    setShowScannerView(false); 
    setCurrentSide(null); 
    setLoading(false); 
    setError('');
  };

  const handlePhotoCaptured = async (base64Image) => {
    closeModal();

    try {
      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append("image", base64ToBlob(base64Image), "photo.jpg");
          formData.append("doc_type", currentDocType);
          return formData;
        })(),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // Save the data in context and localStorage 
        const carteData = {
          extractedText: data.extracted_text || '', 
          nom: data.nom || '', 
          prenom: data.prenom || '', 
          dateNaissance: data.date_naissance || '', 
          numeroIdentite: data.numeroIdentite || '' 
        }; 

        updatePrescriptionData({ carteIdentite: carteData }); 
        localStorage.setItem('carteIdentite', JSON.stringify(carteData));
        setStatusSides(prev => {
          const updated = { ...prev, [currentDocType]: "valid" };
          if (updated.R === "valid" && updated.V === "valid") {
            setTimeout(() => goToNextStep(), 800);
          }
          return updated;
        });
      } else {
        setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
        console.error("Erreur API :", data.error);
      }
    } catch (error) {
      setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
      console.error("Erreur client:", error);
    }
  };

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  };

  const renderStatus = (side) => {
    if (statusSides[side] === "valid") {
      return <p className="text-green-600 font-semibold mt-2">✔ Vérifié</p>;
    }
    if (statusSides[side] === "invalid") {
      return <p className="text-red-600 font-semibold mt-2">❌ Refusé</p>;
    }
    return null;
  };


  const handleKeyDown = useCallback((event) => {
    if (event.key === "ArrowRight" || (event.key === "Tab" && !event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % 4;
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "ArrowLeft" || (event.key === "Tab" && event.shiftKey)) {
      event.preventDefault();
      setFocusedIndex((prevIndex) => {
        const newIndex = (prevIndex - 1 + 4) % 4;
        focusedIndexRef.current = newIndex;
        return newIndex;
      });
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (focusedIndexRef.current === 1) {
        openCameraForSide("verso")
      } else if (focusedIndexRef.current === 2) {
        navigate('/');
      } else if (focusedIndexRef.current === 3) {
        goBackStep()
      } else if (focusedIndexRef.current === 0) {
        openCameraForSide("recto")
      }
    }
  }, [navigate, openCameraForSide]);


  useInactivityRedirect(() => setShowInactivityModal(true));
  useEffect(() => {
    if (!showInactivityModal) {
      return;
    }
    const dismiss = () => setShowInactivityModal(false);
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, dismiss));
    return () => events.forEach(event => window.removeEventListener(event, dismiss));
  }, [showInactivityModal]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (buttonsRef.current[focusedIndex]) {
      buttonsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
  }, [focusedIndex]);

  return (

    <div className="w-full h-screen flex flex-col">
      {showScannerView ? (
        // Scanner View
        <>
          {/* Header */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={closeModal}
                className="flex items-center text-black hover:text-gray-600 transition-colors"
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">
                Scan carte d'identité - {currentSide === 'recto' ? 'Recto' : 'Verso'}
              </h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* Scanner Content */}
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

            {/* Button to validate scan */}
            {statusSides[currentDocType] !== "valid" && !loading && (
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError('');

                    // Create a blank white image as placeholder
                    const canvas = document.createElement('canvas');
                    canvas.width = 640;
                    canvas.height = 480;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob(async (blob) => {
                      const formData = new FormData();
                      formData.append("image", blob, "photo.jpg");
                      formData.append("doc_type", currentDocType);

                      const response = await fetch(`${config.backendUrl}/extractText`, {
                        method: 'POST',
                        body: formData,
                      });

                      const data = await response.json();
                      if (response.ok && data.success) {
                        // Save the data in context and localStorage 
                        const carteData = {
                          extractedText: data.extracted_text || '', 
                          nom: data.nom || '', 
                          prenom: data.prenom || '', 
                          dateNaissance: data.date_naissance || '', 
                          numeroIdentite: data.numero_identite || '' 
                        }; 

                        updatePrescriptionData({ carteIdentite: carteData }); 


                        localStorage.setItem('carteIdentite', JSON.stringify(carteData));
                        
                        setStatusSides(prev => {
                          const updated = { ...prev, [currentDocType]: "valid" };
                          setTimeout(() => {
                            setShowScannerView(false);
                            if (updated.R === "valid" && updated.V === "valid") {
                              setTimeout(() => goToNextStep(), 800);
                            }
                          }, 1000);
                          return updated;
                        });
                      } else {
                        setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
                        setError(data.error || "Erreur lors du scan de la carte");
                        setLoading(false);
                      }
                    }, 'image/jpeg');
                  } catch (error) {
                    setStatusSides(prev => ({ ...prev, [currentDocType]: "invalid" }));
                    setError("Erreur lors du scan de la carte");
                    setLoading(false);
                    console.error("Erreur client:", error);
                  }
                }}
                className="px-16 py-5 bg-black text-white text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
              >
                LANCER LE SCAN
              </button>
            )}

            {loading && (
              <p className="text-gray-700 font-medium text-xl animate-pulse mt-2">Scan en cours, veuillez patienter...</p>
            )}

            {error && (
              <div className="text-red-600 font-semibold text-lg mt-2 max-w-md">{error}</div>
            )}

            {statusSides[currentDocType] === "valid" && (
              <div className="text-green-600 font-semibold text-xl mt-2 max-w-md">Carte scannée avec succès !</div>
            )}
          </div>
        </>
      ) : (
        // Selection View
        <>
          {/* Header */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                ref={(el) => (buttonsRef.current[3] = el)}
                onClick={goBackStep}
                className="flex items-center text-black hover:text-gray-600 transition-colors"
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan carte d'identité</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez le côté de la carte à scanner
            </h2>

            {/* Two cards side by side */}
            <div className="flex gap-8 max-w-5xl w-full mb-8">
              {/* Recto Card */}
              <div className="flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.idCard className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Recto</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le recto de votre carte
                </p>
                {renderStatus("R")}
                <button
                  ref={(el) => (buttonsRef.current[0] = el)}
                  onClick={() => openCameraForSide('recto')}
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 mt-4"
                >
                  CHOISIR
                </button>
              </div>

              {/* Verso Card */}
              <div className="flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.idCard className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Verso</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le verso de votre carte
                </p>
                {renderStatus("V")}
                <button
                  ref={(el) => (buttonsRef.current[1] = el)}
                  onClick={() => openCameraForSide('verso')}
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300 mt-4"
                >
                  CHOISIR
                </button>
              </div>
            </div>
          </div>
        </>
      )} 
    </div>

  );
}

export default StepCarteIdentite;
