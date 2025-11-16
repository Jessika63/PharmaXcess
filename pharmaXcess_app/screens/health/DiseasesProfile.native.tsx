import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import profileApi from '../../utils/api/profile';
import { useProfileData } from '../../hooks/useProfileData';
import { CustomPicker } from '../../components';

type Disease = { 
    id?: number | string;
    name: string; 
    description: string; 
    symptoms: string; 
    beginDate: string; 
    medications: string; 
    examens: string; 
}; 

type DiseasesProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

export default function Diseases ({ navigation }: DiseasesProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile, updateProfile } = useProfile();
    const { diseases: profileDiseases, addDisease, removeDisease } = useProfileData();
    const styles = createStyles(colors, fontScale);

    // Diseases: source of truth is backend via useProfileData/currentProfile
    const [diseases, setDiseases] = useState<Disease[]>([]);

    // Helper to normalize backend disease entries (could be string, JSON string, SQL row object, or frontend shape)
    const normalizeDiseaseEntry = (entry: any): Disease => {
        if (!entry) return { name: '', description: '', symptoms: '', beginDate: '', medications: '', examens: '' };
        if (typeof entry === 'string') {
            try {
                entry = JSON.parse(entry);
            } catch {
                return { name: entry, description: '', symptoms: '', beginDate: '', medications: '', examens: '' };
            }
        }

        const id = entry.id || entry.maladie_id || entry.id_maladie || undefined;
        const name = entry.name || entry.nom || '';
        const description = entry.description || entry.desc || '';
        const symptoms = entry.symptoms || entry.symptomes || '';
        const beginDate = entry.beginDate || entry.date_debut || entry.date || '';
        const medications = entry.medications || entry.traitements || '';
        const examens = entry.examens || entry.exams || '';

        return { id, name, description, symptoms, beginDate, medications, examens };
    };

    // Sync local view state with backend/currentProfile data
    // Guard: only update local `diseases` state when the normalized data actually changed
    useEffect(() => {
        const sourceArray: any[] =
            (profileDiseases && Array.isArray(profileDiseases) && profileDiseases) ||
            (currentProfile && Array.isArray((currentProfile as any).diseases) && ((currentProfile as any).diseases || [])) ||
            [];

        const normalized = sourceArray.map(normalizeDiseaseEntry);

        // shallow deep-equality for disease arrays (compare lengths and key fields)
        const equal = (a: Disease[], b: Disease[]) => {
            if (a === b) return true;
            if (!Array.isArray(a) || !Array.isArray(b)) return false;
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                const A = a[i] || ({} as Disease);
                const B = b[i] || ({} as Disease);
                if (
                    A.name !== B.name ||
                    A.description !== B.description ||
                    A.symptoms !== B.symptoms ||
                    A.beginDate !== B.beginDate ||
                    A.medications !== B.medications ||
                    A.examens !== B.examens
                ) return false;
            }
            return true;
        };

        if (!equal(diseases, normalized)) {
            setDiseases(normalized);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileDiseases, currentProfile]);

    // When arriving on the diseases screen, fetch diseases from backend once and attach to profile cache
    const fetchedDiseasesForProfile = useRef<string | null>(null);
    React.useEffect(() => {
        let mounted = true;
        const fetchDiseases = async () => {
            try {
                if (!currentProfile || !currentProfile.id) return;
                if (String(fetchedDiseasesForProfile.current) === String(currentProfile.id)) return; // already fetched
                const res = await profileApi.getDiseases();
                if (!mounted) return;
                if (res.ok && Array.isArray(res.data)) {
                    // persist to local profile cache without triggering a redundant backend PUT
                    await updateProfile(currentProfile.id, { diseases: res.data });
                    fetchedDiseasesForProfile.current = String(currentProfile.id);
                    // local state will sync via the other effect
                }
            } catch (e) {
                console.warn('Failed to fetch diseases on Diseases screen', e);
            }
        };
        fetchDiseases();
        return () => { mounted = false; };
    }, [currentProfile?.id]);

        const getRelationshipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Mon profil';
            case 'child': return 'Profil enfant';
            case 'parent': return 'Profil parent';
            case 'spouse': return 'Profil conjoint(e)';
            case 'other': return 'Autre profil';
            default: return 'Mon profil';
        }
    };

    const [expanded, setExpanded] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newDisease, setNewDisease] = useState<Disease>({
        name: '',
        description: '',
        symptoms: '',
        beginDate: '',
        medications: '',
        examens: '',
    });
    const [editedDisease, setEditedDisease] = useState<Disease>({
        name: '',
        description: '',
        symptoms: '',
        beginDate: '',
        medications: '',
        examens: '',
    });

    const [selectedYear, setSelectedYear] = useState<number>(2024); 
    const [selectedMonth, setSelectedMonth] = useState<number>(1); 
    const [selectedDay, setSelectedDay] = useState<number>(1); 
    const [editSelectedYear, setEditSelectedYear] = useState<number>(2024); 
    const [editSelectedMonth, setEditSelectedMonth] = useState<number>(1); 
    const [editSelectedDay, setEditSelectedDay] = useState<number>(1); 

    // For simple disease addition by profile 
    const [newDiseaseSimple, setNewDiseaseSimple] = useState<string>('');

    const toggleCard = (index: number): void => { 
        setExpanded(expanded === index ? null : index);
    }; 

    // Complex disease management (for the main profile) 
    const handleAddPress = async (): Promise<void> => {
        if (
            !newDisease.name ||
            !newDisease.description ||
            !newDisease.symptoms ||
            !newDisease.medications ||
            !newDisease.examens
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs pour ajouter une nouvelle maladie.');
            return;
        }

        const newDiseaseData: Disease = {
            ...newDisease,
            beginDate: `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`,
        };

        // Try to persist via useProfileData.addDisease which handles server POST or local fallback
        try {
            const success = await addDisease(JSON.stringify(newDiseaseData));
            if (success) {
                // reset form and close modal; the profile cache will be refreshed by the hook/context
                setNewDisease({
                    name: '',
                    description: '',
                    symptoms: '',
                    beginDate: '',
                    medications: '',
                    examens: '',
                });
                setModalVisible(false);
                setSelectedYear(2024);
                setSelectedMonth(1);
                setSelectedDay(1);
                Alert.alert('Succès', 'Maladie ajoutée avec succès.');
            } else {
                // Fallback: update local UI immediately
                setDiseases([newDiseaseData, ...diseases]);
                setNewDisease({
                    name: '',
                    description: '',
                    symptoms: '',
                    beginDate: '',
                    medications: '',
                    examens: '',
                });
                setModalVisible(false);
                setSelectedYear(2024);
                setSelectedMonth(1);
                setSelectedDay(1);
                Alert.alert('Avertissement', "La maladie a été ajoutée localement mais n'a pas pu être enregistrée sur le serveur.");
            }
        } catch (e) {
            console.warn('Failed to add disease', e);
            // keep UX consistent by adding locally
            setDiseases([newDiseaseData, ...diseases]);
            setNewDisease({
                name: '',
                description: '',
                symptoms: '',
                beginDate: '',
                medications: '',
                examens: '',
            });
            setModalVisible(false);
            setSelectedYear(2024);
            setSelectedMonth(1);
            setSelectedDay(1);
            Alert.alert('Erreur', 'Impossible d\'ajouter la maladie. Elle a été ajoutée localement.');
        }
    };

    const handleEditPress = (index: number): void => {
        const disease = diseases[index];
        setEditedDisease({ ...disease });
        setEditingIndex(index);
        
        const dateParts = disease.beginDate.split('/');
        if (dateParts.length === 3) {
            setEditSelectedDay(parseInt(dateParts[0]));
            setEditSelectedMonth(parseInt(dateParts[1]));
            setEditSelectedYear(parseInt(dateParts[2]));
        }
        
        setEditModalVisible(true);
    };

    const handleSaveEdit = async (): Promise<void> => {
        if (
            !editedDisease.name ||
            !editedDisease.description ||
            !editedDisease.symptoms ||
            !editedDisease.medications ||
            !editedDisease.examens
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (editingIndex !== null) {
            const updatedDiseases = [...diseases];
            const newBeginDate = `${editSelectedDay.toString().padStart(2, '0')}/${editSelectedMonth.toString().padStart(2, '0')}/${editSelectedYear}`;
            const updated = {
                ...editedDisease,
                beginDate: newBeginDate,
            };
            updatedDiseases[editingIndex] = updated;
            setDiseases(updatedDiseases);

            // If this disease has a server id and the current profile looks server-side, call backend PUT
            const diseaseId = diseases[editingIndex]?.id;
            const numericCandidate = currentProfile ? Number(currentProfile.id) : NaN;
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile?.id);

            if (isServerProfile && diseaseId) {
                try {
                    // convert DD/MM/YYYY -> YYYY-MM-DD
                    const toISO = (s?: string) => {
                        if (!s) return undefined;
                        const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
                        if (/^\d{4}-\d{2}-\d{2}$/.test(String(s))) return s;
                        return undefined;
                    };

                    const payload: any = {
                        nom: updated.name,
                        description: updated.description,
                        symptomes: updated.symptoms,
                    };
                    const iso = toISO(updated.beginDate);
                    if (iso) payload.date_debut = iso;
                    // include examens and traitements (medications)
                    if (updated.examens) payload.examens = updated.examens;
                    if (updated.medications) payload.traitements = updated.medications;
                    // include examens and traitements/medications when updating
                    if (updated.examens) payload.examens = updated.examens;
                    if (updated.medications) payload.traitements = updated.medications;

                    const res = await profileApi.updateDisease(diseaseId, payload);
                    if (res.ok) {
                        // refresh diseases from backend and update local profile cache
                        const diseasesRes = await profileApi.getDiseases();
                        if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                            await updateProfile(currentProfile!.id, { diseases: diseasesRes.data });
                        }
                    } else {
                        console.warn('Failed to update disease on server', res.error);
                    }
                } catch (e) {
                    console.warn('Error while updating disease on server', e);
                }
            }
        }

        setEditModalVisible(false);
        setEditingIndex(null);
        Alert.alert('Succès', 'Les informations de la maladie ont été mises à jour.');
    };

    const handleDeleteDisease = (index: number): void => {
        const disease = diseases[index];
        Alert.alert(
            'Supprimer la maladie',
            `Êtes-vous sûr de vouloir supprimer "${disease.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        const updatedDiseases = diseases.filter((_, i) => i !== index);
                        setDiseases(updatedDiseases);
                    }
                }
            ]
        );
    };

    // Simple disease management by profile 
    const handleAddSimpleDisease = async (): Promise<void> => {
        // For other profiles, we only require the name field but save all available data
        if (!newDisease.name.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer le nom de la maladie.');
            return;
        }

        // Create complete disease data even for other profiles
        const diseaseData = {
            name: newDisease.name.trim(),
            description: newDisease.description || '',
            symptoms: newDisease.symptoms || '',
            beginDate: `${selectedDay.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}/${selectedYear}`,
            medications: newDisease.medications || '',
            examens: newDisease.examens || ''
        };

        const success = await addDisease(JSON.stringify(diseaseData));
        if (success) {
            // Reset all fields
            setNewDiseaseSimple('');
            setNewDisease({
                name: '',
                description: '',
                symptoms: '',
                beginDate: '',
                medications: '',
                examens: '',
            });
            setModalVisible(false);
            setSelectedYear(2024);
            setSelectedMonth(1);
            setSelectedDay(1);
            Alert.alert('Succès', 'Maladie ajoutée avec succès.');
        } else {
            Alert.alert('Erreur', 'Cette maladie est déjà enregistrée ou une erreur est survenue.');
        }
    };

    const handleRemoveDisease = async (disease: string): Promise<void> => {
        Alert.alert(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer "${disease}" ?`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await removeDisease(disease);
                        if (success) {
                            Alert.alert('Succès', 'Maladie supprimée avec succès.');
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer la maladie.');
                        }
                    },
                },
            ]
        );
    };

    const getRelatioinhipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Mon profil';
            case 'child': return 'Profil enfant';
            case 'parent': return 'Profil parent';
            case 'spouse': return 'Profil conjoint(e)';
            case 'other': return 'Autre profil';
            default: return 'Mon profil';
        }
    }; 

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Maladies',
        });
    }, [navigation]);

    // Determine if it's the main profile 
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

    return ( 
        <View style={[styles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header for current profile */}
            {currentProfile && (
                <View style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={[styles.title, { color: colors.primary, fontWeight: 'bold' }]}>
                                {getRelationshipText(currentProfile.relationship)}
                            </Text>
                            <Text style={[styles.content, { color: colors.primary, opacity: 0.8 }]}>
                                {currentProfile.name}
                            </Text>
                        </View>
                        <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                    </View>
                </View>
            )}
                {/* Conditional display based on profile */} 
                {isMainProfile ? ( 
                    // For the main profile: predefined complex cards
                    <>
                        {diseases.map((disease, index) => (
                            <TouchableOpacity key={index} onPress={() => toggleCard(index)}>
                                <View key={index} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{disease.name}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                                                <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteDisease(index)} style={styles.deleteButton}>
                                                <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Description: </Text>
                                        {expanded === index ? disease.description : `${disease.description.slice(0, 70)}...`}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Symptômes: </Text>
                                        {expanded === index ? disease.symptoms : `${disease.symptoms.slice(0, 75)}...`}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Date de début: </Text>
                                        {disease.beginDate}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Traitements: </Text>
                                        {expanded === index ? disease.medications : `${disease.medications.slice(0, 75)}...`}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Examens: </Text>
                                        {expanded === index ? disease.examens : `${disease.examens.slice(0, 75)}...`}
                                    </Text>

                                    <TouchableOpacity onPress={() => toggleCard(index)} style={styles.arrowContainer}>
                                        <Ionicons
                                            name={expanded === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                                            size={24}
                                            color={colors.iconPrimary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : ( 
                    // For other profiles: full disease display with same functionality
                    <>
                        {profileDiseases && profileDiseases.length > 0 ? (
                            <>
                                {profileDiseases.map((diseaseString, index) => {
                                    // Parse disease data (could be JSON string or simple name)
                                    let disease: Disease;
                                    try {
                                        disease = JSON.parse(diseaseString);
                                    } catch {
                                        // Fallback for simple string names
                                        disease = {
                                            name: diseaseString,
                                            description: '',
                                            symptoms: '',
                                            beginDate: '',
                                            medications: '',
                                            examens: ''
                                        };
                                    }
                                    
                                    return (
                                        <TouchableOpacity key={index} onPress={() => toggleCard(index)}>
                                            <View style={styles.card}>
                                                <View style={styles.cardHeader}>
                                                    <Text style={styles.cardTitle}>{disease.name}</Text>
                                                    <View style={styles.actionButtons}>
                                                        <TouchableOpacity onPress={() => handleRemoveDisease(diseaseString)} style={styles.deleteButton}>
                                                            <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>

                                                {disease.description && (
                                                    <Text style={styles.cardText}>
                                                        <Text style={styles.bold}>Description: </Text>
                                                        {expanded === index ? disease.description : `${disease.description.slice(0, 70)}...`}
                                                    </Text>
                                                )}
                                                {disease.symptoms && (
                                                    <Text style={styles.cardText}>
                                                        <Text style={styles.bold}>Symptômes: </Text>
                                                        {expanded === index ? disease.symptoms : `${disease.symptoms.slice(0, 75)}...`}
                                                    </Text>
                                                )}
                                                {disease.beginDate && (
                                                    <Text style={styles.cardText}>
                                                        <Text style={styles.bold}>Date de début: </Text>
                                                        {disease.beginDate}
                                                    </Text>
                                                )}
                                                {disease.medications && (
                                                    <Text style={styles.cardText}>
                                                        <Text style={styles.bold}>Traitements: </Text>
                                                        {expanded === index ? disease.medications : `${disease.medications.slice(0, 75)}...`}
                                                    </Text>
                                                )}
                                                {disease.examens && (
                                                    <Text style={styles.cardText}>
                                                        <Text style={styles.bold}>Examens: </Text>
                                                        {expanded === index ? disease.examens : `${disease.examens.slice(0, 75)}...`}
                                                    </Text>
                                                )}

                                                {/* Show expand/collapse arrow only if there's expandable content */}
                                                {(disease.description || disease.symptoms || disease.medications || disease.examens) && (
                                                    <TouchableOpacity onPress={() => toggleCard(index)} style={styles.arrowContainer}>
                                                        <Ionicons
                                                            name={expanded === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                                                            size={24}
                                                            color={colors.iconPrimary}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </>
                        ) : (
                            <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                                <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                                <Text style={[styles.cardText, { textAlign: 'center', marginTop: 20 }]}>
                                    Aucune maladie enregistrée pour ce profil.
                                </Text>
                                <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}> 
                                    Ajoutez vos maladies pour un meilleur suivi médical
                                </Text>
                            </View>
                        )}
                    </> 
                )}

                {/* Button to add a new disease */} 
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Ajouter</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Retour</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal for adding a new disease - same for all profiles */} 
            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        backgroundColor: colors.background,
                        padding: 20
                    }}
                    keyboardShouldPersistTaps="handled"
                > 
                    <Text style={[styles.cardText, { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}> 
                        Ajouter une maladie 
                    </Text>

                    <TextInput 
                        placeholder="Nom" 
                        value={isMainProfile ? newDisease.name : newDiseaseSimple}
                        onChangeText={(text: string) => {
                            if (isMainProfile) {
                                setNewDisease({ ...newDisease, name: text })
                            } else {
                                setNewDiseaseSimple(text);
                                // For other profiles, also update newDisease.name for consistency
                                setNewDisease({ ...newDisease, name: text });
                            }
                        }}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 15,
                            fontSize: 16,
                            color: colors.text
                        }}
                        placeholderTextColor={colors.text + '80'} 
                    />

                    <TextInput 
                        placeholder="Description" 
                        value={newDisease.description}
                        onChangeText={(text: string) => setNewDisease({ ...newDisease, description: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 15,
                            fontSize: 16,
                            color: colors.text,
                            minHeight: 80
                        }}
                        multiline
                        placeholderTextColor={colors.text + '80'} 
                    />
                    
                    <TextInput 
                        placeholder="Symptômes"
                        value={newDisease.symptoms}
                        onChangeText={(text: string) => setNewDisease({ ...newDisease, symptoms: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 15,
                            fontSize: 16,
                            color: colors.text,
                            minHeight: 80
                        }}
                        multiline
                        placeholderTextColor={colors.text + '80'} 
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                        <View style={{ flex: 1, marginRight: 5 }}> 
                            <CustomPicker 
                                label="Jour" 
                                selectedValue={selectedDay} 
                                onValueChange={(value: string | number) => setSelectedDay(Number(value))}
                                options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 5 }}> 
                            <CustomPicker 
                                label="Mois" 
                                selectedValue={selectedMonth} 
                                onValueChange={(value: string | number) => setSelectedMonth(Number(value))}
                                options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}> 
                            <CustomPicker 
                                label="Année" 
                                selectedValue={selectedYear} 
                                onValueChange={(value: string | number) => setSelectedYear(Number(value))}
                                options={Array.from({ length: 100 }, (_, i) => ({ label: (i + 1920).toString(), value: (i + 1920).toString() }))}
                                placeholder="2024"
                            />
                        </View>
                    </View>

                    <TextInput 
                        placeholder="Traitements"
                        value={newDisease.medications}
                        onChangeText={(text: string) => setNewDisease({ ...newDisease, medications: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 15,
                            fontSize: 16,
                            color: colors.text,
                            minHeight: 80
                        }}
                        multiline
                        placeholderTextColor={colors.text + '80'} 
                    />

                    <TextInput 
                        placeholder="Examens" 
                        value={newDisease.examens}
                        onChangeText={(text: string) => setNewDisease({ ...newDisease, examens: text })}
                        style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            padding: 15,
                            marginBottom: 30,
                            fontSize: 16,
                            color: colors.text,
                            minHeight: 80
                        }}
                        multiline
                        placeholderTextColor={colors.text + '80'} 
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}> 
                        <TouchableOpacity 
                            style={{ 
                                flex: 1, 
                                padding: 15, 
                                borderRadius: 10, 
                                backgroundColor: colors.secondary + '30',
                                marginRight: 10,
                                alignItems: 'center'
                            }}
                            onPress={() => {
                                setModalVisible(false);
                                // Reset all fields for both main and other profiles
                                setNewDiseaseSimple('');
                                setNewDisease({
                                    name: '',
                                    description: '',
                                    symptoms: '',
                                    beginDate: '',
                                    medications: '',
                                    examens: '',
                                });
                                setSelectedYear(2024);
                                setSelectedMonth(1);
                                setSelectedDay(1);
                            }}
                        >
                            <Text style={{ color: colors.text, fontWeight: 'bold' }}>Annuler</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ 
                                flex: 1, 
                                padding: 15, 
                                borderRadius: 10, 
                                backgroundColor: colors.primary,
                                marginLeft: 10, 
                                alignItems: 'center'
                            }}
                            onPress={isMainProfile ? handleAddPress : handleAddSimpleDisease}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>

            {/* Editing modal for the main profile */} 
            {isMainProfile && ( 
                <Modal visible={isEditModalVisible} animationType="slide"> 
                    <ScrollView 
                        contentContainerStyle={{ 
                            flexGrow: 1, 
                            backgroundColor: colors.background,
                            padding: 20
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={[styles.cardText, { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}> 
                            Modifier la maladie 
                        </Text>

                        <TextInput 
                            placeholder="Nom" 
                            value={editedDisease.name}
                            onChangeText={(text: string) => setEditedDisease({ ...editedDisease, name: text })}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 15,
                                fontSize: 16,
                                color: colors.text
                            }}
                            placeholderTextColor={colors.text + '80'}
                        />

                        <TextInput 
                            placeholder="Description" 
                            value={editedDisease.description}
                            onChangeText={(text: string) => setEditedDisease({ ...editedDisease, description: text })}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 15,
                                fontSize: 16,
                                color: colors.text,
                                minHeight: 80
                            }}
                            multiline
                            placeholderTextColor={colors.text + '80'}
                        />

                        <TextInput 
                            placeholder="Symptômes" 
                            value={editedDisease.symptoms}
                            onChangeText={(text: string) => setEditedDisease({ ...editedDisease, symptoms: text })}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 15,
                                fontSize: 16,
                                color: colors.text,
                                minHeight: 80
                            }}
                            multiline
                            placeholderTextColor={colors.text + '80'}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                            <View style={{ flex: 1, marginRight: 5 }}> 
                                <CustomPicker 
                                    label="Jour" 
                                    selectedValue={editSelectedDay} 
                                    onValueChange={(value: string | number) => setEditSelectedDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1}))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}> 
                                <CustomPicker 
                                    label="Mois" 
                                    selectedValue={editSelectedMonth} 
                                    onValueChange={(value: string | number) => setEditSelectedMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}> 
                                <CustomPicker 
                                    label="Année" 
                                    selectedValue={editSelectedYear} 
                                    onValueChange={(value: string | number) => setEditSelectedYear(Number(value))}
                                    options={Array.from({ length: 100 }, (_, i) => ({ label: (1980 + i).toString(), value: 1980 + i }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>

                        <TextInput 
                            placeholder="Traitements" 
                            value={editedDisease.medications}
                            onChangeText={(text: string) => setEditedDisease({ ...editedDisease, medications: text })}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 15,
                                fontSize: 16,
                                color: colors.text,
                                minHeight: 80
                            }}
                            multiline
                            placeholderTextColor={colors.text + '80'}
                        />

                        <TextInput 
                            placeholder="Examens" 
                            value={editedDisease.examens}
                            onChangeText={(text: string) => setEditedDisease({ ...editedDisease, examens: text })}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 30,
                                fontSize: 16,
                                color: colors.text,
                                minHeight: 80
                            }}
                            multiline
                            placeholderTextColor={colors.text + '80'}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}> 
                            <TouchableOpacity 
                                style={{ 
                                    flex: 1, 
                                    padding: 15, 
                                    borderRadius: 10, 
                                    backgroundColor: colors.secondary + '30',
                                    marginRight: 10,
                                    alignItems: 'center'
                                }}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={{ 
                                    flex: 1, 
                                    padding: 15, 
                                    borderRadius: 10, 
                                    backgroundColor: colors.primary,
                                    marginLeft: 10,
                                    alignItems: 'center'
                                }}
                                onPress={handleSaveEdit}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enregistrer</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </Modal>
            )}
        </View> 
    ); 
}