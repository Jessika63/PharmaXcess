import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'support';
    timestamp: string;
    isRead: boolean;
};

type ChatItem = {
    id: string;
    title: string;
    name: string;
    question: string;
    date: string;
    messages: Message[];
    status: 'open' | 'closed' | 'pending';
    lastActivity: string;
};

// The Chat component provides a complete messaging system for support tickets with real-time conversations, message history, and ticket management.
export default function Chat(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    
    const [chats, setChats] = useState<ChatItem[]>([
        { 
            id: '1', 
            title: 'Problème de prescription', 
            name: 'Jean Dupont', 
            question: 'Comment renouveler ma prescription ?', 
            date: '2023-10-01',
            status: 'open',
            lastActivity: '2023-10-02 14:30',
            messages: [
                {
                    id: 'm1',
                    text: 'Comment renouveler ma prescription ?',
                    sender: 'user',
                    timestamp: '2023-10-01 10:00',
                    isRead: true
                },
                {
                    id: 'm2',
                    text: 'Bonjour ! Pour renouveler votre prescription, vous pouvez prendre rendez-vous avec votre médecin ou demander un renouvellement en ligne.',
                    sender: 'support',
                    timestamp: '2023-10-01 10:15',
                    isRead: true
                },
                {
                    id: 'm3',
                    text: 'Merci pour votre réponse. Comment puis-je faire une demande en ligne ?',
                    sender: 'user',
                    timestamp: '2023-10-02 14:30',
                    isRead: false
                }
            ]
        },
        { 
            id: '2', 
            title: 'Question sur un médicament', 
            name: 'Marie Curie', 
            question: 'Quels sont les effets secondaires ?', 
            date: '2023-10-02',
            status: 'closed',
            lastActivity: '2023-10-03 09:15',
            messages: [
                {
                    id: 'm4',
                    text: 'Quels sont les effets secondaires du paracétamol ?',
                    sender: 'user',
                    timestamp: '2023-10-02 15:00',
                    isRead: true
                },
                {
                    id: 'm5',
                    text: 'Les effets secondaires courants du paracétamol incluent : nausées, troubles digestifs, réactions allergiques rares. En cas d\'effets indésirables, consultez votre médecin.',
                    sender: 'support',
                    timestamp: '2023-10-03 09:15',
                    isRead: true
                }
            ]
        },
    ]);

    // Chat interface states
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    
    // New ticket states
    const [newTicket, setNewTicket] = useState<ChatItem>({
        id: '',
        title: '',
        name: '',
        question: '',
        date: '',
        messages: [],
        status: 'open',
        lastActivity: '',
    });

    // Function to handle opening a chat conversation
    const handleChatPress = (chat: ChatItem): void => {
        setSelectedChat(chat);
        // Mark messages as read when opening the chat
        setChats(prevChats => 
            prevChats.map(c => 
                c.id === chat.id 
                    ? {
                        ...c,
                        messages: c.messages.map(msg => ({ ...msg, isRead: true }))
                      }
                    : c
            )
        );
    };

    // Function to send a new message
    const handleSendMessage = (): void => {
        if (!newMessage.trim() || !selectedChat) return;

        const message: Message = {
            id: Math.random().toString(),
            text: newMessage.trim(),
            sender: 'user',
            timestamp: new Date().toLocaleString('fr-FR'),
            isRead: true
        };

        setChats(prevChats => 
            prevChats.map(chat => 
                chat.id === selectedChat.id 
                    ? {
                        ...chat,
                        messages: [...chat.messages, message],
                        lastActivity: message.timestamp
                      }
                    : chat
            )
        );

        setNewMessage('');
        
        // Simulate support response after 2 seconds
        setTimeout(() => {
            const supportMessage: Message = {
                id: Math.random().toString(),
                text: 'Merci pour votre message. Notre équipe va traiter votre demande et vous répondra dans les plus brefs délais.',
                sender: 'support',
                timestamp: new Date().toLocaleString('fr-FR'),
                isRead: false
            };

            setChats(prevChats => 
                prevChats.map(chat => 
                    chat.id === selectedChat.id 
                        ? {
                            ...chat,
                            messages: [...chat.messages, supportMessage],
                            lastActivity: supportMessage.timestamp
                          }
                        : chat
                )
            );
        }, 2000);
    };

    // Function to get status badge color
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'open': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'closed': return '#9E9E9E';
            default: return colors.infoTextSecondary;
        }
    };

    // Function to get status label
    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'open': return 'Ouvert';
            case 'pending': return 'En attente';
            case 'closed': return 'Fermé';
            default: return 'Inconnu';
        }
    };

    // Function to get unread messages count
    const getUnreadCount = (messages: Message[]): number => {
        return messages.filter(msg => !msg.isRead && msg.sender === 'support').length;
    };

    const handleAddTicket = (): void => {
        // Validate that all fields are filled before adding a new ticket
        if (!newTicket.title || !newTicket.name || !newTicket.question) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const currentDateTime = new Date().toLocaleString('fr-FR');
        const initialMessage: Message = {
            id: Math.random().toString(),
            text: newTicket.question,
            sender: 'user',
            timestamp: currentDateTime,
            isRead: true
        };

        // Create a new ticket with a unique ID and current date
        const newTicketData: ChatItem = {
            ...newTicket,
            id: Math.random().toString(),
            date: new Date().toISOString().split('T')[0],
            messages: [initialMessage],
            status: 'open',
            lastActivity: currentDateTime,
        };

        // Add the new ticket to the chat list and reset the form
        setChats([newTicketData, ...chats]);
        setNewTicket({ 
            id: '', 
            title: '', 
            name: '', 
            question: '', 
            date: '',
            messages: [],
            status: 'open',
            lastActivity: '',
        });
        setIsModalVisible(false);
    };

    // Render chat list view
    const renderChatList = () => (
        <>
            <FlatList
                data={chats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const unreadCount = getUnreadCount(item.messages);
                    return (
                        <TouchableOpacity 
                            style={styles.chatCard} 
                            onPress={() => handleChatPress(item)}
                        >
                            <View style={styles.chatHeader}>
                                <View style={styles.chatInfo}>
                                    <Text style={styles.chatTitle}>{item.title}</Text>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                        <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                                    </View>
                                </View>
                                <View style={styles.chatMeta}>
                                    <Text style={styles.chatDate}>{item.lastActivity}</Text>
                                    {unreadCount > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.chatPreview} numberOfLines={2}>
                                {item.messages.length > 0 
                                    ? item.messages[item.messages.length - 1].text 
                                    : item.question
                                }
                            </Text>
                            <Text style={styles.chatName}>Par {item.name}</Text>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={true}
            />

            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Ionicons name="add" size={24} color={colors.iconPrimary} />
                        <Text style={styles.buttonText}>Ouvrir un ticket</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </>
    );

    // Render conversation view
    const renderConversation = () => (
        <KeyboardAvoidingView 
            style={styles.conversationContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Chat Header */}
            <View style={styles.conversationHeader}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setSelectedChat(null)}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.iconPrimary} />
                </TouchableOpacity>
                <View style={styles.conversationInfo}>
                    <Text style={styles.conversationTitle}>{selectedChat?.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedChat?.status || 'open') }]}>
                        <Text style={styles.statusText}>{getStatusLabel(selectedChat?.status || 'open')}</Text>
                    </View>
                </View>
            </View>

            {/* Messages List */}
            <FlatList
                data={selectedChat?.messages || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[
                        styles.messageContainer,
                        item.sender === 'user' ? styles.userMessage : styles.supportMessage
                    ]}>
                        <View style={[
                            styles.messageBubble,
                            item.sender === 'user' ? styles.userBubble : styles.supportBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                item.sender === 'user' ? styles.userText : styles.supportText
                            ]}>
                                {item.text}
                            </Text>
                            <Text style={[
                                styles.messageTime,
                                item.sender === 'user' ? styles.userTime : styles.supportTime
                            ]}>
                                {item.timestamp}
                            </Text>
                        </View>
                    </View>
                )}
                style={styles.messagesList}
                contentContainerStyle={{ padding: 20 }}
            />

            {/* Message Input */}
            <View style={styles.messageInputContainer}>
                <TextInput
                    style={styles.messageInput}
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]} 
                    onPress={handleSendMessage}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons 
                        name="send" 
                        size={20} 
                        color={newMessage.trim() ? colors.iconPrimary : colors.inputBorder} 
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );

    return (
        <View style={styles.container}>
            {selectedChat ? renderConversation() : renderChatList()}

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
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleAddTicket}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.saveButtonText}>Confirmer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.saveButton} onPress={() => setIsModalVisible(false)}>
                            <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                <Text style={styles.saveButtonText}>Annuler</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
