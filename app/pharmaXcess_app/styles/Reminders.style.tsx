import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    alarmCard: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    alarmName: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
    },
    alarmText: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        marginVertical: 5,
        padding: 5,
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
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: colors.text,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 24 * fontScale,
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
        marginBottom: 10,
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale,
    },
    label: {
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.settingsTitle,
    },
    selectedDay: {
        backgroundColor: colors.optionsSecondary,
    },
    dayText: {
        color: colors.infoTitle,
        textAlign: 'center',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.editButtonBackground,
        padding: 8,
        borderRadius: 50,
    },
});
export default createStyles;