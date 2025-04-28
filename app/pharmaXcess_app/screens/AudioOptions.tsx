import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AudioOptions({ navigation }): JSX.Element {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('VolumeOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Volume</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('SoundTypeOptions')}
            >
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Type de son</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('VibrationOptions')}>
                <LinearGradient
                    colors={['#EE9AD0', '#F57196']}
                    style={styles.gradient}
                >
                    <Text style={styles.itemText}>Vibrations</Text>
                </LinearGradient>
            </TouchableOpacity>
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
}); 