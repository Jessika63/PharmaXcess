import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The Settings component provides a list of settings options for the user, allowing navigation to different configuration screens such as visual options, audio options, privacy settings, and more.
export default function Settings({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const items: Item[] = [
        { title: 'Options visuelles', route: 'VisualOptions', icon: 'eye-outline' },
        { title: 'Options audio', route: 'AudioOptions', icon: 'volume-high-outline' },
        { title: 'Confidentialité et sécurité', route: 'PrivacySecurity', icon: 'shield-checkmark-outline' },
        { title: 'Notifications', route: 'Notifications', icon: 'notifications-outline' },
        { title: 'Compte et profil', route: 'AccountProfile', icon: 'person-outline' },
        { title: 'Aide et support', route: 'HelpSupport', icon: 'help-circle-outline' },
        { title: 'Préférences de l\'application', route: 'AppPreferences', icon: 'settings-outline' },
        { title: 'Confidentialité avancée', route: 'AdvancedPrivacy', icon: 'shield-outline' },
    ]   

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
