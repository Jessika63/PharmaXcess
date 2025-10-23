import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import createStyles from '../../styles/ProfessionalChat.style';

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

  // States
  const [activeTab, setActiveTab] = useState<'unassigned' | 'assigned'>('unassigned');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Mock data - non-assigned tickets 
  const [unassignedTickets, setUnassignedTickets] = useState<Ticket[]>([
    {
      id: '1',
      title: 'Problème de prescription',
      patientName: 'Jean Dupont',
      patientId: 'P001',
      question: 'Je n\'arrive pas à renouveler ma prescription sur l\'application. Pouvez-vous m\'aider ?',
      createdAt: '2024-10-24 09:30',
      status: 'unassigned',
      messages: [
        {
          id: 'm1',
          text: 'Je n\'arrive pas à renouveler ma prescription sur l\'application. Pouvez-vous m\'aider ?',
          sender: 'user',
          timestamp: '2024-10-24 09:30',
          isRead: true
        }
      ],
      lastActivity: '2024-10-24 09:30',
    },
    {
      id: '2',
      title: 'Question sur les effets secondaires',
      patientName: 'Marie Curie',
      patientId: 'P002',
      question: 'Mon nouveau médicament me donne des nausées. Est-ce normal ?',
      createdAt: '2024-10-24 10:15',
      status: 'unassigned',
      messages: [
        {
          id: 'm2',
          text: 'Mon nouveau médicament me donne des nausées. Est-ce normal ?',
          sender: 'user',
          timestamp: '2024-10-24 10:15',
          isRead: true
        }
      ],
      lastActivity: '2024-10-24 10:15',
    },
    {
      id: '3',
      title: 'Horaires de pharmacie',
      patientName: 'Pierre Martin',
      patientId: 'P003',
      question: 'Quels sont vos horaires d\'ouverture pendant les fêtes ?',
      createdAt: '2024-10-24 11:00',
      status: 'unassigned',
      messages: [
        {
          id: 'm3',
          text: 'Quels sont vos horaires d\'ouverture pendant les fêtes ?',
          sender: 'user',
          timestamp: '2024-10-24 11:00',
          isRead: true
        }
      ],
      lastActivity: '2024-10-24 11:00',
    }
  ]);

  // Mock data - assigned tickets
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([
    {
      id: '4',
      title: 'Livraison de médicaments',
      patientName: 'Sophie Blanc',
      patientId: 'P004',
      question: 'Est-il possible de me livrer mes médicaments à domicile ?',
      createdAt: '2024-10-23 14:20',
      status: 'assigned',
      assignedTo: 'Pharmacien',
      messages: [
        {
          id: 'm4',
          text: 'Est-il possible de me livrer mes médicaments à domicile ?',
          sender: 'user',
          timestamp: '2024-10-23 14:20',
          isRead: true
        },
        {
          id: 'm5',
          text: 'Bonjour Sophie, oui nous proposons un service de livraison. Je peux organiser cela pour vous.',
          sender: 'support',
          timestamp: '2024-10-23 14:45',
          isRead: true
        },
        {
          id: 'm6',
          text: 'Parfait ! Combien cela coûte-t-il ?',
          sender: 'user',
          timestamp: '2024-10-23 15:10',
          isRead: false
        }
      ],
      lastActivity: '2024-10-23 15:10',
    }
  ]);

  // Functions
  const handleTicketPress = (ticket: Ticket) => {
    if (ticket.status === 'unassigned') {
      setTicketToAssign(ticket);
      setShowAssignmentModal(true);
    } else {
      setSelectedTicket(ticket);
      // Mark messages as read
      setAssignedTickets(prev => prev.map(t => 
        t.id === ticket.id 
          ? { ...t, messages: t.messages.map(m => ({ ...m, isRead: true })) }
          : t
      ));
    }
  };

  const handleAssignTicket = () => {
    if (!ticketToAssign) return;

    const assignedTicket: Ticket = {
      ...ticketToAssign,
      status: 'assigned',
      assignedTo: 'Pharmacien',
    };

    // Move ticket from unassigned to assigned
    setUnassignedTickets(prev => prev.filter(t => t.id !== ticketToAssign.id));
    setAssignedTickets(prev => [assignedTicket, ...prev]);

    // Close modal
    setShowAssignmentModal(false);
    setTicketToAssign(null);

    Alert.alert('Succès', 'Le ticket vous a été assigné.');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: Message = {
      id: Math.random().toString(),
      text: newMessage.trim(),
      sender: 'support',
      timestamp: new Date().toLocaleString('fr-FR'),
      isRead: true
    };

    setAssignedTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? {
            ...ticket,
            messages: [...ticket.messages, message],
            lastActivity: message.timestamp
          }
        : ticket
    ));

    setNewMessage('');
  };

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

  const getUnreadCount = (messages: Message[]): number => {
    return messages.filter(msg => !msg.isRead && msg.sender === 'user').length;
  };

  const renderTicketCard = ({ item }: { item: Ticket }) => {
    const unreadCount = getUnreadCount(item.messages);
    
    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(item)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketTitle}>{item.title}</Text>
            <Text style={styles.ticketPatient}>Patient: {item.patientName}</Text>
            <Text style={styles.ticketDate}>Créé le {item.createdAt}</Text>
          </View>
          {item.status === 'unassigned' && (
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
  };

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

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Tapez votre réponse..."
          placeholderTextColor={colors.infoText}
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
            color={newMessage.trim() ? '#FFFFFF' : colors.inputBorder} 
          />
        </TouchableOpacity>
      </View>
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