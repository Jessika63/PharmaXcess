import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16 * fontScale,
        fontWeight: '600',
        color: colors.profileText,
        marginBottom: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 10,
        backgroundColor: colors.inputBackground,
        overflow: 'hidden',
    },
    pickerContainerError: {
        borderColor: colors.error || '#FF6B6B',
    },
    picker: {
        height: 50,
        color: colors.text,
    },
    pickerItem: {
        fontSize: 16 * fontScale,
        color: colors.text,
    },
    errorText: {
        color: colors.error || '#FF6B6B',
        fontSize: 14 * fontScale,
        marginTop: 5,
        marginLeft: 5,
    },
});

export default createStyles;
