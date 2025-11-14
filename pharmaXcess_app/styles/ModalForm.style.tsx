import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    modalContainer: { 
        flex: 1, 
        backgroundColor: colors.background,
    },
    modalTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.settingsTitle,
        textAlign: 'center',
    },
    input: { 
        width: '100%', 
        padding: 15, 
        borderWidth: 2, 
        borderColor: colors.inputBorder,
        borderRadius: 10, 
        marginBottom: 15, 
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale, 
        color: colors.infoText,
    },
    inputMultiline: { 
        width: '100%', 
        padding: 15, 
        borderWidth: 2, 
        borderColor: colors.inputBorder,
        borderRadius: 10, 
        marginBottom: 15, 
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale, 
        color: colors.infoText,
        minHeight: 80, 
        textAlignVertical: 'top', 
    },
    label: { 
        fontSize: 16 * fontScale, 
        fontWeight: '600', 
        marginBottom: 8, 
        color: colors.settingsTitle,
    },
    scrollContainer: { 
        backgroundColor: colors.background,
    },
    scrollContent: { 
        padding: 20, 
        paddingBottom: 30,
    },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 20,
    },
    button: { 
        flex: 1, 
        padding: 15, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginHorizontal: 5,
    },
    cancelButton: { 
        backgroundColor: colors.error,
    },
    saveButton: { 
        backgroundColor: colors.primary,
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 16 * fontScale, 
        fontWeight: 'bold',
    },
});

export default createStyles;
