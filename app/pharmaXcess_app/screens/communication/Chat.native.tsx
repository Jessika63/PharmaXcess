import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './Chat.style';

type ChatItem = {
    id: string;
    title: string;
    name: string;
    question: string;
    date: string;
};

// The Chat component allows users to view and manage their chat tickets, including creating new tickets for questions or issues related to prescriptions or medications.
export default function Chat(): JSX.Element {
    const [chats, setChats] = useState<ChatItem[]>([
        { id: '1', title: 'Problème de prescription', name: 'Jean Dupont', question: 'Comment renouveler ma prescription ?', date: '2023-10-01' },
        { id: '2', title: 'Question sur un médicament', name: 'Marie Curie', question: 'Quels sont les effets secondaires ?', date: '2023-10-02' },
    ]);

    // State to manage the modal visibility and new ticket data
    const [isModalVisible, setIsModalVisible] = useState(false);
    // State to manage the data for the new ticket being created
    const [newTicket, setNewTicket] = useState<ChatItem>({
        id: '',
        title: '',
        name: '',
        question: '',
        date: '',
    });

    const handleAddTicket = (): void => {
        // Validate that all fields are filled before adding a new ticket
        if (!newTicket.title || !newTicket.name || !newTicket.question) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        // Create a new ticket with a unique ID and current date
        const newTicketData: ChatItem = {
            ...newTicket,
            id: Math.random().toString(),
            date: new Date().toISOString().split('T')[0],
        };

        // Add the new ticket to the chat list and reset the form
        setChats([newTicketData, ...chats]);
        setNewTicket({ id: '', title: '', name: '', question: '', date: '' });
        setIsModalVisible(false);
    };

    return (
        <View style={styles.container}>
            {/* Liste des tickets */}
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.chatCard}>
                        <Text style={styles.chatTitle}>Sujet : {item.title}</Text>
                        <Text style={styles.chatQuestion}>Question : {item.question}</Text>
                        <Text style={styles.chatDate}>Date : {item.date}</Text>
                    </View>
                )}
            />

            {/* Bouton Ouvrir un ticket */}
            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Ouvrir un ticket</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Modal pour créer un ticket */}
            <Modal visible={isModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Créer un ticket</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Sujet"
                        value={newTicket.title}
                        onChangeText={(text) => setNewTicket({ ...newTicket, title: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Nom et prénom"
                        value={newTicket.name}
                        onChangeText={(text) => setNewTicket({ ...newTicket, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Votre question"
                        value={newTicket.question}
                        onChangeText={(text) => setNewTicket({ ...newTicket, question: text })}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleAddTicket}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.saveButtonText}>Confirmer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
