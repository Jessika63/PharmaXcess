// src/pages/PaymentError.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import config from '../../config';

function PaymentError() {
  const location = useLocation();
  const errorMessage = location.state?.errorMessage || "Désolé, une erreur s'est produite lors du traitement de votre paiement.";
  const fromPath = location.state?.from || '/non-prescription-drugs';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background_color">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-500 text-6xl mb-6">⚠️</div>
        <h1 className={`${config.fontSizes.xxl} font-bold text-red-600 mb-4`}>
          Erreur de Paiement
        </h1>

        <div className={`${config.fontSizes.md} bg-red-100 text-red-700 p-4 rounded mb-8`}>
          {errorMessage}
        </div>

        <p className={`${config.fontSizes.xl} mb-8`}>
          Désolé, une erreur s'est produite lors du traitement de votre paiement.
          Veuillez réessayer ou contacter le support.
        </p>

        {/* Correct path usage */}
        <Link
          to={fromPath}
          className={
            `${config.fontSizes.md} ${config.buttonColors.red} ${config.padding.button} ${config.borderRadius.md}
            ${config.shadows.md} ${config.transitions.default} hover:opacity-90`
          }
        >
          Retour aux médicaments
        </Link>
      </div>
    </div>
  );
}

export default PaymentError;
