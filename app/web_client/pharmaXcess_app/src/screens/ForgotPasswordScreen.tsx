import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import AuthTextInput from '../components/AuthTextInput';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../styles/Theme';

export default function ForgotPasswordScreen () {
    const { colors } = useTheme();

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );

    const handleForgotPassword = () => {
        if (!email.includes('@')) {
            setEmailError(true);
            setEmailErrorMessage('Veuillez entrer un email valide.');
        } else {
            setEmailError(false);
            setEmailErrorMessage('');
        }
    };

    return (
        <View style={style.container}>
            <Text style={[style.title, {color: colors.text}]}>Forgot{'\n'}password?</Text>
            <AuthTextInput
                value={email}
                onChangeText={setEmail}
                placeholder='Entrez votre email'
                error={emailError}
                errorMessage={emailErrorMessage}
                secureTextEntry={false}
                icon='email'
            />
            <Text style={{ color: colors.text }}>
                <Text style={{ color: colors.warning }}>*</Text> Un email vous sera envoyé pour réinitialiser votre mot de passe.
            </Text>
            <View style={style.submitButtonContainer}>
                <PrimaryButton
                    onPress={handleForgotPassword}
                    label='Submit'
                    loading={false}
                    disabled={false}
                />
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
    submitButtonContainer: {
        marginTop: 40,
    },
})