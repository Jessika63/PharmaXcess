import { StyleSheet, TextStyle } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { useTheme } from '@/src/context/ThemeContext';
import { useFontScale } from '@/src/context/FontScaleContext';
import useDeviceInfo from '@/src/hooks/useDeviceInfo';

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