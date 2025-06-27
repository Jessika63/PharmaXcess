import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/Reminders.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Reminder = {
    id: string;
    name: string;
    date: string;
    sound: string;
};

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The PrescriptionReminders component allows users to manage their prescription reminders, including adding new reminders with specific dates and sounds.
export default function PrescriptionReminders({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [reminders, setReminders] = useState<Reminder[]>([
        {
            id: '1',
            name: 'Ordonnance 1',
            date: '01/10/2023',
            sound: 'Son 1',
        },
        {
            id: '2',
            name: 'Ordonnance 2',
            date: '02/10/2023',
            sound: 'Son 2',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newReminder, setNewReminder] = useState<Reminder>({
        id: '',
        name: '',
        date: '',
        sound: '',
    });

    const [selectedYear, setSelectedYear] = useState<string>('2023');
    const [selectedMonth, setSelectedMonth] = useState<string>('10');
    const [selectedDay, setSelectedDay] = useState<string>('01');
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');
    
    const [isYearModalVisible, setIsYearModalVisible] = useState(false);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
    const [isDayModalVisible, setIsDayModalVisible] = useState(false);
    const [isSoundModalVisible, setIsSoundModalVisible] = useState(false);

    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];
    const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleAddReminder = () => {
        if (!newReminder.name || !selectedYear || !selectedMonth || !selectedDay) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newReminderData: Reminder = {
            id: Math.random().toString(),
            name: newReminder.name,
            date: `${selectedDay}/${selectedMonth}/${selectedYear}`,
            sound: selectedSound,
        };

        setReminders([...reminders, newReminderData]);
        setNewReminder({
            id: '',
            name: '',
            date: '',
            sound: '',
        });
        setSelectedYear('2023');
        setSelectedMonth('10');
        setSelectedDay('01');
        setSelectedSound('Son 1');
        setIsModalVisible(false);
    };

    const handleEditPress = (name: string): void => {
        Alert.alert('Modifier le rappel', `Cette fonctionnalité n'est pas encore implémentée pour ${name}.`);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={reminders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.alarmCard}>
                        <Text style={styles.alarmName}>Ordonnance: {item.name}</Text>
                        <TouchableOpacity onPress={() => handleEditPress(item.name)} style={styles.editButton}>
                            <Ionicons name="pencil" size={25} color={colors.iconPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.alarmText}>Date: {item.date}</Text>
                        <Text style={styles.alarmText}>Son: {item.sound}</Text>
                    </View>
                )}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
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
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Ajouter un rappel</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom de l'ordonnance"
                        value={newReminder.name}
                        onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
                    />
                    <Text style={styles.label}>Date</Text>
                    <TouchableOpacity onPress={() => setIsYearModalVisible(true)} style={styles.input}>
                        <Text>Année: {selectedYear}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsMonthModalVisible(true)} style={styles.input}>
                        <Text>Mois: {selectedMonth}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsDayModalVisible(true)} style={styles.input}>
                        <Text>Jour: {selectedDay}</Text>
                    </TouchableOpacity>
                    <Text style={styles.label}>Son</Text>
                    <TouchableOpacity onPress={() => setIsSoundModalVisible(true)} style={styles.input}>
                        <Text>Son: {selectedSound}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleAddReminder}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                            <Text style={styles.buttonText}>Enregistrer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
            
            <Modal visible={isYearModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Sélectionner une année</Text>
                    <FlatList
                        data={years}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedYear(item);
                                    setIsYearModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
            
            <Modal visible={isMonthModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Sélectionner un mois</Text>
                    <FlatList
                        data={months}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedMonth(item);
                                    setIsMonthModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
            
            <Modal visible={isDayModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Sélectionner un jour</Text>
                    <FlatList
                        data={days}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedDay(item);
                                    setIsDayModalVisible(false);
                                }}
                            >
                                <Text style={styles.input}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
            
            <Modal visible={isSoundModalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Sélectionner un son</Text>
                    {sounds.map((sound) => (
                        <TouchableOpacity
                            key={sound}
                            onPress={() => {
                                setSelectedSound(sound);
                                setIsSoundModalVisible(false);
                            }}
                        >
                            <Text style={styles.input}>{sound}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modal>
        </View>
    );
}
