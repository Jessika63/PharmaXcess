import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

export default function HistoryTransparency({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Historique des transactions', route: 'TransactionHistory', icon: 'time-outline' },
        { title: 'Transparence des données', route: 'DataTransparency', icon: 'shield-checkmark-outline' },
        { title: 'Rapports d\'audit', route: 'AuditReports', icon: 'document-text-outline' },
        { title: 'Consentement et préférences', route: 'ConsentPreferences', icon: 'checkmark-circle-outline' },
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
        height: 110,
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
        marginLeft: 10,
    },
});
