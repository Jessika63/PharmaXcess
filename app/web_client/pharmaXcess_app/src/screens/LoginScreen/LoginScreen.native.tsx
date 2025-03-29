import { View, Text, ScrollView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '../../components/AuthTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import loginStyles from './LoginScreen.styles';
import { useTranslation } from 'react-i18next';
import { getAccessibilityProps, getHiddenAccessibilityProps } from '@/src/accessibility/screenReader/accessibilityUtils';
import { announceForAccessibility, setScreenAccessibilityFocus } from '@/src/accessibility/screenReader/accessibilityConfig';
import { login } from '@/src/services/authService';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen () {
    const navigation = useNavigation<NavigationProps>();
    const style = loginStyles();
    const { t } = useTranslation('loginScreen');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const [error, setError] = useState('');

    const emailErrorRef = useRef<Text>(null);
    const passwordErrorRef = useRef<Text>(null);

    useEffect(() => {
        announceForAccessibility(t('title'));
    }, []);

    const handleLogin = async () => {
        let hasError = false;
        let timer = 0;

        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage(t('emailInput.error'));
            announceForAccessibility(t('emailInput.error'));
            if (Platform.OS === 'ios') {
                setTimeout(() => setScreenAccessibilityFocus(emailErrorRef), timer);
                timer += 2000;
            }
            hasError = true;
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (password.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage(t('passwordInput.error'));
            announceForAccessibility(t('passwordInput.error'));
            if (Platform.OS === 'ios') {
                setTimeout(() => setScreenAccessibilityFocus(passwordErrorRef), timer);
            }
            hasError = true;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }
        if (!hasError) {
            try {
                const response = await login(email, password);
                announceForAccessibility(t('loginButton.success'));
            }
            catch (error) {
                setError((error as Error).message);
                console.error('Login Error:', error);
            }
        }
    };

    return (
        <ScrollView
            contentContainerStyle={style.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
        >
            <View style={style.titleContainer}>
                <Text
                    style={style.title}
                    {...getAccessibilityProps({
                        label: t('title'),
                        role: "header",
                    })}
                >
                    {t('title')}
                </Text>
            </View>
            <View style={style.formContainer}>
                <View style={style.emailInputContainer}>
                    <AuthTextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('emailInput.hint')}
                        label={t('emailInput.label')}
                        error={emailError}
                        errorMessage={emailErrorMessage}
                        secureTextEntry={false}
                        icon='email'
                        fontSize={style.input.fontSize }
                        errorRef={emailErrorRef}
                    />
                </View>
                <AuthTextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('passwordInput.hint')}
                    label={t('passwordInput.label')}
                    error={passwordError}
                    errorMessage={passwordErrorMessage}
                    secureTextEntry={true}
                    icon='lock'
                    fontSize={style.input.fontSize}
                    errorRef={passwordErrorRef}
                />
                <View style={style.forgotPasswordButtonContainer}>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('ForgotPassword')}
                        labelStyle={style.forgotPasswordButton}
                        contentStyle={{ alignSelf: 'flex-end' }}
                        {...getAccessibilityProps({
                            label: t('forgotPassword.label'),
                            hint: t('forgotPassword.hint'),
                            role: "button",
                        })}
                    >
                        <Text style={style.ButtonTextContainer}>
                            {t('forgotPassword.label')}
                        </Text>
                    </Button>
                </View>
                <View style={style.logInButtonContainer}>
                    <PrimaryButton
                        onPress={handleLogin}
                        label={t('loginButton.label')}
                        loading={false}
                        disabled={false}
                        fontSize={style.logInButton.fontSize}
                        hint={t('loginButton.hint')}
                    />
                </View>
                <View style={style.signUpButtonContainer}>
                    <Text {...getHiddenAccessibilityProps()} style={style.signUpButtonText}>
                        {t('signUpMessage')}
                    </Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('SignUp')}
                        labelStyle={style.signinButton}
                        {...getAccessibilityProps({
                            label: t('signUp.labelScreenReader'),
                            hint: t('signUp.hint'),
                            role: "button",
                        })}
                    >
                        <Text style={style.ButtonTextContainer}>
                            {t('signUp.label')}
                        </Text>
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
}