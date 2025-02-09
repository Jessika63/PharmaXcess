import { StyleSheet, View, TextInputProps, Text } from 'react-native';
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
}

const AuthTextInput = ({
    value,
    onChangeText,
    placeholder,
    error,
    errorMessage,
    secureTextEntry,
    icon,
}: AuthTextInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { colors } = useTheme();
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
            />
            <View style={styles.errorTextContainer}>
                {error && <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>}
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    errorTextContainer: {
        marginTop: 3,
        height: 20,
        marginLeft: 10  ,
        marginRight: 10 ,
    },
    errorText: {
        fontSize: 13,
    },
});

export default AuthTextInput;