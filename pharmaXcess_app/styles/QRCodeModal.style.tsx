import { StyleSheet, Dimensions } from 'react-native';
import { ColorScheme } from './Colors';

const { width, height } = Dimensions.get('window');

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderRadius: 20,
        padding: 20,
        width: width * 0.9,
        maxHeight: height * 0.8,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.profileText,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileName: {
        fontSize: 18 * fontScale,
        fontWeight: '600',
        color: colors.profileText,
        marginBottom: 5,
    },
    profileDetails: {
        fontSize: 14 * fontScale,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    qrContainer: {
        backgroundColor: colors.background,
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    instructionText: {
        fontSize: 14 * fontScale,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    actionButton: {
        width: '80%',
        borderRadius: 25,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: colors.iconPrimary,
        fontSize: 16 * fontScale,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default createStyles;
