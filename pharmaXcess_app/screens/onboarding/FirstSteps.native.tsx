import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import type { StackNavigationProp } from '@react-navigation/stack';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

type FirstStepsProps = {
    navigation: StackNavigationProp<any>;
};
 
// The FirstSteps component provides a list of initial setup tasks for new users, guiding them through account configuration, interface navigation, and settings customization.
export default function FirstSteps({ navigation }: FirstStepsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'Configuration initiale du compte', route: 'AccountSetup', icon: 'settings-outline' },
        { title: 'Navigation dans l\'interface', route: 'InterfaceNavigation', icon: 'apps-outline' },
        { title: 'Personnalisation des paramètres', route: 'SettingsCustomization', icon: 'options-outline' },
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
