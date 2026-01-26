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
  const { resetPassword, isLoading } = useAuth();

  const initialToken = route?.params?.token || '';
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '#FF6B6B' });
  const [errors, setErrors] = useState<{ password?: string }>({});

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
    setMessage(null);
    if (!token || !newPassword) {
      setMessage('Veuillez saisir le token et le nouveau mot de passe');
      AccessibilityInfo.announceForAccessibility('Veuillez saisir le token et le nouveau mot de passe');
      return;
    }

    // validate password with same rules as SignUp
    const pwErrors: { password?: string } = {};
    const strength = calculatePasswordStrength(newPassword);
    setPasswordStrength(strength);
    if (newPassword.length < 8) {
      pwErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (strength.score < 3) {
      pwErrors.password = pwErrors.password ? pwErrors.password + '\nMot de passe trop faible' : 'Mot de passe trop faible';
    }
    setErrors(pwErrors);
    if (Object.keys(pwErrors).length > 0) return;

    // Ensure confirmation matches the new password
    if (confirmPassword !== newPassword) {
      const msg = 'La confirmation du mot de passe ne correspond pas';
      setMessage(msg);
      AccessibilityInfo.announceForAccessibility(msg);
      setErrors({ password: msg });
      return;
    }

    // Note: preventing reuse of the old password requires checking against the
    // existing password on the server. If the backend enforces "new != old",
    // it should return a clear error message which we propagate to the UI below.

    try {
      const ok = await (resetPassword ? resetPassword(token, newPassword) : Promise.resolve(false));
      if (ok) {
        const successMsg = 'Mot de passe réinitialisé avec succès';
        setMessage(successMsg);
        AccessibilityInfo.announceForAccessibility(successMsg);
        navigation.navigate('Login');
      }
    } catch (e: any) {
      const errMsg = e?.message || 'Erreur lors de la réinitialisation du mot de passe';
      setMessage(errMsg);
      AccessibilityInfo.announceForAccessibility(errMsg);
    }
  }, [token, newPassword, confirmPassword, resetPassword, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Réinitialiser le mot de passe</Text>
      {message && <Text style={styles.errorText}>{message}</Text>}

      {/* Token is provided by the previous step and must remain secret; do not show an input for it. */}
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
            // clear errors as user types
            if (errors?.password) setErrors({});
          }}
          style={styles.input}
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
            if (errors?.password) setErrors({});
          }}
          style={styles.input}
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
      {confirmPassword.length > 0 && newPassword === confirmPassword && (
        <Text style={styles.successText}>✓ Les mots de passe correspondent</Text>
      )}

      {errors?.password && (
        <Text style={styles.errorText}>{errors.password}</Text>
      )}

      <TouchableOpacity style={styles.signupButton} onPress={handleSubmit} accessibilityRole="button">
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Réinitialiser</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
