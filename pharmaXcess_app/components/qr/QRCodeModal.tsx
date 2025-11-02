import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { Profile } from '../../context/ProfileContext';
import { generateQRData } from '../../utils/qrCodeUtils';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  profile: Profile | null;
}

const { width, height } = Dimensions.get('window');

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  profile,
}) => {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();

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

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: 20,
      width: width * 0.9,
      maxHeight: height * 0.8,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 20 * fontScale,
      fontWeight: 'bold',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileName: {
      fontSize: 18 * fontScale,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 5,
    },
    profileDetails: {
      fontSize: 14 * fontScale,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    qrContainer: {
      backgroundColor: '#ffffff',
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    instructionText: {
      fontSize: 14 * fontScale,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 10,
      lineHeight: 20,
    },
    actionButton: {
      width: '80%',
      borderRadius: 25,
      overflow: 'hidden',
    },
    actionButtonGradient: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    actionButtonText: {
      color: '#ffffff',
      fontSize: 16 * fontScale,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

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
      <SafeAreaView style={styles.overlay}>
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
      </SafeAreaView>
    </Modal>
  );
};

export default QRCodeModal;