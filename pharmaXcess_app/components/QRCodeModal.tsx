import React from 'react';
import {
  Modal,
  Text,
  TouchableOpacity,
  View, 
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import { Profile } from '../context/ProfileContext';
import { generateQRData } from '../utils/qrCodeUtils';
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
            <QRCode
              value={getQRData()}
              size={200}
              color="#000000"
              backgroundColor="#ffffff"
            />
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