import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ReglementationOptions({ navigation }): JSX.Element {
    const [reglementationType, setReglementationType] = useState('default');
    const [reglementationDuration, setReglementationDuration] = useState('default');
    const [reglementationAccess, setReglementationAccess] = useState('default');
    const [reglementationConfirmation, setReglementationConfirmation] = useState('default');
    const [reglementationConfidentiality, setReglementationConfidentiality] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Type de réglementation</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, reglementationType === type && styles.selectedOption]}
                        onPress={() => setReglementationType(type)}
                    >
                        <Ionicons
                            name={reglementationType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Aucune réglementation'
                                : type === 'type1'
                                ? 'Réglementation standard'
                                : type === 'type2'
                                ? 'Réglementation renforcée'
                                : 'Réglementation personnalisée'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée de la réglementation</Text>
                {['default', 'short', 'medium', 'long'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, reglementationDuration === duration && styles.selectedOption]}
                        onPress={() => setReglementationDuration(duration)}
                    >
                        <Ionicons
                            name={reglementationDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Aucune durée'
                                : duration === 'short'
                                ? 'Durée courte (1 mois)'
                                : duration === 'medium'
                                ? 'Durée moyenne (6 mois)'
                                : 'Durée longue (1 an)'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Accès aux données</Text>
                {['default', 'public', 'private', 'restricted'].map((access) => (
                    <TouchableOpacity
                        key={access}
                        style={[styles.option, reglementationAccess === access && styles.selectedOption]}
                        onPress={() => setReglementationAccess(access)}
                    >
                        <Ionicons
                            name={reglementationAccess === access ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {access === 'default'
                                ? 'Accès public'
                                : access === 'public'
                                ? 'Accès privé'
                                : access === 'private'
                                ? 'Accès restreint'
                                : 'Accès personnalisé'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Mises à jours des conditions</Text>
                {['default', 'immediate', 'weekly', 'monthly'].map((confirmation) => (
                    <TouchableOpacity
                        key={confirmation}
                        style={[styles.option, reglementationConfirmation === confirmation && styles.selectedOption]}
                        onPress={() => setReglementationConfirmation(confirmation)}
                    >
                        <Ionicons
                            name={reglementationConfirmation === confirmation ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {confirmation === 'default'
                                ? 'Aucune mise à jour'
                                : confirmation === 'immediate'
                                ? 'Mise à jour immédiate'
                                : confirmation === 'weekly'
                                ? 'Mise à jour hebdomadaire'
                                : 'Mise à jour mensuelle'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Confidentialité des données</Text>
                {['default', 'high', 'medium', 'low'].map((confidentiality) => (
                    <TouchableOpacity
                        key={confidentiality}
                        style={[styles.option, reglementationConfidentiality === confidentiality && styles.selectedOption]}
                        onPress={() => setReglementationConfidentiality(confidentiality)}
                    >
                        <Ionicons
                            name={reglementationConfidentiality === confidentiality ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {confidentiality === 'default'
                                ? 'Confidentialité standard'
                                : confidentiality === 'high'
                                ? 'Haute confidentialité'
                                : confidentiality === 'medium'
                                ? 'Confidentialité moyenne'
                                : 'Basse confidentialité'}
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
        marginBottom: 20,
        color: '#F57196',
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    selectedOption: {
        backgroundColor: '#F57196',
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        backgroundColor: 'lightgray',
        marginBottom: 10,
    },
});
