import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import createStyles from '../styles/TimePicker.style';

interface TimePickerProps {
    label?: string;
    hour: number;
    minute: number;
    onHourChange: (hour: number) => void;
    onMinuteChange: (minute: number) => void;
    format24?: boolean; 
    errors?: {
        hour?: string;
        minute?: string;
    };
    accessibilityLabel?: string;
    style?: any;
}

export default function TimePicker({
    label,
    hour,
    minute,
    onHourChange,
    onMinuteChange,
    format24 = true,
    errors,
    accessibilityLabel,
    style
}: TimePickerProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const getHourOptions = () => {
        const hours = [];
        const maxHour = format24 ? 23 : 12;
        const minHour = format24 ? 0 : 1;
        
        for (let i = minHour; i <= maxHour; i++) {
            const displayHour = format24 ? i.toString().padStart(2, '0') : i.toString();
            hours.push({ label: displayHour, value: i });
        }
        return hours;
    };

    const getMinuteOptions = () => {
        const minutes = [];
        for (let i = 0; i < 60; i += 5) { 
            minutes.push({ 
                label: i.toString().padStart(2, '0'), 
                value: i 
            });
        }
        return minutes;
    };

    const hasError = errors && (errors.hour || errors.minute);

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label} accessibilityRole="header">
                    {label}
                </Text>
            )}
            <View 
                style={styles.timeContainer}
                accessibilityLabel={accessibilityLabel || "Sélection d'heure"}
            >
                <View style={[
                    styles.pickerWrapper,
                    errors?.hour && styles.pickerWrapperError
                ]}>
                    <Picker
                        selectedValue={hour}
                        style={styles.picker}
                        onValueChange={(value) => onHourChange(Number(value))}
                        accessibilityLabel="Heure"
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item 
                            label="Heure" 
                            value={-1} 
                            color={colors.infoText}
                        />
                        {getHourOptions().map((option) => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                color={colors.text}
                            />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.separator}>:</Text>

                <View style={[
                    styles.pickerWrapper,
                    errors?.minute && styles.pickerWrapperError
                ]}>
                    <Picker
                        selectedValue={minute}
                        style={styles.picker}
                        onValueChange={(value) => onMinuteChange(Number(value))}
                        accessibilityLabel="Minute"
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item 
                            label="Min" 
                            value={-1} 
                            color={colors.infoText}
                        />
                        {getMinuteOptions().map((option) => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                color={colors.text}
                            />
                        ))}
                    </Picker>
                </View>
            </View>
            
            {hasError && (
                <View>
                    {errors?.hour && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.hour}
                        </Text>
                    )}
                    {errors?.minute && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.minute}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
