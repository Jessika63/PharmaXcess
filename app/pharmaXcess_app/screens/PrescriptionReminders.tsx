import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FlatList } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

type Reminder = {
    id: string;
    name: string;
    date: string;
    sound: string;
};

export default function PrescriptionReminders({ navigation}): JSX.Element {
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

    const handleAddReminder = () => {
        if (!newReminder.name || !newReminder.date) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newReminderData: Reminder = {
            id: Math.random().toString(),
            name: newReminder.name,
            date: newReminder.date,
            sound: newReminder.sound,
        };

        setReminders([...reminders, newReminderData]);
        setNewReminder({
            id: '',
            name: '',
            date: '',
            sound: '',
        });
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
                    <TextInput
                        placeholder="Date"
                        value={newReminder.date}
                        onChangeText={(text) => setNewReminder({ ...newReminder, date: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Son"
                        value={newReminder.sound}
                        onChangeText={(text) => setNewReminder({ ...newReminder, sound: text })}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddReminder}>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
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
    addButton: {
        backgroundColor: '#F57196',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    addbuttonText: {
        fontSize: 20,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
        borderRadius: 10,
        margin: 20,
    },
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
    saveButton: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
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
