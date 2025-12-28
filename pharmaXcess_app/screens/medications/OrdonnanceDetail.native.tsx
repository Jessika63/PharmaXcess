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
    <ScrollView contentContainerStyle={styles.prescriptionList}>
      <View style={[styles.prescriptionCard, { margin: 20, width: '90%', maxWidth: 600, alignSelf: 'center' }]}>
        <Text style={[styles.prescriptionTitle, { marginBottom: 8 }]}>{ordonnance?.name}</Text>
        <Text style={styles.prescriptionText}>Date: {ordonnance?.date}</Text>
        <Text style={styles.prescriptionText}>Médecin: {ordonnance?.doctor}</Text>
        <Text style={styles.prescriptionText}>Médicaments: {ordonnance?.medications}</Text>
        <View style={{ marginTop: 12 }}>
          {loading ? <ActivityIndicator /> : (
            imageB64 ? <Image source={{ uri: imageB64 }} style={styles.image} /> : <Text style={styles.prescriptionText}>Aucune image disponible</Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
              <Text style={styles.buttonText}>Fermer</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
              <Text style={styles.buttonText}>{deleting ? 'Suppression...' : 'Supprimer'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
