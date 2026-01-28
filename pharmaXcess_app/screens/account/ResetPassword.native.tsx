import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, AccessibilityInfo } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useAuth } from '../../context/AuthContext';
import createStyles from '../../styles/SignUp.style';

type Props = {
  navigation: StackNavigationProp<any, any>;
  route?: any;
};

export default function ResetPassword({ navigation, route }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);
  const { resetPassword } = useAuth();

  const initialToken = route?.params?.token || '';
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#FF6B6B' });
  const [errors, setErrors] = useState<{ password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // Local loading state

  // Log navigation changes to debug unwanted redirects
  useEffect(() => {
    console.log('🟢 ResetPassword MOUNTED');
    const unsubscribe = navigation.addListener('blur', () => {
      console.log('⚠️ ResetPassword BLUR - On quitte la page');
    });
    return () => {
      console.log('🔴 ResetPassword UNMOUNTED');
      unsubscribe();
    };
  }, [navigation]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let label = 'Très faible';
    let color = '#FF6B6B';
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
  };

  const handleSubmit = useCallback(async () => {
    console.log('========== RESET PASSWORD SUBMIT ==========');
    console.log('Token:', token ? 'présent' : 'absent');
    console.log('Nouveau mot de passe:', newPassword);
    console.log('Confirmation:', confirmPassword);
    
    setMessage(null);
    setMessageType(null);
    setErrors({});
    
    if (!token) {
      const errMsg = 'Aucun token fourni. Veuillez générer une demande de réinitialisation depuis l\'écran « Mot de passe oublié ».';
      console.log('❌ ERREUR: Pas de token');
      setMessage(errMsg);
      setMessageType('error');
      AccessibilityInfo.announceForAccessibility(errMsg);
      return;
    }

    if (!newPassword) {
      const msg = 'Veuillez saisir le nouveau mot de passe';
      setErrors({ general: msg });
      AccessibilityInfo.announceForAccessibility(msg);
      return;
    }

    // validate password with same rules as SignUp
    const pwErrors: { password?: string; general?: string } = {};
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    if (newPassword.length < 8) {
      pwErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (strength.score < 3) {
      pwErrors.password = pwErrors.password ? pwErrors.password + '\nMot de passe trop faible' : 'Mot de passe trop faible';
    }
    
    // Ensure confirmation matches the new password
    if (confirmPassword !== newPassword) {
      pwErrors.password = pwErrors.password ? pwErrors.password + '\nLa confirmation du mot de passe ne correspond pas' : 'La confirmation du mot de passe ne correspond pas';
    }
    
    setErrors(pwErrors);
    if (Object.keys(pwErrors).length > 0) {
      console.log('❌ ERREUR: Validation locale échouée:', pwErrors);
      return;
    }

    console.log('✅ Validation locale OK - Appel backend...');
    // All local validation passed, attempt to reset password on backend
    setIsSubmitting(true);
    try {
      const ok = await (resetPassword ? resetPassword(token, newPassword) : Promise.resolve(false));
      console.log('Résultat backend resetPassword:', ok);
      if (ok === true) {
        // Only navigate to Login on explicit success
        console.log('✅ SUCCÈS: Mot de passe réinitialisé');
        const successMsg = 'Mot de passe réinitialisé avec succès';
        setMessage(successMsg);
        setMessageType('success');
        AccessibilityInfo.announceForAccessibility(successMsg);
        console.log('⏱️ Navigation vers Login dans 1.5s...');
        // Redirect to login after a short delay to let user see the success message
        setTimeout(() => {
          console.log('🔄 NAVIGATION vers /Login');
          navigation.navigate('Login');
        }, 1500);
      } else {
        // resetPassword returned false without throwing - treat as error
        console.log('❌ ERREUR: resetPassword a retourné false');
        const errMsg = 'Erreur lors de la réinitialisation du mot de passe';
        setMessage(errMsg);
        setMessageType('error');
        console.log('📍 Message affiché sur ResetPassword:', errMsg);
        AccessibilityInfo.announceForAccessibility(errMsg);
      }
    } catch (e: any) {
      // Backend error - stay on the page and display the error
      console.log('❌ EXCEPTION CATCHÉE dans ResetPassword:');
      console.log('Type:', typeof e);
      console.log('Message:', e?.message);
      console.log('Objet complet:', e);
      const errMsg = e?.message || e?.toString?.() || 'Erreur lors de la réinitialisation du mot de passe';
      setMessage(errMsg);
      setMessageType('error');
      console.log('📍 Message affiché sur ResetPassword:', errMsg);
      AccessibilityInfo.announceForAccessibility(errMsg);
      console.log('🛑 PAS de navigation - reste sur ResetPassword');
      // Explicitly do NOT navigate - stay on ResetPassword page
    } finally {
      setIsSubmitting(false);
    }
  }, [token, newPassword, confirmPassword, resetPassword, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialiser le mot de passe</Text>
      
      {/* Display general token or backend error */}
      {message && messageType === 'error' && (
        <Text 
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {message}
        </Text>
      )}
      
      {/* Display success message */}
      {message && messageType === 'success' && (
        <Text 
          style={[styles.errorText, { color: '#4CAF50' }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {message}
        </Text>
      )}

      {/* Show error if no token */}
      {!token && (
        <Text style={styles.errorText}>Aucun token fourni. Veuillez générer une demande de réinitialisation depuis l'écran « Mot de passe oublié ».</Text>
      )}

      <Text style={styles.label}>Nouveau mot de passe</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          value={newPassword}
          onChangeText={(val) => {
            setNewPassword(val);
            const s = calculatePasswordStrength(val);
            setPasswordStrength(s);
            // clear errors and messages as user types
            if (errors?.password || errors?.general) setErrors({});
            if (message) {
              setMessage(null);
              setMessageType(null);
            }
          }}
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Entrez le nouveau mot de passe"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(prev => !prev)}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.profileText} />
        </TouchableOpacity>
      </View>

      {/* Password strength indicator (same as SignUp) */}
      {newPassword.length > 0 && (
        <View style={styles.passwordStrengthContainer}>
          <Text style={styles.passwordStrengthLabel}>Force du mot de passe:</Text>
          <View style={styles.passwordStrengthBar}>
            <View
              style={[
                styles.passwordStrengthFill,
                { width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: passwordStrength.color }
              ]}
            />
          </View>
          <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]} accessibilityLiveRegion="polite">
            {passwordStrength.label}
          </Text>
        </View>
      )}

      {/* Confirm password input */}
      <Text style={styles.label}>Confirmer le mot de passe</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          value={confirmPassword}
          onChangeText={(val) => {
            setConfirmPassword(val);
            // clear errors and messages as user types
            if (errors?.password || errors?.general) setErrors({});
            if (message) {
              setMessage(null);
              setMessageType(null);
            }
          }}
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Confirmez le nouveau mot de passe"
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowConfirmPassword(prev => !prev)}
          accessibilityRole="button"
          accessibilityLabel={showConfirmPassword ? 'Masquer la confirmation' : 'Afficher la confirmation'}
        >
          <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.profileText} />
        </TouchableOpacity>
      </View>
      {confirmPassword.length > 0 && newPassword === confirmPassword && !errors.password && (
        <Text style={styles.successText}>✓ Les mots de passe correspondent</Text>
      )}
      {confirmPassword.length > 0 && newPassword !== confirmPassword && (
        <Text style={styles.errorText}>✗ Les mots de passe ne correspondent pas</Text>
      )}

      {errors?.password && (
        <Text 
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          {errors.password}
        </Text>
      )}

      <TouchableOpacity style={styles.signupButton} onPress={handleSubmit} disabled={isSubmitting} accessibilityRole="button">
        {isSubmitting ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Réinitialiser</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
