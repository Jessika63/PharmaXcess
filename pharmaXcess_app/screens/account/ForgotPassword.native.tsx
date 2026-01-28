import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, AccessibilityInfo, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useAuth } from '../../context/AuthContext';
import createStyles from '../../styles/Login.style';

type Props = {
  navigation: StackNavigationProp<any, any>;
};

export default function ForgotPassword({ navigation }: Props): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);
  const { forgotPassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success' | null>(null);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const handleSubmit = useCallback(async () => {
    setMessage(null);
    setMessageType(null);
    setErrors({});
    
    if (!email.trim()) {
      const msg = 'Veuillez saisir votre email';
      setErrors({ email: msg });
      AccessibilityInfo.announceForAccessibility(msg);
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const msg = 'Format d\'email invalide';
      setErrors({ email: msg });
      AccessibilityInfo.announceForAccessibility(msg);
      return;
    }

    try {
      const token = await (forgotPassword ? forgotPassword(email) : Promise.resolve(null));
      if (token) {
        const successMsg = 'Un email de réinitialisation a été envoyé. Veuillez vérifier votre boîte mail.';
        setMessage(successMsg);
        setMessageType('success');
        AccessibilityInfo.announceForAccessibility(successMsg);

        // Wait a moment before navigating so user can see the success message
        setTimeout(() => {
          navigation.navigate('ResetPassword', { token });
        }, 1500);
      } else {
        // Backend returned null, which means account might not exist (security)
        const msg = 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.';
        setMessage(msg);
        setMessageType('success');
        AccessibilityInfo.announceForAccessibility(msg);
      }
    } catch (e: any) {
      // Backend error - stay on the page and display the error
      const errMsg = e?.message || 'Impossible de générer le token de réinitialisation. Veuillez réessayer.';
      setMessage(errMsg);
      setMessageType('error');
      AccessibilityInfo.announceForAccessibility(errMsg);
    }
  }, [email, forgotPassword, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      
      {/* Display error message */}
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

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={(val) => {
          setEmail(val);
          // Clear email error when user starts typing
          if (errors.email) {
            setErrors({});
          }
        }}
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="Entrez votre email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && (
        <Text 
          style={styles.errorText}
          accessibilityRole="alert"
        >
          {errors.email}
        </Text>
      )}

      <TouchableOpacity onPress={handleSubmit} disabled={isLoading} accessibilityRole="button">
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.registerLink}>Envoyer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
