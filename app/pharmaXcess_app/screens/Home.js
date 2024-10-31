import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home({ navigation}) {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyPrescriptions')}>
                <LinearGradient colors={['#F57196', '#F7C5E0']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Mes ordonnances</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <LinearGradient colors={['#F57196', '#F7C5E0']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Mes rappels médicaments</Text>
                </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <LinearGradient colors={['#F57196', '#F7C5E0']} style={styles.gradient}>
                    <Text style={styles.buttonText}>Mes rappels ordonnances</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingTop: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    button: {
        width: '80%',
        borderRadius: 25,
        marginBottom: 20,
        height: 50,
        margin: 10,
    },
    gradient: {
        paddingVertical: 15,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});