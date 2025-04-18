import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextStyle, ViewStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlatList } from 'react-native-gesture-handler';

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

    const handleAddAlarm = () => {
        if (!newAlarm.medicineName || !newAlarm.time || newAlarm.days.length === 0) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newAlarmData: Alarm = {
            id: Math.random().toString(),
            medicineName: newAlarm.medicineName,
            time: newAlarm.time,
            days: newAlarm.days,
            sound: newAlarm.sound,
        };

        setAlarms([...alarms, newAlarmData]);
        setNewAlarm({
            id: '',
            medicineName: '',
            time: '',
            days: [],
            sound: '',
        });
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={alarms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.alarmCard}>
                        <Text style={styles.reminderName}>Médicament: {item.medicineName}</Text>
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
                    <TextInput
                        style={styles.input}
                        placeholder="Heure (HH:MM)"
                        value={newAlarm.time}
                        onChangeText={(text) => setNewAlarm({ ...newAlarm, time: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Jours (séparés par des virgules)"
                        value={newAlarm.days.join(', ')}
                        onChangeText={(text) => setNewAlarm({ ...newAlarm, days: text.split(', ') })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Son"
                        value={newAlarm.sound}
                        onChangeText={(text) => setNewAlarm({ ...newAlarm, sound: text })}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddAlarm}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.buttonText}>Enregistrer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
    } as ViewStyle,
    saveButton: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    } as ViewStyle,
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
    },
    alarmCard: {
        width: '100%',
        backgroundColor: '#F2F2F2',
        marginVertical: 8,
        borderRadius: 10,
        marginBottom: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        fontSize: 20,
    } as ViewStyle,
    alarmText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    } as TextStyle,
    bold: {
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    } as ViewStyle,
    modalContent: {
        width: '100%',
        padding: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        width: '45%', 
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
    reminderName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
