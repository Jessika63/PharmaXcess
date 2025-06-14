/**
 * AuthTextInput Component
 * 
 * Custom text input field for authentication forms.
 * Supports:
 * - Error display
 * - Password visibility toggle
 * - Icon support
 * - Accessibility integration
 * - Dynamic font sizing
 */

import { StyleSheet, View, TextInputProps, Text, PixelRatio } from 'react-native';
import { useState } from 'react';
import { TextInput as PaperTextInput } from 'react-native-paper';
import { useTheme } from '@/src/context/ThemeContext';
import { getAccessibilityProps, getHiddenAccessibilityProps } from '@/src/accessibility/screenReader/accessibilityUtils';
import { useTranslation } from 'react-i18next';

interface AuthTextInputProps extends TextInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    label: string;
    error?: boolean;
    errorMessage?: string;
    secureTextEntry?: boolean;
    icon?: string;
    fontSize?: number;
    errorRef?: React.RefObject<Text>;
}

/**
 * AuthTextInput
 * 
 * Displays a customizable text input field with optional password visibility toggle and error handling.
 * 
 * @param {AuthTextInputProps} props - Component props
 * @returns {JSX.Element} - Rendered AuthTextInput component
 */
const AuthTextInput = ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    errorMessage,
    secureTextEntry,
    icon,
    fontSize = 14,
    errorRef,
}: AuthTextInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { colors } = useTheme();
    const fontScale = PixelRatio.getFontScale();

    const { t } = useTranslation('common');

    return (
        <View>
            <PaperTextInput
                label={label}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry && !showPassword}
                left={icon && <PaperTextInput.Icon {...getHiddenAccessibilityProps()} icon={icon} />}
                right={
                    secureTextEntry && (
                        <PaperTextInput.Icon
                            icon={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                            {...getAccessibilityProps({
                                label: t(`eyeButton.${showPassword ? 'hide' : 'show'}.label`),
                                role: "button",
                                hint: t(`eyeButton.${showPassword ? 'hide' : 'show'}.hint`),
                            })}
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
                {...getAccessibilityProps({
                    label: label,
                    role: "text",
                })}
            />
            <View style={[styles.errorTextContainer, {height: fontSize * 1.1 * fontScale}]}>
                {error &&
                    <Text
                        ref={errorRef}
                        style={{ fontSize: fontSize * 0.85, marginTop: fontSize * 0.05 * fontScale, color: colors.error, }}
                    >
                        {errorMessage}
                    </Text>}
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