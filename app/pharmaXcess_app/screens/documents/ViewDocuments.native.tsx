import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { StackNavigationProp } from '@react-navigation/stack';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

type DocProps = {
    navigation: StackNavigationProp<any, any>; 
};

// The ViewDocuments component displays a list of documents related to privacy policies and allows users to navigate to different sections or download them in PDF format.
export default function ViewDocuments({ navigation }: DocProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Politique de confidentialité complète ', route: 'PrivacyPolicy', icon: 'document-text-outline' },
        { title: 'Version simplifiée et résumé', route: 'SimplifiedVersion', icon: 'document-text-outline' },
        { title: 'Télécharger au format PDF', route: 'DownloadPDF', icon: 'document-text-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Map through the items array to create a card for each document */}
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color={colors.iconPrimary} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
