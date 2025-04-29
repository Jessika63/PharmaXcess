import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function PersonalDataOptions({ navigation }): JSX.Element {
    const [dataType, setDataType] = useState('default');
    const [dataDuration, setDataDuration] = useState('default');
    const [dataAssociation, setDataAssociation] = useState('default');
    const [dataRegulation, setDataRegulation] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Gestion des données personnelles</Text>
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
                                ? 'Collecte et stockage de vos informations personnelles'
                                : type === 'type1'
                                ? 'Utilisation pour la gestion de votre compte'
                                : type === 'type2'
                                ? 'Stockage de votre historique médical'
                                : 'Gestion de vos prescriptions médicales'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Autorisations</Text>
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
                                ? 'Partage avec les professionnels de santé'
                                : duration === 'short'
                                ? 'Partage avec les pharmaciens'
                                : 'Partage avec les proches'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Durée de conservation</Text>
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
                                ? 'Conservation de 6 mois'
                                : regulation === 'short'
                                ? 'Conservation de 1 an'
                                : 'Conservation de 2 ans'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Association des données</Text>
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
                                ? 'Association avec les professionnels de santé'
                                : association === 'short'
                                ? 'Association avec les pharmaciens'
                                : 'Association avec les proches'}
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
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#F7C5E0',
    },
    optionText: {
        fontSize: 18,
        marginLeft: 10,
        color: 'white',
        fontWeight: 'bold',
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
        fontWeight: 'bold',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
    card: {
        width: '100%',
        height: 105,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        overflow: 'hidden',
    },
    itemText: {
        fontSize: 20,
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
    },
});