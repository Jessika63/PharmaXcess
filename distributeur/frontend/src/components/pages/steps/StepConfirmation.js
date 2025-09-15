import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import config from "../../../config";

function StepConfirmation({ goToNextStep, goBackStep }) {
  const navigate = useNavigate();
  const [medicaments, setMedicaments] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("medicaments");
    if (stored) {
      setMedicaments(JSON.parse(stored));
    }

    const medoc = [
      { id: 1, nom: "TOXICORTOL PIVALATE", posologie: "1 % susp pulv nasal (PIVALOINE)" },
      { id: 2, nom: "PARACETAMOL 1 g cp", posologie: "un comprimé 3 fois par jour si douleur ou fièvre" },
      { id: 3, nom: "AMBROXOL CHLORHYDRATE 17,86 mg/ml sol", posologie: "pulv bucc (LYSOPAÏNE AMBROXOL Ment Ss sucre) 1 cp à sucer 6 fois par jour" }
    ];

    setMedicaments(medoc)


  }, []);

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
          <ul className="space-y-3">




            {medicaments.map((m, index) => (
              <li
                key={index}
                className="p-4 bg-white rounded-lg shadow-md flex justify-between items-center"
              >
                <span className="font-semibold text-gray-800">{m.nom}</span>
                <span className="text-gray-600 italic">{m.posologie}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-center">
            Aucun médicament détecté
          </p>
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
