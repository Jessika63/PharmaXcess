
// src/components/ElementsWrapper.js
import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Initialisez Stripe en dehors du composant
const stripePromise = loadStripe('pk_test_51Rsl1CLfU2UU0K5QVl6iyAUF5YuvHw648nWONQGJZmWPqtZhmxlZmSw6fORMnQNdzqtBe6Wd1LkTP7RCCoE71VyK00Zjm3nzmr');

function ElementsWrapper({ clientSecret, children }) {
    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            {children}
        </Elements>
    );
}

export default ElementsWrapper;
