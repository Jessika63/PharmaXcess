import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CORSLoadingScreenProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Composant d'écran de chargement pour l'enregistrement CORS
 */
export default function CORSLoadingScreen({ isLoading, error, onRetry }: CORSLoadingScreenProps): React.JSX.Element {
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#ec4899', '#f43f5e']}
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
        colors={['#ec4899', '#f43f5e']}
        style={styles.container}
      >
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Erreur de connexion</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return <></>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ec4899',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
