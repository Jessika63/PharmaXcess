import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Reminder = {
    id: string;
    name: string;
    date: string;
    sound: string;
};

export default function PrescriptionReminders({ navigation }): JSX.Element {
    const [reminders, setReminders] = useState<Reminder[]>([
        {
            id: '1',
            name: 'Ordonnance 1',
            date: '2023-10-01',
            sound: 'Son 1',
        },
        {
            id: '2',
            name: 'Ordonnance 2',
            date: '2023-10-02',
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
    const [isYearModalVisible, setIsYearModalVisible] = useState(false);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
    const [isDayModalVisible, setIsDayModalVisible] = useState(false);
    const [isSoundModalVisible, setIsSoundModalVisible] = useState(false);

    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];
    const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleAddReminder = () => {
        if (!newReminder.name || !selectedYear || !selectedMonth || !selectedDay || !newReminder.sound) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newReminderData: Reminder = {
            id: Math.random().toString(),
            name: newReminder.name,
            date: `${selectedYear}-${selectedMonth}-${selectedDay}`,
            sound: newReminder.sound,
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
                    <View style={styles.reminderItem}>
                        <TouchableOpacity onPress={() => handleEditPress(item.name)} style={styles.editButton}>
                            <Ionicons name="create-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.reminderName}>Ordonnance: {item.name}</Text>
                        <Text style={styles.reminderDate}>Date: {item.date}</Text>
                        <Text style={styles.reminderSound}>Son: {item.sound}</Text>
                    </View>
                )}
            />

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
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

            <Modal animationType="slide" visible={isModalVisible}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Ajouter un rappel</Text>
                    <TextInput
                        placeholder="Nom de l'ordonnance"
                        value={newReminder.name}
                        onChangeText={(text) => setNewReminder({ ...newReminder, name: text })}
                        style={styles.input}
                    />
                    <TouchableOpacity onPress={() => setIsYearModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Année: {selectedYear}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsMonthModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Mois: {selectedMonth}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsDayModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Jour: {selectedDay}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsSoundModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Son: {newReminder.sound || 'Sélectionner un son'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddReminder}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.buttonText}>Enregistrer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={isYearModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner une année</Text>
                    <ScrollView>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedYear(year);
                                    setIsYearModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{year}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isMonthModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner un mois</Text>
                    <ScrollView>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedMonth(month);
                                    setIsMonthModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDayModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner un jour</Text>
                    <ScrollView>
                        {days.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedDay(day);
                                    setIsDayModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isSoundModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner un son</Text>
                    <ScrollView>
                        {sounds.map((sound) => (
                            <TouchableOpacity
                                key={sound}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setNewReminder({ ...newReminder, sound });
                                    setIsSoundModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{sound}</Text>
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
        backgroundColor: '#ffffff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    reminderItem: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 16,
    },
    reminderName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    reminderDate: {
        fontSize: 16,
    },
    reminderSound: {
        fontSize: 16,
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
    },
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
    },
    selector: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
    },
    selectorText: {
        color: '#333',
        textAlign: 'center',
    },
    scrollableModal: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    selectorItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    selectorItemText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 5,
    },
});