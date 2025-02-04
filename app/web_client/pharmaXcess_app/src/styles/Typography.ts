import { StyleSheet } from 'react-native';
import { useTheme } from './Theme';

export const Typography = () => {
    const { colors } = useTheme();
    return StyleSheet.create({
        defaultText: {
            fontFamily: 'SpaceMono-Regular',
            fontSize: 16,
            color: colors.text,
        },
        heading: {
            fontFamily: 'SpaceMono-Regular',
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.primary,
        },
        subheading: {
            fontFamily: 'SpaceMono-Regular',
            fontSize: 20,
            fontWeight: 'normal',
            color: colors.text,
        },
        buttonText: {
            fontFamily: 'SpaceMono-Regular',
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.background,
        },
    });
}
