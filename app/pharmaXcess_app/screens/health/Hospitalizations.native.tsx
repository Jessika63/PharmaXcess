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
                            <TouchableOpacity onPress={() => setIsDurationValueModalVisible(true)} style={styles.input}>
                                <Text>Durée: {selectedDurationValue}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsDurationUnitModalVisible(true)} style={styles.input}>
                                <Text>Unité de durée: {selectedDurationUnit}</Text>
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
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Confirmer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                    </ScrollView>
                </Modal>
                <Modal visible={isBeginYearModalVisible} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sélectionner une année de début</Text>
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
                        <Text style={styles.modalTitle}>Sélectionner un mois de début</Text>
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
                        <Text style={styles.modalTitle}>Sélectionner un jour de début</Text>
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
                        <Text style={styles.modalTitle}>Sélectionner une année de fin</Text>
                        <ScrollView>
                            {years.map((year) => (
                                <TouchableOpacity
                                    key={year}
                                    onPress={() => {
                                        setSelectedEndYear(year);
                                        setIsEndYearModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.input}>{year}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isEndMonthModalVisible} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sélectionner un mois de fin</Text>
                        <ScrollView>
                            {months.map((month) => (
                                <TouchableOpacity
                                    key={month}
                                    onPress={() => {
                                        setSelectedEndMonth(month);
                                        setIsEndMonthModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.input}>{month}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isEndDayModalVisible} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sélectionner un jour de fin</Text>
                        <ScrollView>
                            {days.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => {
                                        setSelectedEndDay(day);
                                        setIsEndDayModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.input}>{day}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
                <Modal visible={isDurationValueModalVisible} animationType="slide">
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Sélectionner une durée</Text>
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
                        <Text style={styles.modalTitle}>Sélectionner une unité de durée</Text>
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
