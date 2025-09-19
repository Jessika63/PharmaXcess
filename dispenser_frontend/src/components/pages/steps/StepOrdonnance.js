
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CameraComponent from "../../camera_component";
import ModalCamera from "../../modal_camera";
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";

function StepOrdonnance({ goToNextStep, goBackStep, setHasQRCode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const [scanType, setScanType] = useState(null); // 'qr' or 'prescription'
  const navigate = useNavigate();
  const { updatePrescriptionData } = usePrescription();

  const openCamera = (type) => {
    setScanType(type);
    setShowCamera(true);
    setIsModalOpen(true);
    setError(""); // Réinitialiser l'erreur lorsqu'on ouvre la caméra
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
    <div className="w-full h-full flex flex-col items-center bg-background_color">
      <div className="w-4/5 flex justify-between items-center mt-8 mb-6">
        <button
          className={`
            px-6 py-3 ${config.borderRadius.lg} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.md} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
          onClick={() => navigate("/")}
        >
          Retour
        </button>

        <button
          className={`
            px-6 py-3 ${config.borderRadius.lg} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.md} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
          onClick={() => navigate("/")}
        >
          Menu
        </button>
      </div>

      <h2 className={`${config.fontSizes.xl} font-bold text-primary mb-8`}>
        Scanner votre ordonnance
      </h2>

      <p className={`${config.fontSizes.md} text-gray-600 mb-4 text-center`}>
        Scanner votre ordonnance papier
      </p>

      {/* Modification 1: Boutons en colonne au lieu de ligne */}
      <div className="flex flex-col space-y-8 w-4/5 justify-center items-center">
        <button
          onClick={() => openCamera('prescription')}
          className={`
            w-2/5 h-40 flex flex-col items-center justify-center
            ${config.borderRadius.xl} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.xl} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
        >
          <config.icons.filePrescription className="text-4xl mb-2" />
          Scanner l'ordonnance
        </button>

        <p className={`${config.fontSizes.md} text-gray-600 mb-4 text-center`}>
          Ou scanner votre QR code d'ordonnance présent dans l'application mobile PharmaXcess
        </p>

        <button
          onClick={() => openCamera('qr')}
          className={`
            w-2/5 h-40 flex flex-col items-center justify-center
            ${config.borderRadius.xl} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.xl} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
          `}
        >
          <config.icons.qrCode className="text-4xl mb-2" />
          Scan QR code
        </button>
      </div>

      {/* Modification 1: Messages placés en dessous des boutons */}
      {loading && (
        <p className="text-gray-700 font-medium animate-pulse mt-6">
          Analyse en cours, veuillez patienter...
        </p>
      )}

      {error && (
        <div className="text-red-600 font-semibold mt-6">L'ordonnance n'est pas reconnue, veuillez réessayer.</div>
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
