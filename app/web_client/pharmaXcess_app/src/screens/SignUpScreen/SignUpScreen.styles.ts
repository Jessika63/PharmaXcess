/**
 * SignUpScreen.styles
 * 
 * Returns the responsive and dynamic styles for the SignUpScreen.
 * Styles are adapted based on:
 * - Device type (phone or tablet)
 * - Current theme colors
 * - Font scaling preferences
 * 
 * The styles cover:
 * - Containers
 * - Titles
 * - Input fields
 * - Buttons
 * - Navigation links (login)
 * 
 * @returns {object} The compiled stylesheet object for the SignUpScreen.
 */

import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/context/ThemeContext';
import { useFontScale } from '@/src/context/FontScaleContext';
import useDeviceInfo from '@/src/hooks/useDeviceInfo';

/**
 * Type definition for the style object used in the SignUpScreen.
 * 
 * @typedef {object} Styles
 * @property {object} container - Main container style.
 * @property {object} titleContainer - Title wrapper style.
 * @property {object} title - Title text style.
 * @property {object} formContainer - Form wrapper style.
 * @property {object} inputContainer - Input field wrapper style.
 * @property {TextStyle} input - Input text style.
 * @property {object} signUpButtonContainer - Sign up button wrapper style.
 * @property {TextStyle} signUpButton - Sign up button text style.
 * @property {object} logInButtonContainer - Login link wrapper style.
 * @property {object} logInText - Static login text style.
 * @property {object} loginButton - Login button style.
 * @property {object} logInButtonText - Login button text container style.
 */

interface Styles {
    [key: string]: object;
    container: object;
    titleContainer: object;
    title: object;
    formContainer: object;
    inputContainer: object;
    input: TextStyle;
    signUpButtonContainer: object;
    signUpButton: TextStyle;
    logInButtonContainer: object;
    logInText: object;
    loginButton: object;
    logInButtonText: object;
}

/**
 * Generates and returns the appropriate styles based on the device type.
 * 
 * @returns {object} Compiled stylesheet for the SignUpScreen.
 */
const signUpStyles = () => {
    const { colors } = useTheme();
    const { deviceType } = useDeviceInfo();
    const { fontScale } = useFontScale();

    const phoneSpecificStyles:Styles = {
        container: {
            flexGrow: 1,
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
        inputContainer: {
            marginBottom: hp('2%'),
        },
        input: {
            fontSize: moderateScale(14) * fontScale,
        },
        signUpButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('6%'),
        },
        signUpButton: {
            fontSize: moderateScale(16) * fontScale,
        },
        logInButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logInText: {
            fontSize: moderateScale(13) * fontScale,
            color: colors.onBackground,
        },
        loginButton: {
            fontSize: moderateScale(13) * fontScale,
            color: colors.primary,
            textDecorationLine: 'underline'
        },
        logInButtonText: {
            lineHeight: moderateScale(22),
        }
    }
    const tabletSpecificStyles:Styles = {
        container: {
            flexGrow: 1,
            marginHorizontal: wp('7%'),
            marginTop: hp('8%'),
        },
        titleContainer: {
            marginBottom: hp('7%'),
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
        inputContainer: {
            marginBottom: hp('2%'),
        },
        input: {
            fontSize: moderateScale(11) * fontScale,
        },
        signUpButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('8%'),
        },
        signUpButton: {
            fontSize: moderateScale(12) * fontScale,
        },
        logInButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logInText: {
            fontSize: moderateScale(10) * fontScale,
            color: colors.onBackground,
        },
        loginButton: {
            fontSize: moderateScale(10) * fontScale,
            color: colors.primary
        },
        logInButtonText: {
            lineHeight: moderateScale(15),
        }
    }
    return StyleSheet.create(deviceType === 'phone' ? phoneSpecificStyles : tabletSpecificStyles);
}

export default signUpStyles;