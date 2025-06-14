/**
 * ForgotPasswordScreen.styles
 * 
 * Returns the responsive and dynamic styles for the ForgotPasswordScreen.
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
 * @returns {object} The compiled stylesheet object for the ForgotPasswordScreen.
 */


import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/context/ThemeContext';
import { useFontScale } from '@/src/context/FontScaleContext';
import useDeviceInfo from '@/src/hooks/useDeviceInfo';

/**
 * Type definition for the style object used in the ForgotPasswordScreen.
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
 */
interface Styles {
    [key: string]: object;
    container: object;
    titleContainer: object;
    title: object;
    formContainer: object;
    inputContainer: object;
    input: TextStyle;
    infoMessage: object;
    infoMessageError: object;
    submitButtonContainer: object;
    submitButton: TextStyle;
}

/**
 * Generates and returns the appropriate styles based on the device type.
 * 
 * @returns {object} Compiled stylesheet for the ForgotPasswordScreen.
 */
const forgetPasswordStyles = () => {
    const { colors } = useTheme();
    const { deviceType } = useDeviceInfo();
    const { fontScale } = useFontScale();

    const phoneSpecificStyles:Styles = {
        container: {
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
        infoMessage: {
            fontSize: moderateScale(12) * fontScale,
            color: colors.onBackground,
        },
        infoMessageError: {
            color: colors.error
        },
        submitButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('6%'),
        },
        submitButton: {
            fontSize: moderateScale(16) * fontScale,
        },
    };
    const tabletSpecificStyles:Styles = {
        container: {
            flex: 1,
            marginHorizontal: wp('7%'),
            marginTop: hp('8%'),
        },
        titleContainer: {
            marginBottom: hp('10%'),
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
        infoMessage: {
            fontSize: moderateScale(10) * fontScale,
            color: colors.onBackground,
        },
        infoMessageError: {
            color: colors.error
        },
        submitButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('8%'),
        },
        submitButton: {
            fontSize: moderateScale(12) * fontScale,
        },
    };
    return StyleSheet.create(deviceType === 'phone' ? phoneSpecificStyles : tabletSpecificStyles);
};

export default forgetPasswordStyles;