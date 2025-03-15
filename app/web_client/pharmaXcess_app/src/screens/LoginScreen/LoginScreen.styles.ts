import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/context/ThemeContext';
import { useFontScale } from '@/src/context/FontScaleContext';
import useDeviceInfo from '../../hooks/useDeviceInfo';

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