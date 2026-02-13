import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import config from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import createStyles from '../../styles/ProfessionalChat.style';
import fetchWithTimeout from '../../utils/fetchWithTimeout';
import { useUser } from '../../context/UserContext';

type Message = { 
  id: string; 
  text: string;
  sender: 'user' | 'support';
  timestamp: string;
  isRead: boolean;
}; 

type Ticket = { 
  id: string; 
  title: string;
  patientName: string; 
  patientId: string; 
  question: string;
  createdAt: string; 
  status: 'unassigned' | 'assigned' | 'closed'; 
  assignedTo?: string; 
  messages: Message[]; 
  lastActivity: string; 
};

export default function Chat(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);
  const { user: authUser } = useAuth();
  const { user } = useUser();

  // States
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - non-assigned tickets 
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([]);

  // Mock data - assigned tickets
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);

  // Effects
  useEffect(() => {
    const fetchUnassignedTickets = async () => {
        try {
            const sector = 'pharmacien'; // Replace with the actual sector dynamically if available
            const region = 'all'; // Replace with the actual region dynamically if available
            const response = await fetchWithTimeout(`${config.backendUrl}/discussions/open?sector=${sector}&region=${region}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error(`Error fetching unassigned tickets: ${response.statusText}`);
            }

            const data = await response.json();
            setUnassignedTickets(data.open_discussions);
            console.log('Unassigned tickets fetched:', data.open_discussions);
        } catch (error) {
            console.error('Error fetching unassigned tickets:', error);
        }
    };

    fetchUnassignedTickets();
  }, []);

  useEffect(() => {
        const fetchAssignedTickets = async () => {
            try {
                if (!user) {
                    console.error('User is not logged in. Cannot fetch assigned tickets.');
                    return;
                }

                const professionalId = user.id; // Use the logged-in user's ID dynamically
                const response = await fetchWithTimeout(`${config.backendUrl}/discussions/professional/${professionalId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Error fetching assigned tickets: ${response.statusText}`);
                }

                const data = await response.json();
                setAssignedTickets(data);
                console.log('Assigned tickets fetched:', data);
            } catch (error) {
                console.error('Error fetching assigned tickets:', error);
            }
        };

        fetchAssignedTickets();
    }, [user]); // Trigger the effect when the user changes

  useEffect(() => {
    const fetchUserDiscussions = async () => {
      try {
        if (!user) {
          console.error('User is not logged in. Please log in to access discussions.');
          return;
        }

        const utilisateurId = user.id; // Dynamically get the user ID from the context
        if (!utilisateurId) {
          console.error('User ID is not available');
          return;
        }

        const response = await fetchWithTimeout(`${config.backendUrl}/discussions/user/${utilisateurId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error fetching user discussions: ${response.statusText}`);
        }

        const data = await response.json();
        setUnassignedTickets(data); // Assuming unassignedTickets is used for user discussions
      } catch (error) {
        console.error('Error fetching user discussions:', error);
      }
    };

    fetchUserDiscussions();
  }, [user]);

  // Functions
  const handleTicketPress = async (ticket: Ticket) => {
    if (ticket.status === 'unassigned') {
      // If backend is available, try to fetch the first message to show patient name and question
      if (config.backendUrl) {
        try {
          const base = config.backendUrl.replace(/\/$/, '');
          const res = await fetch(`${base}/messages/discussion/${ticket.id}`);
          if (res.ok) {
            const messages = await res.json();
            if (messages && messages.length > 0) {
              const first = messages[0];
              const patientNameFromMsg = first.auteur_name || first.auteur || '';
              const questionFromMsg = first.message || first.message_text || '';
              setTicketToAssign({ ...ticket, patientName: patientNameFromMsg, question: questionFromMsg });
              setShowAssignmentModal(true);
              return;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch first message for ticket', e);
        }
      }

      // Fallback to local/mock data if backend not available or fetch failed
      setTicketToAssign(ticket);
      setShowAssignmentModal(true);
    } else {
      // If backend available, fetch messages for this discussion BEFORE setting selectedTicket
      if (config.backendUrl) {
        try {
          const base = config.backendUrl.replace(/\/$/, '');
          const url = `${base}/messages/discussion/${ticket.id}`;
          const res = await fetch(url);
          if (res.ok) {
            const messages = await res.json();
            const mapped = (messages || []).map((m: any) => ({
              id: String(m.id || m.message_id || Math.random()),
              text: m.message || '',
              sender: Number(m.auteur_id) === Number(user?.id) ? 'support' : 'user',
              timestamp: m.date_envoi || m.date || new Date().toLocaleString('fr-FR'),
              isRead: true
            }));
            
            // Create updated ticket with messages
            const updatedTicket = { ...ticket, messages: mapped };
            
            // Update ticket with messages first
            setAssignedTickets(prev => prev.map(t => t.id === ticket.id ? updatedTicket : t));
            
            // Set selected ticket with the updated ticket that has messages
            setSelectedTicket(updatedTicket);
            return; // Exit early since we set selectedTicket
          }
        } catch (e) {
          console.warn('Failed to fetch messages for ticket', e);
        }
      }

      // Mark messages as read locally
      setAssignedTickets(prev => prev.map(t => 
        t.id === ticket.id 
          ? { ...t, messages: t.messages.map(m => ({ ...m, isRead: true })) }
          : t
      ));
    }
  };

  const handleAssignTicket = async () => {
        if (!ticketToAssign || !user) {
            Alert.alert('Erreur', 'Utilisateur non connecté ou ticket non valide.');
            return;
        }

        try {
            console.log('Assigning ticket with payload:', {
            professionnel_id: user.id,
        });

            const response = await fetch(`${config.backendUrl}/discussions/update/${ticketToAssign.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ professionnel_id: user.id }),
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                console.error('Failed to assign ticket:', await response.text());
                throw new Error(`Failed to assign ticket: ${response.statusText}`);
            }

            const assignedTicket: Ticket = {
                ...ticketToAssign,
                status: 'assigned',
                assignedTo: user?.prenom ? `${user.prenom} ${user.nom}` : 'Pharmacien',
            };

            // Move ticket from unassigned to assigned (local update)
            setUnassignedTickets(prev => prev.filter(t => t.id !== ticketToAssign.id));
            setAssignedTickets(prev => [assignedTicket, ...(prev || [])]);

            // Close modal
            setShowAssignmentModal(false);
            setTicketToAssign(null);

            Alert.alert('Succès', 'Le ticket vous a été assigné.');
        } catch (error) {
            console.error('Error assigning ticket:', error);
            Alert.alert('Erreur', 'Impossible d\'assigner le ticket.');
        }
    };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    // Prevent sending messages if ticket is closed
    if (selectedTicket.status === 'closed') {
      Alert.alert(
        'Discussion fermée',
        'Impossible d\'envoyer un message dans une discussion fermée.',
        [{ text: 'OK' }]
      );
      return;
    }

    const now = new Date().toLocaleString('fr-FR');

    // If backend available, post the message
    if (config.backendUrl && user?.id) {
      (async () => {
        try {
          const base = config.backendUrl.replace(/\/$/, '');
          const res = await fetch(`${base}/messages/add/${selectedTicket.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ auteur_id: Number(user.id), message: newMessage.trim() })
          });
          if (res.ok) {
            const json = await res.json();
            const message: Message = {
              id: String(json.message_id || Math.random()),
              text: newMessage.trim(),
              sender: 'support',
              timestamp: now,
              isRead: true
            };

            // Create updated ticket with new message
            const updatedTicket = {
              ...selectedTicket,
              messages: [...selectedTicket.messages, message],
              lastActivity: message.timestamp
            };

            setAssignedTickets(prev => prev.map(ticket => 
              ticket.id === selectedTicket.id ? updatedTicket : ticket
            ));
            
            // Update selectedTicket with the new message so it displays immediately
            setSelectedTicket(updatedTicket);
            setNewMessage('');

            // If backend confirms message creation, ask to close the discussion
            if (json?.message === 'Message added') {
              // Capture the discussion ID now before Alert changes state
              const discussionIdToClose = selectedTicket.id;
              Alert.alert(
                'Clore la discussion ?',
                'La question est-elle résolue ? Voulez-vous fermer cette discussion ?',
                [
                  { text: 'Non', style: 'cancel' },
                  {
                    text: 'Oui',
                    onPress: async () => {
                      try {
                        const updateRes = await fetch(`${base}/discussions/update/${discussionIdToClose}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ statut: 'ferme' })
                        });
                        if (!updateRes.ok) {
                          console.warn('Failed to close discussion', await updateRes.text());
                        } else {
                          // Optionally reflect closure locally
                          setAssignedTickets(prev => prev.map(t => 
                            t.id === discussionIdToClose ? { ...t, status: 'closed' } : t
                          ));
                          // Mettre à jour aussi selectedTicket pour que l'UI réagisse tout de suite
                          setSelectedTicket(prev => prev && prev.id === discussionIdToClose ? { ...prev, status: 'closed' } : prev);
                        }
                      } catch (e) {
                        console.warn('Error calling close discussion API', e);
                      }
                    }
                  }
                ]
              );
            }
            return;
          }
        } catch (e) {
          console.warn('Failed to send professional message', e);
        }
      })();
      return;
    }

    const message: Message = {
      id: Math.random().toString(),
      text: newMessage.trim(),
      sender: 'support',
      timestamp: now,
      isRead: true
    };

    setAssignedTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? {
            ...ticket,
            messages: [...(ticket.messages || []), message],
            lastActivity: message.timestamp
          }
        : ticket
    ));

    setNewMessage('');
  };

  // Load open and professional discussions from backend on mount
  // --- Polling automatique pour rafraîchir les discussions toutes les 5 secondes ---
  useEffect(() => {
    if (!config.backendUrl) return;
    const base = config.backendUrl.replace(/\/$/, '');

    let isMounted = true;

    const fetchDiscussions = async () => {
      try {
        // Unassigned
        const res = await fetch(`${base}/discussions/open?sector=pharmacien&region=all`);
        if (res.ok) {
          const json = await res.json();
          const rawList = (json.open_discussions || []).map((d: any) => ({
            id: String(d.id),
            title: d.sujet || 'Sans sujet',
            patientName: '',
            patientId: String(d.utilisateur_id || d.user_id || ''),
            question: '',
            createdAt: d.date_creation || '',
            status: 'unassigned',
            messages: [],
            lastActivity: d.date_creation || ''
          }));
          const enrich = async (tickets: typeof rawList) => {
            return await Promise.all(tickets.map(async (t) => {
              try {
                const r = await fetch(`${base}/messages/discussion/${t.id}`);
                if (r.ok) {
                  const msgs = await r.json();
                  if (msgs && msgs.length > 0) {
                    const first = msgs[0];
                    return { ...t, patientName: first.auteur_name || t.patientName, question: first.message || t.question };
                  }
                }
              } catch (e) {}
              return t;
            }));
          };
          const enriched = await enrich(rawList);
          if (isMounted) setUnassignedTickets(enriched);
        }
      } catch (e) {
        if (isMounted) console.warn('Failed to load open discussions', e);
      }
      // Assigned
      if (user?.id) {
        try {
          const res = await fetch(`${base}/discussions/professional/${user.id}`);
          if (res.ok) {
            const discussions = await res.json();
            const rawMapped = (discussions || []).map((d: any) => ({
              id: String(d.id),
              title: d.sujet || 'Sans sujet',
              patientName: '',
              patientId: String(d.utilisateur_id || ''),
              question: '',
              createdAt: d.date_creation || '',
              status: d.statut === 'ouvert' ? 'assigned' : 'closed',
              messages: [],
              lastActivity: d.date_creation || ''
            }));
            const enrichAssigned = async (tickets: typeof rawMapped) => {
              return await Promise.all(tickets.map(async (t) => {
                try {
                  const r = await fetch(`${base}/messages/discussion/${t.id}`);
                  if (r.ok) {
                    const msgs = await r.json();
                    if (msgs && msgs.length > 0) {
                      const first = msgs[0];
                      return { ...t, patientName: first.auteur_name || t.patientName, question: first.message || t.question };
                    }
                  }
                } catch (e) {}
                return t;
              }));
            };
            const enrichedAssigned = await enrichAssigned(rawMapped);
            if (isMounted) setAssignedTickets(enrichedAssigned);
          }
        } catch (e) {
          if (isMounted) console.warn('Failed to load professional discussions', e);
        }
      }
    };

    fetchDiscussions();
    const interval = setInterval(fetchDiscussions, 5000); // 5 secondes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'unassigned': return colors.error;
      case 'assigned': return colors.secondary;
      case 'closed': return colors.infoTextSecondary;
      default: return colors.infoTextSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'unassigned': return 'Non assigné';
      case 'assigned': return '';
      case 'closed': return 'Fermé';
      default: return 'Inconnu';
    }
  };

  const getUnreadCount = (messages: Message[] | undefined): number => {
    if (!messages) return 0; // Handle undefined messages
    return messages.filter(msg => !msg.isRead && msg.sender === 'user').length;
  };

  const renderTicketCard = useCallback(({ item }: { item: Ticket }) => {
    const unreadCount = getUnreadCount(item.messages);
    
    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(item)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketPatient}>Patient: {item.patientName || item.patientId || 'Nom inconnu'}</Text>
            <Text style={styles.ticketDate}>Créé le {item.createdAt}</Text>
          </View>
          {item.status !== 'assigned' && getStatusLabel(item.status) && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
            </View>
          )}
          {unreadCount > 0 && item.status === 'assigned' && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.ticketPreview} numberOfLines={2}>
          {item.question}
        </Text>
      </TouchableOpacity>
    );
  }, [handleTicketPress, getUnreadCount]);

  const renderConversation = () => (
    <KeyboardAvoidingView 
      style={styles.conversationContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.conversationHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setSelectedTicket(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationTitle}>{selectedTicket?.title}</Text>
          {selectedTicket?.status === 'unassigned' && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket?.status || 'assigned') }]}>
              <Text style={styles.statusText}>{getStatusLabel(selectedTicket?.status || 'assigned')}</Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={selectedTicket?.messages || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender === 'support' ? styles.userMessage : styles.supportMessage
          ]}>
            <View style={[
              styles.messageBubble,
              item.sender === 'support' ? styles.userBubble : styles.supportBubble
            ]}>
              <Text style={[
                styles.messageText,
                item.sender === 'support' ? styles.userText : styles.supportText
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.messageTime,
                item.sender === 'support' ? styles.userTime : styles.supportTime
              ]}>
                {item.timestamp}
              </Text>
            </View>
          </View>
        )}
        style={styles.messagesList}
        contentContainerStyle={{ padding: 20 }}
      />

      {selectedTicket?.status === 'closed' ? (
        <View style={[styles.messageInputContainer, { justifyContent: 'center', alignItems: 'center', flexDirection: 'column', paddingVertical: 20 }]}>
            <Ionicons name="lock-closed" size={32} color={colors.infoTextSecondary} style={{ marginBottom: 10 }} />
            <Text style={[styles.messageText, { textAlign: 'center', marginBottom: 8, color: colors.iconPrimary }]}>Cette discussion est fermée</Text>
            <Text style={[styles.messageText, { textAlign: 'center', color: colors.iconPrimary }]}>Ouvrir un nouveau ticket</Text>
        </View>
      ) : (
        <View style={styles.messageInputContainer}>
          <TextInput
            style={[styles.messageInput, selectedTicket?.status === 'closed' && styles.messageInputDisabled]}
            placeholder={selectedTicket?.status === 'closed' ? 'Discussion fermée' : 'Tapez votre réponse...'}
            placeholderTextColor={colors.infoText}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            editable={selectedTicket?.status !== 'closed'}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!newMessage.trim() || selectedTicket?.status === 'closed') && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || selectedTicket?.status === 'closed'}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(newMessage.trim() && selectedTicket?.status !== 'closed') ? colors.iconPrimary : colors.inputBorder} 
            />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );

  const renderTicketList = () => {
    const currentTickets = activeTab === 'unassigned' ? unassignedTickets : assignedTickets;
    
    if (currentTickets.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons 
            name={activeTab === 'unassigned' ? 'ticket-outline' : 'chatbubbles-outline'} 
            size={60} 
            color={colors.infoTextSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>
            {activeTab === 'unassigned' ? 'Aucun ticket en attente' : 'Aucune conversation assignée'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'unassigned' 
              ? 'Tous les tickets patients ont été traités.' 
              : 'Vous n\'avez pas encore de conversations assignées.'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={currentTickets}
        renderItem={renderTicketCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
      />
    );
  };

  const unassignedCount = unassignedTickets.length;
  const assignedCount = assignedTickets.length;
  const unreadAssignedCount = assignedTickets.reduce((count, ticket) => 
    count + getUnreadCount(ticket.messages), 0
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {selectedTicket ? (
          renderConversation()
        ) : (
          <>
            <View style={styles.header}>              
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'unassigned' ? styles.activeTab : styles.inactiveTab]}
                  onPress={() => setActiveTab('unassigned')}
                >
                  <Text style={[styles.tabText, activeTab === 'unassigned' ? styles.activeTabText : styles.inactiveTabText]}>
                    Tickets {unassignedCount > 0 ? `(${unassignedCount})` : ''}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'assigned' ? styles.activeTab : styles.inactiveTab]}
                  onPress={() => setActiveTab('assigned')}
                >
                  <Text style={[styles.tabText, activeTab === 'assigned' ? styles.activeTabText : styles.inactiveTabText]}>
                    Mes Conversations {assignedCount > 0 ? `(${assignedCount})` : ''}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.content}>
              {renderTicketList()}
            </View>
          </>
        )}

        {/* Assignment Modal */}
        <Modal
          visible={showAssignmentModal}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.assignmentModal}>
            <View style={styles.assignmentContent}>
              <Text style={styles.assignmentTitle}>Assigner le ticket</Text>
              <Text style={styles.assignmentText}>
                Voulez-vous vous assigner ce ticket de {ticketToAssign?.patientName} ?
              </Text>
              <Text style={[styles.assignmentText, { fontStyle: 'italic', marginTop: 10 }]}>
                "{ticketToAssign?.question}"
              </Text>
              
              <View style={styles.assignmentButtonContainer}>
                <TouchableOpacity
                  style={[styles.assignmentButton, styles.assignButton]}
                  onPress={handleAssignTicket}
                >
                  <Text style={styles.assignmentButtonText}>Oui, m'assigner</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.assignmentButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAssignmentModal(false);
                    setTicketToAssign(null);
                  }}
                >
                  <Text style={styles.assignmentButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}