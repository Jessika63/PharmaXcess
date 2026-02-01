import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';
import { canUserPerformAction, getDefaultPermissions } from '../../utils/profileValidation';
import { useNavigation } from '@react-navigation/native';

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
    const { user } = useAuth();
    const styles = createStyles(colors, fontScale);
    const navigation = useNavigation();
    
    // Default chats for the main profile (empty to avoid fake discussions)
    const defaultChats: ChatItem[] = [];
    
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
    
    // Retrieve chats for the current profile or default to main profile 
    const currentChats = currentProfile 
        ? (profileChatsData[currentProfile.id] || (currentProfile.isMain ? defaultChats : [])).map(chat => ({
            ...chat,
            messages: chat.messages || []
        }))
        : [];

    console.log('🔍 Transformed currentChats:', currentChats);
        
    // Chat interface states
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    
    // New ticket states
    const [newTicket, setNewTicket] = useState<ChatItem>({
        id: '',
        title: '',
        name: user?.name || '',
        question: '',
        date: '',
        messages: [],
        status: 'open',
        lastActivity: '',
    });

    // Load chats from AsyncStorage
    const loadChats = async () => {
        try {
            if (!currentProfile?.id) {
                return;
            }
            
            // Detect server-backed numeric profile ids
            const numericCandidate = Number(currentProfile.id);
            const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);

            const storageKey = `chats_${currentProfile.id}`;
            const storedChats = await AsyncStorage.getItem(storageKey);

            if (isServerProfile && config.backendUrl) {
                // Fetch discussions from backend for server profiles
                try {
                    const base = config.backendUrl.replace(/\/$/, '');
                    const url = `${base}/discussions/user/${currentProfile.id}`;
                    const res = await fetch(url);
                    if (res.ok) {
                        const discussions = await res.json();
                        // Map discussions to ChatItem minimal shape (messages loaded when opening)
                        const rawChats: ChatItem[] = (discussions || []).map((d: any) => ({
                                id: String(d.id),
                                title: d.sujet || d.subject || 'Sans sujet',
                                name: '',
                                question: '',
                                date: d.date_creation || d.date_creation || '',
                                messages: [],
                                status: d.statut === 'ouvert' ? 'open' : (d.statut === 'ferme' ? 'closed' : 'pending'),
                                lastActivity: d.date_creation || ''
                            }));

                            // Enrich chats by fetching the discussion messages and extracting the professional's name when available
                            const enrichChats = async (items: ChatItem[]) => {
                                const base = config.backendUrl.replace(/\/$/, '');
                                return await Promise.all(items.map(async (c) => {
                                    try {
                                        const r = await fetch(`${base}/messages/discussion/${c.id}`);
                                        if (r.ok) {
                                            const msgs = await r.json();
                                            if (msgs && msgs.length > 0) {
                                                // find first message authored by someone other than the current profile
                                                const other = msgs.find((m: any) => String(m.auteur_id) !== String(currentProfile.id));
                                                if (other) {
                                                    return { ...c, name: other.auteur_name || c.name, question: other.message || c.question };
                                                }
                                                // fallback: keep first message text as preview
                                                return { ...c, question: msgs[0].message || c.question };
                                            }
                                        }
                                    } catch (e) {
                                        console.warn('Failed to enrich chat', e);
                                    }
                                    return c;
                                }));
                            };

                            const chats = await enrichChats(rawChats);
                            setProfileChatsData(prev => ({ ...prev, [currentProfile.id]: chats }));
                            // persist cache locally as well
                            await saveChats(chats, currentProfile.id);
                        return;
                    }
                } catch (e) {
                    console.warn('Failed to fetch discussions from backend', e);
                }
            }

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

    // Fetch discussions from backend
    useEffect(() => {
        const fetchDiscussionsFromBackend = async () => {
            try {
                if (!currentProfile?.id) return;

                const response = await fetch(`${config.backendUrl}/discussions/user/${currentProfile.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Error fetching discussions: ${response.statusText}`);
                }

                const discussions = await response.json();
                setProfileChatsData(prev => ({
                    ...prev,
                    [currentProfile.id]: discussions,
                }));
            } catch (error) {
                console.error('Error fetching discussions from backend:', error);
            }
        };

        fetchDiscussionsFromBackend();
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
        // If this profile is backed by server, fetch messages from backend BEFORE setting selectedChat
        const numericCandidate = Number(currentProfile?.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile?.id);

        if (isServerProfile && config.backendUrl) {
            try {
                const base = config.backendUrl.replace(/\/$/, '');
                const url = `${base}/messages/discussion/${chat.id}`;
                const res = await fetch(url);
                if (res.ok) {
                    const messages = await res.json();
                    const mapped = (messages || []).map((m: any) => ({
                        id: String(m.id || m.message_id || Math.random()),
                        text: m.message || m.message_text || '',
                        sender: Number(m.auteur_id) === Number(currentProfile?.id) ? 'user' : 'support',
                        timestamp: m.date_envoi || m.date || new Date().toLocaleString('fr-FR'),
                        isRead: true
                    }));

                    // Create updated chat with messages
                    const updatedChat = { ...chat, messages: mapped };
                    
                    await updateCurrentProfileChats(chats => 
                        chats.map(c => c.id === chat.id ? updatedChat : c)
                    );
                    
                    // Set selectedChat with the updated chat that has messages
                    setSelectedChat(updatedChat);
                    return; // Exit early since we set selectedChat
                }
            } catch (e) {
                console.warn('PATIENT: Failed to load messages from backend', e);
            }
        } else {
            // Mark messages as read when opening the chat (local-only)
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
        }

        // Set selected chat AFTER messages are loaded (fallback if not server profile)
        setSelectedChat(chat);
    };

    // Function to send a new message
    const handleSendMessage = async (): Promise<void> => {
        if (!newMessage.trim() || !selectedChat) return;

        const numericCandidate = Number(currentProfile?.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile?.id);

        const now = new Date().toLocaleString('fr-FR');

        if (isServerProfile && config.backendUrl) {
            try {
                const base = config.backendUrl.replace(/\/$/, '');
                const res = await fetch(`${base}/messages/add/${selectedChat.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ auteur_id: Number(currentProfile?.id), message: newMessage.trim() })
                });

                if (res.ok) {
                    const json = await res.json();
                    const message: Message = {
                        id: String(json.message_id || Math.random()),
                        text: newMessage.trim(),
                        sender: 'user',
                        timestamp: now,
                        isRead: true
                    };

                    const updatedChat = {
                        ...selectedChat,
                        messages: [...selectedChat.messages, message],
                        lastActivity: message.timestamp
                    };

                    await updateCurrentProfileChats(chats => 
                        chats.map(chat => 
                            chat.id === selectedChat.id 
                                ? updatedChat
                                : chat
                        )
                    );

                    setSelectedChat(updatedChat);
                    setNewMessage('');
                    return;
                }
            } catch (e) {
                console.warn('Failed to send message to backend');
            }
        }

        // Fallback/local behaviour
        const message: Message = {
            id: Math.random().toString(),
            text: newMessage.trim(),
            sender: 'user',
            timestamp: now,
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
    };

    // Function to get status badge color
    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'open': return colors.success || colors.primary;
            case 'pending': return colors.warning || colors.secondary;
            case 'closed': return colors.textSecondary || colors.infoTextSecondary;
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

    // Ensure messages is always an array before accessing length
    const getUnreadCount = (messages: Message[] = []): number => {
        return (messages || []).filter(msg => !msg.isRead && msg.sender === 'support').length;
    };

    const handleAddTicket = async (): Promise<void> => {
        // Check if current profile can access chat
        if (safeCurrentProfile && !canUserPerformAction(safeCurrentProfile, 'access_chat')) {
            Alert.alert('Accès refusé', 'Ce profil n\'a pas l\'autorisation d\'accéder au chat.');
            return;
        }

        // Validate required fields (title and question only)
        if (!newTicket.title || !newTicket.question) {
            Alert.alert('Erreur', 'Veuillez remplir le sujet et la question.');
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

        // Derive name from profile (use profile name, fallback to email)
        const nameFromProfile = (currentProfile?.name && String(currentProfile.name).trim()) || currentProfile?.email || '';

        // Create a new ticket with a unique ID and current date
        const newTicketData: ChatItem = {
            ...newTicket,
            id: Math.random().toString(),
            name: nameFromProfile || '',
            date: new Date().toISOString().split('T')[0],
            messages: [initialMessage],
            status: 'open',
            lastActivity: currentDateTime,
        };

        // If this is a server profile, create discussion on backend
        const numericCandidate = Number(currentProfile?.id);
        const isServerProfile = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile?.id);

        if (isServerProfile && config.backendUrl) {
            try {
                const base = config.backendUrl.replace(/\/$/, '');
                const payload = {
                    utilisateur_id: Number(currentProfile?.id),
                    subject: newTicket.title,
                    name: nameFromProfile,
                    question: newTicket.question,
                    flag: null,
                    region: (currentProfile as any).region || 'all'
                };
                const res = await fetch(`${base}/discussions/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const json = await res.json();
                    const created: ChatItem = {
                        id: String(json.discussion_id),
                        title: newTicket.title,
                        name: nameFromProfile,
                        question: newTicket.question,
                        date: new Date().toISOString().split('T')[0],
                        messages: [
                            {
                                id: String(json.first_message?.message_id || Math.random()),
                                text: json.first_message?.message || newTicket.question,
                                sender: 'user',
                                timestamp: new Date().toLocaleString('fr-FR'),
                                isRead: true
                            }
                        ],
                        status: 'open',
                        lastActivity: new Date().toLocaleString('fr-FR')
                    };

                    await updateCurrentProfileChats(chats => [created, ...chats]);
                    setNewTicket({ id: '', title: '', name: '', question: '', date: '', messages: [], status: 'open', lastActivity: '' });
                    setIsModalVisible(false);
                    return;
                }
            } catch (e) {
                console.warn('Failed to create discussion on backend', e);
            }
        }

        // Add the new ticket to the chat list and reset the form (local fallback)
        await updateCurrentProfileChats(chats => [newTicketData, ...chats]);
        setNewTicket({ 
            id: '', 
            title: '', 
            name: safeCurrentProfile?.name || user?.email || '',
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
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            // Prefill the name field from profile (use name, fallback to email)
                            const prefilledName = (currentProfile?.name && String(currentProfile.name).trim()) || currentProfile?.email || '';
                            setNewTicket(prev => ({ ...prev, title: '', name: prefilledName, question: '' }));
                            setIsModalVisible(true);
                        }}
                    >
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
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
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
                contentContainerStyle={{ padding: 20, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
            />

            {/* Message Input or Closed Message */}
            {selectedChat?.status === 'closed' ? (
                <View style={[styles.messageInputContainer, { justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingVertical: 20 }]}>
                    <Ionicons name="lock-closed" size={32} color={colors.infoTextSecondary} style={{ marginBottom: 10 }} />
                    <Text style={[styles.messageText, { textAlign: 'center', marginBottom: 8, color: colors.iconPrimary }]}>Cette discussion est fermée</Text>
                    <Text style={[styles.messageText, { textAlign: 'center', color: colors.iconPrimary }]}>Ouvrir un nouveau ticket</Text>
                </View>
            ) : (
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
            )}
        </KeyboardAvoidingView>
    );

    const createDiscussion = async () => {
        console.log('Creating discussion with payload:', {
            utilisateur_id: Number(currentProfile?.id),
            subject: newTicket.title,
            name: user?.name,
            question: newTicket.question,
            flag: null,
            region: (currentProfile as any).region || 'all',
        });

        try {
            const response = await fetch(`${config.backendUrl}/discussions/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    utilisateur_id: Number(currentProfile?.id),
                    subject: newTicket.title,
                    name: user?.name,
                    question: newTicket.question,
                    flag: null,
                    region: (currentProfile as any).region || 'all',
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                console.error('Error creating discussion:', response.statusText);
                throw new Error(`Error creating discussion: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Discussion created successfully:', data);
            // Optionally refresh discussions
            await loadChats();
        } catch (error) {
            console.error('Error creating discussion:', error);
        }
    };

    const addMessage = async (discussionId: string, message: string) => {
        try {
            const payload = {
                auteur_id: Number(currentProfile?.id),
                message: message,
            };

            const response = await fetch(`${config.backendUrl}/messages/add/${discussionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error adding message: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Message added:', data);
            // Optionally refresh messages
            await loadChats();
        } catch (error) {
            console.error('Error adding message:', error);
        }
    };

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
                    {/* Name removed: we save profile name/email automatically in backend. */}
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
                            <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                                <Text style={styles.saveButtonText}>Annuler</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
