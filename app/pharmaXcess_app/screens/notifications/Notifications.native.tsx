import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

// The Notifications component allows users to customize their notification settings, including medical alerts, medication reminders, push notifications, reminder frequency, and advanced personalization options.
import type { StackNavigationProp } from '@react-navigation/stack';

type NotificationsProps = {
    navigation: StackNavigationProp<any>;
};

export default function Notifications({ navigation }: NotificationsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    const [fontSize, setFontSize] = useState('medium');
    const [contrast, setContrast] = useState('standard');
    const [theme, setTheme] = useState('light');
    const [frequency, setFrequency] = useState('daily');
    const [personnalisation, setPersonalisation] = useState('enabled');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Gestion des alertes médicales </Text>
                {['small', 'medium', 'large'].map((size) => (
                    <TouchableOpacity
                        key={size}
                        style={[styles.option, fontSize === size && styles.selectedOption]}
                        onPress={() => setFontSize(size)}
                    >
                        <Ionicons
                            name={fontSize === size ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {size === 'small' 
                            ? 'Alertes médicaments à prendre ' 
                            : size === 'medium' 
                            ? 'Notifications de renouvellement d\'ordonnance ' 
                            : 'rappels rendez-vous médicaux'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Rappels de médicaments</Text>
                {['standard', 'deuteranopia', 'protanopia', 'tritanopia'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.option, contrast === mode && styles.selectedOption]}
                        onPress={() => setContrast(mode)}
                    >
                        <Ionicons
                            name={contrast === mode ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {mode === 'standard' 
                            ? 'Sons différents selon l\'importance du médicament ' 
                            : mode === 'deuteranopia' 
                            ? 'Rappels multiples (15 minutes avant, à l\'heure, 15 minutes après)' 
                            : mode === 'protanopia' 
                            ? 'Rappels jusqu\'à confirmation de prise médicament' 
                            : 'Envoyer les rappels par SMS ou e-mail'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Notifications push </Text>
                {['light', 'dark', 'discret'].map((themeOption) => (
                    <TouchableOpacity
                        key={themeOption}
                        style={[styles.option, theme === themeOption && styles.selectedOption]}
                        onPress={() => setTheme(themeOption)}
                    >
                        <Ionicons
                            name={theme === themeOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {themeOption === 'light' 
                            ? 'Activer les notifications push ' 
                            : themeOption === 'dark'
                            ? 'Afficher contenu des notifications sur l\'écran verrouillé '
                            : 'Mode discret (sans détails sensibles) '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Fréquence des rappels </Text>
                {['daily', 'weekly'].map((freq) => (
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
                            {freq === 'daily' 
                            ? 'Rappels toutes les 5 minutes jusqu\'à 3 fois par jour' 
                            : 'Rappels personnalisés '}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Personnalisation avancée </Text>
                {['enabled', 'disabled', 'vocal', 'silent'].map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.option, personnalisation === option && styles.selectedOption]}
                        onPress={() => setPersonalisation(option)}
                    >
                        <Ionicons
                            name={personnalisation === option ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {option === 'enabled' 
                            ? 'Regrouper les notifications par période de temps (matin, midi, soir)' 
                            : option === 'disabled'
                            ? 'Notifications contextuelles basées sur localisation'
                            : option === 'vocal'
                            ? 'Notifications vocales'
                            : 'Notifications silencieuses dans lieux (travail, cinéma)'}
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