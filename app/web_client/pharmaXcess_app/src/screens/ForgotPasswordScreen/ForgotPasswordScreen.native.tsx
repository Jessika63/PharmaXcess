import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import forgetPasswordStyles from './ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen () {
    const style = forgetPasswordStyles();

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
        <ScrollView
            contentContainerStyle={style.container}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps='handled'
        >
            <View style={style.titleContainer}>
                <Text style={style.title}>Mot de passe{"\n"}oublié ?</Text>
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
                        />
                </View>
                <Text style={style.infoMessage}>
                    <Text style={style.infoMessageError}>*</Text> Un email vous sera envoyé pour réinitialiser votre mot de passe.
                </Text>
                <View style={style.submitButtonContainer}>
                    <PrimaryButton
                        onPress={handleForgotPassword}
                        label='Soumettre'
                        loading={false}
                        disabled={false}
                        fontSize={style.submitButton.fontSize}
                    />
                </View>
            </View>
        </ScrollView>
    );
}