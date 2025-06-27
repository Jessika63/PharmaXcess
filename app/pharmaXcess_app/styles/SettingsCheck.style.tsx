import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';


const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.settingsTitle,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        backgroundColor: colors.optionsPrimary,
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: colors.optionsSecondary,
        borderRadius: 10,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        overflow: 'hidden',    },
    optionText: {
        fontSize: 18 * fontScale,
        color: colors.text,
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
        fontSize: 18 * fontScale,
        color: colors.text,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 20,
    },
});

export default createStyles;