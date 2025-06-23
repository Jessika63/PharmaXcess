import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

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
export default function Hospitalizations({ navigation }: HospitalizationsProps): JSX.Element {
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

    const [selectedBeginYear, setSelectedBeginYear] = useState<string>('2021');
    const [selectedBeginMonth, setSelectedBeginMonth] = useState<string>('01');
    const [selectedBeginDay, setSelectedBeginDay] = useState<string>('01');
    const [isBeginYearModalVisible, setIsBeginYearModalVisible] = useState<boolean>(false);
    const [isBeginMonthModalVisible, setIsBeginMonthModalVisible] = useState<boolean>(false);
    const [isBeginDayModalVisible, setIsBeginDayModalVisible] = useState<boolean>(false);


    const [selectedEndYear, setSelectedEndYear] = useState<string>('2021');
    const [selectedEndMonth, setSelectedEndMonth] = useState<string>('01');
    const [selectedEndDay, setSelectedEndDay] = useState<string>('01');
    const [isEndYearModalVisible, setIsEndYearModalVisible] = useState<boolean>(false);
    const [isEndMonthModalVisible, setIsEndMonthModalVisible] = useState<boolean>(false);
    const [isEndDayModalVisible, setIsEndDayModalVisible] = useState<boolean>(false);

    const [selectedDurationValue, setSelectedDurationValue] = useState<string>('1 jour');
    const [selectedDurationUnit, setSelectedDurationUnit] = useState<string>('jour');
    const [isDurationValueModalVisible, setIsDurationValueModalVisible] = useState<boolean>(false);
    const [isDurationUnitModalVisible, setIsDurationUnitModalVisible] = useState<boolean>(false);


    const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const durationValues = Array.from({ length: 30 }, (_, i) => (i + 1).toString());
    const durationUnits = ['jour(s)', 'semaine(s)', 'mois', 'année(s)'];

    const handleAddPress = (): void => {
        if (
            !newHospitalization.name || 
            !selectedBeginYear || 
            !selectedBeginMonth ||
            !selectedBeginDay ||
            !selectedEndYear ||
            !selectedEndMonth ||
            !selectedEndDay ||
            !selectedDurationValue ||
            !selectedDurationUnit ||
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
            beginDate: `${selectedBeginDay}/${selectedBeginMonth}/${selectedBeginYear}`,
            endDate: `${selectedEndDay}/${selectedEndMonth}/${selectedEndYear}`,
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
        setModalVisible(false);
    };

    const handleEditPress = (hospitalizationReason: string): void => {
        Alert.alert('Modifier l\'hospitalisation', `Cette fonctionnalité n\'est pas encore implémentée pour l'hospitalisation "${hospitalizationReason}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.hospitalizationList}>
                {hospitalizations.map((hospitalization, index) => (
                    <View key={index} style={styles.hospitalizationCard}>
                        <TouchableOpacity onPress={() => handleEditPress(hospitalization.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color="#ffffff" />
                        </TouchableOpacity>
                        <View style={styles.cardHeader}>
                            <Text style={styles.hospitalizationTitle}>{hospitalization.name}</Text>
                        </View>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Date de début: </Text>
                            {hospitalization.beginDate}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Date de fin: </Text>
                            {hospitalization.endDate}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Durée: </Text>
                            {hospitalization.duration}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Service: </Text>
                            {hospitalization.department}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Médecin: </Text>
                            {hospitalization.doctor}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Hôpital: </Text>
                            {hospitalization.hospital}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Médicaments: </Text>
                            {hospitalization.medications}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Examens: </Text>
                            {hospitalization.examens}
                        </Text>
                        <Text style={styles.hospitalizationText}>
                            <Text style={styles.bold}>Commentaires: </Text>
                            {hospitalization.comments}
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
                    <ScrollView contentContainerStyle={styles.scrollableModal} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior='automatic'> 
                        <View style={styles.container}>
                            <Text style={styles.hospitalizationTitle}>Ajouter une hospitalisation</Text>
                            <TextInput
                                placeholder="Raison de l'hospitalisation"
                                value={newHospitalization.name}
                                onChangeText={(text) => setNewHospitalization({ ...newHospitalization, name: text })}
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
                            <TouchableOpacity onPress={() => setIsDurationValueModalVisible(true)} style={styles.selector}>
                                <Text style={styles.selectorText}>Durée: {selectedDurationValue}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsDurationUnitModalVisible(true)} style={styles.selector}>
                                <Text style={styles.selectorText}>Unité de durée: {selectedDurationUnit}</Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity style={styles.button} onPress={handleAddPress}>
                                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Confirmer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Modal>
                <Modal visible={isBeginYearModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner une année de début</Text>
                        <ScrollView>
                            {years.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedBeginYear(year);
                                        setIsBeginYearModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isBeginMonthModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner un mois de début</Text>
                        <ScrollView>
                            {months.map((month) => (
                                <TouchableOpacity
                                    key={month}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedBeginMonth(month);
                                        setIsBeginMonthModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{month}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isBeginDayModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner un jour de début</Text>
                        <ScrollView>
                            {days.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedBeginDay(day);
                                        setIsBeginDayModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isEndYearModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner une année de fin</Text>
                        <ScrollView>
                            {years.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedEndYear(year);
                                        setIsEndYearModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isEndMonthModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner un mois de fin</Text>
                        <ScrollView>
                            {months.map((month) => (
                                <TouchableOpacity
                                    key={month}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedEndMonth(month);
                                        setIsEndMonthModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{month}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isEndDayModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner un jour de fin</Text>
                        <ScrollView>
                            {days.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedEndDay(day);
                                        setIsEndDayModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isDurationValueModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner une durée</Text>
                        <ScrollView>
                            {durationValues.map((value) => (
                                <TouchableOpacity
                                    key={value}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedDurationValue(value);
                                        setIsDurationValueModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{value}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isDurationUnitModalVisible} animationType="slide">
                    <View style={styles.scrollableModal}>
                        <Text style={styles.modalTitle}>Sélectionner une unité de durée</Text>
                        <ScrollView>
                            {durationUnits.map((unit) => (
                                <TouchableOpacity
                                    key={unit}
                                    style={styles.selectorItem}
                                    onPress={() => {
                                        setSelectedDurationUnit(unit);
                                        setIsDurationUnitModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.selectorItemText}>{unit}</Text>
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
    } as ViewStyle,
    hospitalizationList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    } as ViewStyle,
    hospitalizationCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    } as ViewStyle,
    hospitalizationTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    } as TextStyle,
    hospitalizationText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    } as TextStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    } as ViewStyle,
    editButton: {
        position: 'absolute',
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
        top: 10,
    } as ViewStyle,
    gradient: {
        padding: 15,
        borderRadius: 10,
    } as ViewStyle,
    bold: {
        fontWeight: 'bold',
    } as TextStyle,
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    } as ViewStyle,
    button: {
        flex: 1,
        marginHorizontal: 10,
    } as ViewStyle,
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    } as TextStyle,
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    } as TextStyle,
    scrollableModal: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    selectorItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    } as ViewStyle,
    selectorItemText: {
        fontSize: 18,
        color: '#333',
    } as TextStyle,
    selector: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#F2F2F2',
    } as ViewStyle,
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    } as TextStyle,
    selectorText: {
        fontSize: 16,
        color: '#333',
    } as TextStyle,
});