import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Touchable, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import createStyles from '../../styles/Report.style';
import { useTheme } from '../../context/ThemeContext';

// The TechnicalSupport component allows users to submit technical support requests, providing fields for user information, request type, description, and file attachment, enhancing user support experience.
export default function TechnicalSupport({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [requestType, setRequestType] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');

    const handleConfirm = () => {
        Alert.alert('Confirmation', 'Votre demande a été envoyée avec succès.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput style={styles.input} placeholder="Nom et prénom" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Numéro de téléphone" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Type de demande" value={requestType} onChangeText={setRequestType} />
            <TextInput style={styles.input} placeholder="Description de la demande" value={description} onChangeText={setDescription} />
            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Déposer un fichier', 'Fonctionnalité à venir')}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>Déposer un fichier</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>Confirmer</Text>
                </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.buttonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
