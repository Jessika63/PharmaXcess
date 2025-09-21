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

// The HelpSupport component allows users to access various support resources, including a tutorial, FAQ, technical support, and issue reporting, enhancing user experience and providing assistance when needed.
import type { StackNavigationProp } from '@react-navigation/stack';

type HelpSupportScreenNavigationProp = StackNavigationProp<any>;

interface HelpSupportProps {
    navigation: HelpSupportScreenNavigationProp;
}

export default function HelpSupport({ navigation }: HelpSupportProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Tutoriel', route: 'Tutorial', icon: 'book-outline' },
        { title: 'FAQ', route: 'FAQ', icon: 'help-circle-outline' },
        { title: 'Assistance technique', route: 'TechnicalSupport', icon: 'construct-outline' },
        { title: 'Signaler un problème', route: 'ReportIssue', icon: 'alert-circle-outline' },  
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
