
// src/pages/PaymentError.js
import React from 'react';
import { Link } from 'react-router-dom';
import config from '../../config';

function PaymentError() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background_color">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className={`${config.fontSizes.xxl} font-bold text-red-600 mb-4`}>Erreur de Paiement</h1>
        <p className={`${config.fontSizes.xl} mb-8`}>
          Désolé, une erreur s'est produite lors du traitement de votre paiement.
          Veuillez réessayer ou contacter le support.
        </p>
        <Link
          to="/non-prescription-drugs"
          className={`${config.fontSizes.md} ${config.buttonColors.red} ${config.padding.button} ${config.borderRadius.md} ${config.shadows.md} ${config.transitions.default} hover:opacity-90`}
        >
          Retour aux médicaments
        </Link>
      </div>
    </div>
  );
}

export default PaymentError;
