import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import Ionicons from '@expo/vector-icons/Ionicons'; 
import createStyles from '../../styles/ClickAndCollect.style';

interface PrescriptionRequest { 
  id: string; 
  patientName: string; 
  patientFirstName: string; 
  requestTime: string; 
  prescriptionImage: string;
  status: 'pending' | 'approved' | 'rejected'; 
}

export default function ClickAndCollect(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  // State for managing prescription requests 
  const [requests, setRequests] = useState<PrescriptionRequest[]>([
    {
      id: '1',
      patientName: 'Dubois',
      patientFirstName: 'Marie',
      requestTime: '14:30',
      prescriptionImage: 'https://via.placeholder.com/400x600/CCCCCC/FFFFFF?text=Ordonnance+1',
      status: 'pending',
    },
    {
      id: '2',
      patientName: 'Martin',
      patientFirstName: 'Jean',
      requestTime: '15:15',
      prescriptionImage: 'https://via.placeholder.com/400x600/CCCCCC/FFFFFF?text=Ordonnance+2',
      status: 'pending',
    },
    {
      id: '3',
      patientName: 'Laurent',
      patientFirstName: 'Sophie',
      requestTime: '16:00',
      prescriptionImage: 'https://via.placeholder.com/400x600/CCCCCC/FFFFFF?text=Ordonnance+3',
      status: 'pending',
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<PrescriptionRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  // Functions to handle request actions 
  const openRequestDetail = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
  };

  const closeRequestDetail = () => {
    setSelectedRequest(null);
  };

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    // Simulate sending QR code to patient 
    Alert.alert(
      'Demande approuvée',
      `QR code envoyé à ${selectedRequest.patientFirstName} ${selectedRequest.patientName}`,
      [{ text: 'OK', onPress: () => {
        // Delete the request from the list 
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        closeRequestDetail();
      }}]
    );
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const sendRejection = () => {
    if (!selectedRequest) return;
    
    Alert.alert(
      'Demande refusée',
      `Commentaire envoyé à ${selectedRequest.patientFirstName} ${selectedRequest.patientName}`,
      [{ text: 'OK', onPress: () => {
        // Delete the request from the list 
        setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
        setShowRejectModal(false);
        setRejectComment('');
        closeRequestDetail();
      }}]
    );
  };

  const renderRequestCard = ({ item }: { item: PrescriptionRequest }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => openRequestDetail(item)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.patientFirstName} {item.patientName}
        </Text>
        <Text style={styles.requestTime}>
          Demande reçue à {item.requestTime}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={24} 
        color={colors.infoTitle} 
        style={styles.arrow}
      />
    </TouchableOpacity>
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>
            {pendingRequests.length} demande{pendingRequests.length !== 1 ? 's' : ''} en attente
          </Text>
        </View>

        <View style={styles.content}>
          {pendingRequests.length > 0 ? (
            <FlatList
              data={pendingRequests}
              renderItem={renderRequestCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={60} color={colors.secondary + '40'} />
              <Text style={styles.emptyText}>
                Aucune demande en attente{'\n'}
                Toutes les demandes ont été traitées !
              </Text>
            </View>
          )}
        </View>

        {/* Modal of request details  */}
        <Modal
          visible={selectedRequest !== null}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          {selectedRequest && (
            <View style={styles.detailModal}>
              <View style={styles.detailContent}>
                <View style={styles.detailHeader}>
                  <Text style={styles.detailTitle}>
                    {selectedRequest.patientFirstName} {selectedRequest.patientName}
                  </Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={closeRequestDetail}
                  >
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.prescriptionContainer}>
                  <Image
                    source={{ uri: selectedRequest.prescriptionImage }}
                    style={styles.prescriptionImage}
                  />
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={handleApprove}
                  >
                    <Text style={styles.buttonText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={handleReject}
                  >
                    <Text style={styles.buttonText}>Refuser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>

        {/* Modal of rejection with comment */}
        <Modal
          visible={showRejectModal}
          animationType="fade"
          transparent={true}
        >
          <View style={styles.rejectModal}>
            <View style={styles.rejectContent}>
              <Text style={styles.rejectTitle}>
                Motif du refus
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Expliquez pourquoi vous refusez cette ordonnance..."
                placeholderTextColor={colors.infoTitle}
                value={rejectComment}
                onChangeText={setRejectComment}
                multiline={true}
                maxLength={500}
              />
              <View style={styles.rejectButtonContainer}>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => {
                    setShowRejectModal(false);
                    setRejectComment('');
                  }}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveButton }
                  onPress={sendRejection}
                >
                  <Text style={styles.buttonText}>Envoyer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}