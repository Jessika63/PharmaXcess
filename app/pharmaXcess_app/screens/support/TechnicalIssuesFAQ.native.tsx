import react, { useState } from 'react';
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

// The TechnicalIssuesFAQ component provides a list of frequently asked questions related to technical issues, allowing users to navigate to specific sections such as App Sync Issues, Connection Issues, and Notification Issues.
import type { StackNavigationProp } from '@react-navigation/stack';

type TechnicalIssuesFAQProps = {
    navigation: StackNavigationProp<any>;
};

export default function TechnicalIssuesFAQ({ navigation }: TechnicalIssuesFAQProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const items: Item[] = [
        { title: 'L\'application ne se synchronise pas', route: 'AppSyncIssues', icon: 'sync-outline' },
        { title: 'Problèmes de connexion', route: 'ConnectionIssues', icon: 'wifi-outline' },
        { title: 'Problèmes de notifications', route: 'NotificationIssues', icon: 'notifications-off-outline' },
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
