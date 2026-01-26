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
import { CustomPicker } from '../../components';
import createStyles from '../../styles/Login.style';
import config from '../../config';

type LoginProps = {
    navigation: StackNavigationProp<any, any>;
};

interface FormData {
    userType: 'patient' | 'professional';
    email: string;
    password: string;
}

interface FormErrors {
    userType?: string;
    email?: string;
    password?: string;
    general?: string;
}

export default function Login({ navigation }: LoginProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { login, isLoading: authLoading, authError, clearAuthError } = useAuth();
    const { t } = useTranslation('common');
    const styles = createStyles(colors, fontScale);

    // Check if error is "already logged in"
    const isAlreadyLoggedInError = (msg: string) => msg?.toLowerCase().includes('already logged in');

    // Handle force logout when stuck with another session
    const handleForceLogout = useCallback(async () => {
        try {
            const base = config.backendUrl?.replace(/\/$/, '') || '';
            if (!base) {
                Alert.alert('Erreur', 'URL backend non configurée');
                return;
            }

            const res = await fetch(`${base}/logout`, { 
                method: 'POST',
                credentials: 'include' 
            });

            if (res.ok) {
                Alert.alert('Succès', 'Session déconnectée. Veuillez réessayer de vous connecter.');
                setErrors({});
                setErrorStatus(null);
                if (clearAuthError) clearAuthError();
            } else {
                Alert.alert('Erreur', 'Impossible de déconnecter la session actuelle');
            }
        } catch (error) {
            console.warn('Logout error:', error);
            Alert.alert('Erreur', 'Erreur lors de la déconnexion');
        }
    }, [clearAuthError]);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        userType: 'patient',
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [errorStatus, setErrorStatus] = useState<number | null>(null);
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

        // User type validation 
        if (!formData.userType) { 
            newErrors.userType = 'Le type de compte est requis'; 
        }


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
        // Clear general error/status when user edits any field
        if (errors.general) {
            setErrors(prev => ({ ...prev, general: undefined }));
        }
        if (errorStatus) {
            setErrorStatus(null);
        }
        // Clear shared auth error in context so it doesn't persist across remounts
        if (clearAuthError) clearAuthError();
    }, [errors, errorStatus, clearAuthError]);

    // Handle login submission
    const handleLogin = useCallback(async () => {
        if (!validateForm()) {
            // Announce validation errors to screen readers
            const errorMessages = Object.values(errors).join('. ');
            AccessibilityInfo.announceForAccessibility(`Erreurs de validation: ${errorMessages}`);
            return;
        }

        setErrors({});
    setErrorStatus(null);

            try {
                // call AuthContext.login which now throws on failure with backend message
                await login(formData.email, formData.password, formData.userType);
                AccessibilityInfo.announceForAccessibility('Connexion réussie');
                // Navigation will be handled by RootNavigation observing auth state
            } catch (error: any) {
                const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';

                // If backend returned 401 (not found / wrong password) show the backend message
                // inline on the page instead of a popup to avoid interrupting the flow.
                const status = error?.status;
                setErrors({ general: errorMessage });
                setErrorStatus(status || null);
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
                { (errors.general || authError?.message) && (
                    <View>
                        <Text 
                            style={styles.errorText}
                            accessibilityRole="alert"
                            accessibilityLiveRegion="assertive"
                        >
                            {errors.general || authError?.message}
                        </Text>
                        
                        {/* Show logout button if already logged in error */}
                        {isAlreadyLoggedInError(errors.general || authError?.message || '') && (
                            <TouchableOpacity 
                                style={[styles.loginButton, { marginTop: 12, backgroundColor: colors.error }]}
                                onPress={handleForceLogout}
                                accessibilityRole="button"
                                accessibilityLabel="Forcer la déconnexion"
                            >
                                <Text style={styles.buttonText}>Forcer la déconnexion</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                {/* If the backend indicated 401 (not found/wrong password), show a small inline link to SignUp */}
                { (errors.general ? errorStatus === 401 : authError?.status === 401) && (
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')} accessibilityRole="button">
                        <Text style={[styles.registerLink, { marginTop: 8 }]}>Créer un compte</Text>
                    </TouchableOpacity>
                )}

{/* 
                {/* User Type Selection */}
                <View style={styles.inputContainer}>
                    <CustomPicker
                        label="Type de compte"
                        selectedValue={formData.userType}
                        onValueChange={(value) => updateFormData('userType', value as string)}
                        options={[
                            { label: 'Patient', value: 'patient' },
                            { label: 'Professionnel de santé', value: 'professional' }
                        ]}
                        placeholder="Sélectionnez votre type de compte"
                        accessibilityLabel="Type de compte"
                        accessibilityHint="Choisissez entre Patient ou Professionnel de santé"
                        error={errors.userType}
                    />
                </View>

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
