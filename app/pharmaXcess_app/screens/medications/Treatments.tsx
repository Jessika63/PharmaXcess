import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextStyle, ViewStyle, StyleProp } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

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
export default function Treatments({ navigation }: treatmentsProps): JSX.Element {
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
            <ScrollView contentContainerStyle={styles.treatmentList}>
                {treatments.map((treatment, index) => (
                    <View key={index} style={styles.treatmentCard}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.treatmentTitle}>{treatment.name}</Text>
                            <TouchableOpacity onPress={() => handleEditPress(treatment.name)} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color="#ffffff" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {treatment.beginDate}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {treatment.endDate}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Dosage: </Text>
                            {treatment.dosage}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {treatment.duration}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Effets secondaires: </Text>
                            {treatment.sideEffects}
                        </Text>
                        <Text style={styles.treatmentText}>
                            <Text style={styles.bold}>Maladie: </Text>
                            {treatment.disease}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.scrollableContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <View style={styles.container}>
                        <Text style={styles.treatmentTitle}>Ajouter un traitement</Text>
                        <TextInput
                            placeholder="Nom du traitement"
                            value={newTreatment.name}
                            onChangeText={(text) => setNewTreatment({ ...newTreatment, name: text })}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setIsBeginYearModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Année de début: {selectedBeginYear}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsBeginMonthModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Mois de début: {selectedBeginMonth}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsBeginDayModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Jour de début: {selectedBeginDay}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndYearModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Année de fin: {selectedEndYear}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndMonthModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Mois de fin: {selectedEndMonth}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEndDayModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Jour de fin: {selectedEndDay}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDosageModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Dosage: {selectedDosage} comprimé(s) par jour</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDurationValueModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Durée: {selectedDurationValue}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDurationUnitModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Unité: {selectedDurationUnit}</Text>
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
                            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                                <Text style={styles.buttonText}>Ajouter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
            <Modal visible={isBeginYearModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner une année de début</Text>
                    <ScrollView>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedBeginYear(year);
                                    setIsBeginYearModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{year}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isBeginMonthModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner un mois de début</Text>
                    <ScrollView>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedBeginMonth(month);
                                    setIsBeginMonthModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isBeginDayModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner un jour de début</Text>
                    <ScrollView>
                        {days.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedBeginDay(day);
                                    setIsBeginDayModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isEndYearModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner l'année de fin</Text>
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
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner le mois de fin</Text>
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
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner le jour de fin</Text>
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
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner le dosage</Text>
                    <ScrollView>
                        {dosageOptions.map((dosage) => (
                            <TouchableOpacity
                                key={dosage}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedDosage(dosage);
                                    setIsDosageModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{dosage} comprimé(s)</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDurationValueModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner la durée</Text>
                    <ScrollView>
                        {durationValues.map((value) => (
                            <TouchableOpacity
                                key={value}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedDurationValue(value);
                                    setIsDurationValueModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{value}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDurationUnitModalVisible} animationType="slide">
                <View style={styles.scrollableContainer}>
                    <Text style={styles.treatmentTitle}>Sélectionner l'unité de durée</Text>
                    <ScrollView>
                        {durationUnits.map((unit) => (
                            <TouchableOpacity
                                key={unit}
                                style={styles.selector}
                                onPress={() => {
                                    setSelectedDurationUnit(unit);
                                    setIsDurationUnitModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorText}>{unit}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    treatmentList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    treatmentCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    gradient: {
        padding: 15,
        borderRadius: 10,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    treatmentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    } as TextStyle,
    editButton: {
        backgroundColor: '#F57196',
        padding: 5,
        borderRadius: 50,
    },
    treatmentText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
        marginTop: 5,
    } as TextStyle,
    bold: {
        fontWeight: 'bold',
    } as TextStyle,
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    } as TextStyle,
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f2f2f2',
        color: '#333',
        fontSize: 16,
    } as TextStyle,
    selectorText: {
        fontSize: 16,
        color: '#333',
    } as TextStyle,
    selector: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f2f2f2',
        color: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    scrollableContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
        padding: 20,
        backgroundColor: 'white',
    } as ViewStyle,
});