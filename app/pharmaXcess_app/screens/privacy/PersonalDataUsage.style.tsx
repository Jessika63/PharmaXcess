import { StyleSheet } from 'react-native';


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
export default styles;