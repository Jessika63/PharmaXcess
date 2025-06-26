import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextStyle, ViewStyle, StyleProp } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';

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
    const styles = createStyles(colors);

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
    const [newTreatment, setNewTreatment] = useState<Treatment>({
        name: '',
        beginDate: '',
        endDate: '',
        dosage: '',
        duration: '',
        sideEffects: '',
        disease: '',
    });

    const [selectedBeginYear, setSelectedBeginYear] = useState<string>('');
    const [selectedBeginMonth, setSelectedBeginMonth] = useState<string>('');
    const [selectedBeginDay, setSelectedBeginDay] = useState<string>('');
    const [isBeginYearModalVisible, setIsBeginYearModalVisible] = useState<boolean>(false);
    const [isBeginMonthModalVisible, setIsBeginMonthModalVisible] = useState<boolean>(false);
    const [isBeginDayModalVisible, setIsBeginDayModalVisible] = useState<boolean>(false);
    const [selectedDosage, setSelectedDosage] = useState<string>('');
    const [isDosageModalVisible, setIsDosageModalVisible] = useState<boolean>(false);

    const [selectedEndYear, setSelectedEndYear] = useState<string>('');
    const [selectedEndMonth, setSelectedEndMonth] = useState<string>('');
    const [selectedEndDay, setSelectedEndDay] = useState<string>('');
    const [isEndYearModalVisible, setIsEndYearModalVisible] = useState<boolean>(false);
    const [isEndMonthModalVisible, setIsEndMonthModalVisible] = useState<boolean>(false);
    const [isEndDayModalVisible, setIsEndDayModalVisible] = useState<boolean>(false);
    const [selectedDurationValue, setSelectedDurationValue] = useState<string>('');
    const [selectedDurationUnit, setSelectedDurationUnit] = useState<string>('mois');
    const [isDurationValueModalVisible, setIsDurationValueModalVisible] = useState<boolean>(false);
    const [isDurationUnitModalVisible, setIsDurationUnitModalVisible] = useState<boolean>(false);

    const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const dosageOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString()); 
    const durationUnits = ['jour(s)', 'semaine(s)', 'mois', 'an(s)'];
    const durationValues = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

    const handleAddPress = (): void => {
        if ( 
            !newTreatment.name || 
            !selectedBeginYear ||
            !selectedBeginMonth ||
            !selectedBeginDay || 
            !selectedEndYear || 
            !selectedEndMonth || 
            !selectedEndDay || 
            !selectedDosage || 
            !selectedDurationValue ||
            !selectedDurationUnit ||
            !newTreatment.sideEffects ||
            !newTreatment.disease
        ) { 
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newTreatmentData: Treatment = {
            ...newTreatment,
            beginDate: `${selectedBeginDay}/${selectedBeginMonth}/${selectedBeginYear}`,
            endDate: `${selectedEndDay}/${selectedEndMonth}/${selectedEndYear}`,
            dosage: `${selectedDosage} comprimé(s) par jour`,
            duration: `${selectedDurationValue} ${selectedDurationUnit}`, 

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
        setSelectedBeginYear('2023');
        setSelectedBeginMonth('01');
        setSelectedBeginDay('01');
        setSelectedEndYear('2023');
        setSelectedEndMonth('01');
        setSelectedEndDay('01');
        setSelectedDosage('1');
        setSelectedDurationValue('1');
        setSelectedDurationUnit('mois');
    };

    const handleEditPress = (treatmentName: string): void => {
        Alert.alert('Modifier le traitement', `Cette fonctionnalité n\'est pas encore implémentée pour le traitement "${treatmentName}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.list}>
                {treatments.map((treatment, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>{treatment.name}</Text>
                            <TouchableOpacity onPress={() => handleEditPress(treatment.name)} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                            </TouchableOpacity>
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
                        <TouchableOpacity onPress={() => setIsBeginYearModalVisible(true)} style={styles.input}>
                            <Text>Année de début: {selectedBeginYear}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsBeginMonthModalVisible(true)} style={styles.input}>
                            <Text>Mois de début: {selectedBeginMonth}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsBeginDayModalVisible(true)} style={styles.input}>
                            <Text>Jour de début: {selectedBeginDay}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndYearModalVisible(true)} style={styles.input}>
                            <Text>Année de fin: {selectedEndYear}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndMonthModalVisible(true)} style={styles.input}>
                            <Text>Mois de fin: {selectedEndMonth}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndDayModalVisible(true)} style={styles.input}>
                            <Text>Jour de fin: {selectedEndDay}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDosageModalVisible(true)} style={styles.input}>
                            <Text>Dosage: {selectedDosage} comprimé(s) par jour</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDurationValueModalVisible(true)} style={styles.input}>
                            <Text>Durée: {selectedDurationValue}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDurationUnitModalVisible(true)} style={styles.input}>
                            <Text>Unité: {selectedDurationUnit}</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Ajouter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                </ScrollView>
            </Modal>
            <Modal visible={isBeginYearModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner une année de début</Text>
                    <ScrollView>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                onPress={() => {
                                    setSelectedBeginYear(year);
                                    setIsBeginYearModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{year}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isBeginMonthModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner un mois de début</Text>
                    <ScrollView>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                onPress={() => {
                                    setSelectedBeginMonth(month);
                                    setIsBeginMonthModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isBeginDayModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner un jour de début</Text>
                    <ScrollView>
                        {days.map((day) => (
                            <TouchableOpacity
                                key={day}
                                onPress={() => {
                                    setSelectedBeginDay(day);
                                    setIsBeginDayModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isEndYearModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner l'année de fin</Text>
                    {years.map((year) => (
                        <TouchableOpacity key={year} onPress={() => {
                            setSelectedEndYear(year);
                            setIsEndYearModalVisible(false);
                        }}>
                            <Text style={styles.input}>{year}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
            <Modal visible={isEndMonthModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner le mois de fin</Text>
                    {months.map((month) => (
                        <TouchableOpacity key={month} onPress={() => {
                            setSelectedEndMonth(month);
                            setIsEndMonthModalVisible(false);
                        }}>
                            <Text style={styles.input}>{month}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
            <Modal visible={isEndDayModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner le jour de fin</Text>
                    {days.map((day) => (
                        <TouchableOpacity key={day} onPress={() => {
                            setSelectedEndDay(day);
                            setIsEndDayModalVisible(false);
                        }}>
                            <Text style={styles.input}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Modal>
            <Modal visible={isDosageModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner le dosage</Text>
                    <ScrollView>
                        {dosageOptions.map((dosage) => (
                            <TouchableOpacity
                                key={dosage}
                                onPress={() => {
                                    setSelectedDosage(dosage);
                                    setIsDosageModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{dosage} comprimé(s)</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDurationValueModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner la durée</Text>
                    <ScrollView>
                        {durationValues.map((value) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => {
                                    setSelectedDurationValue(value);
                                    setIsDurationValueModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{value}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDurationUnitModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.cardTitle}>Sélectionner l'unité de durée</Text>
                    <ScrollView>
                        {durationUnits.map((unit) => (
                            <TouchableOpacity
                                key={unit}
                                onPress={() => {
                                    setSelectedDurationUnit(unit);
                                    setIsDurationUnitModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{unit}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}
