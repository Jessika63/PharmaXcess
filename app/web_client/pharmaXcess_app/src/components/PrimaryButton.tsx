import { useState } from 'react';
import { Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../styles/Theme';

interface CustomButtonProps {
    onPress: () => void;
    label: string;
    color?: string;
    labelStyle?: object;
    icon?: string;
    loading?: boolean;
    disabled?: boolean;
}

const PrimaryButton: React.FC<CustomButtonProps> = ({
    onPress,
    label,
    color,
    icon,
    loading = false,
    disabled = false,
}: CustomButtonProps) => {
    const [isPressed, setIsPressed] = useState(false);
    const { colors } = useTheme();
    const buttonColor = color || colors.primary;
    return (
        <View style={[{ opacity: isPressed ? 0.6 : 1 }]}>
            <Button
                mode='contained'
                labelStyle={styles.label}
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
                contentStyle={styles.content}
            >
                {label}
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        height: 50,
    },
});

export default PrimaryButton;