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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useAuth } from '../../context/AuthContext';
import createStyles from '../../styles/SignUp.style';

type SignUpProps = {
    navigation: StackNavigationProp<any, any>;
};

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

interface FormErrors {
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

/**
 * This screen allows users to create a new account by providing an email address,
 * a password, and a password confirmation.
 * 
 * It includes:
 * - Email, password, and password confirmation inputs with validation.
 * - Navigation to the login screen.
 * - Accessibility announcements and screen reader focus management.
 * - Keyboard handling for a smooth user experience.
 */
export default function SignUp({ navigation }: SignUpProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { register, isLoading: authLoading } = useAuth();
    const { t } = useTranslation('common');
    const styles = createStyles(colors, fontScale);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Refs for accessibility
    const emailInputRef = useRef<TextInput>(null);
    const passwordInputRef = useRef<TextInput>(null);
    const confirmPasswordInputRef = useRef<TextInput>(null);
    const announcementRef = useRef<Text>(null);

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Password strength calculation
    const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
        let score = 0;
        let label = 'Très faible';
        let color = '#FF6B6B';

        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 0:
            case 1:
                label = 'Très faible';
                color = '#FF6B6B';
                break;
            case 2:
                label = 'Faible';
                color = '#FF9800';
                break;
            case 3:
                label = 'Moyen';
                color = '#FFC107';
                break;
            case 4:
                label = 'Fort';
                color = '#8BC34A';
                break;
            case 5:
                label = 'Très fort';
                color = '#4CAF50';
                break;
        }

        return { score, label, color };
    }, []);

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
        } else if (formData.password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        // Terms validation
        if (!formData.acceptTerms) {
            newErrors.terms = 'Vous devez accepter les conditions d\'utilisation';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Update form data
    const updateFormData = useCallback((field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    // Handle signup submission
    const handleSignUp = useCallback(async () => {
        if (!validateForm()) {
            // Announce validation errors to screen readers
            const errorMessages = Object.values(errors).join('. ');
            AccessibilityInfo.announceForAccessibility(`Erreurs de validation: ${errorMessages}`);
            return;
        }

        setErrors({});

        try {
            const success = await register(formData.email, formData.password, formData.email.split('@')[0]);
            
            if (success) {
                AccessibilityInfo.announceForAccessibility('Inscription réussie');
                // La navigation sera automatiquement gérée par RootNavigation
            } else {
                throw new Error('Erreur lors de la création du compte');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
            setErrors({ general: errorMessage });
            AccessibilityInfo.announceForAccessibility(`Erreur d'inscription: ${errorMessage}`);
        }
    }, [formData, validateForm, errors, register]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback((field: 'password' | 'confirmPassword') => {
        if (field === 'password') {
            setShowPassword(prev => {
                const newValue = !prev;
                AccessibilityInfo.announceForAccessibility(
                    newValue ? 'Mot de passe visible' : 'Mot de passe masqué'
                );
                return newValue;
            });
        } else {
            setShowConfirmPassword(prev => {
                const newValue = !prev;
                AccessibilityInfo.announceForAccessibility(
                    newValue ? 'Confirmation du mot de passe visible' : 'Confirmation du mot de passe masquée'
                );
                return newValue;
            });
        }
    }, []);

    // Handle field focus
    const handleFocus = useCallback((fieldName: string) => {
        setFocusedField(fieldName);
    }, []);

    const handleBlur = useCallback(() => {
        setFocusedField(null);
    }, []);

    // Handle terms checkbox
    const handleTermsToggle = useCallback(() => {
        const newValue = !formData.acceptTerms;
        updateFormData('acceptTerms', newValue);
        AccessibilityInfo.announceForAccessibility(
            newValue ? 'Conditions acceptées' : 'Conditions non acceptées'
        );
    }, [formData.acceptTerms, updateFormData]);

    // Navigate to login
    const handleLogin = useCallback(() => {
        AccessibilityInfo.announceForAccessibility('Navigation vers la connexion');
        navigation.navigate('Login');
    }, [navigation]);

    // Navigate to terms
    const handleTerms = useCallback(() => {
        AccessibilityInfo.announceForAccessibility('Navigation vers les conditions d\'utilisation');
        navigation.navigate('Terms');
    }, [navigation]);

    // Get password strength
    const passwordStrength = calculatePasswordStrength(formData.password);

    return (
        <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel="Écran d'inscription"
        >
            <View style={styles.container}>
                {/* Header */}
                <Text style={styles.title} accessibilityRole="header">
                    Bienvenue !
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
                    <Text style={styles.label}>Email *</Text>
                    <TextInput
                        ref={emailInputRef}
                        style={[
                            styles.input,
                            focusedField === 'email' && styles.inputFocused,
                            errors.email && styles.inputError,
                            !errors.email && formData.email && emailRegex.test(formData.email) && styles.inputValid,
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
                    {errors.email ? (
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {errors.email}
                        </Text>
                    ) : formData.email && emailRegex.test(formData.email) && (
                        <Text 
                            style={styles.successText}
                            accessibilityRole="text"
                        >
                            ✓ Email valide
                        </Text>
                    )}
                </View>

                {/* Password input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mot de passe *</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={passwordInputRef}
                            style={[
                                styles.input,
                                focusedField === 'password' && styles.inputFocused,
                                errors.password && styles.inputError,
                                !errors.password && formData.password.length >= 8 && styles.inputValid,
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
                            autoComplete="password-new"
                            textContentType="newPassword"
                            accessibilityLabel="Champ mot de passe"
                            accessibilityHint="Entrez un mot de passe sécurisé"
                            accessibilityState={{ 
                                selected: focusedField === 'password'
                            }}
                        />
                        <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={() => togglePasswordVisibility('password')}
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

                    {/* Password strength indicator */}
                    {formData.password.length > 0 && (
                        <View style={styles.passwordStrengthContainer}>
                            <Text style={styles.passwordStrengthLabel}>
                                Force du mot de passe:
                            </Text>
                            <View style={styles.passwordStrengthBar}>
                                <View 
                                    style={[
                                        styles.passwordStrengthFill,
                                        { 
                                            width: `${(passwordStrength.score / 5) * 100}%`,
                                            backgroundColor: passwordStrength.color
                                        }
                                    ]}
                                />
                            </View>
                            <Text 
                                style={[
                                    styles.passwordStrengthText,
                                    { color: passwordStrength.color }
                                ]}
                                accessibilityLiveRegion="polite"
                            >
                                {passwordStrength.label}
                            </Text>
                        </View>
                    )}

                    {errors.password && (
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {errors.password}
                        </Text>
                    )}
                </View>

                {/* Confirm password input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Confirmer le mot de passe *</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={confirmPasswordInputRef}
                            style={[
                                styles.input,
                                focusedField === 'confirmPassword' && styles.inputFocused,
                                errors.confirmPassword && styles.inputError,
                                !errors.confirmPassword && formData.confirmPassword && 
                                formData.password === formData.confirmPassword && styles.inputValid,
                            ]}
                            value={formData.confirmPassword}
                            onChangeText={(value) => updateFormData('confirmPassword', value)}
                            onFocus={() => handleFocus('confirmPassword')}
                            onBlur={handleBlur}
                            placeholder="Confirmez votre mot de passe"
                            placeholderTextColor={colors.infoText}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password-new"
                            textContentType="newPassword"
                            accessibilityLabel="Champ confirmation du mot de passe"
                            accessibilityHint="Retapez votre mot de passe pour confirmation"
                            accessibilityState={{ 
                                selected: focusedField === 'confirmPassword'
                            }}
                        />
                        <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={() => togglePasswordVisibility('confirmPassword')}
                            accessibilityRole="button"
                            accessibilityLabel={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                            accessibilityHint="Appuyez pour basculer la visibilité de la confirmation"
                        >
                            <Ionicons
                                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={24}
                                color={colors.profileText}
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? (
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                        >
                            {errors.confirmPassword}
                        </Text>
                    ) : formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <Text 
                            style={styles.successText}
                            accessibilityRole="text"
                        >
                            ✓ Les mots de passe correspondent
                        </Text>
                    )}
                </View>

                {/* Terms and conditions */}
                <View style={styles.termsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.checkbox,
                            formData.acceptTerms && styles.checkboxChecked,
                        ]}
                        onPress={handleTermsToggle}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: formData.acceptTerms }}
                        accessibilityLabel="Accepter les conditions d'utilisation"
                    >
                        {formData.acceptTerms && (
                            <Ionicons name="checkmark" size={14} color={colors.text} />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.checkboxText}>
                        J'accepte les{' '}
                        <Text 
                            style={styles.termsLink}
                            onPress={handleTerms}
                            accessibilityRole="button"
                            accessibilityLabel="Lire les conditions d'utilisation"
                        >
                            conditions d'utilisation
                        </Text>
                        {' '}et la{' '}
                        <Text 
                            style={styles.termsLink}
                            onPress={handleTerms}
                            accessibilityRole="button"
                            accessibilityLabel="Lire la politique de confidentialité"
                        >
                            politique de confidentialité
                        </Text>
                    </Text>
                </View>
                {errors.terms && (
                    <Text 
                        style={styles.errorText}
                        accessibilityRole="alert"
                    >
                        {errors.terms}
                    </Text>
                )}

                {/* Signup button */}
                <TouchableOpacity
                    style={[
                        styles.signupButton,
                        authLoading && styles.buttonDisabled
                    ]}
                    onPress={handleSignUp}
                    disabled={authLoading}
                    accessibilityRole="button"
                    accessibilityLabel="S'inscrire"
                    accessibilityHint="Appuyez pour créer votre compte"
                    accessibilityState={{ disabled: authLoading }}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.gradient}
                    >
                        {authLoading ? (
                            <ActivityIndicator color={colors.text} size="small" />
                        ) : (
                            <Text style={styles.buttonText}>S'inscrire</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Login link */}
                <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                        Déjà un compte ?
                    </Text>
                    <TouchableOpacity
                        onPress={handleLogin}
                        accessibilityRole="button"
                        accessibilityLabel="Se connecter"
                        accessibilityHint="Appuyez pour aller à la page de connexion"
                    >
                        <Text style={styles.loginLink}>
                            Se connecter
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
