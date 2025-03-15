import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import { AuthStackParamList } from '@/src/navigation/AuthNavigator'
import signUpStyles from './SignUpScreen.styles';
import { useTranslation } from 'react-i18next';
import { getAccessibilityProps, getHiddenAccessibilityProps } from '@/src/accessibility/screenReader/accessibilityUtils';
import { announceForAccessibility, setScreenAccessibilityFocus } from '@/src/accessibility/screenReader/accessibilityConfig';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen () {
    const navigation = useNavigation<NavigationProps>();
    const style = signUpStyles();
    const { t } = useTranslation('signUpScreen');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );
    const [firstPassword, setFirstPassword] = useState('');
    const [firstPasswordError, setFirstPasswordError] = useState(false);
    const [firstPasswordErrorMessage, setFirstPasswordErrorMessage] = useState('');
    const [secondPassword, setSecondPassword] = useState('');
    const [secondPasswordError, setSecondPasswordError] = useState(false);
    const [secondPasswordErrorMessage, setSecondPasswordErrorMessage] = useState('');

    const emailErrorRef = useRef<Text>(null);
    const passwordErrorRef = useRef<Text>(null);
    const passwordConfirmationErrorRef = useRef<Text>(null);

    useEffect(() => {
            announceForAccessibility(t('title'));
    }, []);

    const handleSignUp = () => {
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
        if (firstPassword.length < 6) {
            setFirstPasswordError(true);
            setFirstPasswordErrorMessage(t('passwordInput.error'));
            announceForAccessibility(t('passwordInput.error'));
            if (Platform.OS === 'ios') {
                setTimeout(() => setScreenAccessibilityFocus(passwordErrorRef), timer);
                timer += 2000;
            }
            hasError = true;
        } else {
            setFirstPasswordError(false);
            setFirstPasswordErrorMessage('');
        }
        if (secondPassword !== firstPassword) {
            setSecondPasswordError(true);
            setSecondPasswordErrorMessage(t('passwordConfirmationInput.error'));
            announceForAccessibility(t('passwordConfirmationInput.error'));
            if (Platform.OS === 'ios') {
                setTimeout(() => setScreenAccessibilityFocus(passwordConfirmationErrorRef), timer);
                timer += 2000;
            }
            hasError = true;
        } else {
            setSecondPasswordError(false);
            setSecondPasswordErrorMessage('');
        }
        if (!hasError) {
            announceForAccessibility(t('signUpButton.success'));
        }
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView 
                style={{ flex: 1 }}
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
                    <View style={style.inputContainer}>
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
                    <View style={style.inputContainer}>
                        <AuthTextInput
                            value={firstPassword}
                            onChangeText={setFirstPassword}
                            placeholder={t('passwordInput.hint')}
                            label={t('passwordInput.label')}
                            error={firstPasswordError}
                            errorMessage={firstPasswordErrorMessage}
                            secureTextEntry={true}
                            icon='lock'
                            fontSize={style.input.fontSize }
                            errorRef={passwordErrorRef}
                        />
                    </View>
                    <View style={style.inputContainer}>
                        <AuthTextInput
                            value={secondPassword}
                            onChangeText={setSecondPassword}
                            placeholder={t('passwordConfirmationInput.hint')}
                            label={t('passwordConfirmationInput.label')}
                            error={secondPasswordError}
                            errorMessage={secondPasswordErrorMessage}
                            secureTextEntry={true}
                            icon='lock'
                            fontSize={style.input.fontSize }
                            errorRef={passwordConfirmationErrorRef}
                        />
                    </View>   
                    <View style={style.signUpButtonContainer}>
                        <PrimaryButton
                            onPress={handleSignUp}
                            label={t('signUpButton.label')}
                            disabled={false}
                            loading={false}
                            fontSize={style.signUpButton.fontSize}
                            hint={t('signUpButton.hint')}
                        />
                    </View>
                    <View style={style.logInButtonContainer}>
                        <Text {...getHiddenAccessibilityProps()} style={style.logInText}>
                            {t('loginMessage')}
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            labelStyle={style.loginButton}
                            {...getAccessibilityProps({
                                label: t('loginButton.labelScreenReader'),
                                hint: t('loginButton.hint'),
                                role: "button",
                            })}
                        >
                            <Text style={style.logInButtonText}>
                                {t('loginButton.label')}
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}