import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../styles/CORSLoadingScreen.style';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';

interface CORSLoadingScreenProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Component to display a loading screen during CORS initialization
 * or an error message with a retry option if initialization fails.
 */
export default function CORSLoadingScreen({ isLoading, error, onRetry }: CORSLoadingScreenProps): React.JSX.Element {
  const { colors } = useTheme(); 
  const { fontScale } = useFontScale(); 
  const styles = createStyles(colors, fontScale);
  if (isLoading) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.container}
      >
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Initialisation de la connexion...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.container}
      >
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.retryButtonGradient}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return <></>;
}
