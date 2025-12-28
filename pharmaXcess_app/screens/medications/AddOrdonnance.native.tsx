import React, { useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, Alert, Image, Linking } from 'react-native';
import * as ExpoLinearGradient from 'expo-linear-gradient';
import * as ExpoCamera from 'expo-camera';
const CameraComponent: any = (ExpoCamera as any).CameraView ?? (ExpoCamera as any).Camera ?? (ExpoCamera as any).default ?? ExpoCamera;
import Ionicons from '@expo/vector-icons/Ionicons';
const LinearGradientComponent: any = (ExpoLinearGradient as any).default ?? (ExpoLinearGradient as any).LinearGradient ?? ExpoLinearGradient;
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import ordonnancesApi from '../../utils/api/ordonnances';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

type Props = {
  navigation: any;
  route: any;
};

export default function AddOrdonnance({ navigation, route }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);

  const cameraRef = useRef<any | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const userId = route?.params?.userId;

  const requestPermission = async () => {
    try {
      const cam = (ExpoCamera as any);
      let perm: any = null;
      // Try known APIs in order
      if (typeof cam.requestCameraPermissionsAsync === 'function') {
        perm = await cam.requestCameraPermissionsAsync();
      } else if (cam.Camera && typeof cam.Camera.requestCameraPermissionsAsync === 'function') {
        perm = await cam.Camera.requestCameraPermissionsAsync();
      } else if (typeof cam.getCameraPermissionsAsync === 'function') {
        perm = await cam.getCameraPermissionsAsync();
      } else if (cam.Camera && typeof cam.Camera.getCameraPermissionsAsync === 'function') {
        perm = await cam.Camera.getCameraPermissionsAsync();
      } else {
        console.warn('AddOrdonnance: no camera permission API found on expo-camera module', Object.keys(cam));
        setHasPermission(false);
        return;
      }
      const granted = !!(perm && (perm.status === 'granted' || perm.granted === true || perm === 'granted'));
      setHasPermission(granted);
    } catch (e) {
      console.warn('Camera permission request failed', e);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  // Re-check permission when screen gains focus (e.g., after returning from Settings)
  useFocusEffect(
    React.useCallback(() => {
      requestPermission();
    }, [])
  );

  const takePicture = async () => {
    if (cameraRef.current && typeof cameraRef.current.takePictureAsync === 'function') {
      const photoData = await cameraRef.current.takePictureAsync();
      setPhoto(photoData.uri);
    } else {
      Alert.alert('Erreur', 'La caméra n\'est pas disponible.');
    }
  };

  const handleValidate = async () => {
    if (!userId) return Alert.alert('Erreur', "Profil introuvable");
    if (!photo) return Alert.alert('Erreur', 'Aucune photo');
    if (isUploading) return;
    setIsUploading(true);
    try {
      // Compress / resize image before upload to avoid huge payloads
      const filename = photo.split('/').pop() || `ordonnance_${Date.now()}.jpg`;
      const manipulated = await ImageManipulator.manipulateAsync(
        photo,
        [{ resize: { width: 1024 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );

      const upload = await ordonnancesApi.uploadTempFile(userId, manipulated.uri, filename, 'image/jpeg');
      if (!upload.ok) {
        console.error('uploadTempFile result', upload);
        throw new Error(upload.error || `Upload failed (status ${upload.status})`);
      }
      let tempImageId = upload.data?.id;
      if (!tempImageId) {
        const last = await ordonnancesApi.getLastTempImage(userId);
        if (!last.ok || !last.data) throw new Error(last.error || 'Failed to get temp image');
        tempImageId = last.data.id;
      }
      const created = await ordonnancesApi.createOrdonnance({ user_id: userId, temp_image_id: tempImageId });
      if (!created.ok) throw new Error(created.error || 'Create ordonnance failed');
      Alert.alert('Succès', 'Ordonnance ajoutée');
      navigation.goBack();
    } catch (e: any) {
      console.error('AddOrdonnance error', e);
      Alert.alert('Erreur', String(e?.message || e));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestart = () => {
    // Return to prescriptions list without saving
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.prescriptionText}>L'application a besoin d'accéder à la caméra.</Text>
        <TouchableOpacity style={[styles.button, { width: 200, marginTop: 12 }]} onPress={requestPermission}>
          <LinearGradientComponent colors={[colors.primary, colors.secondary]} style={styles.gradient}>
            <Text style={styles.buttonText}>Demander la permission</Text>
          </LinearGradientComponent>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.prescriptionText}>Accès à la caméra refusé. Activez la permission dans les paramètres.</Text>
        <TouchableOpacity style={[styles.button, { width: 200, marginTop: 12 }]} onPress={() => Linking.openSettings()}>
          <LinearGradientComponent colors={[colors.primary, colors.secondary]} style={styles.gradient}>
            <Text style={styles.buttonText}>Ouvrir paramètres</Text>
          </LinearGradientComponent>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!photo ? (
        <View style={{ flex: 1 }}>
          <CameraComponent style={styles.camera} ref={cameraRef} />
          <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center' }}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
                <LinearGradientComponent colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                  <Text style={styles.buttonText}>Prendre une photo</Text>
                </LinearGradientComponent>
              </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewScreen}>
          <View style={styles.previewWrapper}>
            <Image source={{ uri: photo }} style={styles.previewImage} />
          </View>
          <View style={styles.bottomActionContainer}>
            <TouchableOpacity style={styles.button} onPress={handleValidate} disabled={isUploading}>
              <LinearGradientComponent colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>{isUploading ? 'Enregistrement...' : 'Valider'}</Text>
              </LinearGradientComponent>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setPhoto(null)}>
              <LinearGradientComponent colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                <Text style={styles.buttonText}>Recommencer</Text>
              </LinearGradientComponent>
            </TouchableOpacity>
          </View>
          {/* Footer removed as requested (no visible text) */}
        </View>
      )}
    </View>
  );
}
