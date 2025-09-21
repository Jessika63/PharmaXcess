import React from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";

function StepCarteVitale({ goToNextStep, goBackStep }) {
  const navigate = useNavigate();

  const handleNext = () => {
    console.log("Carte Vitale ignorée (pas encore gérée). Passage à l'étape suivante.");
    goToNextStep();
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
        Valider votre carte vitale
      </h2>

      <button
        onClick={handleNext}
        className={`
          w-2/5 h-40 flex items-center justify-center
          ${config.borderRadius.xl} ${config.shadows.md}
          ${config.buttonColors.mainGradient} ${config.textColors.primary}
          ${config.fontSizes.xl} ${config.transitions.slow}
          ${config.buttonColors.mainGradientHover} ${config.scaleEffects.hover}
        `}
      >
        Continuer
      </button>


    </div>
  );
}

export default StepCarteVitale;
