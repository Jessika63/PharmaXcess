import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  Dimensions,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../../styles/ClickAndCollect.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext'; 
import clickcollectApi from '../../utils/api/clickcollect';
import { CustomPicker } from '../../components';
import config from '../../config';
import { useFocusEffect } from '@react-navigation/native';

// Interface for storing QR data by profile 
interface ProfileQRData { 
  [profileId: string]: { 
    qrCode: string; 
    isValidated: boolean; 
    selectedOrdonnanceId: string | null; 
  }; 
}

export default function ClickAndCollect(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const { currentProfile, getProfileById } = useProfile();
  const styles = createStyles(colors, fontScale);
  const { height: screenHeight } = Dimensions.get('window');

  // Global state to store QR data for all profiles
  const [profileQRData, setProfileQRData] = useState<ProfileQRData>({});
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isValidatedByPharmacist, setIsValidatedByPharmacist] = useState<boolean | null>(null);
  const [clickcollectError, setClickcollectError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const pollingCancelledRef = React.useRef(false);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Nouveaux états pour la sélection d'ordonnance
  const [ordonnances, setOrdonnances] = useState<Array<{ label: string; value: string }>>([]);
  const [selectedOrdonnanceId, setSelectedOrdonnanceId] = useState<string | null>(null);
  const [isLoadingOrdonnances, setIsLoadingOrdonnances] = useState<boolean>(false);

  const userClosedOrderRef = useRef(false);
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  const statusLabel = (s: string | undefined) => {
    if (!s) return '';
    const map: any = { 
      en_attente: 'En attente', 
      pending: 'En attente', 
      valide: 'Validée', 
      refuse: 'Refusée',
      error: 'Erreur'
    };
    return map[s] || s;
  };

  const resolveOrderName = (order: any): string => {
    if (!order) return 'Non renseigné';
    const profileId = String(order.user_id || order.userId || order.profile_id || order.client_id || order.clientId || '');
    const prof = (typeof getProfileById === 'function' && profileId) ? getProfileById(profileId) : null;
    return prof?.name || order.profile_name || order.user_name || order.client_name || profileId || String(order.id || order.order_id || 'Non renseigné');
  };
  
  // Retrieve current profile data 
  const currentProfileData = currentProfile ? profileQRData[currentProfile.id] : null;
  
  // Function to fetch user's prescriptions
  const fetchUserPrescriptions = async () => {
    const apiBase = config?.backendUrl || '';
    if (!apiBase) return;
    
    setIsLoadingOrdonnances(true);
    try {
      const res = await fetch(`${apiBase}/prescription-reminders/prescription`, {
        credentials: 'include'
      });
      console.log('[ClickAndCollect] fetchUserPrescriptions response', res.status);
      if (res.ok) {
        const data = await res.json();
        const prescriptionsData = data || [];
        
        const formattedOrdonnances = prescriptionsData.map((ordonnance: any) => ({
          label: `${ordonnance.description || 'Ordonnance'} — ${ordonnance.date_expiration ? new Date(ordonnance.date_expiration).toLocaleDateString() : ''}`,
          value: String(ordonnance.id)
        }));
        
        setOrdonnances(formattedOrdonnances);
        
        // Si une ordonnance était déjà sélectionnée pour ce profil, la restaurer
        if (currentProfileData?.selectedOrdonnanceId) {
          setSelectedOrdonnanceId(currentProfileData.selectedOrdonnanceId);
        }
      }
    } catch (error) {
      console.error('[ClickAndCollect] error fetching user prescriptions', error);
    } finally {
      setIsLoadingOrdonnances(false);
    }
  };

  const refreshOrdonnances = async () => {
    const apiBase = config?.backendUrl || '';
    if (!apiBase || !currentProfile?.id) return;
    
    setIsLoadingOrdonnances(true);
    try {
      const res = await fetch(`${apiBase}/prescription-reminders/prescription`, {
        credentials: 'include'
      });
      console.log('[ClickAndCollect] refreshOrdonnances response', res.status);
      if (res.ok) {
        const data = await res.json();
        const prescriptionsData = data || [];
        
        const formattedOrdonnances = prescriptionsData.map((ordonnance: any) => ({
          label: `${ordonnance.description || 'Ordonnance'} — ${ordonnance.date_expiration ? new Date(ordonnance.date_expiration).toLocaleDateString() : ''}`,
          value: String(ordonnance.id)
        }));
        
        setOrdonnances(formattedOrdonnances);
        
        // Vérifier si l'ordonnance actuellement sélectionnée existe encore
        if (selectedOrdonnanceId) {
          const stillExists = formattedOrdonnances.some(o => o.value === selectedOrdonnanceId);
          if (!stillExists) {
            setSelectedOrdonnanceId(null);
            // Mettre à jour aussi le profileQRData
            setProfileQRData(prev => ({
              ...prev,
              [currentProfile.id]: {
                selectedOrdonnanceId: null,
                qrCode: prev[currentProfile.id]?.qrCode || '',
                isValidated: false
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error('[ClickAndCollect] error refreshing user prescriptions', error);
    } finally {
      setIsLoadingOrdonnances(false);
    }
  };

  // Effect to reset state when switching profiles 
  useEffect(() => { 
    if (currentProfile?.id) { 
      const profileData = profileQRData[currentProfile.id];
      if (profileData) {
        setSelectedOrdonnanceId(profileData.selectedOrdonnanceId);
      } else {
        setSelectedOrdonnanceId(null);
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

      // Charger les ordonnances de l'utilisateur
      refreshOrdonnances();
    }
  }, [currentProfile?.id]);

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
                setUserOrders(prev => prev.map(o => 
                  (o.id === id || o.order_id === id) ? { ...o, status: 'valide' } : o
                ));
              }
              break;
            } else if (status === 'refuse') {
              if (!userClosedOrderRef.current) {
                setOrderStatus('refuse');
                setClickcollectError(statusRes.data.order.refusal_reason || 'Refusé par la pharmacie');
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
    setSelectedOrdonnanceId(null);
    setIsWaiting(false);
    setIsValidatedByPharmacist(null);
    setClickcollectError(null);
    if (currentProfile?.id) { 
      setProfileQRData(prev => ({
        ...prev,
        [currentProfile.id]: {
          selectedOrdonnanceId: null,
          qrCode: prev[currentProfile.id]?.qrCode || '',
          isValidated: false
        }
      }));
    }
    pollingCancelledRef.current = true;
    setOrderId(null);
    setOrderStatus(null);
    setSelectedOrder(null);
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
    if (!selectedOrdonnanceId || !currentProfile?.id) {
      Alert.alert('Erreur', 'Veuillez sélectionner une ordonnance');
      return;
    }

    setClickcollectError(null);
    setIsWaiting(true);

    let newOrderId: number | null = null;
    let newOrder: any = null;

    try {
      const sendRes = await clickcollectApi.sendOrder(currentProfile.id, selectedOrdonnanceId);
      if (!sendRes.ok) throw new Error(sendRes.error || 'Send order failed');
      
      newOrderId = sendRes.data?.order_id || sendRes.data?.orderId;
      
      newOrder = {
        id: newOrderId,
        order_id: newOrderId,
        user_id: currentProfile.id,
        profile_id: currentProfile.id,
        status: 'en_attente',
        date_demande: new Date().toISOString(),
        created_at: new Date().toISOString(),
        refusal_reason: null,
        contenu_qr: null
      };

      setUserOrders(prev => [newOrder, ...prev]);
      setSelectedOrder(newOrder);
      setOrderId(newOrderId);
      setOrderStatus('en_attente');

      const key = `clickcollect_selected_order_${currentProfile.id}`;
      await AsyncStorage.setItem(key, String(newOrderId));

      setProfileQRData(prev => ({
        ...prev,
        [currentProfile.id]: {
          selectedOrdonnanceId: selectedOrdonnanceId,
          qrCode: prev[currentProfile.id]?.qrCode || '',
          isValidated: false
        }
      }));

      pollingCancelledRef.current = false;
      while (!pollingCancelledRef.current) {
        await new Promise(r => setTimeout(r, 3000));
        
        if (pollingCancelledRef.current) break;

        const statusRes = await clickcollectApi.getOrderStatus(newOrderId);
        if (statusRes.ok && statusRes.data?.order) {
          const status = statusRes.data.order.status;
          
          const updatedOrder = {
            ...newOrder,
            ...statusRes.data.order,
            status: status
          };
          
          setSelectedOrder(updatedOrder);
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
                  selectedOrdonnanceId: selectedOrdonnanceId,
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
      
      // Vérification spécifique pour l'erreur de commande existante
      if (msg.includes("already exists for this user and prescription")) {
        // Extraire l'ID de la commande existante depuis le message d'erreur
        const match = msg.match(/order \(ID (\d+)\)/);
        const existingOrderId = match ? match[1] : null;
        
        let errorMessage = "Une demande est déjà en cours pour cette ordonnance.";
        
        if (existingOrderId) {
          errorMessage += `\n\nID de la demande existante : ${existingOrderId}`;
          
          // Rechercher la commande existante dans userOrders
          const existingOrder = userOrders.find((order: any) => 
            (order.id === Number(existingOrderId) || order.order_id === Number(existingOrderId))
          );
          
          if (existingOrder) {
            // Si on trouve la commande, on peut afficher plus de détails
            errorMessage += `\nStatut : ${statusLabel(existingOrder.status)}`;
            if (existingOrder.date_demande || existingOrder.created_at) {
              errorMessage += `\nDate : ${formatDate(existingOrder.date_demande || existingOrder.created_at)}`;
            }
          }
        }
        
        // Afficher une alerte avec l'option pour ouvrir la commande existante
        Alert.alert(
          "Demande déjà existante",
          errorMessage,
          [
            { text: "OK", style: "cancel" },
            ...(existingOrderId ? [{
              text: "Voir la demande existante",
              onPress: () => {
                const existingOrder = userOrders.find((order: any) => 
                  (order.id === Number(existingOrderId) || order.order_id === Number(existingOrderId))
                );
                if (existingOrder) {
                  openOrder(existingOrder);
                }
              }
            }] : [])
          ]
        );
        
        // On ne veut pas afficher cette erreur comme une erreur standard
        setClickcollectError(null);
      } else {
        // Pour les autres erreurs, comportement normal
        setClickcollectError(msg);
        console.error('[ClickAndCollect] error during validation flow', { error: msg, newOrderId });
        Alert.alert('Erreur', msg);
      }
      
      if (newOrder) {
        newOrder.status = 'error';
        newOrder.error = msg;
        setUserOrders(prev => [newOrder, ...prev]);
      }
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
    setSelectedOrdonnanceId(null);
    pollingCancelledRef.current = true;
    
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

  // Calcul de la hauteur pour la liste des commandes
  const ordersListHeight = Math.min(220, screenHeight * 0.4);

  useEffect(() => {
    if (selectedOrdonnanceId && showOrders) {
      setShowOrders(false);
    }
  }, [selectedOrdonnanceId, showOrders]);

  useFocusEffect(
    React.useCallback(() => {
      // Recharger les ordonnances quand l'écran redevient focus
      if (currentProfile?.id) {
        refreshOrdonnances();
      }
      
      return () => {
        // Optionnel: nettoyage si nécessaire
      };
    }, [currentProfile?.id])
  );

  return (
    <View style={[styles.container, { flex: 1 }]}>
      {selectedOrder ? (
        <ScrollView 
          contentContainerStyle={[
            styles.centeredContent, 
            { 
              flexGrow: 1, 
              justifyContent: 'center', 
              paddingVertical: 20 
            }
          ]}
        >
          {orderStatus === 'en_attente' || isWaiting ? (
            <>
              <Text style={styles.loadingText}>Votre ordonnance est en cours de validation...</Text>
              <ActivityIndicator size="large" color={colors.secondary} style={{ marginVertical: 20 }} />
              <TouchableOpacity 
                style={[styles.button, { width: '100%', marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.gradient, { width: '100%' }]}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'refuse' ? (
            <>
              <Text style={styles.loadingText}>Raison du refus :</Text>
              <Text style={[styles.loadingText, { color: colors.error, marginVertical: 10 }]}>
                {selectedOrder?.refusal_reason || clickcollectError || 'Raison non spécifiée'}
              </Text>
              <TouchableOpacity 
                style={[styles.button, { width: '100%', marginTop: 20 }]} 
                onPress={goBackToList}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.gradient, { width: '100%' }]}>
                  <Text style={styles.buttonText}>Retour à la liste</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : orderStatus === 'valide' ? (
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
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* History section - seulement quand il y a des commandes */}
          {!isWaiting && !orderStatus &&  !selectedOrdonnanceId && userOrders.length > 0 && (
            <View style={{ width: '100%', marginBottom: 20, paddingHorizontal: 16, paddingTop: 20 }}>
              <TouchableOpacity 
                style={[styles.button, { paddingVertical: 12 }]} 
                onPress={toggleShowOrders}
              >
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>
                    {showOrders ? 'Masquer mes demandes' : 'Voir mes demandes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {showOrders && (
                <View style={{ 
                  marginTop: 12,
                  height: ordersListHeight,
                  borderRadius: 8,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border
                }}>
                  <FlatList
                    data={userOrders}
                    keyExtractor={(item, index) => String(item.id || item.order_id || index)}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity 
                        style={{
                          padding: 16,
                          borderBottomWidth: index < userOrders.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border
                        }} 
                        onPress={() => openOrder(item)}
                      >
                        <Text style={[styles.loadingText, { fontWeight: 'bold', marginBottom: 4 }]}>
                          Demande du {formatDate(item.date_demande || item.created_at)}
                        </Text>
                        <Text style={[styles.loadingText, { 
                          color: item.status === 'valide' ? colors.success : 
                                 item.status === 'refuse' ? colors.error : 
                                 item.status === 'error' ? colors.error :
                                 colors.secondary,
                          fontSize: 14
                        }]}>
                          Statut: {statusLabel(item.status)}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={true}
                  />
                </View>
              )}
            </View>
          )}

          {/* Main content section */}
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              flexGrow: 1, 
              paddingVertical: 20,
              paddingHorizontal: 16,
              minHeight: screenHeight * 0.5
            }}
          >
            {/* Ordonnance selection section */}
            {!selectedOrdonnanceId ? (
              <View style={[
                styles.qrContainer, 
                { 
                  flex: 1, 
                  justifyContent: 'center',
                  paddingVertical: 20 
                }
              ]}>
                {isLoadingOrdonnances ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : ordonnances.length === 0 ? (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.loadingText, { textAlign: 'center', marginBottom: 20 }]}>
                      Aucune ordonnance disponible.
                    </Text>
                    <Text style={[styles.loadingText, { textAlign: 'center', fontSize: 14, opacity: 0.7 }]}>
                      Veuillez d'abord ajouter au moins une ordonnance dans la section "Ordonnance" de la page Home.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={[styles.loadingText, { textAlign: 'center', marginBottom: 20 }]}>
                      Sélectionnez une ordonnance :
                    </Text>
                    <CustomPicker
                      label="Ordonnance liée"
                      selectedValue={selectedOrdonnanceId || ''}
                      onValueChange={(value) => setSelectedOrdonnanceId(String(value))}
                      options={ordonnances}
                      placeholder={ordonnances.length > 0 ? 'Choisir une ordonnance' : 'Aucune ordonnance disponible'}
                      style={{ marginBottom: 30 }}
                    />
                    {selectedOrdonnanceId && (
                      <TouchableOpacity 
                        style={[styles.approveButton, { width: '100%', marginTop: 20 }]} 
                        onPress={handleImageValidation}
                      >
                        <LinearGradient colors={[colors.primary, colors.secondary]} style={[styles.gradient, { width: '100%' }]}>
                          <Text style={styles.buttonText}>Envoyer pour validation</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            ) : (
              <View style={[
                styles.qrContainer, 
                { 
                  flex: 1, 
                  justifyContent: 'center',
                  paddingVertical: 20 
                }
              ]}>
                <Text style={[styles.loadingText, { textAlign: 'center', marginBottom: 10 }]}>
                  Ordonnance sélectionnée
                </Text>
                <Text style={[
                  styles.loadingText, 
                  { 
                    fontWeight: 'bold', 
                    marginVertical: 15, 
                    textAlign: 'center',
                    paddingHorizontal: 16
                  }
                ]}>
                  {ordonnances.find(o => o.value === selectedOrdonnanceId)?.label}
                </Text>
                <Text style={[styles.loadingText, { textAlign: 'center', marginBottom: 30 }]}>
                  Voulez-vous envoyer cette ordonnance ou en sélectionner une autre ?
                </Text>
                <View style={[styles.buttonContainer, { width: '100%', flexDirection: 'column' }]}>

                  <TouchableOpacity 
                    style={{ width: '100%', marginBottom: 12 }}
                    onPress={resetProcess}
                  >
                    <LinearGradient 
                      colors={[colors.textSecondary, colors.infoTextSecondary]} 
                      style={[styles.gradient, { width: '100%' }]}
                    >
                      <Text style={styles.buttonText}>Changer d'ordonnance</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{ width: '100%' }}
                    onPress={handleImageValidation}
                  >
                    <LinearGradient 
                      colors={[colors.primary, colors.secondary]} 
                      style={[styles.gradient, { width: '100%' }]}
                    >
                      <Text style={styles.buttonText}>Envoyer pour validation</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                </View>

              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
