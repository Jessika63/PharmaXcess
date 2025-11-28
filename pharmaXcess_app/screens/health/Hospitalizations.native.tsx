import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/ProfileInfos.style';
import createModalStyles from '../../styles/ModalForm.style'; 
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';
import { CustomPicker } from '../../components';

type Hospitalization = { 
    name: string; 
    description: string; 
    beginDate: string; 
    endDate: string; 
    department: string; 
    hospital: string; 
    doctor: string; 
    medications: string; 
}; 

type HospitalizationsProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

export default function Hospitalizations ({ navigation }: HospitalizationsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const { hospitalizations: profileHospitalizations, addHospitalization, removeHospitalization } = useProfileData();
    const styles = createStyles(colors, fontScale);
    const modalStyles = createModalStyles(colors, fontScale);

    // Hospitalizations predefined for the main profile 
    const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>([
        {
            name: 'Opération de l\'appendice',
            description: 'Appendicectomie en urgence suite à une appendicite aiguë.',
            beginDate: '15/03/2022',
            endDate: '18/03/2022',
            department: 'Chirurgie digestive',
            hospital: 'Hôpital Saint-Louis',
            doctor: 'Dr. Martin',
            medications: 'Antibiotiques, antalgiques, anti-inflammatoires',
        },
        {
            name: 'Hospitalisation COVID-19',
            description: 'Hospitalisation pour complications respiratoires liées au COVID-19.',
            beginDate: '10/01/2021',
            endDate: '25/01/2021',
            department: 'Pneumologie',
            hospital: 'Hôpital Bichat',
            doctor: 'Dr. Durand',
            medications: 'Oxygénothérapie, corticoïdes, anticoagulants',
        },
    ]);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newHospitalization, setNewHospitalization] = useState<Hospitalization>({
        name: '',
        description: '',
        beginDate: '',
        endDate: '',
        department: '',
        hospital: '',
        doctor: '',
        medications: '',
    });
    const [editedHospitalization, setEditedHospitalization] = useState<Hospitalization>({
        name: '',
        description: '',
        beginDate: '',
        endDate: '',
        department: '',
        hospital: '',
        doctor: '',
        medications: '',
    });

    const [selectedBeginYear, setSelectedBeginYear] = useState<number>(2024); 
    const [selectedBeginMonth, setSelectedBeginMonth] = useState<number>(1); 
    const [selectedBeginDay, setSelectedBeginDay] = useState<number>(1); 
    const [selectedEndYear, setSelectedEndYear] = useState<number>(2024); 
    const [selectedEndMonth, setSelectedEndMonth] = useState<number>(1); 
    const [selectedEndDay, setSelectedEndDay] = useState<number>(1); 
    
    const [editSelectedBeginYear, setEditSelectedBeginYear] = useState<number>(2024); 
    const [editSelectedBeginMonth, setEditSelectedBeginMonth] = useState<number>(1); 
    const [editSelectedBeginDay, setEditSelectedBeginDay] = useState<number>(1); 
    const [editSelectedEndYear, setEditSelectedEndYear] = useState<number>(2024); 
    const [editSelectedEndMonth, setEditSelectedEndMonth] = useState<number>(1); 
    const [editSelectedEndDay, setEditSelectedEndDay] = useState<number>(1); 

    // For simple hospitalization addition by profile 
    const [newHospitalizationSimple, setNewHospitalizationSimple] = useState<string>('');

    const toggleCard = (index: number): void => { 
        // Supprimé : pas de logique de déploiement pour les profils secondaires
    }; 

    // Complex hospitalization management (for the main profile) 
    const handleAddPress = (): void => {
        if (
            !newHospitalization.name ||
            !newHospitalization.description ||
            !newHospitalization.department ||
            !newHospitalization.hospital ||
            !newHospitalization.doctor ||
            !newHospitalization.medications
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs pour ajouter une nouvelle hospitalisation.');
            return;
        }
    
        const newHospitalizationData: Hospitalization = {
            ...newHospitalization,
            beginDate: `${selectedBeginDay.toString().padStart(2, '0')}/${selectedBeginMonth.toString().padStart(2, '0')}/${selectedBeginYear}`,
            endDate: `${selectedEndDay.toString().padStart(2, '0')}/${selectedEndMonth.toString().padStart(2, '0')}/${selectedEndYear}`,
        };
    
        setHospitalizations([newHospitalizationData, ...hospitalizations]);
        setNewHospitalization({
            name: '',
            description: '',
            beginDate: '',
            endDate: '',
            department: '',
            hospital: '',
            doctor: '',
            medications: '',
        });
        setModalVisible(false);
        setSelectedBeginYear(2024);
        setSelectedBeginMonth(1);
        setSelectedBeginDay(1); 
        setSelectedEndYear(2024);
        setSelectedEndMonth(1);
        setSelectedEndDay(1); 
    };

    const handleEditPress = (index: number): void => {
        const hospitalization = hospitalizations[index];
        setEditedHospitalization({ ...hospitalization });
        setEditingIndex(index);
        
        const beginDateParts = hospitalization.beginDate.split('/');
        if (beginDateParts.length === 3) {
            setEditSelectedBeginDay(parseInt(beginDateParts[0]));
            setEditSelectedBeginMonth(parseInt(beginDateParts[1]));
            setEditSelectedBeginYear(parseInt(beginDateParts[2]));
        }
        
        const endDateParts = hospitalization.endDate.split('/');
        if (endDateParts.length === 3) {
            setEditSelectedEndDay(parseInt(endDateParts[0]));
            setEditSelectedEndMonth(parseInt(endDateParts[1]));
            setEditSelectedEndYear(parseInt(endDateParts[2]));
        }
        
        setEditModalVisible(true);
    };

    const handleSaveEdit = (): void => {
        if (
            !editedHospitalization.name ||
            !editedHospitalization.description ||
            !editedHospitalization.department ||
            !editedHospitalization.hospital ||
            !editedHospitalization.doctor ||
            !editedHospitalization.medications
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (editingIndex !== null) {
            const updatedHospitalizations = [...hospitalizations];
            updatedHospitalizations[editingIndex] = {
                ...editedHospitalization,
                beginDate: `${editSelectedBeginDay.toString().padStart(2, '0')}/${editSelectedBeginMonth.toString().padStart(2, '0')}/${editSelectedBeginYear}`,
                endDate: `${editSelectedEndDay.toString().padStart(2, '0')}/${editSelectedEndMonth.toString().padStart(2, '0')}/${editSelectedEndYear}`,
            };
            setHospitalizations(updatedHospitalizations);
        }

        setEditModalVisible(false);
        setEditingIndex(null);
        Alert.alert('Succès', 'Les informations de l\'hospitalisation ont été mises à jour.');
    };

    const handleDeleteHospitalization = (index: number): void => {
        const hospitalization = hospitalizations[index];
        Alert.alert(
            'Supprimer l\'hospitalisation',
            `Êtes-vous sûr de vouloir supprimer "${hospitalization.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        const updatedHospitalizations = hospitalizations.filter((_, i) => i !== index);
                        setHospitalizations(updatedHospitalizations);
                    }
                }
            ]
        );
    };

    // Simple hospitalization management by profile 
    const handleAddSimpleHospitalization = async (): Promise<void> => {
        // For other profiles, we only require the name field but save all available data
        if (!newHospitalization.name.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer le nom de l\'hospitalisation.');
            return;
        }

        // Create complete hospitalization data even for other profiles
        const hospitalizationData = {
            name: newHospitalization.name.trim(),
            description: newHospitalization.description || '',
            beginDate: `${selectedBeginDay.toString().padStart(2, '0')}/${selectedBeginMonth.toString().padStart(2, '0')}/${selectedBeginYear}`,
            endDate: `${selectedEndDay.toString().padStart(2, '0')}/${selectedEndMonth.toString().padStart(2, '0')}/${selectedEndYear}`,
            department: newHospitalization.department || '',
            hospital: newHospitalization.hospital || '',
            doctor: newHospitalization.doctor || '',
            medications: newHospitalization.medications || ''
        };

        const success = await addHospitalization(JSON.stringify(hospitalizationData));
        if (success) {
            // Reset all fields
            setNewHospitalizationSimple('');
            setNewHospitalization({
                name: '',
                description: '',
                beginDate: '',
                endDate: '',
                department: '',
                hospital: '',
                doctor: '',
                medications: '',
            });
            setModalVisible(false);
            setSelectedBeginYear(2024);
            setSelectedBeginMonth(1);
            setSelectedBeginDay(1); 
            setSelectedEndYear(2024);
            setSelectedEndMonth(1);
            setSelectedEndDay(1); 
            Alert.alert('Succès', 'Hospitalisation ajoutée avec succès.');
        } else {
            Alert.alert('Erreur', 'Cette hospitalisation est déjà enregistrée ou une erreur est survenue.');
        }
    };

    const handleRemoveHospitalization = async (hospitalization: string): Promise<void> => {
        Alert.alert(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer "${hospitalization}" ?`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await removeHospitalization(hospitalization);
                        if (success) {
                            Alert.alert('Succès', 'Hospitalisation supprimée avec succès.');
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer l\'hospitalisation.');
                        }
                    },
                },
            ]
        );
    };

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

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Hospitalisations',
        });
    }, [navigation]);

    // Determine if it's the main profile 
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

    return ( 
        <View style={[styles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
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
                        {hospitalizations.map((hospitalization, index) => (
                            <TouchableOpacity key={index} onPress={() => toggleCard(index)}>
                                <View key={index} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardTitle}>{hospitalization.name}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                                                <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteHospitalization(index)} style={styles.deleteButton}>
                                                <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Description: </Text>
                                        {hospitalization.description}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Date d'entrée: </Text>
                                        {hospitalization.beginDate}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Date de sortie: </Text>
                                        {hospitalization.endDate}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Service: </Text>
                                        {hospitalization.department}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Hôpital: </Text>
                                        {hospitalization.hospital}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Médecin: </Text>
                                        {hospitalization.doctor}
                                    </Text>
                                    <Text style={styles.cardText}>
                                        <Text style={styles.bold}>Traitements: </Text>
                                        {hospitalization.medications}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : ( 
                    // For other profiles: full hospitalization display without expandable cards
                    <>
                        {profileHospitalizations && profileHospitalizations.length > 0 ? (
                            <>
                                {profileHospitalizations.map((hospitalizationString, index) => {
                                    // Parse hospitalization data (could be JSON string or simple name)
                                    let hospitalization: Hospitalization;
                                    try {
                                        hospitalization = JSON.parse(hospitalizationString);
                                    } catch {
                                        // Fallback for simple string names
                                        hospitalization = {
                                            name: hospitalizationString,
                                            description: '',
                                            beginDate: '',
                                            endDate: '',
                                            department: '',
                                            hospital: '',
                                            doctor: '',
                                            medications: ''
                                        };
                                    }
                                    
                                    return (
                                        <View key={index} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>{hospitalization.name}</Text>
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity onPress={() => handleRemoveHospitalization(hospitalizationString)} style={styles.deleteButton}>
                                                        <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {hospitalization.description && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Description: </Text>
                                                    {hospitalization.description}
                                                </Text>
                                            )}
                                            {hospitalization.beginDate && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Date d'entrée: </Text>
                                                    {hospitalization.beginDate}
                                                </Text>
                                            )}
                                            {hospitalization.endDate && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Date de sortie: </Text>
                                                    {hospitalization.endDate}
                                                </Text>
                                            )}
                                            {hospitalization.department && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Service: </Text>
                                                    {hospitalization.department}
                                                </Text>
                                            )}
                                            {hospitalization.hospital && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Hôpital: </Text>
                                                    {hospitalization.hospital}
                                                </Text>
                                            )}
                                            {hospitalization.doctor && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Médecin: </Text>
                                                    {hospitalization.doctor}
                                                </Text>
                                            )}
                                            {hospitalization.medications && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Traitements: </Text>
                                                    {hospitalization.medications}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </>
                        ) : (
                            <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                                <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                                <Text style={[styles.cardText, { textAlign: 'center', marginTop: 20 }]}>
                                    Aucune hospitalisation enregistrée pour ce profil.
                                </Text>
                                <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}> 
                                    Ajoutez vos hospitalisations pour un meilleur suivi médical
                                </Text>
                            </View>
                        )}
                    </> 
                )}
            </ScrollView>

            {/* Button to add a new hospitalization - Fixed at bottom */} 
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

            {/* Modal for adding a new hospitalization - same for all profiles */} 
            <Modal visible={isModalVisible} animationType="slide">
                <View style={modalStyles.modalContainer}>
                    <ScrollView
                        contentContainerStyle={modalStyles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    > 
                        <Text style={modalStyles.modalTitle}>
                            Ajouter une hospitalisation 
                        </Text>

                        <Text style={modalStyles.label}>Nom/Motif</Text>
                        <TextInput 
                            placeholder="Nom ou motif de l'hospitalisation" 
                            value={isMainProfile ? newHospitalization.name : newHospitalizationSimple}
                            onChangeText={(text) => {
                                if (isMainProfile) {
                                    setNewHospitalization({ ...newHospitalization, name: text })
                                } else {
                                    setNewHospitalizationSimple(text);
                                    // For other profiles, also update newHospitalization.name for consistency
                                    setNewHospitalization({ ...newHospitalization, name: text });
                                }
                            }}
                            style={modalStyles.input}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Description</Text>
                        <TextInput 
                            placeholder="Description détaillée" 
                            value={newHospitalization.description}
                            onChangeText={(text) => setNewHospitalization({ ...newHospitalization, description: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Date d'entrée</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                        <View style={{ flex: 1, marginRight: 5 }}> 
                            <CustomPicker 
                                label="Jour" 
                                selectedValue={selectedBeginDay} 
                                onValueChange={(value) => setSelectedBeginDay(Number(value))}
                                options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 5 }}> 
                            <CustomPicker 
                                label="Mois" 
                                selectedValue={selectedBeginMonth} 
                                onValueChange={(value) => setSelectedBeginMonth(Number(value))}
                                options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}> 
                            <CustomPicker 
                                label="Année" 
                                selectedValue={selectedBeginYear} 
                                onValueChange={(value) => setSelectedBeginYear(Number(value))}
                                options={Array.from({ length: 100 }, (_, i) => ({ label: (i + 1920).toString(), value: (i + 1920).toString() }))}
                                placeholder="2024"
                            />
                        </View>
                    </View>

                    <Text style={[modalStyles.label]}>Date de sortie</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                        <View style={{ flex: 1, marginRight: 5 }}> 
                            <CustomPicker 
                                label="Jour" 
                                selectedValue={selectedEndDay} 
                                onValueChange={(value) => setSelectedEndDay(Number(value))}
                                options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginHorizontal: 5 }}> 
                            <CustomPicker 
                                label="Mois" 
                                selectedValue={selectedEndMonth} 
                                onValueChange={(value) => setSelectedEndMonth(Number(value))}
                                options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }))}
                                placeholder="01"
                            />
                        </View>
                        <View style={{ flex: 1, marginLeft: 5 }}> 
                            <CustomPicker 
                                label="Année" 
                                selectedValue={selectedEndYear} 
                                onValueChange={(value) => setSelectedEndYear(Number(value))}
                                options={Array.from({ length: 100 }, (_, i) => ({ label: (i + 1920).toString(), value: (i + 1920).toString() }))}
                                placeholder="2024"
                            />
                        </View>
                    </View>

                        <Text style={modalStyles.label}>Service/Département</Text>
                        <TextInput 
                            placeholder="Service ou département"
                            value={newHospitalization.department}
                            onChangeText={(text) => setNewHospitalization({ ...newHospitalization, department: text })}
                            style={modalStyles.input}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Hôpital</Text>
                        <TextInput 
                            placeholder="Nom de l'hôpital"
                            value={newHospitalization.hospital}
                            onChangeText={(text) => setNewHospitalization({ ...newHospitalization, hospital: text })}
                            style={modalStyles.input}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Médecin responsable</Text>
                        <TextInput 
                            placeholder="Nom du médecin responsable"
                            value={newHospitalization.doctor}
                            onChangeText={(text) => setNewHospitalization({ ...newHospitalization, doctor: text })}
                            style={modalStyles.input}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <Text style={modalStyles.label}>Traitements</Text>
                        <TextInput 
                            placeholder="Traitements administrés"
                            value={newHospitalization.medications}
                            onChangeText={(text) => setNewHospitalization({ ...newHospitalization, medications: text })}
                            style={modalStyles.inputMultiline}
                            multiline
                            numberOfLines={3}
                            placeholderTextColor={colors.inputBorder} 
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={isMainProfile ? handleAddPress : handleAddSimpleHospitalization}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.button}
                                onPress={() => {
                                    setModalVisible(false);
                                    // Reset all fields for both main and other profiles
                                    setNewHospitalizationSimple('');
                                    setNewHospitalization({
                                        name: '',
                                        description: '',
                                        beginDate: '',
                                        endDate: '',
                                        department: '',
                                        hospital: '',
                                        doctor: '',
                                        medications: '',
                                    });
                                    setSelectedBeginYear(2024);
                                    setSelectedBeginMonth(1);
                                    setSelectedBeginDay(1); 
                                    setSelectedEndYear(2024);
                                    setSelectedEndMonth(1);
                                    setSelectedEndDay(1); 
                                }}
                            >
                                <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
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
                                Modifier l'hospitalisation 
                            </Text>

                            <Text style={modalStyles.label}>Nom/Motif</Text>
                            <TextInput 
                                placeholder="Nom ou motif de l'hospitalisation" 
                                value={editedHospitalization.name}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, name: text })}
                                style={modalStyles.input}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Description</Text>
                            <TextInput 
                                placeholder="Description détaillée" 
                                value={editedHospitalization.description}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, description: text })}
                                style={modalStyles.inputMultiline}
                                multiline
                                numberOfLines={3}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Date d'entrée</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                                <View style={{ flex: 1, marginRight: 5 }}> 
                                    <CustomPicker 
                                        label="Jour" 
                                        selectedValue={editSelectedBeginDay} 
                                        onValueChange={(value) => setEditSelectedBeginDay(Number(value))}
                                        options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1}))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginHorizontal: 5 }}> 
                                    <CustomPicker 
                                        label="Mois" 
                                        selectedValue={editSelectedBeginMonth} 
                                        onValueChange={(value) => setEditSelectedBeginMonth(Number(value))}
                                        options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}> 
                                    <CustomPicker 
                                        label="Année" 
                                        selectedValue={editSelectedBeginYear} 
                                        onValueChange={(value) => setEditSelectedBeginYear(Number(value))}
                                        options={Array.from({ length: 100 }, (_, i) => ({ label: (1980 + i).toString(), value: 1980 + i }))}
                                        placeholder="2024"
                                    />
                                </View>
                            </View>

                            <Text style={modalStyles.label}>Date de sortie</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}> 
                                <View style={{ flex: 1, marginRight: 5 }}> 
                                    <CustomPicker 
                                        label="Jour" 
                                        selectedValue={editSelectedEndDay} 
                                        onValueChange={(value) => setEditSelectedEndDay(Number(value))}
                                        options={Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1}))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginHorizontal: 5 }}> 
                                    <CustomPicker 
                                        label="Mois" 
                                        selectedValue={editSelectedEndMonth} 
                                        onValueChange={(value) => setEditSelectedEndMonth(Number(value))}
                                        options={Array.from({ length: 12 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }))}
                                        placeholder="01"
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 5 }}> 
                                    <CustomPicker 
                                        label="Année" 
                                        selectedValue={editSelectedEndYear} 
                                        onValueChange={(value) => setEditSelectedEndYear(Number(value))}
                                        options={Array.from({ length: 100 }, (_, i) => ({ label: (1980 + i).toString(), value: 1980 + i }))}
                                        placeholder="2024"
                                    />
                                </View>
                            </View>

                            <Text style={modalStyles.label}>Service/Département</Text>
                            <TextInput 
                                placeholder="Service ou département" 
                                value={editedHospitalization.department}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, department: text })}
                                style={modalStyles.input}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Hôpital</Text>
                            <TextInput 
                                placeholder="Nom de l'hôpital" 
                                value={editedHospitalization.hospital}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, hospital: text })}
                                style={modalStyles.input}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Médecin responsable</Text>
                            <TextInput 
                                placeholder="Nom du médecin responsable" 
                                value={editedHospitalization.doctor}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, doctor: text })}
                                style={modalStyles.input}
                                placeholderTextColor={colors.inputBorder}
                            />

                            <Text style={modalStyles.label}>Traitements</Text>
                            <TextInput 
                                placeholder="Traitements administrés" 
                                value={editedHospitalization.medications}
                                onChangeText={(text) => setEditedHospitalization({ ...editedHospitalization, medications: text })}
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
                                    <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
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
