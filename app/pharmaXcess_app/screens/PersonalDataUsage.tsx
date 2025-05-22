import React, { useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function PersonalDataUsage({ navigation }): JSX.Element {
    const [dataType, setDataType] = useState("default");
    const [dataDuration, setDataDuration] = useState("default");
    const [dataAssociation, setDataAssociation] = useState("default");
    const [dataRegulation, setDataRegulation] = useState("default");

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Téléchargement des données </Text>
                {["default", "type1", "type2", "type3"].map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, dataType === type && styles.selectedOption]}
                        onPress={() => setDataType(type)}
                    >
                        <Ionicons
                            name={dataType === type ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {type === "default"
                                ? "PDF"
                                : type === "type1"
                                ? "CSV"
                                : type === "type2"
                                ? "Inclure l'historique complet"
                                : "Protéger par mot de passe"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Suppression des données</Text>
                {["default", "short", "medium"].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, dataDuration === duration && styles.selectedOption]}
                        onPress={() => setDataDuration(duration)}
                    >
                        <Ionicons
                            name={dataDuration === duration ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {duration === "default"
                                ? "Historique de navigation"
                                : duration === "short"
                                ? "Ordonnances archivées"
                                : "Données du compte"},
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subtitle}>Partage des données</Text>
                {["default", "option1", "option2"].map((association) => (
                    <TouchableOpacity
                        key={association}
                        style={[styles.option, dataAssociation === association && styles.selectedOption]}
                        onPress={() => setDataAssociation(association)}
                    >
                        <Ionicons
                            name={dataAssociation === association ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color="white"
                        />
                        <Text style={styles.optionText}>
                            {association === "default"
                                ? "Partage avec des tiers"
                                : association === "option1"
                                ? "Partage avec des partenaires"
                                : "Partage avec des chercheurs"}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.subtitle}>Anonymisation</Text>
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
                                ? "Données anonymisées"
                                : regulation === "short"
                                ? "Données pseudonymisées"
                                : "Données non anonymisées"}
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
