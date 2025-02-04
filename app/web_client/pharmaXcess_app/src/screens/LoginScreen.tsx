import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '../components/AuthTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { AuthStackParamList } from '../navigation/AuthNavigator'
import { useTheme } from '../styles/Theme';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen () {
    const navigation = useNavigation<NavigationProps>();
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const handleLogin = () => {
        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage('Veuillez entrer un email valide.');
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (password.length < 6) {
            setPasswordError(true);
            setPasswordErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }
    };

    return (
        <View style={style.container}>
            <Text style={[style.title, {color: colors.text}]}>Welcome{'\n'}Back!</Text>
            <AuthTextInput
                value={email}
                onChangeText={setEmail}
                placeholder='Entrez votre email'
                error={emailError}
                errorMessage={emailErrorMessage}
                secureTextEntry={false}
                icon='email'
            />
            <AuthTextInput
                value={password}
                onChangeText={setPassword}
                placeholder='Entrez votre mot de passe'
                error={passwordError}
                errorMessage={passwordErrorMessage}
                secureTextEntry={true}
                icon='lock'
            />
            <View style={style.forgotPasswordButtonContainer}>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('ForgotPassword')}
                    labelStyle={{ fontSize: 14, color: colors.primary }}
                    contentStyle={{ alignSelf: 'flex-end' }}
                >
                    Forget password?
                </Button>
            </View>
            <View style={style.logInButtonContainer}>
                <PrimaryButton
                    onPress={handleLogin}
                    label='Login'
                    loading={false}
                    disabled={false}
                />
            </View>
            <View style={style.signUpButtonContainer}>
                <Text style={[style.signUpButtonText, { color: colors.text }]}>
                    Create an account
                </Text>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignUp')}
                    labelStyle={{ fontSize: 16, color: colors.primary }}
                >
                    Sign up
                </Button>
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        marginTop: 50,
        marginHorizontal: 30,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    forgotPasswordButtonContainer: {
        marginBottom: 20,
    },
    logInButtonContainer: {
        marginTop: 40,
    },
    signUpButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: 20,
    },
    signUpButtonText: {
        fontSize: 16,
    },
});