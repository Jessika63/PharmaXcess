import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import { AuthStackParamList } from '@/src/navigation/AuthNavigator'
import { useTheme } from '@/src/context/ThemeContext';
import signUpStyles from './SignUpScreen.styles';
import { useTranslation } from 'react-i18next';

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

    const handleSignUp = () => {
        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage(t('emailInputError'));
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (firstPassword.length < 6) {
            setFirstPasswordError(true);
            setFirstPasswordErrorMessage(t('passwordInputError'));
        } else {
            setFirstPasswordError(false);
            setFirstPasswordErrorMessage('');
        }
        if (secondPassword !== firstPassword) {
            setSecondPasswordError(true);
            setSecondPasswordErrorMessage(t('passwordConfirmationInputError'));
        } else {
            setSecondPasswordError(false);
            setSecondPasswordErrorMessage('');
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
                            fontSize={style.input.fontSize }
                        />
                    </View>
                    <View style={style.inputContainer}>
                        <AuthTextInput
                            value={firstPassword}
                            onChangeText={setFirstPassword}
                            placeholder={t('passwordInput')}
                            error={firstPasswordError}
                            errorMessage={firstPasswordErrorMessage}
                            secureTextEntry={true}
                            icon='lock'
                            fontSize={style.input.fontSize }
                        />
                    </View>
                    <View style={style.inputContainer}>
                        <AuthTextInput
                            value={secondPassword}
                            onChangeText={setSecondPassword}
                            placeholder={t('passwordConfirmationInput')}
                            error={secondPasswordError}
                            errorMessage={secondPasswordErrorMessage}
                            secureTextEntry={true}
                            icon='lock'
                            fontSize={style.input.fontSize }
                        />
                    </View>   
                    <View style={style.signUpButtonContainer}>
                        <PrimaryButton
                            onPress={handleSignUp}
                            label={t('signUpButton')}
                            disabled={false}
                            loading={false}
                            fontSize={style.signUpButton.fontSize}
                        />
                    </View>
                    <View style={style.logInButtonContainer}>
                        <Text style={style.logInText}>
                            {t('loginMessage')}
                        </Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('Login')}
                            labelStyle={style.loginButton}
                        >
                            <Text style={style.logInButtonText}>
                                {t('loginButton')}
                            </Text>
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}