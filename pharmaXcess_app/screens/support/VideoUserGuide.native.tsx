import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import QRCode from 'react-native-qrcode-svg';
import Ionicons from '@expo/vector-icons/Ionicons';

// Guide utilisateur vidéo de l'application PharmaXcess
export default function VideoUserGuide(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();

    const videoUrl = 'https://pharmaxcess.video.guide'; // À remplacer par le vrai lien

    const handleOpenVideo = () => {
        Linking.openURL(videoUrl);
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 24 * fontScale,
            fontWeight: 'bold',
            color: colors.headerText,
            marginBottom: 20,
            textAlign: 'center',
        },
        description: {
            fontSize: 16 * fontScale,
            color: colors.textSecondary,
            marginBottom: 30,
            textAlign: 'center',
        },
        qrContainer: {
            backgroundColor: colors.background,
            padding: 20,
            borderRadius: 15,
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.22,
            shadowRadius: 2.22,
            elevation: 3,
        },
        button: {
            marginTop: 30,
            backgroundColor: colors.primary,
            paddingVertical: 15,
            paddingHorizontal: 30,
            borderRadius: 25,
            flexDirection: 'row',
            alignItems: 'center',
        },
        buttonText: {
            color: colors.text,
            fontSize: 16 * fontScale,
            fontWeight: '600',
            marginLeft: 10,
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Guide utilisateur vidéo</Text>
            <Text style={styles.description}>
                Scannez le QR code ci-dessous pour accéder à la vidéo d'instruction
            </Text>
            <View style={styles.qrContainer}>
                <QRCode
                    value={videoUrl}
                    size={200}
                    color="#000000"
                    backgroundColor="#ffffff"
                />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleOpenVideo}>
                <Ionicons name="videocam-outline" size={24} color={colors.text} />
                <Text style={styles.buttonText}>Voir la vidéo</Text>
            </TouchableOpacity>
        </View>
    );
}
