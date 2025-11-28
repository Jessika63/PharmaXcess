import { useProfile } from '../context/ProfileContext'; 

/** 
 * personalized hook to get and manage data specific to the current profile
 */
export const useProfileData = () => { 
    const { currentProfile, updateProfile } = useProfile(); 

    // Functions to manage the medical data of the current profile
    const addDisease = async (disease: string) => {
        if (!currentProfile) return false;
        const diseases = currentProfile.diseases || [];
        if (diseases.includes(disease)) return false;
        
        return await updateProfile(currentProfile.id, {
            diseases: [...diseases, disease]
        });
    }; 

    const removeDisease = async (disease: string) => {
        if (!currentProfile) return false;
        const diseases = currentProfile.diseases || [];
        
        return await updateProfile(currentProfile.id, {
            diseases: diseases.filter(d => d !== disease)
        });
    };

    const addTreatment = async (treatment: string) => {
        if (!currentProfile) return false;
        const treatments = currentProfile.treatments || [];
        if (treatments.includes(treatment)) return false;
        
        return await updateProfile(currentProfile.id, {
            treatments: [...treatments, treatment]
        });
    };

    const removeTreatment = async (treatment: string) => {
        if (!currentProfile) return false;
        const treatments = currentProfile.treatments || [];
        
        return await updateProfile(currentProfile.id, {
            treatments: treatments.filter(t => t !== treatment)
        });
    };

    const addAllergy = async (allergy: string) => {
        if (!currentProfile) return false;
        const allergies = currentProfile.allergies || [];
        if (allergies.includes(allergy)) return false;
        
        return await updateProfile(currentProfile.id, {
            allergies: [...allergies, allergy]
        });
    };

    const removeAllergy = async (allergy: string) => {
        if (!currentProfile) return false;
        const allergies = currentProfile.allergies || [];
        
        return await updateProfile(currentProfile.id, {
            allergies: allergies.filter(a => a !== allergy)
        });
    };

    const addFamilyHistory = async (history: string) => {
        if (!currentProfile) return false;
        const familyHistory = currentProfile.familyHistory || [];
        if (familyHistory.includes(history)) return false;
        
        return await updateProfile(currentProfile.id, {
            familyHistory: [...familyHistory, history]
        });
    };

    const removeFamilyHistory = async (history: string) => {
        if (!currentProfile) return false;
        const familyHistory = currentProfile.familyHistory || [];
        
        return await updateProfile(currentProfile.id, {
            familyHistory: familyHistory.filter(h => h !== history)
        });
    };

    const addDoctor = async (doctor: string) => { 
        if (!currentProfile) return false; 
        const doctors = currentProfile.doctors || []; 
        if (doctors.includes(doctor)) return false; 

        return await updateProfile(currentProfile.id, { 
            doctors: [...doctors, doctor] 
        }); 
    }; 

    const removeDoctor = async (doctor: string) => { 
        if (!currentProfile) return false; 
        const doctors = currentProfile.doctors || []; 

        return await updateProfile(currentProfile.id, { 
            doctors: doctors.filter(d => d !== doctor)
        }); 
    }; 

    const addHospitalization = async (hospitalization: string) => { 
        if (!currentProfile) return false; 
        const hospitalizations = currentProfile.hospitalizations || []; 
        if (hospitalizations.includes(hospitalization)) return false; 

        return await updateProfile(currentProfile.id, { 
            hospitalizations: [...hospitalizations, hospitalization] 
        }); 
    }; 

    const removeHospitalization = async (hospitalization: string) => { 
        if (!currentProfile) return false; 
        const hospitalizations = currentProfile.hospitalizations || []; 

        return await updateProfile(currentProfile.id, { 
            hospitalizations: hospitalizations.filter(h => h !== hospitalization) 
        }); 
    };

    return { 
        currentProfile, 
        // Current profile data 
        diseases: currentProfile?.diseases || [],
        treatments: currentProfile?.treatments || [],
        allergies: currentProfile?.allergies || [],
        familyHistory: currentProfile?.familyHistory || [],
        doctors: currentProfile?.doctors || [],
        hospitalizations: currentProfile?.hospitalizations || [],

        // Functions to modify data 
        addDisease, 
        removeDisease, 
        addTreatment, 
        removeTreatment, 
        addAllergy, 
        removeAllergy, 
        addFamilyHistory, 
        removeFamilyHistory, 
        addDoctor, 
        removeDoctor, 
        addHospitalization, 
        removeHospitalization,
    };
};