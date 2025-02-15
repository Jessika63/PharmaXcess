import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '../../components/AuthTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import loginStyles from './LoginScreen.styles';
import { useTranslation } from 'react-i18next';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen () {
    const navigation = useNavigation<NavigationProps>();
    const style = loginStyles();
    const { t } = useTranslation('loginScreen');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const handleLogin = () => {
        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage(t('emailInputError'));
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (password.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage(t('passwordInputError'));
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
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
                <View style={style.emailInputContainer}>
                    <AuthTextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('emailInput')}
                        error={emailError}
                        errorMessage={emailErrorMessage}
                        secureTextEntry={false}
                        icon='email'
                        fontSize={style.input.fontSize }
                    />
                </View>
                <AuthTextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('passwordInput')}
                    error={passwordError}
                    errorMessage={passwordErrorMessage}
                    secureTextEntry={true}
                    icon='lock'
                    fontSize={style.input.fontSize}
                />
                <View style={style.forgotPasswordButtonContainer}>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('ForgotPassword')}
                        labelStyle={style.forgotPasswordButton}
                        contentStyle={{ alignSelf: 'flex-end' }}
                    >
                        <Text style={style.ButtonTextContainer}>
                            {t('forgotPassword')}
                        </Text>
                    </Button>
                </View>
                <View style={style.logInButtonContainer}>
                    <PrimaryButton
                        onPress={handleLogin}
                        label={t('loginButton')}
                        loading={false}
                        disabled={false}
                        fontSize={style.logInButton.fontSize}
                    />
                </View>
                <View style={style.signUpButtonContainer}>
                    <Text style={style.signUpButtonText}>
                        {t('signUpMessage')}
                    </Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('SignUp')}
                        labelStyle={style.signinButton}
                    >
                        <Text style={style.ButtonTextContainer}>
                            {t('signUpButton')}
                        </Text>
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
}