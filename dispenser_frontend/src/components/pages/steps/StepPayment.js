import React from 'react';
import { useVoiceOver } from '../../../hooks/useVoiceOver';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers';

function StepPayment() {
  const { speak } = useVoiceOver();
    return (
        <div className="flex flex-col items-center justify-center">
            <p className="text-lg mb-4">Paiement</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md"
            {...createVoiceOverHandlers(speak)}>
                Payer
            </button>
        </div>
    );
}

export default StepPayment;
