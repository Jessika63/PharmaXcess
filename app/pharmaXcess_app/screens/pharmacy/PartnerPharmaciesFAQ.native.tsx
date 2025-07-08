import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The PartnerPharmaciesFAQ component displays a list of frequently asked questions related to partner pharmacies.
import type { StackNavigationProp } from '@react-navigation/stack';

type PartnerPharmaciesFAQProps = {
    navigation: StackNavigationProp<any>;
};

export default function PartnerPharmaciesFAQ({ navigation }: PartnerPharmaciesFAQProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Comment trouver une pharmacie compatible ?', route: 'FindCompatiblePharmacy', icon: 'search-outline' },
        { title: 'Comment synchroniser mon ordonnance avec une pharmacie ?', route: 'SyncPrescription', icon: 'sync-outline' },
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
