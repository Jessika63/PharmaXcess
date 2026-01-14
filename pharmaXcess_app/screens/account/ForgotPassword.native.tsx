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

  const handleSubmit = useCallback(async () => {
    setMessage(null);
    if (!email) {
      setMessage('Veuillez saisir votre email');
      AccessibilityInfo.announceForAccessibility('Veuillez saisir votre email');
      return;
    }

    try {
      const token = await (forgotPassword ? forgotPassword(email) : Promise.resolve(null));
      if (token) {
        AccessibilityInfo.announceForAccessibility('Email de réinitialisation envoyé');

        navigation.navigate('ResetPassword', { token });
      } else {
        setMessage('Un email a été envoyé si le compte existe.');
      }
    } catch (e: any) {
      const err = e?.message || 'Impossible de générer le token de réinitialisation';
      console.error('ForgotPassword error:', e);
      setMessage(err);
      AccessibilityInfo.announceForAccessibility(err);
    }
  }, [email, forgotPassword, navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mot de passe oublié</Text>
      {message && <Text style={styles.errorText}>{message}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="Entrez votre email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity onPress={handleSubmit} accessibilityRole="button">
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.registerLink}>Envoyer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
