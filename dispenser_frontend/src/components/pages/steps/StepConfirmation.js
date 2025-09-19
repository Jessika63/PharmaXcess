import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { usePrescription } from "../../../context/PrescriptionContext";
import config from "../../../config";

function StepConfirmation({ goToNextStep, goBackStep }) {
  const navigate = useNavigate();
  const { prescriptionData } = usePrescription();
  const [medicaments, setMedicaments] = useState([]);

  useEffect(() => {
    // Utiliser les données du contexte de prescription
    if (prescriptionData.medicaments && prescriptionData.medicaments.length > 0) {
      setMedicaments(prescriptionData.medicaments);
    } else {
      // Fallback vers localStorage pour compatibilité
      const stored = localStorage.getItem("medicaments");
      if (stored) {
        setMedicaments(JSON.parse(stored));
      }
    }
  }, [prescriptionData]);

  const handleConfirm = () => {
    navigate("/"); 
    // INSERT PRICE SAVING AND SEND IT TO THE PAYMENT PAGE (NEED TO BE DONE AND RATTACHED)
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
          onClick={goBackStep}
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
        Confirmez vos achats
      </h2>

      <div className="w-4/5 mb-8">
        {medicaments.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Médicaments détectés ({medicaments.length})
            </h3>
            <ul className="space-y-3">
              {medicaments.map((m, index) => (
                <li
                  key={m.id || index}
                  className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">{m.nom}</span>
                    <span className="text-gray-600 italic">{m.posologie}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-8">
            <config.icons.warning className="text-yellow-500 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 italic text-lg">
              Aucun médicament détecté
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Veuillez retourner à l'étape précédente pour scanner votre ordonnance
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleConfirm}
        className={`
          w-2/5 h-40 flex items-center justify-center
          ${config.borderRadius.xl} ${config.shadows.md}
          ${config.buttonColors.mainGradient} ${config.textColors.primary}
          ${config.fontSizes.xl} ${config.transitions.slow}
          ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
        `}
      >
        Confirmer les médicaments
      </button>
    </div>
  );
}

export default StepConfirmation;
