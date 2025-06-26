import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: colors.background,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: colors.card,
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.infoTitle,
    },
    content: {
        fontSize: 16,
        color: colors.infoText,
        marginTop: 4,
    },
    date: {
        fontSize: 14,
        color: colors.infoTextSecondary,
        marginTop: 4,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    buttonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.settingsTitle,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: colors.inputBackground,
        fontSize: 16,
    },
    saveButton: {
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        overflow: 'hidden',
    },
    saveButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default createStyles;