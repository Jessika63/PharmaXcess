
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { PrescriptionProvider } from '../../context/PrescriptionContext';
// StepHeader removed from overview to hide numeric badges 
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
    const [activeStepIndex, setActiveStepIndex] = useState(null); // null = overview

    const currentStep = steps[currentStepIndex];

    const findFirstUncompleted = (list) => {
        return list.findIndex(s => !s.completed);
    };

    const goToNextStep = (options) => {
        const nextHasQRCode = options && typeof options.hasQRCode === 'boolean' ? options.hasQRCode : hasQRCode;

        // If a step was running (opened from overview), mark that specific step completed and return to overview
        if (activeStepIndex !== null) {
            setSteps(prev => prev.map((s, i) => {
                if (i === activeStepIndex) return { ...s, completed: true }; 
                if (nextHasQRCode && prev[activeStepIndex].id === 'ordonnance' && s.id === 'carte_identite') {
                    return { ...s, completed: true };
                }
                return s; 
            })); 
            setHasQRCode(nextHasQRCode);
            // after finishing, return to overview
            setActiveStepIndex(null);
            setCurrentStepIndex(prev => { 
                const first = findFirstUncompleted(steps); 
                return first === -1 ? prev : first;
            });
            return; 
        }

        // Default behavior when navigating inside step flow (not from overview)
        setSteps(prev => prev.map((s, i) => {
            if (i === currentStepIndex) return { ...s, completed: true };
            if (nextHasQRCode && prev[currentStepIndex].id === 'ordonnance' && s.id === 'carte_identite') {
                return { ...s, completed: true };
            }
            return s;
        }));
        setHasQRCode(nextHasQRCode);
        if (currentStepIndex < steps.length - 1) {
            // Si on a un QR code, on saute l'étape "Carte d'Identité"
            if (nextHasQRCode && steps[currentStepIndex].id === 'ordonnance') {
                setCurrentStepIndex(2);
            } else {
                setCurrentStepIndex(currentStepIndex + 1);
            }
        }
    };

    const goBackStep = () => {
        if (activeStepIndex !== null) { 
            // if running a step, close it and return to overview
            setActiveStepIndex(null);
            return; 
        }
        if (currentStepIndex > 0) {
            // Si on revient en arrière depuis la carte_vitale et qu'on avait un QR code
            if (hasQRCode && steps[currentStepIndex].id === 'carte_vitale') {
                setCurrentStepIndex(0);
            } else {
                setCurrentStepIndex(currentStepIndex - 1);
            }
        }
    };

    const startStep = (index) => { 
        setActiveStepIndex(index);
    };

    const nextUncompletedIndex = findFirstUncompleted(steps); 

    const [selectedStepIndex, setSelectedStepIndex] = useState(nextUncompletedIndex === -1 ? 0 : nextUncompletedIndex);

    // Keep selected step in sync when steps update (advance to next uncompleted)
    useEffect(() => { 
        if (steps[selectedStepIndex]?.completed) {
            setSelectedStepIndex(nextUncompletedIndex === -1 ? 0 : nextUncompletedIndex);
        }
    }, [steps]);

    const allCompleted = steps.every(s => s.completed);
    const anyCompleted = steps.some(s => s.completed);

    const navigate = useNavigate(); 

    return (
        <PrescriptionProvider>
            <div className="w-full h-screen flex flex-col bg-background_color">
                {/* Header: isn't displayed if the active step is StepOrdonnance, StepCarteIdentite or StepCarteVitale */}
                {!(activeStepIndex !== null && (steps[activeStepIndex].id === 'ordonnance' || steps[activeStepIndex].id === 'carte_identite' || steps[activeStepIndex].id === 'carte_vitale')) && (
                  <div className="w-full px-8 py-4 flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                          <button
                              onClick={() => navigate(-1)}
                              className="flex items-center text-black hover:text-gray-600 transition-colors"
                          >
                              <config.icons.arrowLeft className="text-xl" />
                          </button>
                          <h1 className="text-3xl font-semibold text-black">Vérifications</h1>
                      </div>
                      <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
                  </div>
                )}
                <div className="flex-1 flex items-center justify-center">
                    {activeStepIndex !== null ? (
                        // Render the active step component
                        React.createElement(steps[activeStepIndex].component, {
                            goToNextStep,
                            goBackStep,
                            setHasQRCode: steps[activeStepIndex].id === 'ordonnance' ? setHasQRCode : undefined
                        })
                    ) : (
                        // Overview with step cards and CTA
                        <div className="w-full flex flex-col items-center">
                            <div className="flex gap-8 mb-10 justify-center px-6">
                                        {steps.map((s, i) => {
                                            const isSelected = i === selectedStepIndex && activeStepIndex === null;
                                            return (
                                                <div
                                                    key={s.id}
                                                    onClick={() => setSelectedStepIndex(i)}
                                                    className={`min-w-[24rem] p-10 rounded-xl flex flex-col items-center text-center cursor-pointer transition-transform ${s.completed ? 'bg-green-50 ring-2 ring-green-400' : 'bg-white'} ${isSelected ? 'ring-4 ring-black scale-105' : ''}`}
                                                >
                                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                                        {/* Icon per step */}
                                                        {
                                                            (s.id === 'ordonnance' && <config.icons.filePrescription className="text-2xl" />)
                                                            || (s.id === 'carte_identite' && <config.icons.idCard className="text-2xl" />)
                                                            || (s.id === 'carte_vitale' && <config.icons.addressCard className="text-2xl" />)
                                                            || (s.id === 'confirmation' && <config.icons.check className="text-2xl" />)
                                                        }
                                                    </div>
                                                    <div className="text-2xl font-semibold mb-2">{s.label}</div>
                                                    {s.completed ? (
                                                        <div className="text-sm text-green-700 font-semibold">Validé</div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500">Prêt</div>
                                                    )}
                                                </div>
                                            );
                                        })}
                            </div>

                            <div className="text-center">
                                <p className="mb-4">Prêt à commencer les vérifications?</p>
                                <button
                                    onClick={() => {
                                        const selected = steps[selectedStepIndex];
                                        if (!selected.completed) {
                                            startStep(selectedStepIndex);
                                        } else if (!allCompleted && nextUncompletedIndex !== -1) {
                                            startStep(nextUncompletedIndex);
                                        } else if (allCompleted) {
                                            window.location.href = '/non-prescription-drugs';
                                        }
                                    }}
                                    className="bg-black text-white px-8 py-3 rounded-full"
                                >
                                    {allCompleted ? 'Continuer' : (anyCompleted ? 'Poursuivre les vérifications' : 'Commencer les vérifications')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PrescriptionProvider>
    );
}

export default DocumentsFlow;
