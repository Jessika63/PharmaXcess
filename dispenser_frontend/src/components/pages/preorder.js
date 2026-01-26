import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import QrCameraScanner from '../qr_camera_scanner';

function Preorder() {
  const navigate = useNavigate();
  const goBackButtonRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (goBackButtonRef.current) {
      goBackButtonRef.current.focus();
    }
  }, []);

  const openCamera = () => {
    setError("");
    setSuccess(false);
  };

  const closeModal = () => {
    setError("");
    setSuccess(false);
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
    // when using CameraComponent we closed the modal; here we are using
    // continuous scanner so we don't need to close anything explicitly 
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
    <div style={{ backgroundColor: '#F8E6EA' }} className={`min-h-screen w-full flex flex-col items-center justify-start`}>
      {/* Header matching image: left arrow + title, logo right */}
      <div className="w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            ref={goBackButtonRef}
            onClick={() => navigate('/cart')}
            className="text-black text-lg flex items-center gap-3"
          >
            <config.icons.arrowLeft />
            <span className="text-xl font-semibold">Commander et récupérer plus tard</span>
          </button>
        </div>
        <img src={config.icons.logo} alt="Logo Pharmaxcess" className="h-8 mr-4" />
      </div>

      {/* Central content */}
      <div className="w-full flex flex-col items-center justify-center mt-8 px-6">
        <div className="flex flex-col items-center text-center max-w-3xl">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6">
            <config.icons.qrCode className="text-2xl" />
          </div>
          <p className={`${config.fontSizes.md} text-black mb-4`}>
            Veuillez scanner votre QR code de profil
          </p>
          <p className={`${config.fontSizes.sm} text-black mb-6`}>
            PharmaXcess afin de vous recontacter lors de la disponibilité de votre commande
          </p>
        </div>

        {/* Embedded scanner area (no buttons) */}
        {!success && (
          <div className="mt-6 mb-8">
            <QrCameraScanner onFrame={async (blob) => {
              // when a frame is produced, send it to backend for QR check
              try {
                setLoading(true);
                setError('');
                const formData = new FormData();
                formData.append('image', blob, 'frame.jpg');

                const response = await fetch(`${config.backendUrl}/read_profile_qr`, {
                  method: 'POST',
                  body: formData,
                });
                const data = await response.json();
                    if (data.success) {
                      // navigate to success confirmation page with profile data
                      navigate('/preorder-success', { state: { profile: data.profile } });
                      return;
                    } else {
                      // keep scanning; show error only occasionally
                      setError(data.error || 'Aucun QR code détecté');
                    }
              } catch (err) {
                console.error(err);
                setError('Erreur lors de la lecture du QR code.');
              } finally {
                setLoading(false);
              }
            }} overlaySize={360} />
          </div>
        )}

        {loading && (
          <p className="text-gray-700 font-medium animate-pulse mt-2">Analyse en cours, veuillez patienter...</p>
        )}

        {error && (
          <div className="text-red-600 font-semibold mt-2 max-w-md">{error}</div> 
        )}

        {success && (
          <div className="text-green-600 font-semibold mt-2 max-w-md">Profil utilisateur détecté avec succès !</div>
        )}
      </div>
    </div>
  );
}

export default Preorder;