import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CameraComponent from "../../camera_component";
import ModalCamera from "../../modal_camera";
import config from "../../../config";

function StepOrdonnance({ goToNextStep, goBackStep }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const openCamera = () => {
    setShowCamera(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowCamera(false);
  };

  const handlePhotoCaptured = async (base64Image) => {
    closeModal();
    try {
      setLoading(true);
      setError("");
      setExtractedText("");

      const docCode = "P";
      const byteString = atob(base64Image.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");
      formData.append("doc_type", docCode);

      const response = await fetch(`${config.backendUrl}/extractText`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedText(data.raw_text || "");
        if (!data.success) {
          setError(data.error);
        } else {
          if (data.infos && data.infos.medicaments) {
            localStorage.setItem("medicaments", JSON.stringify(data.infos.medicaments));
            console.log(JSON.stringify(data.infos.medicaments));
          }

          goToNextStep();
        }
      } else {
        setError(data.error || "Erreur inconnue");
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

      <button
        onClick={openCamera}
        className={`
          w-2/5 h-40 flex items-center justify-center
          ${config.borderRadius.xl} ${config.shadows.md}
          ${config.buttonColors.mainGradient} ${config.textColors.primary}
          ${config.fontSizes.xl} ${config.transitions.slow}
          ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
        `}
      >
        <config.icons.filePrescription className="mr-4 text-4xl" />
        Prendre une photo
      </button>

      {isModalOpen && showCamera && (
        <ModalCamera onClose={closeModal}>
          <CameraComponent onPhotoCapture={handlePhotoCaptured} />
        </ModalCamera>
      )}

      {loading && (
        <p className="text-gray-700 font-medium animate-pulse mt-6">
          Analyse en cours, veuillez patienter...
        </p>
      )}

      {error && (
        <div className="text-red-600 font-semibold mt-6">L'ordonnance n'est pas reconnue, veuillez réessayer.</div>
      )}
    </div>
  );
}

export default StepOrdonnance;
