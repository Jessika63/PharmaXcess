
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CameraComponent from "../../camera_component";
import ModalCamera from "../../modal_camera";
import QrCameraScanner from "../../qr_camera_scanner";
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null); // 'qr' or 'prescription'
  const [showQRScanner, setShowQRScanner] = useState(false); // for displaying the QR scan page
  const [success, setSuccess] = useState(false); 
  const navigate = useNavigate();
  const { updatePrescriptionData } = usePrescription();

  const openCamera = (type) => {
    setScanType(type);
    if (type === 'qr') { 
      // Display the QR scan page instead of modal
      setShowQRScanner(true); 
      setError("");
      setSuccess(false);
    } else { 
      // For prescription, open the standard modal
      setShowCamera(true); 
      setIsModalOpen(true); 
      setError("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
    setScanType(null);
  };

  // Fonction pour vérifier si l'image contient un QR code
  const checkQRCode = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");

      const response = await fetch(`${config.backendUrl}/read_prescription_qr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Erreur lors de la lecture du QR code:", err);
      return {
        success: false,
        error: "Impossible de lire le QR code. Veuillez réessayer ou scanner l'ordonnance."
      };
    }
  };

  // Fonction pour extraire le texte d'une ordonnance classique
  const extractPrescriptionText = async (blob) => {
    try {
      const docCode = "P";
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("doc_type", docCode);

      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: "POST",
        body: formData,
      });

      return await response.json();
    } catch (err) {
      console.error("Erreur lors de l'extraction de texte:", err);
      return { success: false, error: err.message };
    }
  };

const handlePhotoCaptured = async (base64Image) => {
  closeModal();
  try {
    setLoading(true);
    setError("");
    setExtractedText("");

    const byteString = atob(base64Image.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/jpeg" });

    if (scanType === 'qr') {
      // Traitement pour QR code
      const qrData = await checkQRCode(blob);

      if (qrData.success) {
        // Si un QR code valide est détecté
        setHasQRCode(true);

        // Transformer les données du QR code pour correspondre au format attendu
        const medicaments = qrData.prescription?.content?.map((med, index) => ({
          id: index + 1,
          nom: med.split(' - ')[0] || `Médicament ${index + 1}`,
          posologie: med.split(' - ')[1] || med
        })) || [];

        // Mettre à jour le contexte de prescription avec les données du QR code
        updatePrescriptionData({
          medicaments: medicaments,
          scanType: 'qr',
          hasQRCode: true,
          rawData: qrData.prescription,
          extractedText: ''
        });

        goToNextStep({ hasQRCode: true });
        return;
      } else {
        setError("Aucun QR code valide détecté. Veuillez réessayer ou scanner l'ordonnance.");
      }
    } else if (scanType === 'prescription') {
      // Traitement pour ordonnance classique
      const data = await extractPrescriptionText(blob);

      if (data.success) {
        setExtractedText(data.raw_text || "");
        
        // Mettre à jour le contexte de prescription avec les données de l'ordonnance
        updatePrescriptionData({
          medicaments: data.infos?.medicaments || [],
          scanType: 'prescription',
          hasQRCode: false,
          extractedText: data.raw_text || '',
          rawData: data.infos
        });
        
        goToNextStep();
      } else {
        setError(data.error || "Erreur lors de l'analyse de l'ordonnance");
      }
    }

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ backgroundColor: '#F8E6EA' }} className="w-full h-screen flex flex-col">
      {showQRScanner ? (
        // Scan QR Code Page
        <>
          {/* Header */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowQRScanner(false)}
                className="flex items-center text-black hover:text-gray-600 transition-colors"
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* QR Scanner Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="flex flex-col items-center text-center max-w-3xl mb-8">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
                <config.icons.qrCode className="text-2xl" />
              </div>
              <p className="text-xl text-black mb-2">
                Veuillez scanner votre QR code de votre
              </p>
              <p className="text-xl text-black">
                ordonnance via le scanner présent sur la machine
              </p>
            </div>

            {/* Embedded QR Scanner */}
            {!success && (
              <div className="mt-6 mb-8">
                <QrCameraScanner 
                  onFrame={async (blob) => {
                    try {
                      setLoading(true);
                      setError('');
                      
                      const qrData = await checkQRCode(blob);
                      
                      if (qrData.success) {
                        setSuccess(true);
                        setHasQRCode(true);

                        const medicaments = qrData.prescription?.content?.map((med, index) => ({
                          id: index + 1,
                          nom: med.split(' - ')[0] || `Médicament ${index + 1}`,
                          posologie: med.split(' - ')[1] || med
                        })) || [];

                        updatePrescriptionData({
                          medicaments: medicaments,
                          scanType: 'qr',
                          hasQRCode: true,
                          rawData: qrData.prescription,
                          extractedText: ''
                        });

                        // Little delay to show success message
                        setTimeout(() => {
                          goToNextStep({ hasQRCode: true });
                        }, 1000);
                      } else {
                        setError('Aucun QR code valide détecté');
                      }
                    } catch (err) {
                      console.error(err);
                      setError('Erreur lors de la lecture du QR code.');
                    } finally {
                      setLoading(false);
                    }
                  }} 
                  overlaySize={360} 
                />
              </div>
            )}

            {loading && (
              <p className="text-gray-700 font-medium animate-pulse mt-2">Analyse en cours, veuillez patienter...</p>
            )}

            {error && (
              <div className="text-red-600 font-semibold mt-2 max-w-md">{error}</div>
            )}

            {success && (
              <div className="text-green-600 font-semibold mt-2 max-w-md">QR code détecté avec succès !</div>
            )}
          </div>
        </>
      ) : (
        // Original choice page 
        <>
          {/* Header matching the image */}
          <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goBackStep}
                className="flex items-center text-black hover:text-gray-600 transition-colors"
              >
                <config.icons.arrowLeft className="text-xl" />
              </button>
              <h1 className="text-3xl font-semibold text-black">Scan ordonnance</h1>
            </div>
            <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <h2 className="text-2xl text-black mb-12 text-center">
              Choisissez la méthode pour scanner votre ordonnance
            </h2>

            {/* Two cards side by side */}
            <div className="flex gap-8 max-w-5xl w-full mb-8">
              {/* Ordonnance Card */}
              <div className="flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.filePrescription className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">Ordonnance</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner votre ordonnance
                </p>
                <button
                  onClick={() => openCamera('prescription')}
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  CHOISIR
                </button>
              </div>

              {/* QR Code Card */}
              <div className="flex-1 bg-white rounded-3xl p-12 flex flex-col items-center text-center shadow-lg min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                  <config.icons.qrCode className="text-3xl text-black" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-6">QR code</h3>
                <p className="text-xl text-gray-600 mb-10 flex-1">
                  Scanner le code qr de votre ordonnance
                </p>
                <button
                  onClick={() => openCamera('qr')}
                  className="bg-black text-white px-12 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-transform duration-300"
                >
                  CHOISIR
                </button>
              </div>
            </div>
            {/* Status messages */}
            {loading && ( 
              <p className="text-gray-700 font-medium animate-pulse mt-6"> 
                Analyse en cours, veuillez patienter...
              </p>
            )}
            {error && ( 
              <div className="text-red-600 font-semibold mt-6">L'ordonnance n'est pas reconnue, veuillez réessayer.</div> 
            )}
          </div>
        </> 
      )} 



      {isModalOpen && showCamera && (
        <ModalCamera onClose={closeModal}>
          <CameraComponent onPhotoCapture={handlePhotoCaptured} />
        </ModalCamera>
      )}
    </div>
  );
}

export default StepOrdonnance;
