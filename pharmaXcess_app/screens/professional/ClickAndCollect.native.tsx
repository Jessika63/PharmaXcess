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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import clickcollectApi from '../../utils/api/clickcollect';
import ordonnancesApi from '../../utils/api/ordonnances';
import { getInfos } from '../../utils/api/profile';
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
  const [requests, setRequests] = useState<PrescriptionRequest[]>([]);
  const [closedRequests, setClosedRequests] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load pending requests from backend on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await clickcollectApi.getPendingRequests();
        console.debug('[Professional ClickAndCollect] getPendingRequests response', res);
        if (res.ok && Array.isArray(res.data?.orders)) {
          const translateStatus = (s: any) => {
            if (!s) return 'pending';
            const st = String(s).toLowerCase();
            if (st === 'en_attente' || st === 'pending') return 'pending';
            if (st === 'valide' || st === 'approved' || st === 'approve') return 'approved';
            if (st === 'refuse' || st === 'refused' || st === 'rejected') return 'rejected';
            return 'pending';
          };

          // Function to fetch user info by ID
          const fetchUserName = async (userId: string | number): Promise<string> => {
            try {
              const res = await getInfos(userId);
              if (res.ok && res.data) {
                return res.data.nom || 'Utilisateur';
              }
            } catch (error) {
              console.error('[ClickAndCollect] Error fetching user info:', error);
            }
            return 'Utilisateur';
          };

          const filteredOrders = res.data.orders.filter((o: any) => {
            const rawStatus = o.status || o.statut || o.statut_fr || null;
            const mappedStatus = translateStatus(rawStatus);
            return mappedStatus === 'pending';
          });

          const mapped: PrescriptionRequest[] = await Promise.all(
            filteredOrders.map(async (o: any) => {
              const rawStatus = o.status || o.statut || o.statut_fr || null;
              const mappedStatus = translateStatus(rawStatus);
              const userName = await fetchUserName(o.user_id || o.utilisateur_id || '');
              return {
                id: String(o.id),
                patientName: userName,
                patientFirstName: '',
                requestTime: o.date_demande ? new Date(o.date_demande).toLocaleString() : '',
                prescriptionImage: '',
                status: mappedStatus as 'pending' | 'approved' | 'rejected',
                userId: o.user_id || o.utilisateur_id || o.utilisateurId || null,
              } as any;
            })
          );
          setRequests(mapped);
        }
      } catch (e) {
        console.error('[Professional ClickAndCollect] error loading pending requests', e);
        // keep empty list on error
      }
    })();
  }, []);

  const [selectedRequest, setSelectedRequest] = useState<PrescriptionRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [selectedImageLoading, setSelectedImageLoading] = useState<boolean>(false);

  // Functions to handle request actions 
  const openRequestDetail = (request: PrescriptionRequest) => {
    setSelectedRequest(request);
    setSelectedImageLoading(true);
    console.debug('[Professional ClickAndCollect] fetching temp image for user', request.userId || request.patientName);
    if (request.userId) {
      (async () => {
        try {
          const imgRes = await ordonnancesApi.getLastTempImage(request.userId);
          console.debug('[Professional ClickAndCollect] getLastTempImage response', imgRes);
          if (imgRes.ok && imgRes.data) {
            const img = imgRes.data.image_base64 || imgRes.data.image_base64 || null;
            const mime = imgRes.data.mime_type || 'image/jpeg';
            const uri = img ? `data:${mime};base64,${img}` : (imgRes.data.filepath || null);
            if (uri) {
              setSelectedRequest(prev => prev ? ({ ...prev, prescriptionImage: uri }) : ({ ...request, prescriptionImage: uri } as any));
            }
          }
        } catch (e) {
          console.error('[Professional ClickAndCollect] error fetching image', e);
        } finally {
          setSelectedImageLoading(false);
        }
      })();
    } else {
      setSelectedImageLoading(false);
    }
  };

  const closeRequestDetail = () => {
    if (selectedImageLoading) {
      console.debug('[Professional ClickAndCollect] Cannot close request detail, image is still loading.');
      return;
    }

    if (selectedRequest) {
      setClosedRequests(prev => new Set(prev).add(selectedRequest.id));
    }
    setSelectedRequest(null);
  };

  const handleApprove = () => {
    if (!selectedRequest || isProcessing) return;
    
    setIsProcessing(true);
    (async () => {
      try {
        console.info('[Professional ClickAndCollect] validateOrder request', { requestId: selectedRequest.id });
        const res = await clickcollectApi.validateOrder(selectedRequest.id);
        console.debug('[Professional ClickAndCollect] validateOrder response', res);
        if (res.ok) {
          Alert.alert('Demande approuvée', `QR code envoyé à ${selectedRequest.patientName}`);
          setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
          closeRequestDetail();
        } else {
          console.warn('[Professional ClickAndCollect] validateOrder failed', res);
          Alert.alert('Erreur', res.error || 'Impossible de valider la demande');
        }
      } catch (e: any) {
        console.error('[Professional ClickAndCollect] validateOrder exception', e);
        Alert.alert('Erreur', e?.message || String(e));
      } finally {
        setIsProcessing(false);
      }
    })();
  };

  const handleReject = () => {
    if (isProcessing) return;
    setShowRejectModal(true);
  };

  const sendRejection = () => {
    if (!selectedRequest || isProcessing) return;
    
    setIsProcessing(true);
    (async () => {
      try {
        console.info('[Professional ClickAndCollect] refuseOrder request', { requestId: selectedRequest.id, comment: rejectComment });
        const res = await clickcollectApi.refuseOrder(selectedRequest.id, rejectComment || 'Refused');
        console.debug('[Professional ClickAndCollect] refuseOrder response', res);
        if (res.ok) {
          Alert.alert('Demande refusée', `Commentaire envoyé à ${selectedRequest.patientName}`);
          setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
          setShowRejectModal(false);
          setRejectComment('');
          closeRequestDetail();
        } else {
          console.warn('[Professional ClickAndCollect] refuseOrder failed', res);
          Alert.alert('Erreur', res.error || 'Impossible de refuser la demande');
        }
      } catch (e: any) {
        console.error('[Professional ClickAndCollect] refuseOrder exception', e);
        Alert.alert('Erreur', e?.message || String(e));
      } finally {
        setIsProcessing(false);
      }
    })();
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
                  {selectedRequest && !selectedImageLoading && (
                    <TouchableOpacity onPress={closeRequestDetail} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.prescriptionContainer}>
                  {selectedImageLoading ? (
                    <View style={[styles.prescriptionImage, { justifyContent: 'center', alignItems: 'center' }]}>
                      <ActivityIndicator size="large" color={colors.secondary} />
                      <Text style={styles.loadingText}>Chargement de l'image...</Text>
                    </View>
                  ) : selectedRequest.prescriptionImage ? (
                    <Image
                      source={{ uri: selectedRequest.prescriptionImage }}
                      style={styles.prescriptionImage}
                    />
                  ) : (
                    <View style={[styles.prescriptionImage, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={styles.loadingText}>Image non disponible</Text>
                    </View>
                  )}

                  <Text style={[styles.loadingText, { marginTop: 12 }]}>Vérifiez l'ordonnance : si elle est conforme, appuyez sur « Valider » pour générer et envoyer le QR au patient. Si elle est non conforme, appuyez sur « Refuser » et indiquez le motif.</Text>
                </ScrollView>

                {/* Show buttons only when image is loaded, otherwise show loading message */}
                {selectedImageLoading ? (
                  <View style={styles.loadingButtonsContainer}>
                    <View style={styles.loadingMessageContainer}>
                      <Ionicons name="time-outline" size={24} color={colors.infoTitle} style={{ marginBottom: 8 }} />
                      <Text style={styles.loadingMessageText}>
                        Veuillez patienter pendant le chargement de l'image
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.approveButton, isProcessing && { opacity: 0.5 }]}
                      onPress={handleApprove}
                      disabled={isProcessing}
                    >
                      <Text style={styles.buttonText}>
                        {isProcessing ? 'Traitement...' : 'Valider'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.rejectButton, isProcessing && { opacity: 0.5 }]}
                      onPress={handleReject}
                      disabled={isProcessing}
                    >
                      <Text style={styles.buttonText}>Refuser</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.approveButton, isProcessing && { opacity: 0.5 }]}
                  onPress={sendRejection}
                  disabled={isProcessing}
                >
                  <Text style={styles.buttonText}>
                    {isProcessing ? 'Envoi...' : 'Envoyer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
