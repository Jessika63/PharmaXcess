import React, { useState, useEffect, useRef } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm = ({ clientSecret, amount, drugId, onSuccess, onError, payButtonRef, cardElementContainerRef, focusIndex, onFocusChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const formRef = useRef(null);

  // Auto-focus the container (not CardElement) when focusIndex === 1
  useEffect(() => {
    if (focusIndex === 1 && cardElementContainerRef && cardElementContainerRef.current) {
      // Focus the container instead of the CardElement iframe
      // This allows us to intercept keyboard events
      cardElementContainerRef.current.focus();
    }
  }, [focusIndex, cardElementContainerRef]);

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
    <form ref={formRef} onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <div 
          ref={cardElementContainerRef}
          tabIndex="0"
          className={`p-4 border rounded-lg bg-white shadow-sm transition-all
            ${focusIndex === 1 ? 'ring-2 ring-pink-300' : ''}`}
          onKeyDown={(e) => {
            if (focusIndex === 1) {
              // Allow Enter to focus the Stripe CardElement for typing
              if (e.key === 'Enter') {
                e.preventDefault();
                if (elements) {
                  const cardElement = elements.getElement(CardElement);
                  if (cardElement) {
                    cardElement.focus();
                  }
                }
              }
              // Intercept arrow keys to navigate away
              else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
                if (onFocusChange) {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    onFocusChange(2); // Move to pay button
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    onFocusChange(0); // Move to back button
                  }
                }
              }
            }
          }}
          onClick={() => {
            // When user clicks, focus the actual Stripe CardElement
            if (elements && focusIndex === 1) {
              const cardElement = elements.getElement(CardElement);
              if (cardElement) {
                cardElement.focus();
              }
            }
          }}
        >
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
        ref={payButtonRef}
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 px-6 rounded-full font-bold text-white
          ${!stripe || processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-black hover:scale-105'} 
          transition-transform duration-300 focus:outline-none 
          ${focusIndex === 2 ? 'ring-4 ring-pink-300' : 'focus:ring-2 focus:ring-pink-300'}`}


      >
        {processing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Traitement en cours...
          </div>
        ) : (
          `PAYER ${(amount / 100).toFixed(2)}€` 

        )}
      </button>
    </form>
  );
};

export default PaymentForm;
