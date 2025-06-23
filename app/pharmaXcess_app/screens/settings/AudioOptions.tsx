import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Item {
    title: string;
    route: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
}

// The AudioOptions component allows users to customize audio settings such as volume, sound type, and vibrations within the application.
export default function AudioOptions({ navigation }): JSX.Element {

    const items: Item[] = [
        { title: 'Volume', route: 'VolumeOptions', icon: 'volume-high-outline' },
        { title: 'Type de son', route: 'SoundTypeOptions', icon: 'musical-notes-outline' },
        { title: 'Vibrations', route: 'VibrationOptions', icon: 'at-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.itemText}>{item.title}</Text>
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
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
    },
    itemText: {
        fontSize: 20,
        color: '#ffffff',
        marginLeft: 10,
        fontWeight: 'bold',
    },
    icon: {
        marginLeft: 10,
    },
}); 