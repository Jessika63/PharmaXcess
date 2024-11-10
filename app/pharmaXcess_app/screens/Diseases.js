import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Diseases({ navigation }) {
    const [expanded, setExpanded] = useState(null);

    const diseases = [
        { 
            name: 'Diabète', 
            description: 'Le diabète est une maladie chronique qui se caractérise par un excès de sucre dans le sang.', 
            symptoms: 'soif intense, besoin fréquent d\'uriner, fatigue, perte de poids, vision floue, cicatrisation lente, infections fréquentes, démangeaisons, fourmillements, douleurs, crampes, nausées, vomissements, haleine fruitée, perte de conscience',
            beginDate: '01/01/2000',
            medications: 'insuline, metformine, sulfamide hypoglycémiants, glinides, glitazones, inhibiteurs de l\'alpha-glucosidase, inhibiteurs de la DPP-4, agonistes des récepteurs du GLP-1, inhibiteurs du cotransporteur du sodium-glucose de type 2',
            examens: 'glycémie à jeun, hémoglobine glyquée, test de tolérance au glucose, test de glycémie aléatoire, test de glycémie postprandiale (après un repas)',
        },
        { 
            name: 'Hypertension',
            description: 'L\'hypertension artérielle est une maladie chronique caractérisée par une pression artérielle trop élevée dans les artères.',
            symptoms: 'maux de tête, fatigue, étourdissements, bourdonnements d\'oreilles, palpitations, douleurs thoraciques, essoufflement, saignements de nez, vision floue',
            beginDate: '01/01/2005',
            medications: 'diurétiques, bêta-bloquants, inhibiteurs de l\'enzyme de conversion de l\'angiotensine (IECA), antagonistes des récepteurs de l\'angiotensine II (ARA II), inhibiteurs calciques, alpha-bloquants, alpha-bêta-bloquants, vasodilatateurs, antihypertenseurs centraux, antihypertenseurs d\'action directe, antihypertenseurs à action périphérique, antihypertenseurs à action centrale',
            examens: 'mesure de la pression artérielle, électrocardiogramme, échocardiographie, échographie des reins, prise de sang (créatinine, potassium, sodium, cholestérol, glycémie, urée)',
        },
        {
            name: 'Asthme',
            description: 'L\'asthme est une maladie chronique des voies respiratoires caractérisée par une inflammation et un rétrécissement des bronches.',
            symptoms: 'toux, sifflements, essoufflement, oppression thoracique, douleur thoracique, fatigue, troubles du sommeil',
            beginDate: '01/01/2010',
            medications: 'bronchodilatateurs, corticostéroïdes inhalés, corticostéroïdes oraux, antileucotriènes, théophylline, immunothérapie, omalizumab, mepolizumab, reslizumab, benralizumab, dupilumab',
            examens: 'spirométrie, test de provocation bronchique, test de la sueur, test cutané, prise de sang (éosinophiles, IgE)',
        },
        {
            name: 'Cancer',
            description: 'Le cancer est une maladie caractérisée par une prolifération cellulaire anormale et incontrôlée.',
            symptoms: 'tumeur, fatigue, perte de poids, fièvre, douleur, saignements, infections, troubles digestifs, troubles urinaires, troubles respiratoires',
            beginDate: '01/01/2015',
            medications: 'chirurgie, radiothérapie, chimiothérapie, immunothérapie, thérapie ciblée, hormonothérapie',
            examens: 'biopsie, scanner, IRM, TEP, échographie, prise de sang (marqueurs tumoraux)',
        },
    ];

    const toggleCard = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    const handleAddPress = () => {
        Alert.alert('Ajouter une maladie', 'Cette fonctionnalité n\'est pas encore implémentée.');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.diseaseList}>
                {diseases.map((disease, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleCard(index)} style={styles.diseaseCard}>
                        <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                            <Text style={styles.diseaseTitle}>{disease.name}</Text>

                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Description: </Text>
                                {expanded === index ? disease.description : `${disease.description.slice(0, 100)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Symptômes: </Text>
                                {expanded === index ? disease.symptoms : `${disease.symptoms.slice(0, 100)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Date de début: </Text>
                                {expanded === index ? disease.beginDate : `${disease.beginDate.slice(0, 10)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Traitements: </Text>
                                {expanded === index ? disease.medications : `${disease.medications.slice(0, 100)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Examens: </Text>
                                {expanded === index ? disease.examens : `${disease.examens.slice(0, 100)}...`}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    diseaseList: {
        alignItems: 'center',
    },
    diseaseCard: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
    },
    diseaseText: {
        fontSize: 16,
        color: '#ffffff',
        marginVertical: 5,
    },
    diseaseTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },

});

