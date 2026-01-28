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
  const { currentProfile } = useProfile();
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
        console.debug('[ClickAndCollect] (poll) getOrderStatus request', { orderId: startOrderId });
        // eslint-disable-next-line no-await-in-loop
        const statusRes = await clickcollectApi.getOrderStatus(startOrderId);
        console.debug('[ClickAndCollect] (poll) getOrderStatus response', statusRes);
        if (statusRes.ok && statusRes.data?.order) {
          const status = statusRes.data.order.status;
          console.debug('[ClickAndCollect] (poll) order status', status);
          if (status === 'valide') {
            const prescriptionQr = statusRes.data.order.contenu_qr || statusRes.data.order.prescription_qr;
            setOrderStatus('valide');
            setIsValidatedByPharmacist(true);
            console.info('[ClickAndCollect] (poll) order validated', { orderId: startOrderId, prescriptionQr });
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
            console.info('[ClickAndCollect] (poll) order refused', { orderId: startOrderId, reason });
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
        // Reset for a new profile
        setPhoto(null);
        setIsImageValidated(false);
        setIsValidatedByPharmacist(null);
        setIsWaiting(false);
    }
    // fetch previous click&collect orders for this user and restore state
    (async () => {
      try {
        console.debug('[ClickAndCollect] fetch previous orders for user', currentProfile.id);
        const listRes = await clickcollectApi.getUserCommands(currentProfile.id);
        console.debug('[ClickAndCollect] getUserCommands response', listRes);
        if (listRes.ok && Array.isArray(listRes.data?.orders)) {
          const orders = listRes.data.orders;
          // store full list for history UI (keep order as returned)
          setUserOrders(orders);
          console.info('[ClickAndCollect] fetched orders count', orders.length);
          // Restore previously opened order (if any) from AsyncStorage
          try {
            const key = `clickcollect_selected_order_${currentProfile.id}`;
            const stored = await AsyncStorage.getItem(key);
            if (stored) {
              const storedId = Number(stored);
              const found = orders.find((o: any) => (o.id || o.order_id) === storedId);
              if (found) {
                console.debug('[ClickAndCollect] restoring selected order from storage', storedId);
                // open without changing showOrders (we restore the exact view)
                // use openOrder to ensure polling starts if needed
                openOrder(found);
              }
            }
          } catch (e) {
            console.warn('[ClickAndCollect] failed to restore selected order', e);
          }
          // Do NOT auto-open the last order otherwise; user will choose when none stored
        } else {
          console.debug('[ClickAndCollect] no previous orders or unexpected response', listRes);
        }
      } catch (err: any) {
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
    if (!order) return;
    console.debug('[ClickAndCollect] openOrder', order);
    setSelectedOrder(order);
    const id = order.id || order.order_id || null;
    setOrderId(id);
    setOrderStatus(order.status || null);
    // hide the list when opening a specific order
    setShowOrders(false);
    // persist selected order id so we can restore if the user leaves and comes back
    (async () => {
      try {
        if (currentProfile?.id && id) {
          const key = `clickcollect_selected_order_${currentProfile.id}`;
          await AsyncStorage.setItem(key, String(id));
        }
      } catch (e) {
        console.warn('[ClickAndCollect] failed to persist selected order', e);
      }
    })();
    // if the selected order is still pending, start polling to follow updates
    if ((order.status === 'en_attente' || order.status === 'pending') && id) {
      setIsWaiting(true);
      startPolling(id);
    }
    if (order.status === 'valide') {
      const prescriptionQr = order.contenu_qr || order.prescription_qr || '';
      if (currentProfile?.id) {
        setProfileQRData(prev => ({
          ...prev,
          [currentProfile.id]: {
            photo: prev[currentProfile.id]?.photo || photo,
            qrCode: prescriptionQr || prev[currentProfile.id]?.qrCode || '',
            isValidated: true
          }
        }));
      }
      setIsValidatedByPharmacist(true);
    } else if (order.status === 'refuse') {
      const reason = order.refusal_reason || order.refusalReason || 'Refusé par la pharmacie';
      setClickcollectError(reason);
      setIsValidatedByPharmacist(false);
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
    console.debug('[ClickAndCollect] resetProcess called for profile', currentProfile?.id);
    // cancel any ongoing polling
    pollingCancelledRef.current = true;
    setOrderId(null);
    setOrderStatus(null);
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

  const handleImageValidation = (): void => {
    // Flow:
    // 1) upload temp image -> returns temp_image id
    // 2) create ordonnance from temp image -> returns ordonnance_id
    // 3) send clickcollect order referencing ordonnance_id
    if (!photo || !currentProfile?.id) {
      Alert.alert('Erreur', 'Photo ou profil manquant');
      return;
    }

    (async () => {
      let orderId: any = null;
      try {
        setClickcollectError(null);
        setIsImageValidated(true);
        setIsWaiting(true);
        console.info('[ClickAndCollect] start validation flow', { profileId: currentProfile.id });

        // upload file (React Native file URI)
        console.debug('[ClickAndCollect] uploadTempFile request', { user_id: currentProfile.id, uri: photo.uri });
        const uploadRes = await ordonnancesApi.uploadTempFile(currentProfile.id, photo.uri, `ord_${Date.now()}.jpg`, 'image/jpeg');
        console.debug('[ClickAndCollect] uploadTempFile response', uploadRes);
        if (!uploadRes.ok) throw new Error(uploadRes.error || 'Upload failed');
        const tempId = uploadRes.data?.id;

        // create ordonnance using temp image
        console.debug('[ClickAndCollect] createOrdonnance request', { user_id: currentProfile.id, temp_image_id: tempId });
        const createRes = await ordonnancesApi.createOrdonnance({ user_id: currentProfile.id, temp_image_id: tempId });
        console.debug('[ClickAndCollect] createOrdonnance response', createRes);
        if (!createRes.ok) throw new Error(createRes.error || 'Create ordonnance failed');
        const ordonnanceId = createRes.data?.ordonnance_id || createRes.data?.ordonnanceId || null;

        // send click & collect order
        console.debug('[ClickAndCollect] sendOrder request', { user_id: currentProfile.id, ordonnance_id: ordonnanceId });
        const sendRes = await clickcollectApi.sendOrder(currentProfile.id, ordonnanceId);
        console.debug('[ClickAndCollect] sendOrder response', sendRes);
        if (!sendRes.ok) throw new Error(sendRes.error || 'Send order failed');
        orderId = sendRes.data?.order_id || sendRes.data?.orderId;

        // start polling order status until a pro accepts or refuses
        const pollInterval = 3000;
        let prescriptionQr: string | undefined;
        // store order id and status for UI
        setOrderId(orderId as number);
        setOrderStatus('en_attente');
        pollingCancelledRef.current = false;
        while (!pollingCancelledRef.current) {
          // wait
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, pollInterval));
          // eslint-disable-next-line no-await-in-loop
          console.debug('[ClickAndCollect] getOrderStatus request', { orderId });
          const statusRes = await clickcollectApi.getOrderStatus(orderId);
          console.debug('[ClickAndCollect] getOrderStatus response', statusRes);
          if (statusRes.ok && statusRes.data?.order) {
            const status = statusRes.data.order.status;
            console.debug('[ClickAndCollect] order status', status);
            if (status === 'valide') {
              prescriptionQr = statusRes.data.order.contenu_qr || statusRes.data.order.prescription_qr;
              setOrderStatus('valide');
              setIsValidatedByPharmacist(true);
              console.info('[ClickAndCollect] order validated', { orderId, prescriptionQr });
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
              console.info('[ClickAndCollect] order refused', { orderId, reason });
              break;
            }
            // if still 'en_attente' keep looping and show waiting state
            setOrderStatus('en_attente');
          } else {
            console.warn('[ClickAndCollect] unexpected status response', statusRes);
          }
        }

      } catch (err: any) {
        const msg = err?.message || String(err);
        setClickcollectError(msg);
        console.error('[ClickAndCollect] error during validation flow', { error: msg, orderId });
        Alert.alert('Erreur', msg);
      } finally {
        setIsWaiting(false);
      }
    })();
  };

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

  return (
    <View style={styles.container}>
      {cameraVisible ? (
        // The camera view is the camera is visible. 
        <CameraView style={styles.camera} ref={(ref) => { cameraRef.current = ref; }}>
          {/* Display a button at the bottom to take a picture */}
          <TouchableOpacity style={styles.cameraButton} onPress={takePicture}>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </CameraView>
      ) : isWaiting ? (
        // Display a loading indicator while the prescription is being validated
        <View style={styles.centeredContent}>
          <Text style={styles.loadingText}>Votre ordonnance est en cours de validation...</Text>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : orderStatus !== null ? (
        // Display order status (en_attente / refuse / valide)
        <View style={styles.centeredContent}>
          {orderStatus === 'en_attente' ? (
            <>
              <Text style={styles.loadingText}>Votre demande est en attente de validation par la pharmacie...</Text>
              <ActivityIndicator size="large" color={colors.secondary} />
              {orderId ? <Text style={[styles.loadingText, { marginTop: 8 }]}>ID commande: {orderId}</Text> : null}
              <TouchableOpacity
                style={[styles.button, { marginTop: 12 }]}
                onPress={() => {
                  // go back to the orders list instead of cancelling the request
                  pollingCancelledRef.current = true;
                  setIsWaiting(false);
                  setSelectedOrder(null);
                  setOrderStatus(null);
                  setShowOrders(true);
                }}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'refuse' ? (
            <>
              <Text style={styles.loadingText}>Demande refusée :</Text>
              <Text style={styles.loadingText}>{clickcollectError}</Text>
              <TouchableOpacity style={styles.button} onPress={resetProcess}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Recommencer</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'valide' ? (
            currentProfileData?.qrCode ? (
              <View style={styles.qrContainer}>
                <Text style={styles.qrTitle}>Votre ordonnance a été validée !</Text>
                <View style={styles.qrCodeWrapper}>
                  <QRCode value={currentProfileData.qrCode} size={200} color={colors.secondary} />
                </View>
                <Text style={styles.qrText}>Présentez ce QR code en pharmacie</Text>
              </View>
            ) : (
              <>
                <Text style={styles.loadingText}>Validation reçue mais QR non disponible.</Text>
                <TouchableOpacity style={styles.button} onPress={resetProcess}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>Recommencer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )
          ) : null}
        </View>
      ) : (
        // The initial state or when no photo has been taken yet
        <View style={styles.centeredContent}>
            {/* History toggle and list */}
            {userOrders && userOrders.length > 0 && (
              <View style={{ width: '100%', marginBottom: 12 }}>
                <TouchableOpacity style={[styles.button, { paddingVertical: 8 }]} onPress={() => setShowOrders(prev => !prev)}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>{showOrders ? 'Masquer mes demandes' : 'Voir mes demandes'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {showOrders && (
                  <ScrollView style={{ maxHeight: 220, marginTop: 8 }}>
                    {userOrders.map((o: any) => (
                      <TouchableOpacity key={o.id || o.order_id} style={{ padding: 8, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8 }} onPress={() => openOrder(o)}>
                        <Text style={styles.loadingText}>ID: {o.id || o.order_id}</Text>
                        <Text style={styles.loadingText}>Date: {formatDate(o.date_demande || o.date || o.created_at)}</Text>
                        <Text style={styles.loadingText}>Statut: {statusLabel(o.status)}</Text>
                        {o.status === 'refuse' && <Text style={styles.loadingText}>Raison: {o.refusal_reason || o.refusalReason}</Text>}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
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
                {selectedOrder ? (
              <View style={{ marginTop: 12, width: '100%' }}>
                <Text style={styles.qrTitle}>Détails de la demande</Text>
                <Text style={styles.loadingText}>ID: {selectedOrder.id || selectedOrder.order_id}</Text>
                <Text style={styles.loadingText}>Statut: {selectedOrder.status}</Text>
                    <TouchableOpacity style={[styles.button, { marginTop: 8 }]} onPress={async () => {
                      // stop polling and go back to the list
                      pollingCancelledRef.current = true;
                      setIsWaiting(false);
                      setSelectedOrder(null);
                      setOrderStatus(null);
                      setShowOrders(true);
                      try {
                        if (currentProfile?.id) {
                          const key = `clickcollect_selected_order_${currentProfile.id}`;
                          await AsyncStorage.removeItem(key);
                        }
                      } catch (e) {
                        console.warn('[ClickAndCollect] failed to remove persisted selected order', e);
                      }
                    }}>
                      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour à la liste</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                {selectedOrder.status === 'valide' ? (
                  <View style={{ marginTop: 8 }}>
                    {profileQRData[currentProfile?.id]?.qrCode ? (
                      <QRCode value={profileQRData[currentProfile?.id].qrCode} size={160} color={colors.secondary} />
                    ) : (
                      <Text style={styles.loadingText}>QR indisponible</Text>
                    )}
                  </View>
                ) : selectedOrder.status === 'refuse' ? (
                  <Text style={styles.loadingText}>Raison: {selectedOrder.refusal_reason || selectedOrder.refusalReason}</Text>
                ) : null}
                <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => setSelectedOrder(null)}>
                  <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>Fermer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : null}
        </View>
      )}
    </View>
  );
}
