import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        marginBottom: 15,
        flex: 1, 
    },
    label: {
        fontSize: 16 * fontScale,
        fontWeight: '600',
        color: colors.settingsTitle,
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 2, 
        borderColor: colors.inputBorder,
        borderRadius: 10,
        backgroundColor: colors.inputBackground,
        overflow: 'hidden',
        minHeight: 50, 
    },
    pickerContainerError: {
        borderColor: colors.error,
    },
    pickerButton: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: colors.inputBackground, 
    },
    pickerText: {
        fontSize: 16 * fontScale,
        color: colors.infoText, 
        flex: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: colors.background,
        marginHorizontal: 20,
        borderRadius: 10,
        maxHeight: '50%',
    },
    modalHeader: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.settingsTitle,
        textAlign: 'center',
    },
    optionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    optionText: {
        fontSize: 16 * fontScale,
        color: colors.text, 
    },
    errorText: {
        color: colors.error,
        fontSize: 14 * fontScale,
        marginTop: 5,
        marginLeft: 5,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default createStyles;
