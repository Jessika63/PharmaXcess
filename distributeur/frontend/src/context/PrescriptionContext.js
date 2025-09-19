import React, { createContext, useContext, useState, useEffect } from 'react';

const PrescriptionContext = createContext();

export const usePrescription = () => {
  const context = useContext(PrescriptionContext);
  if (!context) {
    throw new Error('usePrescription must be used within a PrescriptionProvider');
  }
  return context;
};

export const PrescriptionProvider = ({ children }) => {
  const [prescriptionData, setPrescriptionData] = useState({
    medicaments: [],
    scanType: null, // 'qr' or 'prescription'
    extractedText: '',
    hasQRCode: false,
    scanTimestamp: null,
    rawData: null
  });

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('prescriptionData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrescriptionData(parsed);
      } catch (error) {
        console.error('Erreur lors du parsing des données de prescription:', error);
      }
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
  }, [prescriptionData]);

  const updatePrescriptionData = (newData) => {
    setPrescriptionData(prev => ({
      ...prev,
      ...newData,
      scanTimestamp: new Date().toISOString()
    }));
  };

  const clearPrescriptionData = () => {
    setPrescriptionData({
      medicaments: [],
      scanType: null,
      extractedText: '',
      hasQRCode: false,
      scanTimestamp: null,
      rawData: null
    });
    localStorage.removeItem('prescriptionData');
  };

  const addMedicament = (medicament) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicaments: [...prev.medicaments, medicament]
    }));
  };

  const removeMedicament = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicaments: prev.medicaments.filter((_, i) => i !== index)
    }));
  };

  const value = {
    prescriptionData,
    updatePrescriptionData,
    clearPrescriptionData,
    addMedicament,
    removeMedicament
  };

  return (
    <PrescriptionContext.Provider value={value}>
      {children}
    </PrescriptionContext.Provider>
  );
};
