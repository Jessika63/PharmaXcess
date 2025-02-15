import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/styles/Theme';
import useDeviceInfo from '@/src/hooks/useDeviceInfo';

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

const signUpStyles = () => {
    const { colors } = useTheme();
    const { deviceType } = useDeviceInfo();

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
            fontSize: moderateScale(40),
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
            fontSize: moderateScale(14),
        },
        signUpButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('6%'),
        },
        signUpButton: {
            fontSize: moderateScale(16),
        },
        logInButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logInText: {
            fontSize: moderateScale(13),
            color: colors.onBackground,
        },
        loginButton: {
            fontSize: moderateScale(13),
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
            fontSize: moderateScale(25),
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
            fontSize: moderateScale(11),
        },
        signUpButtonContainer: {
            marginBottom: hp('3%'),
            marginTop: hp('8%'),
        },
        signUpButton: {
            fontSize: moderateScale(12),
        },
        logInButtonContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        logInText: {
            fontSize: moderateScale(10),
            color: colors.onBackground,
        },
        loginButton: {
            fontSize: moderateScale(10),
            color: colors.primary
        },
        logInButtonText: {
            lineHeight: moderateScale(15),
        }
    }
    return StyleSheet.create(deviceType === 'phone' ? phoneSpecificStyles : tabletSpecificStyles);
}

export default signUpStyles;