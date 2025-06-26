import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
} 

// The AudioOptions component allows users to customize audio settings such as volume, sound type, and vibrations within the application.
export default function AudioOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const items: Item[] = [
        { title: 'Volume', route: 'VolumeOptions', icon: 'volume-high-outline' },
        { title: 'Type de son', route: 'SoundTypeOptions', icon: 'musical-notes-outline' },
        { title: 'Vibrations', route: 'VibrationOptions', icon: 'at-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
