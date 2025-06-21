import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, ViewStyle, TextInput, StyleProp, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';

type Disease = {
    name : string;
    description : string;
    symptoms : string;
    beginDate : string;
    medications : string;
    examens : string;
};

type DiseasesProps = {
    navigation: StackNavigationProp<any, any>;
};

export default function Diseases({ navigation }: DiseasesProps) : JSX.Element {
    const [expanded, setExpanded] = useState<number | null>(null);

    const [diseases, setDiseases] = useState<Disease[]>([
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
    ]);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [newDisease, setNewDisease] = useState<Disease>({
        name: '',
        description: '',
        symptoms: '',
        beginDate: '',
        medications: '',
        examens: '',
    });

    const toggleCard = (index: number): void => {
        setExpanded(expanded === index ? null : index);
    };

    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [isYearModalVisible, setIsYearModalVisible] = useState<boolean>(false);
    const [isMonthModalVisible, setIsMonthModalVisible] = useState<boolean>(false);
    const [isDayModalVisible, setIsDayModalVisible] = useState<boolean>(false);

    const years = Array.from({ length: 10 }, (_, i) => (2020 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const handleAddPress = (): void => {
        if (
            !newDisease.name ||
            !newDisease.description ||
            !newDisease.symptoms ||
            !selectedYear ||
            !selectedMonth ||
            !selectedDay ||
            !newDisease.medications ||
            !newDisease.examens
        ) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs pour ajouter une nouvelle maladie.');
            return;
        }
    
        const newDiseaseData: Disease = {
            ...newDisease,
            beginDate: `${selectedYear}-${selectedMonth}-${selectedDay}`,
        };
    
        setDiseases([newDiseaseData, ...diseases]);
        setNewDisease({
            name: '',
            description: '',
            symptoms: '',
            beginDate: '',
            medications: '',
            examens: '',
        });
        setModalVisible(false);
        setSelectedYear('2020');
        setSelectedMonth('01');
        setSelectedDay('01');
    };

    const handleEditPress = (diseaseName: string): void => {
        Alert.alert('Modifier la maladie', `Cette fonctionnalité n\'est pas encore implémentée pour la maladie "${diseaseName}".`);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.diseaseList}>
                {diseases.map((disease, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleCard(index)}>
                        <View style={styles.diseaseCard}>
                            <TouchableOpacity onPress={() => handleEditPress(disease.name)} style={styles.editButton}>
                                <Ionicons name="pencil" size={25} color="#ffffff" />
                            </TouchableOpacity>
                            <View style={styles.cardHeader}>
                                <Text style={styles.diseaseTitle}>{disease.name}</Text>
                            </View>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Description: </Text>
                                {expanded === index ? disease.description : `${disease.description.slice(0, 70)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Symptômes: </Text>
                                {expanded === index ? disease.symptoms : `${disease.symptoms.slice(0, 75)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Date de début: </Text>
                                {expanded === index ? disease.beginDate : `${disease.beginDate.slice(0, 25)}`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Traitements: </Text>
                                {expanded === index ? disease.medications : `${disease.medications.slice(0, 75)}...`}
                            </Text>
                            <Text style={styles.diseaseText}>
                                <Text style={styles.bold}>Examens: </Text>
                                {expanded === index ? disease.examens : `${disease.examens.slice(0, 75)}...`}
                            </Text>
                            <TouchableOpacity onPress={() => toggleCard(index)} style={styles.arrowContainer}>
                                <Ionicons
                                    name={expanded === index ? 'chevron-up-outline' : 'chevron-down-outline'}
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
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
            <Modal visible={isModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.scrollableContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <View style={styles.container}>
                        <Text style={styles.diseaseTitle}>Ajouter une maladie</Text>
                        <TextInput
                            placeholder="Nom"
                            value={newDisease.name}
                            onChangeText={(text) => setNewDisease({ ...newDisease, name: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Description"
                            value={newDisease.description}
                            onChangeText={(text) => setNewDisease({ ...newDisease, description: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Symptômes"
                            value={newDisease.symptoms}
                            onChangeText={(text) => setNewDisease({ ...newDisease, symptoms: text })}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={() => setIsYearModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Année: {selectedYear}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsMonthModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Mois: {selectedMonth}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsDayModalVisible(true)} style={styles.selector}>
                            <Text style={styles.selectorText}>Jour: {selectedDay}</Text>
                        </TouchableOpacity>
                        <TextInput
                            placeholder="Traitements"
                            value={newDisease.medications}
                            onChangeText={(text) => setNewDisease({ ...newDisease, medications: text })}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Examens"
                            value={newDisease.examens}
                            onChangeText={(text) => setNewDisease({ ...newDisease, examens: text })}
                            style={styles.input}
                        />
                        <TouchableOpacity onPress={handleAddPress} style={styles.button}>
                            <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                                <Text style={styles.buttonText}>Confirmer</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
            <Modal visible={isYearModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner une année</Text>
                    <ScrollView>
                        {years.map((year) => (
                            <TouchableOpacity
                                key={year}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedYear(year);
                                    setIsYearModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{year}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isMonthModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner un mois</Text>
                    <ScrollView>
                        {months.map((month) => (
                            <TouchableOpacity
                                key={month}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedMonth(month);
                                    setIsMonthModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{month}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            <Modal visible={isDayModalVisible} animationType="slide">
                <View style={styles.scrollableModal}>
                    <Text style={styles.modalTitle}>Sélectionner un jour</Text>
                    <ScrollView>
                        {days.map((day) => (
                            <TouchableOpacity
                                key={day}
                                style={styles.selectorItem}
                                onPress={() => {
                                    setSelectedDay(day);
                                    setIsDayModalVisible(false);
                                }}
                            >
                                <Text style={styles.selectorItemText}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diseaseText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
        padding: 5,
    } as TextStyle,
    diseaseTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    } as TextStyle,
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    bold: {
        fontWeight: 'bold',
    } as TextStyle,
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    } as ViewStyle,
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    } as TextStyle,
    arrowContainer: {
        alignItems: 'center',
        marginTop: 10,
    } as ViewStyle,
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    } as TextStyle,
    selectorItemText: { 
        fontSize: 18,
        color: '#333',
    },
    selectorItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    } as ViewStyle,
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    } as TextStyle,
    scrollableModal: { 
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    } as TextStyle,
    selector: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    } as ViewStyle,
    scrollableContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
        padding: 20,
        backgroundColor: '#ffffff',
    },
});
