import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import { Profile } from '../context/ProfileContext';
import { generateQRData } from '../utils/qrCodeUtils';
import qrApi from '../utils/api/qr';
import createStyles from '../styles/QRCodeModal.style';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  profile,
}) => {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  // Generate QR code data with profile information
  const getQRData = () => {
    if (!profile) return '';
    
    try {
      return generateQRData(profile, 30); // Expiry in 30 days 
    } catch (error) {
      console.error('Error generating QR data:', error);
      return '';
    }
  };

  // State to hold backend-generated QR image (base64)
  const [backendImage, setBackendImage] = useState<string | null>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchBackendQr() {
      if (!visible || !profile) return;
      setBackendImage(null);
      setBackendError(null);
      setLoadingBackend(true);
      try {
        const res = await qrApi.generateProfileQr(profile.id as any);
        if (!mounted) return;
        if (res.ok && res.data) {
          // Expecting { id, code_unique, image }
          const img = res.data.image;
          if (img) {
            setBackendImage(`data:image/png;base64,${img}`);
          } else {
            setBackendError('Aucune image reçue');
          }
        } else {
          setBackendError(res.error || `Erreur ${res.status}`);
        }
      } catch (e: any) {
        setBackendError(e?.message || String(e));
      } finally {
        if (mounted) setLoadingBackend(false);
      }
    }

    fetchBackendQr();
    return () => { mounted = false; };
  }, [visible, profile]);

  const getRelationshipText = (relationship?: string) => {
    switch (relationship) {
      case 'self': return 'Mon profil';
      case 'child': return 'Profil enfant';
      case 'parent': return 'Profil parent';
      case 'spouse': return 'Profil conjoint(e)';
      case 'other': return 'Autre profil';
      default: return 'Profil';
    }
  };

  if (!profile) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={{ width: 32 }} />
            <Text style={styles.headerTitle}>Mon QR Code</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileDetails}>
              {getRelationshipText(profile.relationship)}
              {profile.age ? ` • ${profile.age} ans` : ''}
            </Text>
          </View>

          <View style={styles.qrContainer}>
            {loadingBackend ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : backendImage ? (
              <Image
                source={{ uri: backendImage }}
                style={{ width: 200, height: 200 }}
                resizeMode="contain"
              />
            ) : (
              // Fallback to local generated QR code
              <QRCode
                value={getQRData()}
                size={200}
                color="#000000"
                backgroundColor="#ffffff"
              />
            )}
            {backendError ? (
              <Text style={{ color: 'red', marginTop: 8 }}>{backendError}</Text>
            ) : null}
          </View>

          <Text style={styles.instructionText}>
            Partagez ce QR code avec un professionnel de santé pour qu'il puisse
            scanner et accéder rapidement à vos informations médicales.
          </Text>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="checkmark" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>Fermer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default QRCodeModal;