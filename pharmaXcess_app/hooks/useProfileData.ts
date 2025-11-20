import { useProfile } from '../context/ProfileContext'; 
import { Alert } from 'react-native';
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

        // Try to POST to backend if this looks like a detailed treatment linked to a disease
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let treatmentObj: any = null;
                if (typeof treatment === 'string') {
                    try { treatmentObj = JSON.parse(treatment); } catch { treatmentObj = null; }
                } else {
                    treatmentObj = treatment;
                }

                const toISO = (s?: string) => {
                    if (!s) return undefined;
                    const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return s;
                    return undefined;
                };

                if (treatmentObj && (treatmentObj.maladie_id || treatmentObj.disease)) {
                    // try to resolve maladie_id
                    let maladieId = treatmentObj.maladie_id || null;
                    if (!maladieId && treatmentObj.disease && currentProfile.diseases) {
                        const match = (currentProfile.diseases as any[]).find(d => (d.nom || d.name || '').toLowerCase() === String(treatmentObj.disease).toLowerCase());
                        maladieId = match ? (match.id || match.maladie_id) : null;
                    }
                    if (maladieId) {
                        const payload: any = {
                            maladie_id: maladieId,
                            nom: treatmentObj.name || treatmentObj.nom || '',
                            debut: toISO(treatmentObj.beginDate || treatmentObj.debut) || null,
                            fin: toISO(treatmentObj.endDate || treatmentObj.fin) || null,
                            dosage: treatmentObj.dosage || null,
                            duree: treatmentObj.duration || treatmentObj.duree || null,
                            effets_secondaires: treatmentObj.sideEffects || treatmentObj.effets_secondaires || null,
                        };
                        const res = await profileApi.createTreatment(payload);
                        if (res.ok) {
                            // refresh diseases treatments by fetching diseases list
                            const diseasesRes = await profileApi.getDiseases();
                            if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                                await updateProfile(currentProfile.id, { diseases: diseasesRes.data });
                            }
                            return true;
                        } else {
                            console.warn('createTreatment backend error', res);
                            Alert.alert('Erreur serveur', res.error || `Statut ${res.status}`);
                            return false;
                        }
                    }
                    // if we reach here, maladieId could not be resolved
                    Alert.alert('Maladie introuvable', "Impossible de trouver la maladie associée dans le profil. Pour persister sur le serveur, saisissez le nom exact d'une maladie existante ou son id.");
                    return false;
                }
            }
        } catch (e) {
            console.warn('createTreatment backend error', e);
        }

        // Fallback to local update
        return await updateProfile(currentProfile.id, {
            treatments: [...treatments, treatment]
        });
    };

    const removeTreatment = async (treatment: string) => {
        if (!currentProfile) return false;
        const treatments = currentProfile.treatments || [];

        // Try to DELETE on backend if treatment string contains an id
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let treatmentObj: any = null;
                if (typeof treatment === 'string') {
                    try { treatmentObj = JSON.parse(treatment); } catch { treatmentObj = null; }
                } else {
                    treatmentObj = treatment;
                }
                const treatmentId = treatmentObj && (treatmentObj.id || treatmentObj.traitement_id || treatmentObj.treatment_id);
                if (treatmentId) {
                    const res = await profileApi.deleteTreatment(treatmentId);
                    if (res.ok) {
                        // refresh diseases list
                        const diseasesRes = await profileApi.getDiseases();
                        if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                            await updateProfile(currentProfile.id, { diseases: diseasesRes.data });
                        }
                        return true;
                    }
                }
            }
        } catch (e) {
            console.warn('deleteTreatment backend error', e);
        }

        return await updateProfile(currentProfile.id, {
            treatments: treatments.filter(t => t !== treatment)
        });
    };

    const addAllergy = async (allergy: string) => {
        if (!currentProfile) return false;
        const allergies = currentProfile.allergies || [];
        if (allergies.includes(allergy)) return false;
        // If this looks like a server-side profile, try to POST to backend
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let allergyObj: any = null;
                if (typeof allergy === 'string') {
                    try { allergyObj = JSON.parse(allergy); } catch { allergyObj = { name: allergy }; }
                } else {
                    allergyObj = allergy;
                }

                const toISO = (s?: string) => {
                    if (!s) return undefined;
                    const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                    if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return s;
                    return undefined;
                };

                const payload: any = {
                    utilisateur_id: numericCandidate,
                    nom: allergyObj.name || allergyObj.nom || String(allergy),
                    medicaments: allergyObj.medicaments || allergyObj.medicament || allergyObj.medications || null,
                    gravite: allergyObj.severity || allergyObj.gravite || null,
                    symptomes: allergyObj.symptoms || allergyObj.symptomes || null,
                    commentaires: allergyObj.comments || allergyObj.commentaires || null,
                };
                const iso = toISO(allergyObj.beginDate || allergyObj.debut || allergyObj.begin_date);
                if (iso) payload.debut = iso;

                const res = await profileApi.createAllergy(payload);
                if (res.ok) {
                    const listRes = await profileApi.getAllergies();
                    if (listRes.ok && Array.isArray(listRes.data)) {
                        await updateProfile(currentProfile.id, { allergies: listRes.data });
                        return true;
                    }
                    return true;
                }
            }
        } catch (e) {
            console.warn('createAllergy backend error', e);
        }

        // Fallback to local update
        return await updateProfile(currentProfile.id, {
            allergies: [...allergies, allergy]
        });
    };

    const removeAllergy = async (allergy: string) => {
        if (!currentProfile) return false;
        const allergies = currentProfile.allergies || [];
        // Try to delete on backend if server profile
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let allergyObj: any = null;
                if (typeof allergy === 'string') {
                    try { allergyObj = JSON.parse(allergy); } catch { allergyObj = { name: allergy }; }
                } else {
                    allergyObj = allergy;
                }

                const allergyId = allergyObj && (allergyObj.id || allergyObj.allergy_id || allergyObj.id_allergy);
                if (allergyId) {
                    const res = await profileApi.deleteAllergy(allergyId);
                    if (res.ok) {
                        const listRes = await profileApi.getAllergies();
                        if (listRes.ok && Array.isArray(listRes.data)) {
                            await updateProfile(currentProfile.id, { allergies: listRes.data });
                            return true;
                        }
                        return true;
                    }
                } else {
                    // Try to find matching allergy in currentProfile to get id
                    const match = allergies.find((a: any) => {
                        if (!a) return false;
                        if (typeof a === 'string') return a === (allergyObj.name || allergy);
                        return (a.nom || a.name || '').toLowerCase() === String(allergyObj.name || allergy).toLowerCase();
                    });
                    const idToDelete = match && typeof match === 'object' ? (match.id || match.allergy_id || null) : null;
                    if (idToDelete) {
                        const res = await profileApi.deleteAllergy(idToDelete);
                        if (res.ok) {
                            const listRes = await profileApi.getAllergies();
                            if (listRes.ok && Array.isArray(listRes.data)) {
                                await updateProfile(currentProfile.id, { allergies: listRes.data });
                                return true;
                            }
                            return true;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('deleteAllergy backend error', e);
        }

        // Fallback: local removal
        return await updateProfile(currentProfile.id, {
            allergies: allergies.filter(a => a !== allergy)
        });
    };

    const addFamilyHistory = async (history: string) => {
        if (!currentProfile) return false;
        const familyHistory = currentProfile.familyHistory || [];
        if (familyHistory.includes(history)) return false;
        // Try to POST to backend if this profile is server-backed
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let histObj: any = null;
                if (typeof history === 'string') {
                    try { histObj = JSON.parse(history); } catch { histObj = { name: history }; }
                } else histObj = history;

                const payload: any = {
                    utilisateur_id: numericCandidate,
                    maladie: histObj.name || histObj.maladie || String(history),
                    membre: histObj.familyMember || histObj.membre || null,
                    severite: histObj.severity || histObj.severite || null,
                    traitement: histObj.treatment || histObj.traitement || null,
                };
                const res = await profileApi.createFamilyHistory(payload);
                if (res.ok) {
                    const list = await profileApi.getFamilyHistory();
                    if (list.ok && Array.isArray(list.data)) {
                        await updateProfile(currentProfile.id, { familyHistory: list.data });
                        return true;
                    }
                    return true;
                }
            }
        } catch (e) {
            console.warn('createFamilyHistory backend error', e);
        }

        // fallback to local update
        return await updateProfile(currentProfile.id, {
            familyHistory: [...familyHistory, history]
        });
    };

    const removeFamilyHistory = async (history: string) => {
        if (!currentProfile) return false;
        const familyHistory = currentProfile.familyHistory || [];
        // Try to DELETE on backend if profile is server-backed
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let histObj: any = null;
                if (typeof history === 'string') {
                    try { histObj = JSON.parse(history); } catch { histObj = { name: history }; }
                } else histObj = history;

                const entryId = histObj && (histObj.id || histObj.antecedent_id || histObj.entry_id);
                if (entryId) {
                    const res = await profileApi.deleteFamilyHistory(entryId);
                    if (res.ok) {
                        const list = await profileApi.getFamilyHistory();
                        if (list.ok && Array.isArray(list.data)) {
                            await updateProfile(currentProfile.id, { familyHistory: list.data });
                            return true;
                        }
                        return true;
                    }
                } else {
                    // try to find matching entry to get id
                    const match = familyHistory.find((h: any) => {
                        if (!h) return false;
                        if (typeof h === 'string') return (h === (histObj.name || history));
                        return (h.maladie || h.name || '').toLowerCase() === String(histObj.name || history).toLowerCase();
                    });
                    const idToDelete = match && typeof match === 'object' ? (match.id || match.antecedent_id || null) : null;
                    if (idToDelete) {
                        const res = await profileApi.deleteFamilyHistory(idToDelete);
                        if (res.ok) {
                            const list = await profileApi.getFamilyHistory();
                            if (list.ok && Array.isArray(list.data)) {
                                await updateProfile(currentProfile.id, { familyHistory: list.data });
                                return true;
                            }
                            return true;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('deleteFamilyHistory backend error', e);
        }

        // Fallback: local removal
        return await updateProfile(currentProfile.id, {
            familyHistory: familyHistory.filter(h => h !== history)
        });
    };

    const addDoctor = async (doctor: string) => { 
        if (!currentProfile) return false; 
        const doctors = currentProfile.doctors || []; 
        if (doctors.includes(doctor)) return false; 

        // Try to POST to backend when profile is server-backed
        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let doctorObj: any = null;
                if (typeof doctor === 'string') {
                    try { doctorObj = JSON.parse(doctor); } catch { doctorObj = { name: doctor }; }
                } else doctorObj = doctor;

                const payload: any = {
                    utilisateur_id: numericCandidate,
                    nom: doctorObj.name || doctorObj.nom || String(doctor),
                    specialite: doctorObj.speciality || doctorObj.specialite || null,
                    hopital: doctorObj.hopital || doctorObj.hospital || doctorObj.hopitalName || null,
                    telephone: doctorObj.telephone || doctorObj.phone || null,
                    email: doctorObj.email || null,
                    adresse: doctorObj.adresse || doctorObj.address || null,
                };

                const res = await profileApi.createDoctor(payload);
                if (res.ok) {
                    const list = await profileApi.getDoctors();
                    if (list.ok && Array.isArray(list.data)) {
                        await updateProfile(currentProfile.id, { doctors: list.data });
                        return true;
                    }
                    return true;
                }
            }
        } catch (e) {
            console.warn('createDoctor backend error', e);
        }

        return await updateProfile(currentProfile.id, { 
            doctors: [...doctors, doctor] 
        }); 
    }; 

    const removeDoctor = async (doctor: string) => { 
        if (!currentProfile) return false; 
        const doctors = currentProfile.doctors || []; 

        try {
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfile) {
                let doctorObj: any = null;
                if (typeof doctor === 'string') {
                    try { doctorObj = JSON.parse(doctor); } catch { doctorObj = { name: doctor }; }
                } else doctorObj = doctor;

                const doctorId = doctorObj && (doctorObj.id || doctorObj.doctor_id || doctorObj.medecin_id);
                if (doctorId) {
                    const res = await profileApi.deleteDoctor(doctorId);
                    if (res.ok) {
                        const list = await profileApi.getDoctors();
                        if (list.ok && Array.isArray(list.data)) {
                            await updateProfile(currentProfile.id, { doctors: list.data });
                            return true;
                        }
                        return true;
                    }
                } else {
                    // try to find matching doctor in currentProfile to get id
                    const match = doctors.find((d: any) => {
                        if (!d) return false;
                        if (typeof d === 'string') return d === (doctorObj.name || doctor);
                        return (d.nom || d.name || '').toLowerCase() === String(doctorObj.name || doctor).toLowerCase();
                    });
                    const idToDelete = match && typeof match === 'object' ? (match.id || match.medecin_id || null) : null;
                    if (idToDelete) {
                        const res = await profileApi.deleteDoctor(idToDelete);
                        if (res.ok) {
                            const list = await profileApi.getDoctors();
                            if (list.ok && Array.isArray(list.data)) {
                                await updateProfile(currentProfile.id, { doctors: list.data });
                                return true;
                            }
                            return true;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('deleteDoctor backend error', e);
        }

        return await updateProfile(currentProfile.id, { 
            doctors: doctors.filter(d => d !== doctor)
        }); 
    }; 

    const addHospitalization = async (hospitalization: any) => { 
        if (!currentProfile) return false; 
        const hospitalizations = currentProfile.hospitalizations || []; 

        // Normalize incoming hospitalization to object form
        let hospObj: any = null;
        if (typeof hospitalization === 'string') {
            try { hospObj = JSON.parse(hospitalization); } catch { hospObj = { reason: hospitalization }; }
        } else {
            hospObj = hospitalization;
        }

        // Prevent exact-duplicate by a simple string comparison of reason+dates
        const uniquenessKey = `${hospObj.reason || hospObj.type || ''}||${hospObj.dates || hospObj.date || ''}`;
        const exists = hospitalizations.some((h: any) => {
            if (!h) return false;
            const key = `${h.reason || h.type || ''}||${h.dates || h.date || ''}`;
            return key === uniquenessKey;
        });
        if (exists) return false;

        // If this profile looks like a server-side profile (numeric id), try backend
        const numericCandidate = Number(currentProfile.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);

        if (isServerProfile) {
            try {
                const payload: any = {
                    utilisateur_id: numericCandidate,
                    type: hospObj.type || hospObj.reason || 'hospitalisation',
                    description: hospObj.description || hospObj.desc || '',
                };
                if (hospObj.dates || hospObj.date) payload.dates = hospObj.dates || hospObj.date;
                else if (hospObj.beginDate || hospObj.endDate) payload.dates = `${hospObj.beginDate || ''} - ${hospObj.endDate || ''}`;
                    if (hospObj.service) payload.service = hospObj.service;
                    if (hospObj.hopital || hospObj.hospital || hospObj.hospitalName) payload.hopital = hospObj.hopital || hospObj.hospital || hospObj.hospitalName;
                    if (hospObj.medecin || hospObj.doctor) payload.medecin = hospObj.medecin || hospObj.doctor;
                    // include medications/traitements if provided by UI
                    if (hospObj.medications || hospObj.traitements || hospObj.medicaments) payload.medicaments = hospObj.medications || hospObj.traitements || hospObj.medicaments;

                const res = await profileApi.createHospitalization(payload);
                if (res.ok) {
                    const listRes = await profileApi.getHospitalizations();
                    if (listRes.ok && Array.isArray(listRes.data)) {
                        await updateProfile(currentProfile.id, { hospitalizations: listRes.data });
                        return true;
                    }
                    return true;
                }
            } catch (e) {
                console.warn('createHospitalization backend error', e);
            }
        }

        // Fallback to local update
        return await updateProfile(currentProfile.id, { 
            hospitalizations: [...hospitalizations, (typeof hospitalization === 'string' ? hospitalization : hospObj)] 
        }); 
    };

    const removeHospitalization = async (hospitalization: any) => { 
        if (!currentProfile) return false; 
        const hospitalizations = currentProfile.hospitalizations || []; 

        // If server-side profile, try to delete on backend
        const numericCandidate = Number(currentProfile.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);

        // Try to extract an id if hospitalization is an object
        let hospId: any = null;
        let hospKey: string | null = null;
        if (typeof hospitalization === 'string') {
            try { const parsed = JSON.parse(hospitalization); hospId = parsed.id || null; hospKey = `${parsed.reason || parsed.type || ''}||${parsed.dates || parsed.date || ''}`; }
            catch { hospKey = hospitalization; }
        } else if (typeof hospitalization === 'object' && hospitalization !== null) {
            hospId = hospitalization.id || hospitalization.hospitalisation_id || null;
            hospKey = `${hospitalization.reason || hospitalization.type || ''}||${hospitalization.dates || hospitalization.date || ''}`;
        }

        if (isServerProfile) {
            try {
                if (hospId) {
                    const res = await profileApi.deleteHospitalization(hospId);
                    if (res.ok) {
                        const listRes = await profileApi.getHospitalizations();
                        if (listRes.ok && Array.isArray(listRes.data)) {
                            await updateProfile(currentProfile.id, { hospitalizations: listRes.data });
                            return true;
                        }
                        return true;
                    }
                } else {
                    // try to locate matching hospitalization and delete by its id
                    const match = hospitalizations.find((h: any) => {
                        if (!h) return false;
                        const key = `${h.reason || h.type || ''}||${h.dates || h.date || ''}`;
                        if (typeof hospKey === 'string') return key === hospKey || key === hospitalization;
                        return false;
                    });
                    const idToDelete = match && typeof match === 'object' ? (match.id || match.hospitalisation_id || null) : null;
                    if (idToDelete) {
                        const res = await profileApi.deleteHospitalization(idToDelete);
                        if (res.ok) {
                            const listRes = await profileApi.getHospitalizations();
                            if (listRes.ok && Array.isArray(listRes.data)) {
                                await updateProfile(currentProfile.id, { hospitalizations: listRes.data });
                                return true;
                            }
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.warn('deleteHospitalization backend error', e);
            }
        }

        // Fallback: local removal
        return await updateProfile(currentProfile.id, { 
            hospitalizations: hospitalizations.filter((h: any) => {
                if (typeof h === 'string' && typeof hospitalization === 'string') return h !== hospitalization;
                if (typeof h === 'object' && typeof hospitalization === 'object') {
                    const keyA = `${h.reason || h.type || ''}||${h.dates || h.date || ''}`;
                    const keyB = `${hospitalization.reason || hospitalization.type || ''}||${hospitalization.dates || hospitalization.date || ''}`;
                    return keyA !== keyB;
                }
                return true;
            })
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