import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ clientSecret, amount, drugId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);

      // 1. Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Client PharmaXcess',
            },
          }
        }
      );

      if (error) {
        throw new Error(error.message || "Erreur de paiement");
      }

      // 2. Call onSuccess with paymentIntent
      onSuccess(paymentIntent);

    } catch (err) {
      setErrorMessage(err.message);
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' }
                },
                invalid: {
                  color: '#9e2146'
                }
              }
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="text-red-500 mb-4 text-center">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 px-6 rounded-lg font-bold text-white
          ${!stripe || processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600'}
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400`}
      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Traitement...
          </div>
        ) : (
          `Payer €${(amount / 100).toFixed(2)}`
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
