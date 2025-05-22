import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AppPreferences({ navigation }): JSX.Element {
    const [language, setLanguage] = useState('French');
    const [date, setDate] = useState('DD/MM/YYYY');
    const [time, setTime] = useState('24h');
    const [frequency, setFrequency] = useState('Daily');
    const [elements, setElements] = useState('All');
    const [save, setSave] = useState('Local');
    const [fonctionality, setFonctionality] = useState('Default');
    const [download, setDownload] = useState('Default');
    const [notifications, setNotifications] = useState('Default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Langue</Text>
                {['French', 'English', 'Spanish'].map((lang) => (
                    <TouchableOpacity
                        key={lang}
                        style={[styles.option, language === lang && styles.selectedOption]}
                        onPress={() => setLanguage(lang)}
                    >
                        <Ionicons
                            name={language === lang ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{lang}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Format de date</Text>
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].map((format) => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.option, date === format && styles.selectedOption]}
                        onPress={() => setDate(format)}
                    >
                        <Ionicons
                            name={date === format ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{format}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Format d'heure</Text>
                {['24h', '12h'].map((format) => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.option, time === format && styles.selectedOption]}
                        onPress={() => setTime(format)}
                    >
                        <Ionicons
                            name={time === format ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{format}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Fréquence de notification</Text>
                {['Daily', 'Weekly', 'Monthly'].map((freq) => (
                    <TouchableOpacity
                        key={freq}
                        style={[styles.option, frequency === freq && styles.selectedOption]}
                        onPress={() => setFrequency(freq)}
                    >
                        <Ionicons
                            name={frequency === freq ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{freq}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Éléments à afficher</Text>
                {['All', 'Favorites', 'Recent'].map((elem) => (
                    <TouchableOpacity
                        key={elem}
                        style={[styles.option, elements === elem && styles.selectedOption]}
                        onPress={() => setElements(elem)}
                    >
                        <Ionicons
                            name={elements === elem ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{elem}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Sauvegarde</Text>
                {['Local', 'Cloud'].map((saveOption) => (
                    <TouchableOpacity
                        key={saveOption}
                        style={[styles.option, save === saveOption && styles.selectedOption]}
                        onPress={() => setSave(saveOption)}
                    >
                        <Ionicons
                            name={save === saveOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{saveOption}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Fonctionnalité</Text>
                {['Default', 'Advanced'].map((func) => (
                    <TouchableOpacity
                        key={func}
                        style={[styles.option, fonctionality === func && styles.selectedOption]}
                        onPress={() => setFonctionality(func)}
                    >
                        <Ionicons
                            name={fonctionality === func ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{func}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Téléchargement</Text>
                {['Default', 'High Quality'].map((downloadOption) => (
                    <TouchableOpacity
                        key={downloadOption}
                        style={[styles.option, download === downloadOption && styles.selectedOption]}
                        onPress={() => setDownload(downloadOption)}
                    >
                        <Ionicons
                            name={download === downloadOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{downloadOption}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Notifications</Text>
                {['Default', 'Silent'].map((notify) => (
                    <TouchableOpacity
                        key={notify}
                        style={[styles.option, notifications === notify && styles.selectedOption]}
                        onPress={() => setNotifications(notify)}
                    >
                        <Ionicons
                            name={notifications === notify ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>{notify}</Text>
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
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#adadad',
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 18,
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: '100%',
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        paddingVertical: 15,
    },
    returnButtonText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});