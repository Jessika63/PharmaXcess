import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import { AuthStackParamList } from '@/src/navigation/AuthNavigator'
import { useTheme } from '@/src/styles/Theme';
import signUpStyles from './SignUpScreen.styles';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen () {
    const navigation = useNavigation<NavigationProps>();
    const style = signUpStyles();

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
        <ScrollView 
            contentContainerStyle={style.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
        >
            <View style={style.titleContainer}>
                <Text style={style.title}>Créer{"\n"}un compte</Text>
            </View>
            <View style={style.formContainer}>
                <View style={style.inputContainer}>
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
                <View style={style.inputContainer}>
                    <AuthTextInput
                        value={firstPassword}
                        onChangeText={setFirstPassword}
                        placeholder='Entrez votre mot de passe'
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
                        placeholder='Confirmez votre mot de passe'
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
                        label='Créer un compte'
                        disabled={false}
                        loading={false}
                        fontSize={style.signUpButton.fontSize}
                    />
                </View>
                <View style={style.logInButtonContainer}>
                    <Text style={style.logInText}>
                    J'ai déjà un compte.
                    </Text>
                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        labelStyle={style.loginButton}
                    >
                        <Text style={style.logInButtonText}>
                            Se connecter
                        </Text>
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
}