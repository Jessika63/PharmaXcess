import React, { useState, useEffect, useRef } from "react";
import { useAutoVoiceOver, useVoiceOver } from '../../../hooks/useVoiceOver';
import { voiceOverTexts } from '../../../config/voiceOverTexts';
import { useNavigate } from 'react-router-dom';
import { createVoiceOverHandlers } from '../../../utils/voiceOverHelpers';
import { usePrescription } from "../../../context/PrescriptionContext";
import { useCart } from "../../../context/CartContext";
import config from "../../../config";

function StepConfirmation({ goToNextStep, goBackStep, restartFlow }) {
  // Auto-play VoiceOver
  useAutoVoiceOver(voiceOverTexts.verification);
  const { speak } = useVoiceOver();

  const navigate = useNavigate();
  const { prescriptionData, updatePrescriptionData } = usePrescription();
  const { addToCart } = useCart();
  const [medicaments, setMedicaments] = useState([]);
  const [selectedMedicaments, setSelectedMedicaments] = useState({});
  
  // Keyboard navigation
  const [focusedIndex, setFocusedIndex] = useState(0);
  const buttonRefs = useRef([]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
        e.preventDefault();
        if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
          setFocusedIndex((prev) => (prev + 1) % 2);
        } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
          setFocusedIndex((prev) => (prev - 1 + 2) % 2);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (buttonRefs.current[focusedIndex]) {
          buttonRefs.current[focusedIndex].click();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex]);

  // Focus management
  useEffect(() => {
    if (buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    // Utiliser les données du contexte de prescription
    if (prescriptionData.medicaments && prescriptionData.medicaments.length > 0) {
      const meds = prescriptionData.medicaments;
      setMedicaments(meds);
      
      // By default, select all medicaments
      const initialSelection = {};
      meds.forEach((med, index) => {
        initialSelection[index] = true;
      });
      setSelectedMedicaments(initialSelection);
    } else {
      // Fallback vers localStorage pour compatibilité
      const stored = localStorage.getItem("medicaments");
      if (stored) {
        const meds = JSON.parse(stored);
        setMedicaments(meds);
        
        const initialSelection = {};
        meds.forEach((med, index) => {
          initialSelection[index] = true;
        });
        setSelectedMedicaments(initialSelection);
      }
    }
  }, [prescriptionData]);

  const toggleMedicament = (index) => {
    setSelectedMedicaments(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleConfirm = () => {
    // Filter the selected medicaments
    const selectedMeds = medicaments.filter((_, index) => selectedMedicaments[index]);
    
    // Add each selected medicament to the cart
    selectedMeds.forEach(med => {
      const quantity = med.quantity || 1;
      // Add the medicament 'quantity' times
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: med.id || `${med.nom}-${Date.now()}-${i}`,
          nom: med.nom,
          name: med.nom, // compatibility
          label: med.nom, // For display in cart
          posologie: med.posologie,
          price: 0, // Price to be set in cart
          description: med.posologie
        });
      }
    });
    
    // Update prescription data with selected medicaments
    updatePrescriptionData({
      medicaments: selectedMeds
    });
    
    // Navigate to cart with verification flag
    navigate('/cart', { state: { fromVerification: true, checkoutLabel: 'FINIR' } });
  };

  const handleRestart = () => {
    // Reinitialize the flow
    if (restartFlow) {
      restartFlow();
    }
  };

  const carteIdentite = prescriptionData.carteIdentite || JSON.parse(localStorage.getItem('carteIdentite') || 'null');
  const carteVitale = prescriptionData.carteVitale || JSON.parse(localStorage.getItem('carteVitale') || 'null');

  return (
    <div className="w-full h-screen flex flex-col overflow-y-auto">
      
      
      <div className="flex-1 px-8 py-6">
        <h2 className="text-3xl font-bold text-black mb-8 text-center">
          Récapitulatif de vos informations
        </h2>

        {/* Medicaments */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-black mb-4 flex items-center gap-2">
            <config.icons.filePrescription className="text-xl" />
            Médicaments
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {medicaments.length > 0 ? (
              <div className="space-y-3">
                {medicaments.map((med, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedMedicaments[index]
                        ? 'bg-green-50 border-green-400'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMedicaments[index] || false}
                      onChange={() => toggleMedicament(index)}
                      className="w-6 h-6 cursor-pointer accent-green-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-black">{med.nom || med.name}</p>
                      {med.posologie && (
                        <p className="text-gray-600 italic">{med.posologie}</p>
                      )}
                      {med.quantity && (
                        <p className="text-gray-700 font-medium">
                          Quantité: {med.quantity} {med.quantity > 1 ? 'boîtes' : 'boîte'}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Aucun médicament détecté
              </p>
            )}
          </div>
        </div>

        {/* Identity Card */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-black mb-4 flex items-center gap-2">
            <config.icons.idCard className="text-xl" />
            Carte d'Identité
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {carteIdentite ? (
              <div className="grid grid-cols-2 gap-4">
                {carteIdentite.nom && (
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="text-black font-semibold">{carteIdentite.nom}</p>
                  </div>
                )}
                {carteIdentite.prenom && (
                  <div>
                    <p className="text-gray-600 text-sm">Prénom</p>
                    <p className="text-black font-semibold">{carteIdentite.prenom}</p>
                  </div>
                )}
                {carteIdentite.dateNaissance && (
                  <div>
                    <p className="text-gray-600 text-sm">Date de naissance</p>
                    <p className="text-black font-semibold">{carteIdentite.dateNaissance}</p>
                  </div>
                )}
                {carteIdentite.numeroIdentite && (
                  <div>
                    <p className="text-gray-600 text-sm">N° d'identité</p>
                    <p className="text-black font-semibold">{carteIdentite.numeroIdentite}</p>
                  </div>
                )}
                {!carteIdentite.nom && !carteIdentite.prenom && (
                  <p className="text-gray-500 italic col-span-2">
                    {carteIdentite.extractedText || 'Informations validées'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Aucune information de carte d'identité
              </p>
            )}
          </div>
        </div>

        {/* Health card */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-black mb-4 flex items-center gap-2">
            <config.icons.addressCard className="text-xl" />
            Carte Vitale
          </h3>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            {carteVitale ? (
              <div className="grid grid-cols-2 gap-4">
                {carteVitale.numeroSecu && (
                  <div>
                    <p className="text-gray-600 text-sm">N° Sécurité Sociale</p>
                    <p className="text-black font-semibold">{carteVitale.numeroSecu}</p>
                  </div>
                )}
                {carteVitale.nom && (
                  <div>
                    <p className="text-gray-600 text-sm">Nom</p>
                    <p className="text-black font-semibold">{carteVitale.nom}</p>
                  </div>
                )}
                {carteVitale.prenom && (
                  <div>
                    <p className="text-gray-600 text-sm">Prénom</p>
                    <p className="text-black font-semibold">{carteVitale.prenom}</p>
                  </div>
                )}
                {!carteVitale.numeroSecu && !carteVitale.nom && (
                  <p className="text-gray-500 italic col-span-2">
                    {carteVitale.extractedText || 'Informations validées'}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center py-4">
                Aucune information de carte vitale
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-6 justify-center mt-10 pb-8">
          <button onClick={handleRestart}
            ref={el => buttonRefs.current[0] = el}
            tabIndex={0}
            className={`bg-red-500 text-white px-12 py-5 rounded-full text-xl font-semibold hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300
              ${focusedIndex === 0 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            {...createVoiceOverHandlers(speak)}>
            RECOMMENCER
          </button>
          <button onClick={handleConfirm}
            ref={el => buttonRefs.current[1] = el}
            tabIndex={0}
            className={`bg-black text-white px-16 py-5 rounded-full text-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-300
              ${focusedIndex === 1 ? 'ring-2 ring-pink-300 scale-105' : ''}`}
            {...createVoiceOverHandlers(speak)}>
            VALIDER
          </button>
        </div>
      </div>
    </div>
  );
}

export default StepConfirmation;
