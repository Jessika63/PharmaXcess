import React, { useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function PersonalDataUsage({ navigation }): JSX.Element {
    const [dataRegulation, setDataRegulation] = useState("default");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Consentements </Text>
                {["default", "short", "medium"].map((regulation) => (
                    <TouchableOpacity
                        key={regulation}
                        style={[styles.option, dataRegulation === regulation && styles.selectedOption]}
                        onPress={() => setDataRegulation(regulation)}
                    >
                        <Ionicons
                            name={dataRegulation === regulation ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color="white"
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
                <LinearGradient colors={["#EE9AD0", "#F57196"]} style={styles.returnButtonGradient}>
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
        backgroundColor: "white",
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#F57196",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: "#adadad",
    },
    selectedOption: {
        backgroundColor: "#F57196",
        borderRadius: 10,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        fontSize: 18,
        color: "white",
        marginLeft: 10,
    },
    returnButtonGradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        width: "100%",
        overflow: "hidden",
    },
    returnButton: {
        marginTop: 20,
        borderRadius: 10,
        width: "100%",
        overflow: "hidden",
    },
    returnButtonText: {
        fontSize: 18,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
    },
    gradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: "center",
        borderRadius: 10,
        alignItems: "center",
    },
});
