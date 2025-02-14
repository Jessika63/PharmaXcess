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
    infoMessage: object;
    infoMessageError: object;
    submitButtonContainer: object;
    submitButton: TextStyle;
}

const forgetPasswordStyles = () => {
    const { colors } = useTheme();
    const { deviceType } = useDeviceInfo();

    const phoneSpecificStyles:Styles = {
        container: {
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
        infoMessage: {
            fontSize: moderateScale(12),
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
            fontSize: moderateScale(16),
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
        infoMessage: {
            fontSize: moderateScale(10),
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
            fontSize: moderateScale(12),
        },
    };
    return StyleSheet.create(deviceType === 'phone' ? phoneSpecificStyles : tabletSpecificStyles);
};

export default forgetPasswordStyles;