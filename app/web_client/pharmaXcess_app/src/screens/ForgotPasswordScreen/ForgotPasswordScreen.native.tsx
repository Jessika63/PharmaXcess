/**
 * ForgotPasswordScreen
 * 
 * This screen allows users to initiate the password reset process by entering their email address.
 * It includes:
 * - Email input with validation.
 * - Accessibility announcements and focus management.
 * - Form submission with feedback for success or error.
 * 
 * Accessibility:
 * - Announces screen title on mount.
 * - Announces error messages and success feedback.
 * - Manages screen reader focus for better user experience.
 * 
 * Translation:
 * - Uses i18n with the "forgotPasswordScreen" namespace.
 * 
 * Form behavior:
 * - Validates email format.
 * - Shows error messages if the email is invalid.
 * - Simulates sending a reset email.
 * 
 * @component
 * @returns {JSX.Element} The forgot password screen component.
 */

import { View, Text, ScrollView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AuthTextInput from '@/src/components/AuthTextInput';
import PrimaryButton from '@/src/components/PrimaryButton';
import forgetPasswordStyles from './ForgotPasswordScreen.styles';
import { useTranslation } from 'react-i18next';
import { getAccessibilityProps, getHiddenAccessibilityProps } from '@/src/accessibility/screenReader/accessibilityUtils';
import { announceForAccessibility, setScreenAccessibilityFocus } from '@/src/accessibility/screenReader/accessibilityConfig';

/**
 * Forgot password screen component.
 * 
 * @returns {JSX.Element} A screen where users can request a password reset email.
 */
export default function ForgotPasswordScreen () {
    const style = forgetPasswordStyles();
    const { t } = useTranslation('forgotPasswordScreen');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('' );

    const emailErrorRef = useRef<Text>(null);

    useEffect(() => {
        announceForAccessibility(t('title'));
    }, []);

    /**
     * Handles the password reset form submission.
     * Validates the email format and provides accessibility feedback.
     */
    const handleForgotPassword = () => {
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
        if (!hasError) {
            announceForAccessibility(t('sendEmailButton.success'));
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
                        role: 'header',
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
                        fontSize={style.input.fontSize}
                        errorRef={emailErrorRef}
                        />
                </View>
                <Text style={style.infoMessage}>
                    <Text {...getHiddenAccessibilityProps()} style={style.infoMessageError}>* </Text>{t('infoMessage')}
                </Text>
                <View style={style.submitButtonContainer}>
                    <PrimaryButton
                        onPress={handleForgotPassword}
                        label={t('sendEmailButton.label')}
                        loading={false}
                        disabled={false}
                        fontSize={style.submitButton.fontSize}
                        hint={t('sendEmailButton.hint')}
                    />
                </View>
            </View>
        </ScrollView>
    );
}