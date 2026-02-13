import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import createStyles from '../styles/QuantityPicker.style';

interface QuantityPickerProps {
    label: string;
    selectedValue: number;
    onValueChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    unit?: string; 
    customValues?: number[]; 
    placeholder?: string;
    error?: string;
    accessibilityLabel?: string;
    style?: any;
}

export default function QuantityPicker({
    label,
    selectedValue,
    onValueChange,
    min = 0,
    max = 20,
    step = 1,
    unit = "",
    customValues,
    placeholder = "Sélectionner...",
    error,
    accessibilityLabel,
    style
}: QuantityPickerProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const getQuantityOptions = () => {
        if (customValues) {
            return customValues.map(value => ({
                label: `${value}${unit ? ` ${unit}` : ''}`,
                value: value
            }));
        }

        const options = [];
        for (let i = min; i <= max; i += step) {
            const displayValue = step < 1 ? i.toFixed(1) : i.toString();
            options.push({
                label: `${displayValue}${unit ? ` ${unit}` : ''}`,
                value: i
            });
        }
        return options;
    };

    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label} accessibilityRole="header">
                {label}
            </Text>
            <View style={[styles.pickerContainer, error && styles.pickerContainerError]}>
                <Picker
                    selectedValue={selectedValue}
                    style={styles.picker}
                    onValueChange={(value) => onValueChange(Number(value))}
                    accessibilityLabel={accessibilityLabel || label}
                    itemStyle={styles.pickerItem}
                >
                    <Picker.Item 
                        label={placeholder} 
                        value={-1} 
                        color={colors.infoText}
                    />
                    {getQuantityOptions().map((option, index) => (
                        <Picker.Item
                            key={index}
                            label={option.label}
                            value={option.value}
                            color={colors.text}
                        />
                    ))}
                </Picker>
            </View>
            {error && (
                <Text style={styles.errorText} accessibilityRole="alert">
                    {error}
                </Text>
            )}
        </View>
    );
}
