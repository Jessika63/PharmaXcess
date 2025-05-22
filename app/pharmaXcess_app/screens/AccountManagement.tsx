import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function AccountManagement({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Gérer mon compte', route: 'ManageAccount', icon: 'person-outline' },
        { title: 'Préférences de communication', route: 'CommunicationPreferences', icon: 'chatbubbles-outline' },
        { title: 'Historique de transparence', route: 'HistoryTransparency', icon: 'document-text-outline' },
        { title: 'Aide et support', route: 'HelpSupport', icon: 'help-circle-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.cardGradient}>
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
    cardGradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    cardText: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});
