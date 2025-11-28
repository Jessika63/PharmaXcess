import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

export const createStyles = (colors: ColorScheme, fontScale: number) => {
    return StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContainer: {
            backgroundColor: colors.background,
            borderRadius: 15,
            padding: 20,
            width: '100%',
            maxWidth: 400,
        },
        modalTitle: {
            textAlign: 'center',
            marginBottom: 20,
            fontSize: 20 * fontScale,
            fontWeight: 'bold',
            color: colors.profileText,
        },
        inputLabel: {
            marginBottom: 10,
            fontSize: 14 * fontScale,
            color: colors.profileText,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 10,
            padding: 15,
            marginBottom: 20,
            fontSize: 16 * fontScale,
            color: colors.profileText,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: colors.primary,
            borderRadius: 10,
            marginBottom: 20,
        },
        picker: {
            color: colors.profileText,
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        cancelButton: {
            flex: 1,
            padding: 15,
            borderRadius: 10,
            backgroundColor: colors.surface,
            marginRight: 10,
            alignItems: 'center',
        },
        createButton: {
            flex: 1,
            padding: 15,
            borderRadius: 10,
            backgroundColor: colors.primary,
            marginLeft: 10,
            alignItems: 'center',
        },
        cancelButtonText: {
            color: colors.profileText,
            fontWeight: 'bold',
            fontSize: 16 * fontScale,
        },
        createButtonText: {
            color: colors.text,
            fontWeight: 'bold',
            fontSize: 16 * fontScale,
        },
    });
};

export default createStyles;
