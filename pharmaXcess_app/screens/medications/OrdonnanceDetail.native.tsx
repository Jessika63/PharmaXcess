import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import ordonnancesApi from '../../utils/api/ordonnances';

type Props = {
  navigation: StackNavigationProp<any>;
  route: any;
};

export default function OrdonnanceDetail({ navigation, route }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  const { ordonnance, userId } = route.params || {};
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      if (!ordonnance) return;
      if (!ordonnance.temp_image_id) return;
      setLoading(true);
      try {
        const res = await ordonnancesApi.getTempImageById(ordonnance.temp_image_id);
        if (res.ok && res.data && res.data.image_base64) {
          setImageB64(`data:${res.data.mime_type};base64,${res.data.image_base64}`);
        }
      } catch (e) {
        console.warn('Failed to load ordonnance image', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [ordonnance]);

  const handleDelete = () => {
    if (!ordonnance?.id || !userId) return;
    Alert.alert('Confirmation', 'Voulez-vous supprimer cette ordonnance ?', [
      { text: 'Non', style: 'cancel' },
      { text: 'Oui', onPress: async () => {
          try {
            setDeleting(true);
            const res = await ordonnancesApi.deleteOrdonnance(userId, ordonnance.id);
            if (res.ok) {
              Alert.alert('Succès', 'Ordonnance supprimée');
              navigation.goBack();
            } else {
              Alert.alert('Erreur', res.error || 'Suppression impossible');
            }
          } catch (e) {
            console.error('Delete ordonnance error', e);
            Alert.alert('Erreur', 'Suppression impossible');
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with close button */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border 
      }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text, flex: 1 }}>
          {ordonnance?.name || 'Ordonnance'}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: 'bold' }}>Fermer</Text>
        </TouchableOpacity>
      </View>

      {/* Image display */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : imageB64 ? (
          <Image 
            source={{ uri: imageB64 }} 
            style={{ width: '100%', height: '100%', maxHeight: 800 }} 
            resizeMode="contain" 
          />
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <Text style={[styles.prescriptionText, { textAlign: 'center', fontSize: 16 }]}>
              Aucune image disponible pour cette ordonnance
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Delete button at bottom */}
      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TouchableOpacity onPress={handleDelete} disabled={deleting}>
          <LinearGradient colors={['#FF4444', '#CC0000']} style={styles.gradient}>
            <Text style={[styles.buttonText, { color: '#FFF' }]}>
              {deleting ? 'Suppression...' : 'Supprimer l\'ordonnance'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
