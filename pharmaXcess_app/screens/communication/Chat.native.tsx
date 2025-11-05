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
// Interface to store chats by profile
interface ProfileChatsData { 
    [profileId: string]: ChatItem[]; 
}

// The Chat component provides a complete messaging system for support tickets with real-time conversations, message history, and ticket management.
export default function Chat(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);
    
    // Default chats for the main profile
    const defaultChats: ChatItem[] = [
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
    ];
    
    // Global state to store chats for all profiles
    const [profileChatsData, setProfileChatsData] = useState<ProfileChatsData>({});
    
    // Ensure current profile has permissions 
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
    const currentChats = currentProfile 
        ? (profileChatsData[currentProfile.id] || (currentProfile.isMain ? defaultChats : []))
        : []; 
        
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

    // Load chats from AsyncStorage
    const loadChats = async () => {
        try {
            if (!currentProfile?.id) return;
            
            const storageKey = `chats_${currentProfile.id}`;
            const storedChats = await AsyncStorage.getItem(storageKey);
            
            if (storedChats) {
                const chats = JSON.parse(storedChats);
                setProfileChatsData(prev => ({
                    ...prev,
                    [currentProfile.id]: chats
                }));
            } else if (currentProfile.isMain) {
                // Initialize with default chats for main profile
                setProfileChatsData(prev => ({
                    ...prev,
                    [currentProfile.id]: defaultChats
                }));
                await saveChats(defaultChats, currentProfile.id);
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    // Save chats to AsyncStorage
    const saveChats = async (chats: ChatItem[], profileId: string) => {
        try {
            const storageKey = `chats_${profileId}`;
            await AsyncStorage.setItem(storageKey, JSON.stringify(chats));
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    };
    // Effect to initialize chats for the current profile 
    useEffect(() => { 
        if (currentProfile?.id) {
            loadChats();
        }
        // Reset selected chat when switching profiles 
        setSelectedChat(null); 
    }, [currentProfile?.id]); 

    // Utility function to update chats for the current profile 
    const updateCurrentProfileChats = async (updater: (chats: ChatItem[]) => ChatItem[]) => { 
        if (!currentProfile?.id) return; 

        const currentProfileChats = profileChatsData[currentProfile.id] || [];
        const updatedChats = updater(currentProfileChats);
        
        setProfileChatsData(prev => ({ 
            ...prev,
            [currentProfile.id]: updatedChats
        }));
        
        // Save to AsyncStorage
        await saveChats(updatedChats, currentProfile.id);
    }; 

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
        
        // Simulate support response after 2 seconds
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
        await updateCurrentProfileChats(chats => [newTicketData, ...chats]);
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
                data={currentChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const unreadCount = getUnreadCount(item.messages);
                    return (
                        <TouchableOpacity 
                            style={styles.chatCard} 
                            onPress={() => handleChatPress(item)}
                        >
                            {/* Title and status on the top */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={[styles.chatTitle, { flex: 1, marginRight: 8 }]}>{item.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                                </View>
                                {unreadCount > 0 && (
                                    <View style={[styles.unreadBadge, { marginLeft: 8 }]}>
                                        <Text style={styles.unreadText}>{unreadCount}</Text>
                                    </View>
                                )}
                            </View>
                            {/* Preview message and details */} 

                            <Text style={styles.chatPreview} numberOfLines={2}>
                                {item.messages.length > 0 
                                    ? item.messages[item.messages.length - 1].text 
                                    : item.question
                                }
                            </Text>
                            
                            {/* Date and name on the bottom  */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <Text style={styles.chatName}>Par {item.name}</Text>
                                <Text style={styles.chatDate}>{item.lastActivity}</Text>
                            </View>
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
                    <Ionicons name="arrow-back" size={24} color={colors.profileText} />
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
