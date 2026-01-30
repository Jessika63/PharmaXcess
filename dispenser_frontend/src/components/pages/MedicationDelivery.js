import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import config from '../../config';
import { useCart } from '../../context/CartContext';
import { usePrescription } from '../../context/PrescriptionContext';

const MedicationDelivery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems: passedItems } = location.state || {};
    const { clearCart } = useCart();
    const { clearPrescriptionData } = usePrescription();
    
    // Use the passed items or fallback to context cart items
    const items = passedItems || [
        { id: 1, label: 'Advil 400mg', quantity: 1 },
        { id: 2, label: 'Doliprane 1000mg', quantity: 2 }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showAdvice, setShowAdvice] = useState(false);
    const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
    const totalItems = items.length;

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

    // Advice screen (after delivery, before completion)
    if (showAdvice && currentAdviceIndex < totalItems) {
        const adviceItem = items[currentAdviceIndex];
        const adviceProgress = currentAdviceIndex + 1;
        
        return (
            <div className="w-full min-h-screen flex flex-col bg-background_color">
                {/* Header */}
                <div className="w-full px-8 py-4 flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="flex items-center text-black hover:text-gray-600 transition-colors"
                        >
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
                                <li className="list-disc">Adultes : 1 comprimé toutes les 6 heures</li>
                                <li className="list-disc">Maximum 4 comprimés par jour</li>
                                <li className="list-disc">À prendre avec un verre d'eau</li>
                                <li className="list-disc">Peut être pris pendant ou hors des repas</li>
                            </ul>
                        </div>

                        {/* Precautions */}
                        <div>
                            <h3 className="text-2xl font-bold text-black mb-4 flex items-center">
                                <span className="mr-3">⚠️</span>
                                Précautions
                            </h3>
                            <ul className="text-lg text-gray-700 space-y-3 ml-8">
                                <li className="list-disc">Ne pas dépasser la dose recommandée</li>
                                <li className="list-disc">Déconseillé en cas d'allergie au principe actif</li>
                                <li className="list-disc">Consulter un médecin si les symptômes persistent</li>
                                <li className="list-disc">Tenir hors de portée des enfants</li>
                            </ul>
                        </div>

                        {/* Timer indicator */}
                        <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center">
                            <p className="text-base text-gray-500">
                                Ces conseils seront affichés pendant 30 secondes
                            </p>
                            <button
                                onClick={() => setCurrentAdviceIndex(prev => prev + 1)}
                                className="mt-4 bg-gray-200 text-black px-8 py-3 rounded-full text-base font-semibold
                                    hover:bg-gray-300 transition-colors duration-300"
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
                        <Link
                            to="/"
                            className="flex items-center text-black hover:text-gray-600 transition-colors"
                        >
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
                        onClick={() => navigate('/')}
                        className="bg-black text-white px-16 py-4 rounded-full text-lg font-semibold
                            hover:scale-105 transition-transform duration-300"
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
                    <Link
                        to="/"
                        className="flex items-center text-black hover:text-gray-600 transition-colors"
                    >
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
