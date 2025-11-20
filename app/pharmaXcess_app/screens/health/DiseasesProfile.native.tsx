import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { CustomPicker } from '../../components';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../../services/diseases/diseasesService'
import { Disease } from '../../services/diseases/types';

type DiseasesProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

export default function Diseases ({ navigation }: DiseasesProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newDisease, setNewDisease] = useState<Omit<Disease, 'id'>>({
        name: '',
        description: '',
        symptoms: '',
        beginDate: '',
        medications: '',
        examens: '',
    });
    const [editedDisease, setEditedDisease] = useState<Disease>({
        id: '',
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

    const toggleCard = (index: number): void => { 
        setExpanded(expanded === index ? null : index);
    };

    const fetchDiseases = async () => {
        if (!currentProfile?.id) return;
        try {
            const data = await getDiseases(currentProfile.id);
            setDiseases(data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de récupérer les maladies.');
        }
    };

    useEffect(() => {
        fetchDiseases();
    }, [currentProfile]);

    const handleAddPress = async (): Promise<void> => {
        if (!newDisease.name || !newDisease.description || !newDisease.symptoms || !newDisease.medications || !newDisease.examens) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs pour ajouter une nouvelle maladie.');
            return;
        }

        const diseaseData = {
            ...newDisease,
            beginDate: `${selectedDay.toString().padStart(2,'0')}/${selectedMonth.toString().padStart(2,'0')}/${selectedYear}`
        };

        try {
            const created = await createDisease(currentProfile!.id, diseaseData);
            setDiseases([created, ...diseases]);
            setNewDisease({ name:'', description:'', symptoms:'', beginDate:'', medications:'', examens:'' });
            setModalVisible(false);
            setSelectedYear(2024); setSelectedMonth(1); setSelectedDay(1);
            Alert.alert('Succès', 'Maladie ajoutée avec succès.');
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible d\'ajouter la maladie.');
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
        if (!editedDisease.name || !editedDisease.description || !editedDisease.symptoms || !editedDisease.medications || !editedDisease.examens) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const updatedDisease = {
            ...editedDisease,
            beginDate: `${editSelectedDay.toString().padStart(2,'0')}/${editSelectedMonth.toString().padStart(2,'0')}/${editSelectedYear}`
        };

        try {
            const saved = await updateDisease(currentProfile!.id, updatedDisease);
            const updatedDiseases = [...diseases];
            if (editingIndex !== null) updatedDiseases[editingIndex] = saved;
            setDiseases(updatedDiseases);
            setEditModalVisible(false);
            setEditingIndex(null);
            Alert.alert('Succès', 'Les informations de la maladie ont été mises à jour.');
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'Impossible de modifier la maladie.');
        }
    };

    const handleDeleteDisease = (index: number): void => {
        const disease = diseases[index];
        Alert.alert(
            'Supprimer la maladie',
            `Êtes-vous sûr de vouloir supprimer "${disease.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try {
                        await deleteDisease(currentProfile!.id, disease.id);
                        setDiseases(diseases.filter((_, i) => i !== index));
                        Alert.alert('Succès', 'Maladie supprimée.');
                    } catch (error) {
                        console.error(error);
                        Alert.alert('Erreur', 'Impossible de supprimer la maladie.');
                    }
                }}
            ]
        );
    }; 

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Maladies',
        });
    }, [navigation]);

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
                {diseases.length > 0 ? (
                    diseases.map((disease, index) => (
                        <TouchableOpacity key={disease.id} onPress={() => toggleCard(index)}>
                            <View style={styles.card}>
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
                    ))
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
                        value={newDisease.name}
                        onChangeText={(text) => setNewDisease({ ...newDisease, name: text })}
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
                        onChangeText={(text) => setNewDisease({ ...newDisease, description: text })}
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
                        onChangeText={(text) => setNewDisease({ ...newDisease, symptoms: text })}
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

                    <TextInput 
                        placeholder="Traitements"
                        value={newDisease.medications}
                        onChangeText={(text) => setNewDisease({ ...newDisease, medications: text })}
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
                        onChangeText={(text) => setNewDisease({ ...newDisease, examens: text })}
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
                            onPress={handleAddPress}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>

            {/* Editing modal for the main profile */} 
            {isEditModalVisible && ( 
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
                            onChangeText={(text) => setEditedDisease({ ...editedDisease, name: text })}
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
                            onChangeText={(text) => setEditedDisease({ ...editedDisease, description: text })}
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
                            onChangeText={(text) => setEditedDisease({ ...editedDisease, symptoms: text })}
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

                        <TextInput 
                            placeholder="Traitements" 
                            value={editedDisease.medications}
                            onChangeText={(text) => setEditedDisease({ ...editedDisease, medications: text })}
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
                            onChangeText={(text) => setEditedDisease({ ...editedDisease, examens: text })}
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