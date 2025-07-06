import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextStyle, ViewStyle, StyleProp } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker, QuantityPicker } from '../../components';

type Treatment = {
    name: string;
    beginDate: string;
    endDate: string;
    dosage: string;
    duration: string;
    sideEffects: string;
    disease: string;
};

type treatmentsProps = {
    navigation: StackNavigationProp<any, any>;
};

// The Treatments component allows users to view, add, and manage their treatments, including details such as dosage, duration, and side effects.
export default function Treatments({ navigation }: treatmentsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [treatments, setTreatments] =  useState<Treatment[]>([
        {
            name: 'Metformine',
            beginDate: '01/01/2021',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '1 an',
            sideEffects: 'nausées, vomissements, diarrhée',
            disease: 'Diabète de type 2',
        },
        {
            name: 'Lévothyrox',
            beginDate: '01/01/2020',
            endDate: '01/01/2022',
            dosage: '1 comprimé par jour',
            duration: '2 ans',
            sideEffects: 'palpitations, tremblements, maux de tête',
            disease: 'Hypothyroïdie',
        },
    ]);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newTreatment, setNewTreatment] = useState<Treatment>({
        name: '',
        beginDate: '',
        endDate: '',
        dosage: '',
        duration: '',
        sideEffects: '',
        disease: '',
    });
    const [editedTreatment, setEditedTreatment] = useState<Treatment>({
        name: '',
        beginDate: '',
        endDate: '',
        dosage: '',
        duration: '',
        sideEffects: '',
        disease: '',
    });

    // Simplified state using our new picker components
    const [beginDay, setBeginDay] = useState<number>(1);
    const [beginMonth, setBeginMonth] = useState<number>(1);
    const [beginYear, setBeginYear] = useState<number>(new Date().getFullYear());
    
    const [endDay, setEndDay] = useState<number>(1);
    const [endMonth, setEndMonth] = useState<number>(1);
    const [endYear, setEndYear] = useState<number>(new Date().getFullYear());
    
    const [dosagePerDay, setDosagePerDay] = useState<number>(1);
    const [durationValue, setDurationValue] = useState<number>(1);
    const [durationUnit, setDurationUnit] = useState<string>('mois');

    // Edit modal states
    const [editBeginDay, setEditBeginDay] = useState<number>(1);
    const [editBeginMonth, setEditBeginMonth] = useState<number>(1);
    const [editBeginYear, setEditBeginYear] = useState<number>(new Date().getFullYear());
    
    const [editEndDay, setEditEndDay] = useState<number>(1);
    const [editEndMonth, setEditEndMonth] = useState<number>(1);
    const [editEndYear, setEditEndYear] = useState<number>(new Date().getFullYear());
    
    const [editDosagePerDay, setEditDosagePerDay] = useState<number>(1);
    const [editDurationValue, setEditDurationValue] = useState<number>(1);
    const [editDurationUnit, setEditDurationUnit] = useState<string>('mois');

    const durationUnits = ['jour(s)', 'semaine(s)', 'mois', 'an(s)'];

    const formatDate = (day: number, month: number, year: number): string => {
        const dayStr = day.toString().padStart(2, '0');
        const monthStr = month.toString().padStart(2, '0');
        return `${dayStr}/${monthStr}/${year}`;
    };

    const handleAddPress = (): void => {
        if ( 
            !newTreatment.name || 
            !newTreatment.sideEffects ||
            !newTreatment.disease
        ) { 
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newTreatmentData: Treatment = {
            ...newTreatment,
            beginDate: formatDate(beginDay, beginMonth, beginYear),
            endDate: formatDate(endDay, endMonth, endYear),
            dosage: `${dosagePerDay} comprimé(s) par jour`,
            duration: `${durationValue} ${durationUnit}`,
        };

        setTreatments([...treatments, newTreatmentData]); 
        setNewTreatment({
            name: '',
            beginDate: '',
            endDate: '',
            dosage: '',
            duration: '',
            sideEffects: '',
            disease: '',
        });
        setModalVisible(false);
        // Reset picker values
        const today = new Date();
        setBeginDay(1);
        setBeginMonth(1);
        setBeginYear(today.getFullYear());
        setEndDay(1);
        setEndMonth(1);
        setEndYear(today.getFullYear());
        setDosagePerDay(1);
        setDurationValue(1);
        setDurationUnit('mois');
    };

    const parseDate = (dateString: string) => {
        const parts = dateString.split('/');
        return {
            day: parseInt(parts[0]),
            month: parseInt(parts[1]),
            year: parseInt(parts[2])
        };
    };

    const parseDosage = (dosageString: string) => {
        const match = dosageString.match(/(\d+)/);
        return match ? parseInt(match[1]) : 1;
    };

    const parseDuration = (durationString: string) => {
        const parts = durationString.split(' ');
        return {
            value: parseInt(parts[0]) || 1,
            unit: parts.slice(1).join(' ') || 'mois'
        };
    };

    const handleEditPress = (index: number): void => {
        const treatment = treatments[index];
        setEditedTreatment({ ...treatment });
        setEditingIndex(index);
        
        // Parse dates
        const beginDate = parseDate(treatment.beginDate);
        setEditBeginDay(beginDate.day);
        setEditBeginMonth(beginDate.month);
        setEditBeginYear(beginDate.year);
        
        const endDate = parseDate(treatment.endDate);
        setEditEndDay(endDate.day);
        setEditEndMonth(endDate.month);
        setEditEndYear(endDate.year);
        
        // Parse dosage
        setEditDosagePerDay(parseDosage(treatment.dosage));
        
        // Parse duration
        const duration = parseDuration(treatment.duration);
        setEditDurationValue(duration.value);
        setEditDurationUnit(duration.unit);
        
        setEditModalVisible(true);
    };

    const handleSaveEdit = (): void => {
        if ( 
            !editedTreatment.name || 
            !editedTreatment.sideEffects ||
            !editedTreatment.disease
        ) { 
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (editingIndex !== null) {
            const updatedTreatments = [...treatments];
            updatedTreatments[editingIndex] = {
                ...editedTreatment,
                beginDate: formatDate(editBeginDay, editBeginMonth, editBeginYear),
                endDate: formatDate(editEndDay, editEndMonth, editEndYear),
                dosage: `${editDosagePerDay} comprimé(s) par jour`,
                duration: `${editDurationValue} ${editDurationUnit}`,
            };
            setTreatments(updatedTreatments);
        }

        setEditModalVisible(false);
        setEditingIndex(null);
        Alert.alert('Succès', 'Les informations du traitement ont été mises à jour.');
    };

    const handleDeleteTreatment = (index: number): void => {
        const treatment = treatments[index];
        Alert.alert(
            'Supprimer le traitement',
            `Êtes-vous sûr de vouloir supprimer "${treatment.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        const updatedTreatments = treatments.filter((_, i) => i !== index);
                        setTreatments(updatedTreatments);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {treatments.map((treatment, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{treatment.name}</Text>                                <View style={styles.actionButtons}>
                                    <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                                        <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDeleteTreatment(index)} style={styles.deleteButton}>
                                        <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                    </TouchableOpacity>
                                </View>
                        </View>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {treatment.beginDate}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {treatment.endDate}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Dosage: </Text>
                            {treatment.dosage}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {treatment.duration}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Effets secondaires: </Text>
                            {treatment.sideEffects}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Maladie: </Text>
                            {treatment.disease}
                        </Text>
                    </View>
                ))}
            </ScrollView>

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

            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                        <Text style={styles.modalTitle}>Ajouter un traitement</Text>
                        
                        <TextInput
                            placeholder="Nom du traitement"
                            value={newTreatment.name}
                            onChangeText={(text) => setNewTreatment({ ...newTreatment, name: text })}
                            style={styles.input}
                        />
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Date de début</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={beginDay}
                                    onValueChange={(value) => setBeginDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={beginMonth}
                                    onValueChange={(value) => setBeginMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <CustomPicker
                                    label="Année"
                                    selectedValue={beginYear}
                                    onValueChange={(value) => setBeginYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Date de fin</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={endDay}
                                    onValueChange={(value) => setEndDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={endMonth}
                                    onValueChange={(value) => setEndMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <CustomPicker
                                    label="Année"
                                    selectedValue={endYear}
                                    onValueChange={(value) => setEndYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Dosage</Text>
                        <CustomPicker
                            label="Comprimés par jour"
                            selectedValue={dosagePerDay}
                            onValueChange={(value) => setDosagePerDay(Number(value))}
                            options={Array.from({ length: 10 }, (_, i) => ({ 
                                label: (i + 1).toString(), 
                                value: i + 1 
                            }))}
                            placeholder="1"
                        />
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Durée</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <CustomPicker
                                    label="Valeur"
                                    selectedValue={durationValue}
                                    onValueChange={(value) => setDurationValue(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString(), 
                                        value: i + 1 
                                    }))}
                                    placeholder="1"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <CustomPicker
                                    label="Unité"
                                    selectedValue={durationUnit}
                                    onValueChange={(value) => setDurationUnit(String(value))}
                                    options={durationUnits.map(unit => ({ 
                                        label: unit, 
                                        value: unit 
                                    }))}
                                    placeholder="Sélectionner"
                                />
                            </View>
                        </View>
                        
                        <TextInput
                            placeholder="Effets secondaires"
                            value={newTreatment.sideEffects}
                            onChangeText={(text) => setNewTreatment({ ...newTreatment, sideEffects: text })}
                            style={styles.input}
                        />
                        
                        <TextInput
                            placeholder="Maladie associée"
                            value={newTreatment.disease}
                            onChangeText={(text) => setNewTreatment({ ...newTreatment, disease: text })}
                            style={styles.input}
                        />
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                </ScrollView>
            </Modal>

            <Modal visible={isEditModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                        <Text style={styles.modalTitle}>Modifier le traitement</Text>
                        
                        <TextInput
                            placeholder="Nom du traitement"
                            value={editedTreatment.name}
                            onChangeText={(text) => setEditedTreatment({ ...editedTreatment, name: text })}
                            style={styles.input}
                        />
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Date de début</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={editBeginDay}
                                    onValueChange={(value) => setEditBeginDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={editBeginMonth}
                                    onValueChange={(value) => setEditBeginMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <CustomPicker
                                    label="Année"
                                    selectedValue={editBeginYear}
                                    onValueChange={(value) => setEditBeginYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Date de fin</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={editEndDay}
                                    onValueChange={(value) => setEditEndDay(Number(value))}
                                    options={Array.from({ length: 31 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 5 }}>
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={editEndMonth}
                                    onValueChange={(value) => setEditEndMonth(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString().padStart(2, '0'), 
                                        value: i + 1 
                                    }))}
                                    placeholder="01"
                                />
                            </View>
                            <View style={{ flex: 1, marginLeft: 5 }}>
                                <CustomPicker
                                    label="Année"
                                    selectedValue={editEndYear}
                                    onValueChange={(value) => setEditEndYear(Number(value))}
                                    options={Array.from({ length: 10 }, (_, i) => ({ 
                                        label: (2024 + i).toString(), 
                                        value: 2024 + i 
                                    }))}
                                    placeholder="2024"
                                />
                            </View>
                        </View>
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Dosage</Text>
                        <CustomPicker
                            label="Comprimés par jour"
                            selectedValue={editDosagePerDay}
                            onValueChange={(value) => setEditDosagePerDay(Number(value))}
                            options={Array.from({ length: 10 }, (_, i) => ({ 
                                label: (i + 1).toString(), 
                                value: i + 1 
                            }))}
                            placeholder="1"
                        />
                        
                        <Text style={[styles.cardTitle, { color: colors.settingsTitle }]}>Durée</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <CustomPicker
                                    label="Valeur"
                                    selectedValue={editDurationValue}
                                    onValueChange={(value) => setEditDurationValue(Number(value))}
                                    options={Array.from({ length: 12 }, (_, i) => ({ 
                                        label: (i + 1).toString(), 
                                        value: i + 1 
                                    }))}
                                    placeholder="1"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <CustomPicker
                                    label="Unité"
                                    selectedValue={editDurationUnit}
                                    onValueChange={(value) => setEditDurationUnit(String(value))}
                                    options={durationUnits.map(unit => ({ 
                                        label: unit, 
                                        value: unit 
                                    }))}
                                    placeholder="Sélectionner"
                                />
                            </View>
                        </View>
                        
                        <TextInput
                            placeholder="Effets secondaires"
                            value={editedTreatment.sideEffects}
                            onChangeText={(text) => setEditedTreatment({ ...editedTreatment, sideEffects: text })}
                            style={styles.input}
                        />
                        
                        <TextInput
                            placeholder="Maladie associée"
                            value={editedTreatment.disease}
                            onChangeText={(text) => setEditedTreatment({ ...editedTreatment, disease: text })}
                            style={styles.input}
                        />
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={handleSaveEdit} style={styles.button}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Sauvegarder</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.button}>
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                </ScrollView>
            </Modal>
        </View>
    );
}
