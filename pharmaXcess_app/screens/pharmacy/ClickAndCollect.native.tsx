import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, ScrollView, AlertProps, StyleProp, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, CameraCapturedPicture, Camera } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../../styles/ClickAndCollect.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext'; 
import clickcollectApi from '../../utils/api/clickcollect';
import ordonnancesApi from '../../utils/api/ordonnances';

// Interface for storing QR data by profile 
interface ProfileQRData { 
  [profileId: string]: { 
    qrCode: string; 
    isValidated: boolean; 
    photo: CameraCapturedPicture | null; 
  }; 
}

// The ClickAndCollect component allows users to take a photo of their prescription, validate it, and receive confirmation from a pharmacist.
export default function ClickAndCollect(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const { currentProfile, getProfileById } = useProfile();
  const styles = createStyles(colors, fontScale);

  // Global state to store QR data for all profiles
  const [profileQRData, setProfileQRData] = useState<ProfileQRData>({});
  // State to manage camera permissions, visibility, photo capture, and validation status
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState<boolean>(false);
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [isImageValidated, setIsImageValidated] = useState<boolean>(false);
  // State to manage whether the prescription is being validated by a pharmacist and the validation result
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isValidatedByPharmacist, setIsValidatedByPharmacist] = useState<boolean | null>(null);
  const [clickcollectError, setClickcollectError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const pollingCancelledRef = React.useRef(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const userClosedOrderRef = useRef(false);

  // Helper to poll the order status until pro acts (validate/refuse)
  const startPolling = async (startOrderId: number | null) => {
    if (!startOrderId) return;
    pollingCancelledRef.current = false;
    const pollInterval = 3000;
    try {
      while (!pollingCancelledRef.current) {
        // wait
        // eslint-disable-next-line no-await-in-loop
        await new Promise(r => setTimeout(r, pollInterval));
        // eslint-disable-next-line no-await-in-loop
        // eslint-disable-next-line no-await-in-loop
        const statusRes = await clickcollectApi.getOrderStatus(startOrderId);
        if (statusRes.ok && statusRes.data?.order) {
          const status = statusRes.data.order.status;
          if (status === 'valide') {
            const prescriptionQr = statusRes.data.order.contenu_qr || statusRes.data.order.prescription_qr;
            setOrderStatus('valide');
            setIsValidatedByPharmacist(true);
            if (currentProfile?.id) {
              const qrCodeValue = prescriptionQr || `https://pharmaxcess.fr/prescription/${currentProfile.id}/${Date.now()}`;
              setProfileQRData(prev => ({
                ...prev,
                [currentProfile.id]: {
                  photo: prev[currentProfile.id]?.photo || photo,
                  qrCode: qrCodeValue,
                  isValidated: true
                }
              }));
            }
            break;
          }
          if (status === 'refuse') {
            const reason = statusRes.data.order.refusal_reason || 'Refusé par la pharmacie';
            setClickcollectError(reason);
            setOrderStatus('refuse');
            setIsValidatedByPharmacist(false);
            break;
          }
          // still pending
          setOrderStatus('en_attente');
        } else {
          console.warn('[ClickAndCollect] (poll) unexpected status response', statusRes);
        }
      }
    } catch (err: any) {
      console.error('[ClickAndCollect] (poll) error', err);
    } finally {
      // leave isWaiting to caller control; do not forcibly clear it here
    }
  };
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const statusLabel = (s: string | undefined) => {
    if (!s) return '';
    const map: any = { en_attente: 'En attente', pending: 'En attente', valide: 'Validée', refuse: 'Refusée' };
    return map[s] || s;
  };

  const resolveOrderName = (order: any): string => {
    if (!order) return 'Non renseigné';
    const profileId = String(order.user_id || order.userId || order.profile_id || order.client_id || order.clientId || '');
    const prof = (typeof getProfileById === 'function' && profileId) ? getProfileById(profileId) : null;
    return prof?.name || order.profile_name || order.user_name || order.client_name || profileId || String(order.id || order.order_id || 'Non renseigné');
  };
  
  // Reference to the camera view for taking pictures
  const cameraRef = useRef<CameraView | null>(null);
  
  // Retrieve current profile data 
  const currentProfileData = currentProfile ? profileQRData[currentProfile.id] : null;
  
  // Request camera permissions when the component mounts
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  // Effect to reset state when switching profiles 
  useEffect(() => { 
    if (currentProfile?.id) { 
      const profileData = profileQRData[currentProfile.id];
      if (profileData) {
        setPhoto(profileData.photo);
        setIsImageValidated(profileData.isValidated);
        setIsValidatedByPharmacist(profileData.isValidated);
      } else {
        setPhoto(null);
        setIsImageValidated(false);
        setIsValidatedByPharmacist(null);
        setIsWaiting(false);
      }

      // fetch previous click&collect orders for this user and restore state
      (async () => {
        try {
          const listRes = await clickcollectApi.getUserCommands(currentProfile.id);
          if (listRes.ok && Array.isArray(listRes.data?.orders)) {
            const orders = listRes.data.orders;
            setUserOrders(orders);

            // Restore previously opened order if exists in storage
            const key = `clickcollect_selected_order_${currentProfile.id}`;
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const storedId = Number(stored);
              const found = orders.find((o: any) => (o.id || o.order_id) === storedId);
              if (found) {
                setSelectedOrder(found);
                setOrderId(storedId);
                setOrderStatus(found.status);
              }
            }
          }
        } catch (err) {
          console.error('[ClickAndCollect] error fetching previous orders', err);
        }
      })();
    }
  }, [currentProfile?.id]);

  const takePicture = async (): Promise<void> => {
    try {
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setPhoto(photo);
          // Save the photo in the local state 
          if (currentProfile?.id) { 
            setProfileQRData(prev => ({
              ...prev,
              [currentProfile.id]: {
                photo: photo,
                qrCode: prev[currentProfile.id]?.qrCode || '',
                isValidated: false
              }
            }));
          }
        } else {
          Alert.alert('Erreur', 'Impossible de capturer la photo.');
        }
        setCameraVisible(false);
      } else {
        Alert.alert('Erreur', 'La caméra n\'est pas prête.');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la prise de photo.');
    }
  };

  const openOrder = (order: any) => {
    if (!order || !currentProfile?.id) return;

    // Stop previous polling
    pollingCancelledRef.current = true;

    setSelectedOrder(order);
    const id = order.id || order.order_id || null;
    setOrderId(id);
    setOrderStatus(order.status || null);
    setShowOrders(false);

    // Save selected order to AsyncStorage
    (async () => {
      try {
        const key = `clickcollect_selected_order_${currentProfile.id}`;
        await AsyncStorage.setItem(key, String(id));
      } catch (e) {
        console.warn('[ClickAndCollect] failed to persist selected order', e);
      }
    })();

    // Start polling for this order
    if (id && (order.status === 'en_attente' || order.status === 'pending')) {
      pollingCancelledRef.current = false;

      (async () => {
        while (!pollingCancelledRef.current) {
          await new Promise(r => setTimeout(r, 3000));

          if (pollingCancelledRef.current) break;

          const statusRes = await clickcollectApi.getOrderStatus(id);
          if (statusRes.ok && statusRes.data?.order) {
            const status = statusRes.data.order.status;
            if (status === 'valide') {
              if (!userClosedOrderRef.current) {
                setOrderStatus('valide');
                // Update the order in userOrders list
                setUserOrders(prev => prev.map(o => 
                  (o.id === id || o.order_id === id) ? { ...o, status: 'valide' } : o
                ));
              }
              break;
            } else if (status === 'refuse') {
              if (!userClosedOrderRef.current) {
                setOrderStatus('refuse');
                setClickcollectError(statusRes.data.order.refusal_reason || 'Refusé par la pharmacie');
                // Update the order in userOrders list
                setUserOrders(prev => prev.map(o => 
                  (o.id === id || o.order_id === id) ? { ...o, status: 'refuse' } : o
                ));
              }
              break;
            } else {
              if (!userClosedOrderRef.current) setOrderStatus('en_attente');
            }
          }
        }
      })();
    }
  };

  const resetProcess = (): void => {
    setPhoto(null);
    setIsImageValidated(false);
    setIsWaiting(false);
    setIsValidatedByPharmacist(null);
    setClickcollectError(null);
    // Delete the saved photo for the current profile
    if (currentProfile?.id) { 
      setProfileQRData(prev => ({
        ...prev,
        [currentProfile.id]: {
          photo: null,
          qrCode: prev[currentProfile.id]?.qrCode || '',
          isValidated: false
        }
      }));
    }
    // cancel any ongoing polling
    pollingCancelledRef.current = true;
    setOrderId(null);
    setOrderStatus(null);
    setSelectedOrder(null);
    // remove persisted selected order
    (async () => {
      try {
        if (currentProfile?.id) {
          const key = `clickcollect_selected_order_${currentProfile.id}`;
          await AsyncStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('[ClickAndCollect] failed to remove persisted selected order', e);
      }
    })();
  };

  const handleImageValidation = async (): Promise<void> => {
    // Flow:
    // 1) upload temp image -> returns temp_image id
    // 2) create ordonnance from temp image -> returns ordonnance_id
    // 3) send clickcollect order referencing ordonnance_id
    if (!photo || !currentProfile?.id) {
      Alert.alert('Erreur', 'Photo ou profil manquant');
      return;
    }

    setClickcollectError(null);
    setIsImageValidated(true);
    setIsWaiting(true);

    let newOrderId: number | null = null;
    let newOrder: any = null;

    try {
      // upload file (React Native file URI)
      const uploadRes = await ordonnancesApi.uploadTempFile(currentProfile.id, photo.uri, `ord_${Date.now()}.jpg`, 'image/jpeg');
      if (!uploadRes.ok) throw new Error(uploadRes.error || 'Upload failed');
      const tempId = uploadRes.data?.id;

      // create ordonnance using temp image
      const createRes = await ordonnancesApi.createOrdonnance({ user_id: currentProfile.id, temp_image_id: tempId });
      if (!createRes.ok) throw new Error(createRes.error || 'Create ordonnance failed');
      const ordonnanceId = createRes.data?.ordonnance_id || createRes.data?.ordonnanceId || null;

      // send click & collect order
      const sendRes = await clickcollectApi.sendOrder(currentProfile.id, ordonnanceId);
      if (!sendRes.ok) throw new Error(sendRes.error || 'Send order failed');
      
      newOrderId = sendRes.data?.order_id || sendRes.data?.orderId;
      
      // Create a proper order object matching the API response format
      newOrder = {
        id: newOrderId,
        order_id: newOrderId,
        user_id: currentProfile.id,
        profile_id: currentProfile.id,
        status: 'en_attente',
        date_demande: new Date().toISOString(),
        created_at: new Date().toISOString(),
        // Include other fields that might be needed
        refusal_reason: null,
        contenu_qr: null
      };

      // IMMEDIATELY add to userOrders and set as selectedOrder
      setUserOrders(prev => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
      setOrderId(newOrderId);
      setOrderStatus('en_attente');

      // Save to AsyncStorage immediately
      const key = `clickcollect_selected_order_${currentProfile.id}`;
      await AsyncStorage.setItem(key, String(newOrderId));

      // Start polling for status updates
      pollingCancelledRef.current = false;
      while (!pollingCancelledRef.current) {
        await new Promise(r => setTimeout(r, 3000));
        
        if (pollingCancelledRef.current) break;

        const statusRes = await clickcollectApi.getOrderStatus(newOrderId);
        if (statusRes.ok && statusRes.data?.order) {
          const status = statusRes.data.order.status;
          
          // Update the order in state
          const updatedOrder = {
            ...newOrder,
            ...statusRes.data.order,
            status: status
          };
          
          setSelectedOrder(updatedOrder);
          
          // Update in userOrders list
          setUserOrders(prev => prev.map(o => 
            o.id === newOrderId || o.order_id === newOrderId ? updatedOrder : o
          ));

          if (status === 'valide') {
            const prescriptionQr = statusRes.data.order.contenu_qr || statusRes.data.order.prescription_qr;
            setOrderStatus('valide');
            setIsValidatedByPharmacist(true);
            if (currentProfile?.id) {
              const qrCodeValue = prescriptionQr || `https://pharmaxcess.fr/prescription/${currentProfile.id}/${Date.now()}`;
              setProfileQRData(prev => ({
                ...prev,
                [currentProfile.id]: {
                  photo: prev[currentProfile.id]?.photo || photo,
                  qrCode: qrCodeValue,
                  isValidated: true
                }
              }));
            }
            break;
          } else if (status === 'refuse') {
            const reason = statusRes.data.order.refusal_reason || 'Refusé par la pharmacie';
            setClickcollectError(reason);
            setOrderStatus('refuse');
            setIsValidatedByPharmacist(false);
            break;
          } else {
            setOrderStatus('en_attente');
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      setClickcollectError(msg);
      console.error('[ClickAndCollect] error during validation flow', { error: msg, newOrderId });
      Alert.alert('Erreur', msg);
      
      // If we created an order but got an error, still add it to the list
      if (newOrder) {
        newOrder.status = 'error';
        newOrder.error = msg;
        setUserOrders(prev => [newOrder, ...prev]);
      }
    } finally {
      setIsWaiting(false);
    }
  };

  const toggleShowOrders = () => {
    setShowOrders(!showOrders);
  };

  const goBackToList = () => {
    userClosedOrderRef.current = true;
    setSelectedOrder(null);
    setShowOrders(false);
    setIsWaiting(false);
    setOrderId(null);
    setOrderStatus(null);
    setClickcollectError(null);
    setPhoto(null);
    setIsImageValidated(false);
    pollingCancelledRef.current = true;
    
    // Remove from AsyncStorage
    (async () => {
      try {
        if (currentProfile?.id) {
          const key = `clickcollect_selected_order_${currentProfile.id}`;
          await AsyncStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('[ClickAndCollect] failed to remove persisted selected order', e);
      }
    })();
  };

  // Debug effect
  useEffect(() => {
    console.debug('[ClickAndCollect] State:', { 
      selectedOrder: selectedOrder?.id, 
      showOrders, 
      userOrders: userOrders.length,
      orderStatus,
      isWaiting,
      photo: !!photo
    });
  }, [selectedOrder, showOrders, userOrders.length, orderStatus, isWaiting, photo]);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Demande de permission de la caméra...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Accès à la caméra refusé. Veuillez activer les permissions dans les paramètres.</Text>
      </View>
    );
  }

  // Main render logic
  return (
    <View style={styles.container}>
      {cameraVisible ? (
        // Camera view
        <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </CameraView>
      ) : selectedOrder ? (
        // Show selected order details
        <View style={styles.centeredContent}>
          {orderStatus === 'en_attente' || isWaiting ? (
            // Order is pending validation
            <>
              <Text style={styles.loadingText}>Votre ordonnance est en cours de validation...</Text>
              <ActivityIndicator size="large" color={colors.secondary} />
              <TouchableOpacity 
                style={[styles.button, { marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'refuse' ? (
            // Order was refused
            <>
              <Text style={styles.loadingText}>Raison du refus :</Text>
              <Text style={[styles.loadingText, { color: colors.error, marginVertical: 10 }]}>
                {selectedOrder?.refusal_reason || clickcollectError || 'Raison non spécifiée'}
              </Text>
              <TouchableOpacity 
                style={[styles.button, { marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'valide' ? (
            // Order was validated
            <>
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Votre ordonnance a été validée !</Text>
                <Text style={styles.qrText}>
                  Présentez ce QR code auprès d'un distributeur PharmaXcess
                </Text>
                {(() => {
                  try {
                    const parsed = JSON.parse(selectedOrder.contenu_qr);
                    if (!parsed?.image) return null;

                    return (
                      <>
                        <Image
                          source={{ uri: `data:image/png;base64,${parsed.image}` }}
                          style={styles.qrImage}
                        />
                        <Text style={styles.qrText}>
                          Ou utilisez ce code : {parsed.code_unique}
                        </Text>
                      </>
                    );
                  } catch (e) {
                    console.warn('QR invalide', e);
                    return (
                      <Text style={styles.qrText}>
                        QR code indisponible
                      </Text>
                    );
                  }
                })()}
              </View>
              <TouchableOpacity 
                style={[styles.button, { marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            // Default order details view
            <>
              <Text style={styles.qrTitle}>Détails de la demande</Text>
              <Text style={styles.loadingText}>Nom: {resolveOrderName(selectedOrder)}</Text>
              <Text style={styles.loadingText}>Statut: {statusLabel(selectedOrder.status)}</Text>
              <Text style={styles.loadingText}>
                Date: {formatDate(selectedOrder.date_demande || selectedOrder.created_at)}
              </Text>
              
              <TouchableOpacity 
                style={[styles.button, { marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        // Main view - no camera, no selected order
        <View style={styles.centeredContent}>
          {/* History toggle and list */}
          {!photo && !isWaiting && !orderStatus && userOrders.length > 0 && (
            <View style={{ width: '100%', marginBottom: 12 }}>
              <TouchableOpacity 
                style={[styles.button, { paddingVertical: 8 }]} 
                onPress={toggleShowOrders}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>
                    {showOrders ? 'Masquer mes demandes' : 'Voir mes demandes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {showOrders && (
                <ScrollView style={{ maxHeight: 220, marginTop: 8 }}>
                  {userOrders.map((order: any) => (
                    <TouchableOpacity 
                      key={order.id || order.order_id} 
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: colors.card,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: colors.border
                      }} 
                      onPress={() => openOrder(order)}
                    >
                      <Text style={[styles.loadingText, { fontWeight: 'bold' }]}>
                        Demande du {formatDate(order.date_demande || order.created_at)}
                      </Text>
                      <Text style={[styles.loadingText, { 
                        color: order.status === 'valide' ? colors.success : 
                               order.status === 'refuse' ? colors.error : 
                               colors.secondary 
                      }]}>
                        Statut: {statusLabel(order.status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Photo taking/validation section */}
          {!photo ? (
            <TouchableOpacity style={styles.card} onPress={() => setCameraVisible(true)}>
              <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                <Text style={styles.cardText}>Prendre une photo de votre ordonnance</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.qrContainer}>
              <Image source={{ uri: photo.uri }} style={styles.image} />
              <Text style={styles.loadingText}>Voulez-vous valider cette photo ou recommencer ?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.rejectButton} onPress={resetProcess}>
                  <Text style={styles.buttonText}>Recommencer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveButton} onPress={handleImageValidation}>
                  <Text style={styles.buttonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
