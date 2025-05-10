import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountProfile({ navigation }): JSX.Element {
    const [profileType, setProfileType] = useState('default');
    const [profileDuration, setProfileDuration] = useState('default');
    const [exports, setExports] = useState('default');
    const [contacts, setContacts] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.section}>
                <Text style={styles.title}>Gestion des traitements</Text>
                {['default', 'type1', 'type2'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, profileType === type && styles.selectedOption]}
                        onPress={() => setProfileType(type)}
                    >
                        <Ionicons
                            name={profileType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Partager mes traitements avec mes professionnels de santé'
                                : type === 'type1'
                                ? 'Générer rapport suivi de traitement'
                                : 'Masquer certains traitements au public '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Synchronisation des ordonnances</Text>
                {['default', 'short'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, profileDuration === duration && styles.selectedOption]}
                        onPress={() => setProfileDuration(duration)}
                    >
                        <Ionicons
                            name={profileDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Synchronisation automatique avec ma pharmacie'
                                : 'Notifications avant expiration de mon ordonnance '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Exportation/import de données médicales </Text>
                {['default', 'short', 'medium', 'share'].map((exportType) => (
                    <TouchableOpacity
                        key={exportType}
                        style={[styles.option, exports === exportType && styles.selectedOption]}
                        onPress={() => setExports(exportType)}
                    >
                        <Ionicons
                            name={exports === exportType ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {exportType === 'default'
                                ? 'Format médical standard (HL7, FHIR) '
                                : exportType === 'short'
                                ? 'Intégration avec mon dossier médical partagé '
                                : exportType === 'medium'
                                ? 'Import depuis d\'autres applications de santé'
                                : 'Partage sécurisé avec les professionnels autorisés '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Contacts médicaux </Text>
                {['default', 'short', 'medium'].map((contactType) => (
                    <TouchableOpacity
                        key={contactType}
                        style={[styles.option, contacts === contactType && styles.selectedOption]}
                        onPress={() => setContacts(contactType)}
                    >
                        <Ionicons
                            name={contacts === contactType ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {contactType === 'default'
                                ? 'Ajouter pharmacie habituelle'
                                : contactType === 'short'
                                ? 'Définir des contacts d\'urgence'
                                : 'Autorisations accès professionnel '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: '#adadad',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',    },
    optionText: {
        fontSize: 18,
        color: 'white',
        marginLeft: 10,
    },
    returnButton: {
        marginTop: 20,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
});