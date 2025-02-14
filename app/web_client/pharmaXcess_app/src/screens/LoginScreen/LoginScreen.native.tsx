import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '../../components/AuthTextInput';
import PrimaryButton from '../../components/PrimaryButton';
import { AuthStackParamList } from '../../navigation/AuthNavigator'
import loginStyles from './LoginScreen.styles';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen () {
    const navigation = useNavigation<NavigationProps>();
    const style = loginStyles();

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
        <ScrollView
            contentContainerStyle={style.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
        >
            <View style={style.titleContainer}>
                <Text style={style.title}>Bienvenue{'\n'}à nouveau !</Text>
            </View>
            <View style={style.formContainer}>
                <View style={style.emailInputContainer}>
                    <AuthTextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder='Entrez votre email'
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
                    placeholder='Entrez votre mot de passe'
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
                            Mot de passe oublié ?
                        </Text>
                    </Button>
                </View>
                <View style={style.logInButtonContainer}>
                    <PrimaryButton
                        onPress={handleLogin}
                        label='Se connecter'
                        loading={false}
                        disabled={false}
                        fontSize={style.logInButton.fontSize}
                    />
                </View>
                <View style={style.signUpButtonContainer}>
                    <Text style={style.signUpButtonText}>
                        Créer un compte
                    </Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('SignUp')}
                        labelStyle={style.signinButton}
                    >
                        <Text style={style.ButtonTextContainer}>
                            S'inscrire
                        </Text>
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
}