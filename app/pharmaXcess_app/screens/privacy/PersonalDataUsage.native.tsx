import React, { useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The PersonalDataUsage component allows users to manage their personal data usage preferences.
export default function PersonalDataUsage({ navigation }): React.JSX.Element {

    const [dataRegulation, setDataRegulation] = useState("default");
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Consentements </Text>
                {["default", "short", "medium"].map((regulation) => (
                    <TouchableOpacity
                        key={regulation}
                        style={[styles.option, dataRegulation === regulation && styles.selectedOption]}
                        onPress={() => setDataRegulation(regulation)}
                    >
                        <Ionicons
                            name={dataRegulation === regulation ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {regulation === "default"
                                ? "Consentement pour partager toutes les données d\'usage et d\'amélioration"
                                : regulation === "short"
                                ? "Consentement pour les données anonymisées à des fins de statistiques"
                                : "Consentement pour la recherche médicale"}
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
