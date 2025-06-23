import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The Settings component provides a list of settings options for the user, allowing navigation to different configuration screens such as visual options, audio options, privacy settings, and more.
export default function Settings({ navigation }): JSX.Element {

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
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'white',
    },
    card: {
        width: '100%',
        height: 100,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        overflow: 'hidden',
    },
    cardText: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    gradient: {
        paddingVertical: 15,
        flex: 1,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});

