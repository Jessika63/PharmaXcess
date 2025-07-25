import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 30 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: colors.profileText,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16 * fontScale,
        fontWeight: '600',
        color: colors.profileText,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 10,
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale,
    },
    inputFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: colors.error || '#FF6B6B',
        borderWidth: 2,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: 15,
        top: 15,
        padding: 5,
        color: colors.profileText,
    },
    errorText: {
        color: colors.error || '#FF6B6B',
        fontSize: 14 * fontScale,
        marginTop: 5,
        marginLeft: 5,
    },
    loginButton: {
        marginTop: 30,
        borderRadius: 10,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: colors.text,
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    forgotPasswordContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 16 * fontScale,
        textDecorationLine: 'underline',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        padding: 20,
    },
    registerText: {
        color: colors.profileText,
        fontSize: 16 * fontScale,
    },
    registerLink: {
        color: colors.primary,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    accessibilityAnnouncement: {
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
    },
});

export default createStyles;
