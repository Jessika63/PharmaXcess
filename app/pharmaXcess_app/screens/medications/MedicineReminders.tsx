import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextInput } from 'react-native-gesture-handler';

type Alarm = {
    id: string;
    medicineName: string;
    time: string;
    days: string[];
    sound: string;
};

type MedicineRemindersProps = {
    navigation: StackNavigationProp<any, any>;
};

// MedicineReminders component allows users to manage their medication reminders, including adding, editing, and viewing reminders for medications.
export default function MedicineReminders({ navigation }: MedicineRemindersProps): JSX.Element {
    const [alarms, setAlarms] = useState<Alarm[]>([
        {
            id: '1',
            medicineName: 'Paracétamol',
            time: '08:00',
            days: ['Lundi', 'Mercredi', 'Vendredi'],
            sound: 'Son 1',
        },
        {
            id: '2',
            medicineName: 'Ibuprofène',
            time: '12:00',
            days: ['Mardi', 'Jeudi'],
            sound: 'Son 2',
        },
    ]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newAlarm, setNewAlarm] = useState<Alarm>({
        id: '',
        medicineName: '',
        time: '',
        days: [],
        sound: '',
    });

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedSound, setSelectedSound] = useState<string>('Son 1');
    const [selectedHour, setSelectedHour] = useState<string>('08');
    const [selectedMinute, setSelectedMinute] = useState<string>('00');

    const [isHourModalVisible, setIsHourModalVisible] = useState(false);
    const [isMinuteModalVisible, setIsMinuteModalVisible] = useState(false);
    const [isSoundModalVisible, setIsSoundModalVisible] = useState(false);

    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const sounds = ['Son 1', 'Son 2', 'Son 3', 'Son 4'];
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const handleAddAlarm = () => {
        if (!newAlarm.medicineName || selectedDays.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newAlarmData: Alarm = {
            id: Math.random().toString(),
            medicineName: newAlarm.medicineName,
            time: `${selectedHour}:${selectedMinute}`,
            days: selectedDays,
            sound: selectedSound,
        };

        setAlarms([...alarms, newAlarmData]);
        setNewAlarm({
            id: '',
            medicineName: '',
            time: '',
            days: [],
            sound: '',
        });
        setSelectedDays([]);
        setSelectedHour('08');
        setSelectedMinute('00');
        setSelectedSound('Son 1');
        setIsModalVisible(false);
    };

    const handleEditPress = (name: string): void => {
         Alert.alert('Modifier le rappel', `Cette fonctionnalité n'est pas encore implémentée pour ${name}.`);
    };

    const toggleDaySelection = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.alarmCard}>
                        <Text style={styles.reminderName}>Médicament: {item.medicineName}</Text>
                        <TouchableOpacity onPress={() => handleEditPress(item.medicineName)} style={styles.editButton}>
                            <Ionicons name="create-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.alarmText}>Heure: {item.time}</Text>
                        <Text style={styles.alarmText}>Jours: {item.days.join(', ')}</Text>
                        <Text style={styles.alarmText}>Son: {item.sound}</Text>
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

            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Ajouter un rappel</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nom du médicament"
                        value={newAlarm.medicineName}
                        onChangeText={(text) => setNewAlarm({ ...newAlarm, medicineName: text })}
                    />
                    <Text style={styles.label}>Heure</Text>
                    <TouchableOpacity onPress={() => setIsHourModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Heure: {selectedHour}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsMinuteModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Minute: {selectedMinute}</Text>
                    </TouchableOpacity>
                    <Text style={styles.label}>Jours</Text>
                    {daysOfWeek.map((day) => (
                        <TouchableOpacity
                            key={day}
                            style={[
                                styles.dayButton,
                                selectedDays.includes(day) && styles.selectedDay,
                            ]}
                            onPress={() => toggleDaySelection(day)}
                        >
                            <Text style={styles.dayText}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                    <Text style={styles.label}>Son</Text>
                    <TouchableOpacity onPress={() => setIsSoundModalVisible(true)} style={styles.selector}>
                        <Text style={styles.selectorText}>Son: {selectedSound}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddAlarm}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.buttonText}>Enregistrer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
            <Modal visible={isHourModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner l'heure</Text>
                    <FlatList
                        data={hours}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedHour(item);
                                    setIsHourModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </Modal>
            <Modal visible={isMinuteModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner les minutes</Text>
                    <FlatList
                        data={minutes}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedMinute(item);
                                    setIsMinuteModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{item}</Text>
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
                            style={styles.selectorItem}
                            onPress={() => {
                                setSelectedSound(sound);
                                setIsSoundModalVisible(false);
                            }}
                        >
                            <Text style={styles.selectorItemText}>{sound}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
    },
    alarmCard: {
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 16,
    },
    reminderName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    alarmText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        width: '45%',
        borderRadius: 10,
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
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
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
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    dayButton: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
    },
    selectedDay: {
        backgroundColor: '#F57196',
    },
    dayText: {
        color: '#333',
        textAlign: 'center',
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
        borderRadius: 10,
    },
    scrollableModal: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 5,
        borderRadius: 5,
        zIndex: 1,
    },
});