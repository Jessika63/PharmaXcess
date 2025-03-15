import { useState } from 'react';
import { Button } from 'react-native-paper';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/src/context/ThemeContext';
import { getAccessibilityProps } from '@/src/accessibility/screenReader/accessibilityUtils';

interface CustomButtonProps {
    onPress: () => void;
    label: string;
    color?: string;
    labelStyle?: object;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
    fontSize?: number;
    hint?: string;
}

const PrimaryButton: React.FC<CustomButtonProps> = ({
    onPress,
    label,
    color,
    icon,
    loading = false,
    disabled = false,
    fontSize = 18,
    hint
}: CustomButtonProps) => {
    const [isPressed, setIsPressed] = useState(false);
    const { colors } = useTheme();
    const buttonColor = color || colors.primary;

    return (
        <View style={[{ opacity: isPressed ? 0.6 : 1 }]}>
            <Button
                mode='contained'
                labelStyle={[styles.label, { color: colors.onPrimary, fontSize: fontSize }]}
                icon={icon}
                loading={loading}
                disabled={disabled}
                onPress={onPress}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
                theme={{
                    roundness: 1,
                    colors: { 
                        primary: buttonColor,
                    }
                }}
                {...getAccessibilityProps({
                    label: label,
                    hint: hint,
                    role: "button",
                })}
            >
                <Text style={{ lineHeight: fontSize * 1.5 }}>
                    {label}
                </Text>
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontWeight: 'bold',
    },
});

export default PrimaryButton;
