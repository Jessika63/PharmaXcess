import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { canUserPerformAction, getDefaultPermissions } from '../../utils/profileValidation';
import { getTickets, createTicket, updateTicket, deleteTicket } from "../../services/ticket/ticketService"
import { ChatItem, Message } from '../../services/ticket/types';

interface ProfileChatsData { 
    [profileId: string]: ChatItem[]; 
}

export default function Chat(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const [profileChatsData, setProfileChatsData] = useState<ProfileChatsData>({});
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMessage, setNewMessage] = useState('');
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

    const ensureProfilePermissions = (profile: typeof currentProfile) => {
        if (!profile) return null;
        if (!profile.permissions) {
            return {
                ...profile,
                permissions: getDefaultPermissions(profile.relationship, profile.age)
            };
        }
        return profile;
    };

    const safeCurrentProfile = ensureProfilePermissions(currentProfile);

    // Retrieve chats for the current profile or default to main profile chats 
    const currentChats = currentProfile ? (profileChatsData[currentProfile.id] || []) : [];

    const loadChats = async () => {
        if (!currentProfile?.id) return;
        try {
            const ticketsData = await getTickets(currentProfile.id);
            setProfileChatsData(prev => ({
                ...prev,
                [currentProfile.id]: ticketsData
            }));
        } catch (error) {
            console.error('Error loading tickets:', error);
        }
    };

    // Utility function to update chats for the current profile 
    const updateCurrentProfileChats = async (updater: (chats: ChatItem[]) => ChatItem[]) => { 
        if (!currentProfile?.id) return; 
        const currentProfileChats = profileChatsData[currentProfile.id] || [];
        const updatedChats = updater(currentProfileChats);

        setProfileChatsData(prev => ({ 
            ...prev,
            [currentProfile.id]: updatedChats
        }));
    }; 
    useEffect(() => { 
        loadChats();
        setSelectedChat(null); 
    }, [currentProfile?.id]); 

    // Function to handle opening a chat conversation
    const handleChatPress = async (chat: ChatItem): Promise<void> => {
        setSelectedChat(chat);
        // Mark messages as read when opening the chat
        await updateCurrentProfileChats(chats => 
            chats.map(c => 
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
    const handleSendMessage = async (): Promise<void> => {
        if (!newMessage.trim() || !selectedChat) return;

        const message: Message = {
            id: Math.random().toString(),
            text: newMessage.trim(),
            sender: 'user',
            timestamp: new Date().toLocaleString('fr-FR'),
            isRead: true
        };

        await updateCurrentProfileChats(chats => 
            chats.map(chat => 
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

        try {
            await updateTicket(selectedChat.id, {
                messages: [...selectedChat.messages, message],
                lastActivity: message.timestamp
            });
        } catch (error) {
            console.error('Send message API error:', error);
        }

        setTimeout(async () => {
            const supportMessage: Message = {
                id: Math.random().toString(),
                text: 'Merci pour votre message. Notre équipe va traiter votre demande et vous répondra dans les plus brefs délais.',
                sender: 'support',
                timestamp: new Date().toLocaleString('fr-FR'),
                isRead: false
            };

            await updateCurrentProfileChats(chats => 
                chats.map(chat => 
                    chat.id === selectedChat.id 
                        ? {
                            ...chat,
                            messages: [...chat.messages, supportMessage],
                            lastActivity: supportMessage.timestamp
                          }
                        : chat
                )
            );

            try {
                await updateTicket(selectedChat.id, {
                    messages: [...selectedChat.messages, supportMessage],
                    lastActivity: supportMessage.timestamp
                });
            } catch (error) {
                console.error('Support message API error:', error);
            }
        }, 2000);
    };

    const handleAddTicket = async (): Promise<void> => {
        // Check if current profile can access chat
        if (safeCurrentProfile && !canUserPerformAction(safeCurrentProfile, 'access_chat')) {
            Alert.alert('Accès refusé', 'Ce profil n\'a pas l\'autorisation d\'accéder au chat.');
            return;
        }

        // Validate that all fields are filled before adding a new ticket
        if (!newTicket.title || !newTicket.name || !newTicket.question) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const currentDateTime = new Date().toLocaleString('fr-FR');
        // Create a new ticket with a unique ID and current date
        const newTicketData: ChatItem = {
            ...newTicket,
            id: Math.random().toString(),
            date: new Date().toISOString().split('T')[0],
            messages: [{
                id: Math.random().toString(),
                text: newTicket.question,
                sender: 'user',
                timestamp: currentDateTime,
                isRead: true
            }],
            status: 'open',
            lastActivity: currentDateTime,
        };

        // Add the new ticket to the chat list and reset the form
        await updateCurrentProfileChats(chats => [newTicketData, ...chats]);

        try {
            await createTicket({
                title: newTicket.title,
                name: newTicket.name,
                question: newTicket.question,
                status: 'open',
            });
        } catch (error) {
            console.error('Create ticket API error:', error);
        }

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

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'open': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'closed': return '#9E9E9E';
            default: return colors.infoTextSecondary;
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case 'open': return 'Ouvert';
            case 'pending': return 'En attente';
            case 'closed': return 'Fermé';
            default: return 'Inconnu';
        }
    };

    const getUnreadCount = (messages: Message[]): number => {
        return messages.filter(msg => !msg.isRead && msg.sender === 'support').length;
    };

    const renderChatList = () => (
        <>
            <FlatList
                data={currentChats}
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
                {safeCurrentProfile && canUserPerformAction(safeCurrentProfile, 'access_chat') ? (
                    <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                            <Ionicons name="add" size={24} color={colors.iconPrimary} />
                            <Text style={styles.buttonText}>Ouvrir un ticket</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={[styles.addButton, { opacity: 0.5 }]}>
                        <View style={[styles.gradient, { backgroundColor: colors.infoTextSecondary }]}>
                            <Ionicons name="lock-closed" size={24} color={colors.textMuted} />
                            <Text style={[styles.buttonText, { color: colors.textMuted }]}>
                                Chat non autorisé
                            </Text>
                        </View>
                    </View>
                )}
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
