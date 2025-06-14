/**
 * LoginScreen.styles
 * 
 * Returns the responsive and dynamic styles for the LoginScreen.
 * Styles are adapted based on:
 * - Device type (phone or tablet)
 * - Current theme colors
 * - Font scaling preferences
 * 
 * The styles cover:
 * - Containers
 * - Titles
 * - Inputs
 * - Buttons
 * - Informational and error messages
 * 
 * @returns {object} The compiled stylesheet object for the LoginScreen.
 */

import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/context/ThemeContext';
import { useFontScale } from '@/src/context/FontScaleContext';
import useDeviceInfo from '../../hooks/useDeviceInfo';

/**
 * Type definition for the style object used in the LoginScreen.
 * 
 * @typedef {object} Styles
 * @property {object} container - Main container style.
 * @property {object} titleContainer - Title wrapper style.
 * @property {object} title - Title text style.
 * @property {object} formContainer - Form wrapper style.
 * @property {object} inputContainer - Input wrapper style.
 * @property {TextStyle} input - Input text style.
 * @property {object} infoMessage - Informational message text style.
 * @property {object} infoMessageError - Error message text style.
 * @property {object} submitButtonContainer - Submit button wrapper style.
 * @property {TextStyle} submitButton - Submit button text style.
 * @property {object} linksContainer - Links wrapper style (e.g. forgot password, signup).
 */
interface Styles {
    [key: string]: object;
    container: object;
    titleContainer: object;
    title: object;
    formContainer: object;
    emailInputContainer: object;
    input: TextStyle;
    forgotPasswordButtonContainer: object;
    forgotPasswordButton: object;
    logInButtonContainer: object;
    logInButton: TextStyle;
    signUpButtonContainer: object;
    signUpButtonText: object;
    signinButton: object;
    ButtonTextContainer: object;
}

/**
 * Generates and returns the appropriate styles based on the device type.
 * 
 * @returns {object} Compiled stylesheet for the LoginScreen.
 */
const loginStyles = () => {
    const { colors } = useTheme();
    const { deviceType } = useDeviceInfo();
    const { fontScale } = useFontScale();
    const phoneSpecificStyles: Styles = {
        container: {
            flex: 1,
            marginHorizontal: wp('7%'),
            marginTop: hp('8%'),
        },
        titleContainer: {
            marginBottom: hp('7%'),
        },
        title: {
            fontSize: moderateScale(40) * fontScale,
            fontWeight: 'bold',
            color: colors.onBackground,
        },
        formContainer: {
            width: '100%',
            alignSelf: 'center',
        },
        emailInputContainer: {
            marginBottom: hp('1%'),
        },
        input: {
            fontSize: moderateScale(14) * fontScale,
        },
        forgotPasswordButtonContainer: {
            marginBottom: hp('6%'),
            alignItems: 'flex-end',
        },
        forgotPasswordButton: {
            fontSize: moderateScale(12) * fontScale,
            color: colors.primary
        },
        logInButtonContainer: {
            marginBottom: hp('3%'),
        },
        logInButton: {
            fontSize: moderateScale(16) * fontScale,
        },
        signUpButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        signUpButtonText: {
            fontSize: moderateScale(13) * fontScale,
            color: colors.onBackground,
        },
        signinButton: {
            fontSize: moderateScale(13) * fontScale,
            color: colors.primary,
            textDecorationLine: 'underline',
        },
        ButtonTextContainer: {
            lineHeight: moderateScale(22),
        }
    }
    const tabletSpecificStyles:Styles = {
        container: {
            flex: 1,
            marginHorizontal: wp('7%'),
            marginTop: hp('8%'),
        },
        titleContainer: {
            marginBottom: hp('15%'),
        },
        title: {
            fontSize: moderateScale(25) * fontScale,
            fontWeight: 'bold',
            color: colors.onBackground,
            alignSelf: 'center',
        },
        formContainer: {
            width: '60%',
            alignSelf: 'center',
        },
        emailInputContainer: {
            marginBottom: hp('2%'),
        },
        input: {
            fontSize: moderateScale(11) * fontScale,
        },
        forgotPasswordButtonContainer: {
            marginBottom: hp('6%'),
        },
        forgotPasswordButton: {
            fontSize: moderateScale(9) * fontScale,
            color: colors.primary
        },
        logInButtonContainer: {
            marginBottom: hp('3%'),
        },
        logInButton: {
            fontSize: moderateScale(12) * fontScale,
        },
        signUpButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        signUpButtonText: {
            fontSize: moderateScale(10) * fontScale,
            color: colors.onBackground,
        },
        signinButton: {
            fontSize: moderateScale(10) * fontScale,
            color: colors.primary
        },
        ButtonTextContainer: {
            lineHeight: moderateScale(15),
        }
    };
    return StyleSheet.create(deviceType === 'phone' ? phoneSpecificStyles : tabletSpecificStyles);
}

export default loginStyles;