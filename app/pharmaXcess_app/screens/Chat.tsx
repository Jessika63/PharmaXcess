import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TextStyle, ViewStyle, StyleProp } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type ChatProps = {
    navigation: StackNavigationProp<any, any>;
};

type ChatItem = {
    id: string;
    title: string;
    date: string;
    message: string;
    response: string;
};

export default function Chat({ navigation }: ChatProps): JSX.Element {
    const [chats, setChats] = useState<ChatItem[]>([
        { id: '1', title: 'Chat 1', date: '2023-10-01', message: 'Hello, how can I help you?', response: 'I need assistance with my prescription.' },
        { id: '2', title: 'Chat 2', date: '2023-10-02', message: 'What is your query?', response: 'I have a question about my medication.' },
        { id: '3', title: 'Chat 3', date: '2023-10-03', message: 'Please provide more details.', response: 'I need to know the side effects.' },
        { id: '4', title: 'Chat 4', date: '2023-10-04', message: 'Can you specify the medication?', response: 'It\'s for my diabetes.' },
        { id: '5', title: 'Chat 5', date: '2023-10-05', message: 'Thank you for your patience.', response: 'I appreciate your help.' },
        { id: '6', title: 'Chat 6', date: '2023-10-06', message: 'Is there anything else I can assist you with?', response: 'No, that\'s all for now.' },
        { id: '7', title: 'Chat 7', date: '2023-10-07', message: 'Have a great day!', response: 'You too!' },
        { id: '8', title: 'Chat 8', date: '2023-10-08', message: 'Thank you for reaching out.', response: 'You\'re welcome!' },
        { id: '9', title: 'Chat 9', date: '2023-10-09', message: 'I\'m here to help.', response: 'I appreciate it!' },
        { id: '10', title: 'Chat 10', date: '2023-10-10', message: 'Let me know if you need anything else.', response: 'Will do!' },
        { id: '11', title: 'Chat 11', date: '2023-10-11', message: 'I\'m glad to assist you.', response: 'Thank you!' },
        { id: '12', title: 'Chat 12', date: '2023-10-12', message: 'Take care!', response: 'You too!' },
        { id: '13', title: 'Chat 13', date: '2023-10-13', message: 'Goodbye!', response: 'Goodbye!' },
        { id: '14', title: 'Chat 14', date: '2023-10-14', message: 'See you soon!', response: 'See you!' },
    ]);

    const handleOpenTicket = (): void => {
        Alert.alert('Open Ticket', 'This feature is not implemented yet.');
    };

    const handleOpenChat = (id: string): void => {
        Alert.alert('Open Chat', 'This feature is not implemented yet.');
    };

    return (
        <LinearGradient
            colors={['#ffffff', '#f0f0f0']}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                {chats.map((chat) => (
                    <TouchableOpacity
                        key={chat.id}
                        style={styles.chatItem}
                        onPress={() => handleOpenChat(chat.id)}
                    >
                        <Text style={styles.chatItem}>{chat.title}</Text>
                        <Text style={styles.chatDate}>{chat.date}</Text>
                        <Text style={styles.chatMessage}>{chat.message}</Text>
                        <Text style={styles.chatResponse}>{chat.response}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
                style={styles.openTicketButton}
                onPress={handleOpenTicket}
            >
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.openTicketButtonText}>Ouvrir un ticket</Text>
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#ffffff',
    } as ViewStyle,
    scrollView: {
        flex: 1,
    } as ViewStyle,
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333333',
    } as TextStyle,
    chatItem: {
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,
    chatSubject: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    } as TextStyle,
    chatLastMessage: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    } as TextStyle,
    chatTimestamp: {
        fontSize: 12,
        color: '#999999',
        marginTop: 4,
        textAlign: 'right',
    } as TextStyle,
    openTicketButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'transparent',
        borderRadius: 50,
        padding: 16,
    } as ViewStyle,
    openTicketButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    } as TextStyle,
    chatMessage: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    } as TextStyle,
    chatDate: {
        fontSize: 12,
        color: '#999999',
        marginTop: 4,
    } as TextStyle,
    chatResponse: {
        fontSize: 14,
        color: '#666666',
        marginTop: 4,
    } as TextStyle,
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
});
