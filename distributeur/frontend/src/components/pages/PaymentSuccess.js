
import React from 'react';
import { useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const paymentIntent = location.state?.paymentIntent;

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Paiement Réussi!</h1>
      <p>Merci pour votre achat. Votre référence: {paymentIntent?.id}</p>
    </div>
  );
};

export default PaymentSuccess;
