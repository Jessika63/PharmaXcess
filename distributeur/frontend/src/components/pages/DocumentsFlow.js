import React, { useState } from 'react';
import config from '../../config';
import StepHeader from './steps/StepHeader';
import StepOrdonnance from './steps/StepOrdonnance';
import StepCarteVitale from './steps/StepCarteVitale';
import StepCarteIdentite from './steps/StepCarteIdentite';
import StepConfirmation from './steps/StepConfirmation';
import StepPayment from './steps/StepPayment';

const stepsDefault = [
    { id: 'ordonnance', label: 'Ordonnance', component: StepOrdonnance },
    { id: 'carte_vitale', label: 'Carte Vitale', component: StepCarteVitale },
    { id: 'carte_identite', label: 'Carte d\'Identité', component: StepCarteIdentite },
    { id: 'confirmation', label: 'Confirmation', component: StepConfirmation },
    // { id: 'paiement', label: 'Paiement', component: StepPayment }, // PAYMENT PAGE (CAN'T BE DONE FOR NOW)
];

function DocumentsFlow({ stepsOrder }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState(stepsOrder || stepsDefault);

    const currentStep = steps[currentStepIndex];

    const goToNextStep = () => {
        setSteps(prev => prev.map((s, i) => i === currentStepIndex ? { ...s, completed: true } : s));
        if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
    };

    const goBackStep = () => {
    if (currentStepIndex > 0) {
        setCurrentStepIndex(currentStepIndex - 1);
    }
};

    return (
        <div className="w-full h-screen flex flex-col bg-background_color">
            <StepHeader steps={steps} currentStepIndex={currentStepIndex} />

            <div className="flex-1 flex items-center justify-center">
                {React.createElement(currentStep.component, { goToNextStep, goBackStep })}
            </div>

        </div>
    );
}

export default DocumentsFlow;
