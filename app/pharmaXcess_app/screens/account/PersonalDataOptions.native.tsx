import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import styles from './PersonalDataOptions.style';

// The PersonalDataOptions component allows users to customize their personal data management settings, including data download options, data deletion preferences, anonymization settings, and data retention periods.
export default function PersonalDataOptions({ navigation }): JSX.Element {
    const [dataType, setDataType] = useState('default');
    const [dataDuration, setDataDuration] = useState('default');
    const [dataAssociation, setDataAssociation] = useState('default');
    const [dataRegulation, setDataRegulation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Téléchargement des données </Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, dataType === type && styles.selectedOption]}
                        onPress={() => setDataType(type)}
                    >
                        <Ionicons
                            name={dataType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'PDF'
                                : type === 'type1'
                                ? 'CSV'
                                : type === 'type2'
                                ? 'Inclure l\'historique complet'
                                : 'Protéger par mot de passe'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Suppression des données</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, dataDuration === duration && styles.selectedOption]}
                        onPress={() => setDataDuration(duration)}
                    >
                        <Ionicons
                            name={dataDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Historique de navigation'
                                : duration === 'short'
                                ? 'Ordonnances archivées'
                                : 'Données du compte'},
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Anonymisation</Text>
                {['default', 'short', 'medium'].map((regulation) => (
                    <TouchableOpacity
                        key={regulation}
                        style={[styles.option, dataRegulation === regulation && styles.selectedOption]}
                        onPress={() => setDataRegulation(regulation)}
                    >
                        <Ionicons
                            name={dataRegulation === regulation ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {regulation === 'default'
                                ? 'Activer mode anonyme'
                                : regulation === 'short'
                                ? 'Masquer noms médicaments'
                                : 'Masquer les pathologies'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Période de conservation</Text>
                {['default', 'short', 'medium'].map((association) => (
                    <TouchableOpacity
                        key={association}
                        style={[styles.option, dataAssociation === association && styles.selectedOption]}
                        onPress={() => setDataAssociation(association)}
                    >
                        <Ionicons
                            name={dataAssociation === association ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {association === 'default'
                                ? 'Conservation de 6 mois'
                                : association === 'short'
                                ? 'Conservation de 1 an'
                                : 'Conservation de 2 ans'}
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
