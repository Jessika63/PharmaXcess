import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { CustomPicker } from '../../components';

type Hospitalization = {
    name: string;
    beginDate: string;
    endDate: string;
    duration: string;
    department: string;
    doctor: string;
    hospital: string;
    medications: string;
    examens: string;
    comments: string;
};

type HospitalizationsProps = {
    navigation: StackNavigationProp<any, any>;
};


// The Hospitalizations component allows users to view, add, and edit hospitalizations in a list, with a modal for adding new hospitalizations.
export default function Hospitalizations({ navigation }: HospitalizationsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [hospitalizations, setHospitalization] = useState<Hospitalization[]>([
        {
            name: 'COVID-19',
            beginDate: '01/01/2021',
            endDate: '01/01/2021',
            duration: '1 jour',
            department: 'Réanimation',
            doctor: 'Dr. Dupont',
            hospital: 'Hôpital Saint-Louis',
            medications: 'Doliprane, antibiotiques',
            examens: 'Radiographie des poumons, prise de sang',
            comments: 'Bonne prise en charge mais attente longue aux urgences',
        },
        {
            name: 'Gastro-entérite',
            beginDate: '01/01/2020',
            endDate: '01/01/2020',
            duration: '1 jour',
            department: 'Gastro-entérologie',
            doctor: 'Dr. Martin',
            hospital: 'Hôpital Lariboisière',
            medications: 'Smecta, antibiotiques',
            examens: 'Échographie abdominale, prise de sang',
            comments: 'RAS',
        },
    ]);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [newHospitalization, setNewHospitalization] = useState<Hospitalization>({
        name: '',
        beginDate: '',
        endDate: '',
        duration: '',
        department: '',
        doctor: '',
        hospital: '',
        medications: '',
        examens: '',
        comments: '',
    });

    const [selectedBeginYear, setSelectedBeginYear] = useState<number>(2024);
    const [selectedBeginMonth, setSelectedBeginMonth] = useState<number>(1);
    const [selectedBeginDay, setSelectedBeginDay] = useState<number>(1);

    const [selectedEndYear, setSelectedEndYear] = useState<number>(2024);
    const [selectedEndMonth, setSelectedEndMonth] = useState<number>(1);
    const [selectedEndDay, setSelectedEndDay] = useState<number>(1);

    const [selectedDurationValue, setSelectedDurationValue] = useState<number>(1);
    const [selectedDurationUnit, setSelectedDurationUnit] = useState<string>('jour(s)');

    const durationUnits = ['jour(s)', 'semaine(s)', 'mois', 'année(s)'];

    // Generate arrays for date picker options
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const durationValues = Array.from({ length: 30 }, (_, i) => i + 1);

    const handleAddPress = (): void => {
        if (
            !newHospitalization.name || 
            !newHospitalization.department ||
            !newHospitalization.doctor ||
            !newHospitalization.hospital ||
            !newHospitalization.medications ||
            !newHospitalization.examens ||
            !newHospitalization.comments
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newHospitalizationData: Hospitalization = {
            ...newHospitalization,
            beginDate: `${selectedBeginDay.toString().padStart(2, '0')}/${selectedBeginMonth.toString().padStart(2, '0')}/${selectedBeginYear}`,
            endDate: `${selectedEndDay.toString().padStart(2, '0')}/${selectedEndMonth.toString().padStart(2, '0')}/${selectedEndYear}`,
            duration: `${selectedDurationValue} ${selectedDurationUnit}`,
        };

        setHospitalization([...hospitalizations, newHospitalizationData]);
        setNewHospitalization({
            name: '',
            beginDate: '',
            endDate: '',
            duration: '',
            department: '',
            doctor: '',
            hospital: '',
            medications: '',
            examens: '',
            comments: '',
        });
        setSelectedBeginYear(2024);
        setSelectedBeginMonth(1);
        setSelectedBeginDay(1);
        setSelectedEndYear(2024);
        setSelectedEndMonth(1);
        setSelectedEndDay(1);
        setSelectedDurationValue(1);
        setSelectedDurationUnit('jour(s)');
        setModalVisible(false);
    };

    const handleEditPress = (hospitalizationReason: string): void => {
        Alert.alert('Modifier l\'hospitalisation', `Cette fonctionnalité n\'est pas encore implémentée pour l'hospitalisation "${hospitalizationReason}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {hospitalizations.map((hospitalization, index) => (
                    <View key={index} style={styles.card}>
                        <TouchableOpacity onPress={() => handleEditPress(hospitalization.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{hospitalization.name}</Text>
                        </View>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {hospitalization.beginDate}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {hospitalization.endDate}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {hospitalization.duration}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Service: </Text>
                            {hospitalization.department}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Médecin: </Text>
                            {hospitalization.doctor}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Hôpital: </Text>
                            {hospitalization.hospital}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Médicaments: </Text>
                            {hospitalization.medications}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Examens: </Text>
                            {hospitalization.examens}
                        </Text>
                        <Text style={styles.cardText}>
                            <Text style={styles.bold}>Commentaires: </Text>
                            {hospitalization.comments}
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
                    <ScrollView contentContainerStyle={styles.modalContainer} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior='automatic'> 
                            <Text style={styles.modalTitle}>Ajouter une hospitalisation</Text>
                            <TextInput
                                placeholder="Raison de l'hospitalisation"
                                value={newHospitalization.name}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, name: text })}
                                style={styles.input}
                            />

                            {/* Start Date Section - Uses three CustomPicker dropdowns for day, month, year */}
                            <Text style={styles.fieldTitle}>Date de début</Text>
                            <View style={styles.dateContainer}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={selectedBeginDay}
                                    onValueChange={(value) => setSelectedBeginDay(Number(value))}
                                    options={days.map(day => ({ label: day.toString(), value: day }))}
                                    style={styles.datePicker}
                                />
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={selectedBeginMonth}
                                    onValueChange={(value) => setSelectedBeginMonth(Number(value))}
                                    options={months.map(month => ({ label: month.toString(), value: month }))}
                                    style={styles.datePicker}
                                />
                                <CustomPicker
                                    label="Année"
                                    selectedValue={selectedBeginYear}
                                    onValueChange={(value) => setSelectedBeginYear(Number(value))}
                                    options={years.map(year => ({ label: year.toString(), value: year }))}
                                    style={styles.datePicker}
                                />
                            </View>

                            {/* End Date Section - Uses three CustomPicker dropdowns for day, month, year */}
                            <Text style={styles.fieldTitle}>Date de fin</Text>
                            <View style={styles.dateContainer}>
                                <CustomPicker
                                    label="Jour"
                                    selectedValue={selectedEndDay}
                                    onValueChange={(value) => setSelectedEndDay(Number(value))}
                                    options={days.map(day => ({ label: day.toString(), value: day }))}
                                    style={styles.datePicker}
                                />
                                <CustomPicker
                                    label="Mois"
                                    selectedValue={selectedEndMonth}
                                    onValueChange={(value) => setSelectedEndMonth(Number(value))}
                                    options={months.map(month => ({ label: month.toString(), value: month }))}
                                    style={styles.datePicker}
                                />
                                <CustomPicker
                                    label="Année"
                                    selectedValue={selectedEndYear}
                                    onValueChange={(value) => setSelectedEndYear(Number(value))}
                                    options={years.map(year => ({ label: year.toString(), value: year }))}
                                    style={styles.datePicker}
                                />
                            </View>

                            {/* Duration Section - Uses two CustomPicker dropdowns for value and unit */}
                            <Text style={styles.fieldTitle}>Durée</Text>
                            <View style={styles.dosageContainer}>
                                <CustomPicker
                                    label="Valeur"
                                    selectedValue={selectedDurationValue}
                                    onValueChange={(value) => setSelectedDurationValue(Number(value))}
                                    options={durationValues.map(value => ({ label: value.toString(), value }))}
                                    style={styles.dosagePicker}
                                />
                                <CustomPicker
                                    label="Unité"
                                    selectedValue={selectedDurationUnit}
                                    onValueChange={(value) => setSelectedDurationUnit(String(value))}
                                    options={durationUnits.map(unit => ({ label: unit, value: unit }))}
                                    style={styles.dosagePicker}
                                />
                            </View>

                            <TextInput
                                placeholder="Service"
                                value={newHospitalization.department}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, department: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Médecin"
                                value={newHospitalization.doctor}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, doctor: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Hôpital"
                                value={newHospitalization.hospital}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, hospital: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Médicaments"
                                value={newHospitalization.medications}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, medications: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Examens"
                                value={newHospitalization.examens}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, examens: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Commentaires"
                                value={newHospitalization.comments}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, comments: text })}
                                style={styles.input}
                            />
                            
                            {/* Modal action buttons container - Confirm and Cancel side by side */}
                            <View style={styles.modalButtonContainer}>
                                {/* Confirm button - saves the hospitalization data */}
                                <TouchableOpacity style={styles.modalButton} onPress={handleAddPress}>
                                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                        <Text style={styles.buttonText}>Confirmer</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                {/* Cancel button - closes modal and resets all form fields */}
                                <TouchableOpacity 
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        // Reset all hospitalization form fields to initial state
                                        setNewHospitalization({
                                            name: '',
                                            beginDate: '',
                                            endDate: '',
                                            duration: '',
                                            department: '',
                                            doctor: '',
                                            hospital: '',
                                            medications: '',
                                            examens: '',
                                            comments: '',
                                        });
                                        // Reset all date picker selections to default values
                                        setSelectedBeginYear(2024);
                                        setSelectedBeginMonth(1);
                                        setSelectedBeginDay(1);
                                        setSelectedEndYear(2024);
                                        setSelectedEndMonth(1);
                                        setSelectedEndDay(1);
                                        // Reset duration picker selections to default values
                                        setSelectedDurationValue(1);
                                        setSelectedDurationUnit('jour(s)');
                                    }}
                                >
                                    {/* Standardized gray gradient for cancel buttons across the app */}
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
