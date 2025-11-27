import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        color: colors.iconPrimary,
        fontSize: 18 * fontScale,
        marginTop: 20,
        textAlign: 'center',
    },
    errorContent: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.background,
        borderRadius: 20,
        margin: 20,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        color: colors.error,
        marginBottom: 10,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16 * fontScale,
        color: colors.profileText,
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    retryButtonGradient: {
        paddingHorizontal: 24, 
        paddingVertical: 12, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButtonText: {
        color: colors.iconPrimary,
        fontSize: 16 * fontScale,
        fontWeight: '600',
    },
});

export default createStyles;
