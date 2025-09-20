import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraComponent from '../camera_component';
import ModalCamera from '../modal_camera';
import config from '../../config';

function Preorder() {
  const navigate = useNavigate();
  const goBackButtonRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (goBackButtonRef.current) {
      goBackButtonRef.current.focus();
    }
  }, []);

  const openCamera = () => {
    setShowCamera(true);
    setIsModalOpen(true);
    setError("");
    setSuccess(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
  };

  // Fonction pour vérifier si l'image contient un QR code de profil
  const checkProfileQRCode = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");

      // Utiliser l'endpoint pour lire les QR codes de profil
      const response = await fetch(`${config.backendUrl}/read_profile_qr`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Erreur lors de la lecture du QR code de profil:", err);
      return {
        success: false,
        error: "Impossible de lire le QR code de profil. Veuillez réessayer."
      };
    }
  };

  const handlePhotoCaptured = async (base64Image) => {
    closeModal();
    try {
      setLoading(true);
      setError("");
      setSuccess(false);

      const byteString = atob(base64Image.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });

      // Traitement pour QR code de profil
      const qrData = await checkProfileQRCode(blob);

      if (qrData.success) {
        setSuccess(true);
        // Ici vous pouvez traiter les données du profil utilisateur
        // Par exemple, naviguer vers une page de profil ou stocker les données
        console.log("Profil utilisateur détecté:", qrData.profile);

        // Optionnel: naviguer vers une autre page après succès
        // navigate('/profile-confirmation', { state: { profile: qrData.profile } });

      } else {
        setError(qrData.error || "Aucun QR code de profil valide détecté.");
      }

    } catch (err) {
      setError("Erreur lors du scan du QR code de profil");
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-background_color min-h-screen w-full flex flex-col items-center justify-center`}>
      {/* Go Back Button */}
      <div className="w-4/5 flex items-center mt-6 mb-2">
        <button
          ref={goBackButtonRef}
          tabIndex={0}
          className={`
            ${config.fontSizes.md} ${config.buttonStyles.back} ${config.padding.button} ${config.borderRadius.lg}
            ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${config.focusStates.outline}
            flex items-center ${config.focusStates.ring} ${config.scaleEffects.focus}`
          }
          onClick={() => navigate('/insufficient-stock')}
        >
          <config.icons.arrowLeft className="mr-3" />
            Retour
        </button>
      </div>

      {/* Logo */}
      <div className="w-4/5 h-28 flex justify-center items-center mb-4 mt-2">
        <div className="flex justify-center items-center w-full">
          <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-80 h-20" />
        </div>
      </div>

      {/* Scanner QR Code de Profil */}
      <div className={`w-3/4 bg-background_color ${config.padding.modal} ${config.borderRadius.md} text-center mb-4 flex flex-col items-center`}>
        <h2 className={`${config.fontSizes.xl} ${config.textColors.primary} font-bold mb-4`}>
          Scanner votre QR code de profil
        </h2>
        <p className={`${config.fontSizes.md} ${config.textColors.secondary} mb-6`}>
          Scannez le QR code de votre profil utilisateur depuis l'application mobile PharmaXcess
        </p>

        {/* Bouton Scanner */}
        <button
          onClick={openCamera}
          disabled={loading}
          className={`
            w-2/5 h-40 flex flex-col items-center justify-center
            ${config.borderRadius.xl} ${config.shadows.md}
            ${config.buttonColors.mainGradient} ${config.textColors.primary}
            ${config.fontSizes.xl} ${config.transitions.slow}
            ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <config.icons.qrCode className="text-4xl mb-2" />
          Scanner QR code
        </button>

        {/* Messages de statut */}
        {loading && (
          <p className="text-gray-700 font-medium animate-pulse mt-6">
            Analyse en cours, veuillez patienter...
          </p>
        )}

        {error && (
          <div className="text-red-600 font-semibold mt-6 max-w-md">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 font-semibold mt-6 max-w-md">
            Profil utilisateur détecté avec succès !
          </div>
        )}
      </div>

      {/* Modal Camera */}
      {isModalOpen && showCamera && (
        <ModalCamera onClose={closeModal}>
          <CameraComponent onPhotoCapture={handlePhotoCaptured} />
        </ModalCamera>
      )}
    </div>
  );
}

export default Preorder;