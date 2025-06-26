import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// GeneralFAQ component provides a list of frequently asked questions related to the application, allowing users to navigate to specific FAQ sections such as PharmaXcess Info, Data Protection, and Offline Functionality.
export default function GeneralFAQ({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const items: Item[] = [
        { title: 'Qu\'est-ce que PharmaXcess ?', route: 'PharmaXcessInfo', icon: 'information-circle-outline' },
        { title: 'Comment mes données sont-elles protégées ?', route: 'DataProtection', icon: 'shield-checkmark-outline' },
        { title: 'L\'appplication fonctionne-t-elle hors ligne ?', route: 'OfflineFunctionality', icon: 'cloud-offline-outline' },
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
