import { useProfile } from '../context/ProfileContext'; 
import profileApi from '../utils/api/profile';

/** 
 * personalized hook to get and manage data specific to the current profile
 */
export const useProfileData = () => { 
    const { currentProfile, updateProfile } = useProfile(); 

    // Functions to manage the medical data of the current profile
    const addDisease = async (disease: any) => {
        if (!currentProfile) return false;
        const diseases = currentProfile.diseases || [];

        // Normalize incoming disease to object form
        let diseaseObj: any = null;
        if (typeof disease === 'string') {
            try { diseaseObj = JSON.parse(disease); } catch { diseaseObj = { nom: disease }; }
        } else {
            diseaseObj = disease;
        }

        const diseaseName = diseaseObj.name || diseaseObj.nom || String(disease);

        // Prevent duplicates by name
        const exists = diseases.some((d: any) => {
            if (!d) return false;
            if (typeof d === 'string') return d === diseaseName;
            return d.nom === diseaseName || d.name === diseaseName || String(d) === String(disease);
        });
        if (exists) return false;

        // If this profile looks like a server-side profile (numeric id), try backend
        const numericCandidate = Number(currentProfile.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);

        if (isServerProfile) {
            try {
                // Convert possible DD/MM/YYYY to YYYY-MM-DD for backend
                const toISO = (s?: string) => {
                    if (!s) return undefined;
                    const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return s;
                    return undefined;
                };

                const payload: any = {
                    utilisateur_id: numericCandidate,
                    nom: diseaseName,
                    description: diseaseObj.description || diseaseObj.desc || '',
                    symptomes: diseaseObj.symptoms || diseaseObj.symptomes || '',
                };
                // include examens and traitements if provided
                const examens = diseaseObj.examens || diseaseObj.exams || diseaseObj.examen || undefined;
                const traitements = diseaseObj.medications || diseaseObj.traitements || diseaseObj.treatments || undefined;
                if (examens) payload.examens = examens;
                if (traitements) payload.traitements = traitements;
                const iso = toISO(diseaseObj.beginDate || diseaseObj.date_debut || diseaseObj.begin_date);
                if (iso) payload.date_debut = iso;

                const res = await profileApi.createDisease(payload);
                if (res.ok) {
                    // refresh diseases from backend and update local profile
                    const diseasesRes = await profileApi.getDiseases();
                    if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                        await updateProfile(currentProfile.id, { diseases: diseasesRes.data });
                        return true;
                    }
                    return true;
                }
            } catch (e) {
                console.warn('createDisease backend error', e);
            }
        }

        // Fallback to local update
        return await updateProfile(currentProfile.id, {
            diseases: [...diseases, (typeof disease === 'string' ? disease : JSON.stringify(diseaseObj))]
        });
    }; 

    const removeDisease = async (disease: any) => {
        if (!currentProfile) return false;
        const diseases = currentProfile.diseases || [];

        // If server-side profile, try to delete on backend
        const numericCandidate = Number(currentProfile.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);

        // Try to extract an id if disease is an object
        let diseaseId: any = null;
        let diseaseName: string | null = null;
        if (typeof disease === 'string') {
            try { const parsed = JSON.parse(disease); diseaseId = parsed.id || parsed.id_maladie || null; diseaseName = parsed.name || parsed.nom || null; }
            catch { diseaseName = disease; }
        } else if (typeof disease === 'object' && disease !== null) {
            diseaseId = disease.id || disease.maladie_id || disease.maladieId || null;
            diseaseName = disease.name || disease.nom || null;
        }

        if (isServerProfile) {
            try {
                // If we have an id, call delete
                if (diseaseId) {
                    const res = await profileApi.deleteDisease(diseaseId);
                    if (res.ok) {
                        const diseasesRes = await profileApi.getDiseases();
                        if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                            await updateProfile(currentProfile.id, { diseases: diseasesRes.data });
                            return true;
                        }
                        return true;
                    }
                } else {
                    // Try to find matching disease in currentProfile.diseases to get its id
                    const match = diseases.find((d: any) => {
                        if (!d) return false;
                        if (typeof d === 'string') return d === diseaseName;
                        return d.nom === diseaseName || d.name === diseaseName;
                    });
                    const idToDelete = match && typeof match === 'object' ? (match.id || match.maladie_id) : null;
                    if (idToDelete) {
                        const res = await profileApi.deleteDisease(idToDelete);
                        if (res.ok) {
                            const diseasesRes = await profileApi.getDiseases();
                            if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                                await updateProfile(currentProfile.id, { diseases: diseasesRes.data });
                                return true;
                            }
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.warn('deleteDisease backend error', e);
            }
        }

        // Fallback: local removal by matching string or serialized object
        return await updateProfile(currentProfile.id, {
            diseases: diseases.filter((d: any) => {
                if (typeof d === 'string' && typeof disease === 'string') return d !== disease;
                if (typeof d === 'string' && typeof disease !== 'string') return d !== (JSON.stringify(disease) || '');
                if (typeof d === 'object' && typeof disease === 'object') {
                    const nameA = d.name || d.nom || '';
                    const nameB = disease.name || disease.nom || '';
                    return nameA !== nameB;
                }
                return true;
            })
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