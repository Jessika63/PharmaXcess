import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// AppPreferences component allows users to customize their app settings such as language, date format, time format, synchronization frequency, and more.
export default function AppPreferences({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
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
                <Text style={styles.title}>Langue</Text>
                {['French', 'English', 'Spanish', 'German', 'Italian', 'Nederlands', 'Portugues'].map((lang) => (
                    <TouchableOpacity
                        key={lang}
                        style={[styles.option, language === lang && styles.selectedOption]}
                        onPress={() => setLanguage(lang)}
                    >
                        <Ionicons
                            name={language === lang ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {lang === 'French'
                                ? 'Français'
                                : lang === 'English'
                                ? 'Anglais'
                                : lang === 'Spanish'
                                ? 'Espagnol'
                                : lang === 'German'
                                ? 'Allemand'
                                : lang === 'Italian'
                                ? 'Italien'
                                : lang === 'Nederlands'
                                ? 'Néerlandais'
                                : 'Portugais'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Format de date</Text>
                {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].map((format) => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.option, date === format && styles.selectedOption]}
                        onPress={() => setDate(format)}
                    >
                        <Ionicons
                            name={date === format ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {format === 'DD/MM/YYYY'
                                ? 'JJ/MM/AAAA'
                                : format === 'MM/DD/YYYY'
                                ? 'MM/JJ/AAAA'
                                : 'AAAA/MM/JJ'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Format d'heure</Text>
                {['24h', '12h'].map((format) => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.option, time === format && styles.selectedOption]}
                        onPress={() => setTime(format)}
                    >
                        <Ionicons
                            name={time === format ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {format === '24h' ? '24 heures' : '12 heures (AM/PM) '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Fréquence de synchronisation </Text>
                {['Real time', 'Hour', 'Daily', 'Wi-fi '].map((freq) => (
                    <TouchableOpacity
                        key={freq}
                        style={[styles.option, frequency === freq && styles.selectedOption]}
                        onPress={() => setFrequency(freq)}
                    >
                        <Ionicons
                            name={frequency === freq ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {freq === 'Real time'
                                ? 'Temps réel'
                                : freq === 'Hour'
                                ? 'Toute les heures'
                                : freq === 'Daily'
                                ? 'Quotidien'
                                : 'Wi-fi uniquement'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Éléments à synchroniser </Text>
                {['Treatments', 'Appointment', 'Prescriptions', 'Profile'].map((elem) => (
                    <TouchableOpacity
                        key={elem}
                        style={[styles.option, elements === elem && styles.selectedOption]}
                        onPress={() => setElements(elem)}
                    >
                        <Ionicons
                            name={elements === elem ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {elem === 'Treatments'
                                ? 'Traitements et médicaments'
                                : elem === 'Appointment'
                                ? 'Rendez-vous médicaux '
                                : elem === 'Prescriptions'
                                ? 'Ordonnances'
                                : 'Profil'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Sauvegarde</Text>
                {['Local', 'Cloud'].map((saveOption) => (
                    <TouchableOpacity
                        key={saveOption}
                        style={[styles.option, save === saveOption && styles.selectedOption]}
                        onPress={() => setSave(saveOption)}
                    >
                        <Ionicons
                            name={save === saveOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {saveOption === 'Local'
                                ? 'Sauvegarde sur l\'appareil uniquement '
                                : 'Sauvegarde dans le cloud'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Fonctionnalités disponibles hors-lignes </Text>
                {['Medicine', 'Alarm', 'Profil', 'Check'].map((func) => (
                    <TouchableOpacity
                        key={func}
                        style={[styles.option, fonctionality === func && styles.selectedOption]}
                        onPress={() => setFonctionality(func)}
                    >
                        <Ionicons
                            name={fonctionality === func ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {func === 'Medicine'
                                ? 'Consultation des médicaments'
                                : func === 'Alarm'
                                ? 'Recevoir des rappels de médicaments'
                                : func === 'Profil'
                                ? 'Accéder à mon profil'
                                : 'Marquer les médicaments comme pris'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Téléchargement</Text>
                {['Important', 'Wi-fi', 'Ask '].map((downloadOption) => (
                    <TouchableOpacity
                        key={downloadOption}
                        style={[styles.option, download === downloadOption && styles.selectedOption]}
                        onPress={() => setDownload(downloadOption)}
                    >
                        <Ionicons
                            name={download === downloadOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {downloadOption === 'Important'
                                ? 'Télécharger les informations essentielles seulement pour utilisation hors-ligne'
                                : downloadOption === 'Wi-fi'
                                ? 'Télécharger uniquement sur Wi-fi'
                                : 'Demander avant de télécharger'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Notifications hors-ligne </Text>
                {['All', 'Alarm', 'Nothing '].map((notify) => (
                    <TouchableOpacity
                        key={notify}
                        style={[styles.option, notifications === notify && styles.selectedOption]}
                        onPress={() => setNotifications(notify)}
                    >
                        <Ionicons
                            name={notifications === notify ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {notify === 'All'
                                ? 'Activer les notifications même hors-ligne'
                                : notify === 'Alarm'
                                ? 'Activer uniquement les rappels de médicaments'
                                : 'Désactiver toutes les notifications'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
