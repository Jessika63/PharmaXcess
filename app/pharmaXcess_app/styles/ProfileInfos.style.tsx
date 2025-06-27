import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    list: {
        alignItems: 'center',
    },
    card: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        marginVertical: 5,
        padding: 5,
    },
    cardTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 10,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    bold: {
        fontWeight: 'bold',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.editButtonBackground,
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
        width: '40%',

    },
    buttonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16 * fontScale,
    },
    arrowContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale,
    },
    modalTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.settingsTitle,
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        flexGrow: 1,
    },
});

export default createStyles;