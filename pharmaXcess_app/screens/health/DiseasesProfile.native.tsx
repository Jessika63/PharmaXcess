import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';
import { CustomPicker } from '../../components';

type Disease = { 
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
    const { currentProfile } = useProfile();
    const { diseases: profileDiseases, addDisease, removeDisease } = useProfileData();
    const styles = createStyles(colors, fontScale);

    // Diseases predefined for the main profile 
    const [diseases, setDiseases] = useState<Disease[]>([
        {
            name: 'Diabète',
            description: 'Le diabète est une maladie chronique qui se caractérise par un excès de sucre dans le sang.',
            symptoms: 'soif intense, besoin fréquent d\'uriner, fatigue, perte de poids, vision floue, cicatrisation lente, infections fréquentes, démangeaisons, fourmillements, douleurs, crampes, nausées, vomissements, haleine fruitée, perte de conscience',
            beginDate: '01/01/2000',
            medications: 'insuline, metformine, sulfamide hypoglycémiants, glinides, glitazones, inhibiteurs de l\'alpha-glucosidase, inhibiteurs de la DPP-4, agonistes des récepteurs du GLP-1, inhibiteurs du cotransporteur du sodium-glucose de type 2',
            examens: 'glycémie à jeun, hémoglobine glyquée, test de tolérance au glucose, test de glycémie aléatoire, test de glycémie postprandiale (après un repas)',
        },
        {
            name: 'Hypertension',
            description: 'L\'hypertension artérielle est une maladie chronique caractérisée par une pression artérielle trop élevée dans les artères.',
            symptoms: 'maux de tête, fatigue, étourdissements, bourdonnements d\'oreilles, palpitations, douleurs thoraciques, essoufflement, saignements de nez, vision floue',
            beginDate: '01/01/2005',
            medications: 'diurétiques, bêta-bloquants, inhibiteurs de l\'enzyme de conversion de l\'angiotensine (IECA), antagonistes des récepteurs de l\'angiotensine II (ARA II), inhibiteurs calciques, alpha-bloquants, alpha-bêta-bloquants, vasodilatateurs, antihypertenseurs centraux',
            examens: 'mesure de la pression artérielle, électrocardiogramme, échocardiographie',
        },
    ]);

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
    const handleAddPress = (): void => {
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

    const handleSaveEdit = (): void => {
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
            updatedDiseases[editingIndex] = {
                ...editedDisease,
                beginDate: `${editSelectedDay.toString().padStart(2, '0')}/${editSelectedMonth.toString().padStart(2, '0')}/${editSelectedYear}`,
            };
            setDiseases(updatedDiseases);
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

    // Modal styles matching PersonalInfo
    const modalStyles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalTitle: {
            fontSize: 24 * fontScale,
            fontWeight: 'bold',
            marginBottom: 20,
            color: colors.settingsTitle,
            textAlign: 'center',
        },
        input: {
            width: '100%',
            padding: 15,
            borderWidth: 2,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            marginBottom: 15,
            backgroundColor: colors.inputBackground,
            fontSize: 16 * fontScale,
            color: colors.infoText,
        },
        inputMultiline: {
            width: '100%',
            padding: 15,
            borderWidth: 2,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            marginBottom: 15,
            backgroundColor: colors.inputBackground,
            fontSize: 16 * fontScale,
            color: colors.infoText,
            minHeight: 80,
            textAlignVertical: 'top',
        },
        label: {
            fontSize: 16 * fontScale,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.settingsTitle,
        },
        scrollContainer: {
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 30,
        },
    });

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
                <View style={modalStyles.modalContainer}>
                    <ScrollView
                        contentContainerStyle={modalStyles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    > 
                        <Text style={modalStyles.modalTitle}> 
                            Ajouter une maladie 
                        </Text>

                        <Text style={modalStyles.label}>Nom</Text>
                        <TextInput 
                            placeholder="Nom de la maladie" 
                            value={isMainProfile ? newDisease.name : newDiseaseSimple}
                            onChangeText={(text) => {
                                if (isMainProfile) {
                                    setNewDisease({ ...newDisease, name: text })
                                } else {
                                    setNewDiseaseSimple(text);
                                    // For other profiles, also update newDisease.name for consistency
                                    setNewDisease({ ...newDisease, name: text });
                                }
                            }}
                            style={modalStyles.input}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Description</Text>
                        <TextInput 
                            placeholder="Description de la maladie" 
                            value={newDisease.description}
                            onChangeText={(text) => setNewDisease({ ...newDisease, description: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />
                        
                        <Text style={modalStyles.label}>Symptômes</Text>
                        <TextInput 
                            placeholder="Symptômes observés"
                            value={newDisease.symptoms}
                            onChangeText={(text) => setNewDisease({ ...newDisease, symptoms: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Date de début</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                            <View style={{ flex: 1, marginRight: 5 }}> 
                                <CustomPicker 
                                    label="Jour" 
                                    selectedValue={selectedDay} 
                                    onValueChange={(value) => setSelectedDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}> 
                                <CustomPicker 
                                    label="Mois" 
                                    selectedValue={selectedMonth} 
                                    onValueChange={(value) => setSelectedMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}> 
                                <CustomPicker 
                                    label="Année" 
                                    selectedValue={selectedYear} 
                                    onValueChange={(value) => setSelectedYear(Number(value))}
                                    options={Array.from({ length: 100 }, (_, i) => ({ label: (i + 1920).toString(), value: (i + 1920).toString() }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>

                        <Text style={modalStyles.label}>Traitements</Text>
                        <TextInput 
                            placeholder="Traitements prescrits"
                            value={newDisease.medications}
                            onChangeText={(text) => setNewDisease({ ...newDisease, medications: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Examens</Text>
                        <TextInput 
                            placeholder="Examens réalisés ou à réaliser" 
                            value={newDisease.examens}
                            onChangeText={(text) => setNewDisease({ ...newDisease, examens: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={isMainProfile ? handleAddPress : handleAddSimpleDisease}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.button}
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
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Editing modal for the main profile */} 
            {isMainProfile && ( 
                <Modal visible={isEditModalVisible} animationType="slide">
                    <View style={modalStyles.modalContainer}>
                        <ScrollView 
                            contentContainerStyle={modalStyles.scrollContent}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            <Text style={modalStyles.modalTitle}>
                                Modifier la maladie 
                            </Text>

                            <Text style={modalStyles.label}>Nom</Text>
                            <TextInput 
                                placeholder="Nom de la maladie" 
                                value={editedDisease.name}
                                onChangeText={(text) => setEditedDisease({ ...editedDisease, name: text })}
                                style={modalStyles.input}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Description</Text>
                            <TextInput 
                                placeholder="Description de la maladie" 
                                value={editedDisease.description}
                                onChangeText={(text) => setEditedDisease({ ...editedDisease, description: text })}
                                style={modalStyles.inputMultiline}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Symptômes</Text>
                            <TextInput 
                                placeholder="Symptômes observés" 
                                value={editedDisease.symptoms}
                                onChangeText={(text) => setEditedDisease({ ...editedDisease, symptoms: text })}
                                style={modalStyles.inputMultiline}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Date de début</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                                <View style={{ flex: 1, marginRight: 5 }}> 
                                    <CustomPicker 
                                        label="Jour" 
                                        selectedValue={editSelectedDay} 
                                        onValueChange={(value) => setEditSelectedDay(Number(value))}
                                        options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1}))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginHorizontal: 5 }}> 
                                    <CustomPicker 
                                        label="Mois" 
                                        selectedValue={editSelectedMonth} 
                                        onValueChange={(value) => setEditSelectedMonth(Number(value))}
                                        options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}> 
                                    <CustomPicker 
                                        label="Année" 
                                        selectedValue={editSelectedYear} 
                                        onValueChange={(value) => setEditSelectedYear(Number(value))}
                                        options={Array.from({ length: 100 }, (_, i) => ({ label: (1980 + i).toString(), value: 1980 + i }))}
                                        placeholder="2024"
                                    />
                                </View>
                            </View>

                            <Text style={modalStyles.label}>Traitements</Text>
                            <TextInput 
                                placeholder="Traitements prescrits" 
                                value={editedDisease.medications}
                                onChangeText={(text) => setEditedDisease({ ...editedDisease, medications: text })}
                                style={modalStyles.inputMultiline}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Examens</Text>
                            <TextInput 
                                placeholder="Examens réalisés ou à réaliser" 
                                value={editedDisease.examens}
                                onChangeText={(text) => setEditedDisease({ ...editedDisease, examens: text })}
                                style={modalStyles.inputMultiline}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                        <Text style={styles.buttonText}>Enregistrer</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
                                    <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                        <Text style={styles.buttonText}>Annuler</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </View> 
    ); 
}