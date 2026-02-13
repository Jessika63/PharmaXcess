import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAutoVoiceOver, useVoiceOver } from '../../hooks/useVoiceOver';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import config from '../../config';
import { useCart } from '../../context/CartContext';
import { usePrescription } from '../../context/PrescriptionContext';
import { voiceOverTexts } from '../../config/voiceOverTexts';
import { createVoiceOverHandlers } from '../../utils/voiceOverHelpers';
import medicineService from '../../services/medicineService';

const MedicationDelivery = () => {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.medicationDelivery);
  const { speak } = useVoiceOver();

    // Keyboard navigation
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [adviceFocused, setAdviceFocused] = useState(false); // Track if skip button is focused on advice screen
    const buttonRefs = useRef([]);
    const skipButtonRef = useRef(null);
    const completeButtonRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems: passedItems } = location.state || {};
    const { clearCart } = useCart();
    const { clearPrescriptionData } = usePrescription();
    
    // Use the passed items or fallback to context cart items (memoized to avoid re-creation)
    const items = useMemo(() => passedItems || [
        { id: 1, label: 'Advil 400mg', quantity: 1 },
        { id: 2, label: 'Doliprane 1000mg', quantity: 2 }
    ], [passedItems]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
    const [medicalAdviceData, setMedicalAdviceData] = useState({});
    const totalItems = items.length;

    // Fetch medical advice for all items
    useEffect(() => {
        const fetchAllMedicalAdvice = async () => {
            const advicePromises = items.map(async (item) => {
                if (item.id) {
                    const advice = await medicineService.getMedicalAdvice(item.id);
                    return { id: item.id, advice };
                }
                return { id: item.id, advice: null };
            });

            const adviceResults = await Promise.all(advicePromises);
            const adviceMap = {};
            adviceResults.forEach(({ id, advice }) => {
                adviceMap[id] = advice;
            });
            setMedicalAdviceData(adviceMap);
        };

        if (items && items.length > 0) {
            fetchAllMedicalAdvice();
        }
    }, [items]);

    // Simulate delivery process
    useEffect(() => {
        if (currentIndex < totalItems) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 3000); // 3 seconds per item
            return () => clearTimeout(timer);
        } else if (currentIndex === totalItems && !showAdvice) {
            // After delivery, show advice for each medication
            const timer = setTimeout(() => {
                setShowAdvice(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, totalItems, showAdvice]);

    // Manage advice display (30 seconds per medication)
    useEffect(() => {
        if (showAdvice && currentAdviceIndex < totalItems) {
            const timer = setTimeout(() => {
                setCurrentAdviceIndex(prev => prev + 1);
            }, 30000); // 30 seconds per advice
            return () => clearTimeout(timer);
        } else if (showAdvice && currentAdviceIndex === totalItems && !isComplete) {
            // Mark as complete after all advice shown
            setIsComplete(true);
        }
    }, [showAdvice, currentAdviceIndex, totalItems, isComplete]);

    const deliveredCount = currentIndex;
    const progressPercent = (deliveredCount / totalItems) * 100;
    const currentItem = items[currentIndex];

    // Auto-read advice content when showing advice
    useEffect(() => {
        if (showAdvice && currentAdviceIndex < totalItems) {
            const adviceItem = items[currentAdviceIndex];
            const advice = medicalAdviceData[adviceItem.id];
            
            let adviceText = '';
            let warningsText = '';

            if (advice && advice.usageAdvice && advice.usageAdvice.length > 0) {
                adviceText = advice.usageAdvice.join('. ') + '.';
            } else {
                adviceText = 'Adultes : 1 comprimé toutes les 6 heures. Maximum 4 comprimés par jour. À prendre avec un verre d\'eau. Peut être pris pendant ou hors des repas.';
            }

            if (advice && advice.warnings && advice.warnings.length > 0) {
                warningsText = advice.warnings.join('. ') + '.';
            } else {
                warningsText = 'Ne pas dépasser la dose recommandée. Déconseillé en cas d\'allergie au principe actif. Consulter un médecin si les symptômes persistent. Tenir hors de portée des enfants.';
            }

            const fullText = `
                Conseils pour ${adviceItem.label || adviceItem.nom}.
                Quantité prescrite : ${adviceItem.quantity}.
                Conseil d'utilisation.
                ${adviceText}
                Précautions.
                ${warningsText}
                Ces conseils seront affichés pendant 30 secondes. Vous pouvez cliquer sur PASSER pour continuer.
            `;
            speak(fullText);
            // Reset focus state when new advice is shown
            setAdviceFocused(false);
        }
    }, [showAdvice, currentAdviceIndex, totalItems, items, speak, medicalAdviceData]);

    // Keyboard navigation for advice screen
    useEffect(() => {
        if (!showAdvice || currentAdviceIndex >= totalItems) return;

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'Tab') {
                e.preventDefault();
                setAdviceFocused(true);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                setAdviceFocused(false);
            } else if (e.key === 'Enter' && adviceFocused) {
                e.preventDefault();
                if (skipButtonRef.current) {
                    skipButtonRef.current.click();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showAdvice, currentAdviceIndex, totalItems, adviceFocused]);

    // Focus management for advice screen skip button
    useEffect(() => {
        if (showAdvice && currentAdviceIndex < totalItems && adviceFocused && skipButtonRef.current) {
            skipButtonRef.current.focus();
        }
    }, [showAdvice, currentAdviceIndex, totalItems, adviceFocused]);

    // Keyboard navigation for completion screen
    useEffect(() => {
        if (!isComplete) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (completeButtonRef.current) {
                    completeButtonRef.current.click();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isComplete]);

    // Auto-focus the complete button when completion screen is shown
    useEffect(() => {
        if (isComplete && completeButtonRef.current) {
            completeButtonRef.current.focus();
        }
    }, [isComplete]);

    // Advice screen (after delivery, before completion)
    if (showAdvice && currentAdviceIndex < totalItems) {
        const adviceItem = items[currentAdviceIndex];
        const adviceProgress = currentAdviceIndex + 1;
        const advice = medicalAdviceData[adviceItem.id];
        
        return (
            <div className="w-full min-h-screen flex flex-col bg-background_color">
                
                
                {/* Header */}
                <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                        <Link ref={el => buttonRefs.current[0] = el} to="/"
                            className="flex items-center text-black hover:text-gray-600 transition-colors"
            {...createVoiceOverHandlers(speak)}>
                            <config.icons.arrowLeft className="text-xl" />
                        </Link>
                        <h1 className="text-3xl font-semibold text-black">Conseils médicamenteux</h1>
                    </div>
                    <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
                </div>

                {/* Content - Advice */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 py-8">
                    {/* Progress indicator */}
                    <div className="text-center mb-6">
                        <span className="text-2xl font-bold text-black">{adviceProgress}/{totalItems}</span>
                        <p className="text-base text-gray-600 mt-1">Conseils affichés</p>
                    </div>

                    {/* Advice Card */}
                    <div className="bg-white rounded-3xl p-10 shadow-2xl max-w-4xl w-full">
                        {/* Medication Name */}
                        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
                            <h2 className="text-3xl font-bold text-black mb-2">{adviceItem.label || adviceItem.nom}</h2>
                            <p className="text-lg text-gray-500">Quantité prescrite : {adviceItem.quantity}</p>
                        </div>

                        {/* Usage Advice */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                                <span className="mr-3">💊</span>
                                Conseil d'utilisation
                            </h3>
                            <ul className="text-lg text-gray-700 space-y-3 ml-8">
                                {advice && advice.usageAdvice && advice.usageAdvice.length > 0 ? (
                                    advice.usageAdvice.map((item, index) => (
                                        <li key={index} className="list-disc">{item}</li>
                                    ))
                                ) : (
                                    <>
                                        <li className="list-disc">Adultes : 1 comprimé toutes les 6 heures</li>
                                        <li className="list-disc">Maximum 4 comprimés par jour</li>
                                        <li className="list-disc">À prendre avec un verre d'eau</li>
                                        <li className="list-disc">Peut être pris pendant ou hors des repas</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Precautions */}
                        <div>
                            <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                                <span className="mr-3">⚠️</span>
                                Précautions
                            </h3>
                            <ul className="text-lg text-gray-700 space-y-3 ml-8">
                                {advice && advice.warnings && advice.warnings.length > 0 ? (
                                    advice.warnings.map((item, index) => (
                                        <li key={index} className="list-disc">{item}</li>
                                    ))
                                ) : (
                                    <>
                                        <li className="list-disc">Ne pas dépasser la dose recommandée</li>
                                        <li className="list-disc">Déconseillé en cas d'allergie au principe actif</li>
                                        <li className="list-disc">Consulter un médecin si les symptômes persistent</li>
                                        <li className="list-disc">Tenir hors de portée des enfants</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Timer indicator */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
                            <p className="text-base text-gray-500">
                                Ces conseils seront affichés pendant 30 secondes
                            </p>
                            <button
                                ref={skipButtonRef}
                                {...createVoiceOverHandlers(speak)}
            onClick={() => setCurrentAdviceIndex(prev => prev + 1)}
                                className={`mt-4 bg-gray-200 text-black px-8 py-3 rounded-full text-base font-semibold
                                    hover:bg-gray-300 transition-colors duration-300 focus:outline-none
                                    ${adviceFocused ? 'ring-2 ring-pink-300' : ''}`}
                            >
                                PASSER
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Ended delivery page
    if (isComplete) {
        return (
            <div className="w-full min-h-screen flex flex-col bg-background_color">
                
                
                {/* Header */}
                <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                        <Link to="/"
                            className="flex items-center text-black hover:text-gray-600 transition-colors"
            {...createVoiceOverHandlers(speak)}>
                            <config.icons.arrowLeft className="text-xl" />
                        </Link>
                        <h1 className="text-3xl font-semibold text-black">Délivrance des médicaments</h1>
                    </div>
                    <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
                </div>

                {/* Content - Completed */}
                <div className="flex-1 flex flex-col items-center justify-center px-8">
                    {/* Icon */}
                    <div className="bg-white rounded-full p-6 mb-8 shadow-lg">
                        <FaCheck className="text-5xl text-black" />
                    </div>

                    {/* Text */}
                    <h2 className="text-3xl font-bold text-black mb-4">Délivrance terminée</h2>
                    <p className="text-xl text-gray-600 mb-12">Tous les médicaments ont été délivrés avec succès</p>

                    {/* Button */}
                    <button
                        ref={completeButtonRef}
                        {...createVoiceOverHandlers(speak)}
            onClick={() => navigate('/')}
                        className="bg-black text-white px-16 py-4 rounded-full text-lg font-semibold
                            hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    >
                        TERMINER
                    </button>
                </div>
            </div>
        );
    }

    // In progress delivery page
    return (
        <div className="w-full min-h-screen flex flex-col bg-background_color">
            
            
            {/* Header */}
            <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                <div className="flex items-center gap-4">
                    <Link to="/"
                        className="flex items-center text-black hover:text-gray-600 transition-colors"
            {...createVoiceOverHandlers(speak)}>
                        <config.icons.arrowLeft className="text-xl" />
                    </Link>
                    <h1 className="text-3xl font-semibold text-black">Délivrance des médicaments</h1>
                </div>
                <img src={config.icons.logo} alt="Logo PharmaXcess" className="h-10" />
            </div>

            {/* Content - In Progress */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
                {/* Title */}
                <h2 className="text-2xl font-bold text-black mb-2">Délivrance des médicaments</h2>
                <p className="text-lg text-gray-600 mb-8">Veuillez récupérer vos médicaments dans le compartiment</p>

                {/* Progress Counter */}
                <div className="text-center mb-4">
                    <span className="text-5xl font-bold text-black">{deliveredCount}/{totalItems}</span>
                    <p className="text-lg text-gray-600 mt-2">Médicaments délivrés</p>
                </div>

                {/* Progress Bar */}
                <div className="w-80 h-3 bg-gray-300 rounded-full mb-8 overflow-hidden">
                    <div 
                        className="h-full bg-black rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                {/* Current Item Card */}
                {currentItem && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center min-w-[300px]">
                        <h3 className="text-xl font-bold text-black mb-4">Délivrance en cours</h3>
                        <p className="text-lg text-gray-700 mb-2">{currentItem.label}</p>
                        <p className="text-gray-500">Quantité : {currentItem.quantity}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicationDelivery;
