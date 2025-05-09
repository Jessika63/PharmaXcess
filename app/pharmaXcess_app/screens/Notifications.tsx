import react, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Notifications({ navigation }): JSX.Element {
    const [fontSize, setFontSize] = useState('medium');
    const [contrast, setContrast] = useState('standard');
    const [theme, setTheme] = useState('light');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Options de police</Text>
                {['small', 'medium', 'large'].map((size) => (
                    <TouchableOpacity
                        key={size}
                        style={[styles.option, fontSize === size && styles.selectedOption]}
                        onPress={() => setFontSize(size)}
                    >
                        <Ionicons
                            name={fontSize === size ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {size === 'small' ? 'Petite' : size === 'medium' ? 'Moyenne' : 'Grande'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Options de contraste</Text>
                {['standard', 'deuteranopia', 'protanopia', 'tritanopia'].map((mode) => (
                    <TouchableOpacity
                        key={mode}
                        style={[styles.option, contrast === mode && styles.selectedOption]}
                        onPress={() => setContrast(mode)}
                    >
                        <Ionicons
                            name={contrast === mode ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {mode === 'standard' ? 'Standard' : mode === 'deuteranopia' ? 'Deutéranopie' : mode === 'protanopia' ? 'Protanopie' : 'Tritanopie'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thème de l'application</Text>
                {['light', 'dark'].map((themeOption) => (
                    <TouchableOpacity
                        key={themeOption}
                        style={[styles.option, theme === themeOption && styles.selectedOption]}
                        onPress={() => setTheme(themeOption)}
                    >
                        <Ionicons
                            name={theme === themeOption ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {themeOption === 'light' ? 'Clair' : 'Sombre'}
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
    sectionTitle: {
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
        backgroundColor: '#F57196',
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#EE9AD0',
    },
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
