
import React, { useState } from 'react';
import config from '../../config';
import { PrescriptionProvider } from '../../context/PrescriptionContext';
import StepHeader from './steps/StepHeader';
import StepOrdonnance from './steps/StepOrdonnance';
import StepCarteVitale from './steps/StepCarteVitale';
import StepCarteIdentite from './steps/StepCarteIdentite';
import StepConfirmation from './steps/StepConfirmation';
import StepPayment from './steps/StepPayment';

const stepsDefault = [
    { id: 'ordonnance', label: 'Ordonnance', component: StepOrdonnance },
    { id: 'carte_identite', label: 'Carte d\'Identité', component: StepCarteIdentite },
    { id: 'carte_vitale', label: 'Carte Vitale', component: StepCarteVitale },
    { id: 'confirmation', label: 'Confirmation', component: StepConfirmation },
    // { id: 'paiement', label: 'Paiement', component: StepPayment }, // PAYMENT PAGE (CAN'T BE DONE FOR NOW)
];

function DocumentsFlow({ stepsOrder }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [steps, setSteps] = useState(stepsOrder || stepsDefault);
    const [hasQRCode, setHasQRCode] = useState(false);

    const currentStep = steps[currentStepIndex];

    const goToNextStep = (options) => {
        const nextHasQRCode = options && typeof options.hasQRCode === 'boolean' ? options.hasQRCode : hasQRCode;
        setSteps(prev => prev.map((s, i) => {
            if (i === currentStepIndex) return { ...s, completed: true };
            // Si on saute la carte d'identité, la marquer comme complétée
            if (nextHasQRCode && prev[currentStepIndex].id === 'ordonnance' && s.id === 'carte_identite') {
                return { ...s, completed: true };
            }
            return s;
        }));
        if (currentStepIndex < steps.length - 1) {
            // Si on a un QR code, on saute l'étape "Carte d'Identité"
            console.log(nextHasQRCode)
            if (nextHasQRCode && steps[currentStepIndex].id === 'ordonnance') {
                // On saute directement à l'étape "Carte Vitale" (index 2)
                setCurrentStepIndex(2);
            } else {
                setCurrentStepIndex(currentStepIndex + 1);
            }
        }
    };

    const goBackStep = () => {
        if (currentStepIndex > 0) {
            // Si on revient en arrière depuis la carte_vitale et qu'on avait un QR code
            if (hasQRCode && steps[currentStepIndex].id === 'carte_vitale') {
                console.log(hasQRCode)
                // On revient directement à l'étape "Ordonnance" (index 0)
                setCurrentStepIndex(0);
            } else {
                setCurrentStepIndex(currentStepIndex - 1);
            }
        }
    };

    return (
        <PrescriptionProvider>
            <div className="w-full h-screen flex flex-col bg-background_color">
                <StepHeader steps={steps} currentStepIndex={currentStepIndex} />

                <div className="flex-1 flex items-center justify-center">
                    {React.createElement(currentStep.component, {
                        goToNextStep,
                        goBackStep,
                        setHasQRCode: currentStep.id === 'ordonnance' ? setHasQRCode : undefined
                    })}
                </div>
            </div>
        </PrescriptionProvider>
    );
}

export default DocumentsFlow;
