import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/Report.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type Props = {
    navigation: StackNavigationProp<any, any>;
};

// The ReportIssue component allows users to report issues with the application, providing fields for issue type, severity, detailed description, and reproduction steps, along with options to attach files and confirm the report.
export default function ReportIssue({ navigation }: Props): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [issueType, setIssueType] = useState<string>('');
    const [attachment, setAttachment] = useState<string>('');

    const handleConfirm = () => {
        Alert.alert('Confirmation', 'Votre problème a été signalé avec succès.');
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput style={styles.input} placeholder="Type de problème" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Criticité du problème" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Description détaillée " value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Etapes pour reproduire le problème " value={issueType} onChangeText={setIssueType} />
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
