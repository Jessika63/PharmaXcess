import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

function Preorder() {
  const navigate = useNavigate();
  const goBackButtonRef = useRef(null);

  useEffect(() => {
    if (goBackButtonRef.current) {
      goBackButtonRef.current.focus();
    }
  }, []);

  return (
    <div className={`bg-background_color min-h-screen w-full flex flex-col items-center justify-center`}>
      {/* Go Back Button */}
      <div className="w-4/5 flex items-center mt-6 mb-2">
        <button
          ref={goBackButtonRef}
          tabIndex={0}
          className={`${config.fontSizes.md} ${config.buttonStyles.back} ${config.padding.button} ${config.borderRadius.lg} ${config.shadows.md} ${config.scaleEffects.hover} ${config.transitions.default} ${config.focusStates.outline} flex items-center ${config.focusStates.ring} ${config.scaleEffects.focus}`}
          onClick={() => navigate('/insufficient-stock')}
        >
          <config.icons.arrowLeft className="mr-3" /> Retour
        </button>
      </div>
      {/* Logo */}
      <div className="w-4/5 h-28 flex justify-center items-center mb-4 mt-2">
        <div className="flex justify-center items-center w-full">
          <img src={config.icons.logo} alt="Logo PharmaXcess" className="w-80 h-20" />
        </div>
      </div>
      {/* Coming Soon Message */}
      <div className={`w-3/4 bg-background_color ${config.padding.modal} ${config.borderRadius.md} text-center mb-4 flex flex-col items-center`}>
        <p className={`${config.fontSizes.xl} ${config.textColors.primary} font-bold mb-4`}>Précommander ou récupérer plus tard</p>
        <p className={`${config.fontSizes.md} ${config.textColors.secondary}`}>Cette fonctionnalité arrive bientôt !</p>
      </div>
    </div>
  );
}

export default Preorder; 