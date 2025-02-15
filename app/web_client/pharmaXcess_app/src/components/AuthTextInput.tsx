import { StyleSheet, View, TextInputProps, Text, PixelRatio } from 'react-native';
import { useState } from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useTheme } from '../styles/Theme';

interface AuthTextInputProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    error?: boolean;
    errorMessage?: string;
    secureTextEntry?: boolean;
    icon?: string;
    fontSize?: number;
}

const AuthTextInput = ({
    value,
    onChangeText,
    placeholder,
    error,
    errorMessage,
    secureTextEntry,
    icon,
    fontSize = 14,
}: AuthTextInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { colors } = useTheme();
    const fontScale = PixelRatio.getFontScale();
    return (
        <View>
            <PaperTextInput
                label={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !showPassword}
                left={icon && <PaperTextInput.Icon icon={icon} />}
                right={
                    secureTextEntry && (
                        <PaperTextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                    )
                }
                error={error}
                theme={{
                    roundness: 12,
                    colors: { 
                        primary: colors.primary,
                        onSurfaceVariant: colors.onSurfaceVariant,
                        background: colors.surfaceVariant,
                    },
                }}
                mode='outlined'
                style={{ fontSize: fontSize }}
            />
            <View style={[styles.errorTextContainer, {height: fontSize * 1.1 * fontScale}]}>
                {error && <Text style={{ fontSize: fontSize * 0.85, marginTop: fontSize * 0.05 * fontScale, color: colors.error, }}>{errorMessage}</Text>}
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    errorTextContainer: {
        marginHorizontal: 10,
    },
});

export default AuthTextInput;