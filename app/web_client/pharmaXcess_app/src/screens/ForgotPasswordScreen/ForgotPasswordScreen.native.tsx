import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import forgetPasswordStyles from './ForgotPasswordScreen.styles';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen () {
    const style = forgetPasswordStyles();
    const { t } = useTranslation('forgotPasswordScreen');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );

    const handleForgotPassword = () => {
        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage(t('emailInputError'));
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
    };

    return (
        <ScrollView
            contentContainerStyle={style.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
        >
            <View style={style.titleContainer}>
                <Text style={style.title}>{t('title')}</Text>
            </View>
            <View style={style.formContainer}>
                <View style={style.inputContainer}>
                    <AuthTextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('emailInput')}
                        error={emailError}
                        errorMessage={emailErrorMessage}
                        secureTextEntry={false}
                        icon='email'
                        fontSize={style.input.fontSize}
                        />
                </View>
                <Text style={style.infoMessage}>
                    <Text style={style.infoMessageError}>* </Text>{t('infoMessage')}
                </Text>
                <View style={style.submitButtonContainer}>
                    <PrimaryButton
                        onPress={handleForgotPassword}
                        label={t('sendEmailButton')}
                        loading={false}
                        disabled={false}
                        fontSize={style.submitButton.fontSize}
                    />
                </View>
            </View>
        </ScrollView>
    );
}