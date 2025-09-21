import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    AccessibilityInfo,
    findNodeHandle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useAuth } from '../../context/AuthContext';
import createStyles from '../../styles/Login.style';

type LoginProps = {
    navigation: StackNavigationProp<any, any>;
};

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

export default function Login({ navigation }: LoginProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { login, isLoading: authLoading } = useAuth();
    const { t } = useTranslation('common');
    const styles = createStyles(colors, fontScale);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Refs for accessibility
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const announcementRef = useRef<Text>(null);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Form validation
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Format d\'email invalide';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Update form data
    const updateFormData = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Handle login submission
    const handleLogin = useCallback(async () => {
        if (!validateForm()) {
            // Announce validation errors to screen readers
            const errorMessages = Object.values(errors).join('. ');
            AccessibilityInfo.announceForAccessibility(`Erreurs de validation: ${errorMessages}`);
            return;
        }

        setErrors({});

        try {
            const success = await login(formData.email, formData.password);
            
            // Mock authentication logic
            if (formData.email === 'test@example.com' && formData.password === 'password') {
                AccessibilityInfo.announceForAccessibility('Connexion réussie');
                // La navigation sera automatiquement gérée par RootNavigation
            } else {
                throw new Error('Identifiants invalides');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
            setErrors({ general: errorMessage });
            AccessibilityInfo.announceForAccessibility(`Erreur de connexion: ${errorMessage}`);
        }
    }, [formData, validateForm, errors, login]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => {
            const newValue = !prev;
            AccessibilityInfo.announceForAccessibility(
                newValue ? 'Mot de passe visible' : 'Mot de passe masqué'
            );
            return newValue;
        });
    }, []);

    // Handle field focus
    const handleFocus = useCallback((fieldName: string) => {
        setFocusedField(fieldName);
    }, []);

    const handleBlur = useCallback(() => {
        setFocusedField(null);
    }, []);

    // Navigate to forgot password
    const handleForgotPassword = useCallback(() => {
        AccessibilityInfo.announceForAccessibility('Navigation vers mot de passe oublié');
        navigation.navigate('ForgotPassword');
    }, [navigation]);

    // Navigate to registration
    const handleRegister = useCallback(() => {
        AccessibilityInfo.announceForAccessibility('Navigation vers inscription');
        navigation.navigate('SignUp');
    }, [navigation]);

    return (
        <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel="Écran de connexion"
        >
            <View style={styles.container}>
                {/* Header */}
                <Text style={styles.title} accessibilityRole="header">
                    Heureux de vous revoir !
                </Text>

                {/* General error message */}
                {errors.general && (
                    <Text 
                        style={styles.errorText}
                        accessibilityRole="alert"
                        accessibilityLiveRegion="assertive"
                    >
                        {errors.general}
                    </Text>
                )}

                {/* Email input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        ref={emailInputRef}
                        style={[
                            styles.input,
                            focusedField === 'email' && styles.inputFocused,
                            errors.email && styles.inputError,
                        ]}
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        onFocus={() => handleFocus('email')}
                        onBlur={handleBlur}
                        placeholder="Entrez votre email"
                        placeholderTextColor={colors.infoText}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        accessibilityLabel="Champ email"
                        accessibilityHint="Entrez votre adresse email"
                        accessibilityState={{ 
                            selected: focusedField === 'email'
                        }}
                    />
                    {errors.email && (
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {errors.email}
                        </Text>
                    )}
                </View>

                {/* Password input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={passwordInputRef}
                            style={[
                                styles.input,
                                focusedField === 'password' && styles.inputFocused,
                                errors.password && styles.inputError,
                            ]}
                            value={formData.password}
                            onChangeText={(value) => updateFormData('password', value)}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            placeholder="Entrez votre mot de passe"
                            placeholderTextColor={colors.infoText}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            accessibilityLabel="Champ mot de passe"
                            accessibilityHint="Entrez votre mot de passe"
                            accessibilityState={{ 
                                selected: focusedField === 'password'
                            }}
                        />
                        <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={togglePasswordVisibility}
                            accessibilityRole="button"
                            accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                            accessibilityHint="Appuyez pour basculer la visibilité du mot de passe"
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color={colors.profileText}
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password && (
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {errors.password}
                        </Text>
                    )}
                </View>

                {/* Login button */}
                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        authLoading && styles.buttonDisabled
                    ]}
                    onPress={handleLogin}
                    disabled={authLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Se connecter"
                    accessibilityHint="Appuyez pour vous connecter"
                    accessibilityState={{ disabled: authLoading }}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.gradient}
                    >
                        {authLoading ? (
                            <ActivityIndicator color={colors.text} size="small" />
                        ) : (
                            <Text style={styles.buttonText}>Se connecter</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Forgot password link */}
                <View style={styles.forgotPasswordContainer}>
                    <TouchableOpacity
                        onPress={handleForgotPassword}
                        accessibilityRole="button"
                        accessibilityLabel="Mot de passe oublié"
                        accessibilityHint="Appuyez pour réinitialiser votre mot de passe"
                    >
                        <Text style={styles.forgotPasswordText}>
                            Mot de passe oublié ?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Register link */}
                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Pas de compte ?
                    </Text>
                    <TouchableOpacity
                        onPress={handleRegister}
                        accessibilityRole="button"
                        accessibilityLabel="S'inscrire"
                        accessibilityHint="Appuyez pour créer un nouveau compte"
                    >
                        <Text style={styles.registerLink}>
                            S'inscrire
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Loading overlay */}
                {authLoading && (
                    <View style={styles.loadingOverlay} />
                )}

                {/* Hidden accessibility announcement text */}
                <Text
                    ref={announcementRef}
                    style={styles.accessibilityAnnouncement}
                    accessibilityLiveRegion="polite"
                />
            </View>
        </ScrollView>
    );
}
