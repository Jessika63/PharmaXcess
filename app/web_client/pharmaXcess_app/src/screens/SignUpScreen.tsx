import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '../components/AuthTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { AuthStackParamList } from '../navigation/AuthNavigator'
import { useTheme } from '../styles/Theme';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen () {
    const navigation = useNavigation<NavigationProps>();
    const { colors } = useTheme();

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
            setEmailErrorMessage('Veuillez entrer un email valide.');
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
        if (firstPassword.length < 6) {
            setFirstPasswordError(true);
            setFirstPasswordErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
        } else {
            setFirstPasswordError(false);
            setFirstPasswordErrorMessage('');
        }
        if (secondPassword !== firstPassword) {
            setSecondPasswordError(true);
            setSecondPasswordErrorMessage('Les mots de passe ne correspondent pas.');
        } else {
            setSecondPasswordError(false);
            setSecondPasswordErrorMessage('');
        }
    };
    return (
        <View style={style.container}>
            <Text style={[style.title, {color: colors.onBackground}]}>Create an{'\n'}account</Text>
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
                value={firstPassword}
                onChangeText={setFirstPassword}
                placeholder='Entrez votre mot de passe'
                error={firstPasswordError}
                errorMessage={firstPasswordErrorMessage}
                secureTextEntry={true}
                icon='lock'
            />
            <AuthTextInput
                value={secondPassword}
                onChangeText={setSecondPassword}
                placeholder='Confirmez votre mot de passe'
                error={secondPasswordError}
                errorMessage={secondPasswordErrorMessage}
                secureTextEntry={true}
                icon='lock'
            />
            <View style={style.signUpButtonContainer}>
                <PrimaryButton
                    onPress={handleSignUp}
                    label='Create account'
                    disabled={false}
                    loading={false}
                />
            </View>
            <View style={style.logInButtonContainer}>
                <Text style={[style.logInButtonText, { color: colors.onBackground }]}>
                    I already have an account.
                </Text>
                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Login')}
                    labelStyle={{ fontSize: 16, color: colors.primary }}
                >
                    Login
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
    signUpButtonContainer: {
        marginTop: 40,
    },
    logInButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center', 
        marginTop: 20,
    },
    logInButtonText: {
        fontSize: 16,
    },
})