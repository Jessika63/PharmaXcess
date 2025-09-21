import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';

interface DatePickerProps {
    label?: string;
    day: number;
    month: number;
    year: number;
    onDayChange: (day: number) => void;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
    minYear?: number;
    maxYear?: number;
    errors?: {
        day?: string;
        month?: string;
        year?: string;
    };
    accessibilityLabel?: string;
    style?: any;
}

export default function DatePicker({
    label,
    day,
    month,
    year,
    onDayChange,
    onMonthChange,
    onYearChange,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
    errors,
    accessibilityLabel,
    style
}: DatePickerProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();

    const getDayOptions = () => {
        const days = [];
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ label: i.toString().padStart(2, '0'), value: i });
        }
        return days;
    };

    const monthOptions = [
        { label: 'Janvier', value: 1 },
        { label: 'Février', value: 2 },
        { label: 'Mars', value: 3 },
        { label: 'Avril', value: 4 },
        { label: 'Mai', value: 5 },
        { label: 'Juin', value: 6 },
        { label: 'Juillet', value: 7 },
        { label: 'Août', value: 8 },
        { label: 'Septembre', value: 9 },
        { label: 'Octobre', value: 10 },
        { label: 'Novembre', value: 11 },
        { label: 'Décembre', value: 12 },
    ];

    const getYearOptions = () => {
        const years = [];
        for (let i = maxYear; i >= minYear; i--) {
            years.push({ label: i.toString(), value: i });
        }
        return years;
    };

    const styles = StyleSheet.create({
        container: {
            marginBottom: 15,
        },
        label: {
            fontSize: 16 * fontScale,
            fontWeight: '600',
            color: colors.profileText,
            marginBottom: 8,
        },
        dateContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
        },
        pickerWrapper: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            backgroundColor: colors.inputBackground,
            overflow: 'hidden',
        },
        pickerWrapperError: {
            borderColor: colors.error || '#FF6B6B',
        },
        picker: {
            height: 50,
            color: colors.text,
        },
        pickerItem: {
            fontSize: 14 * fontScale,
            color: colors.text,
        },
        errorText: {
            color: colors.error || '#FF6B6B',
            fontSize: 14 * fontScale,
            marginTop: 5,
            marginLeft: 5,
        },
    });

    const hasError = errors && (errors.day || errors.month || errors.year);

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={styles.label} accessibilityRole="header">
                    {label}
                </Text>
            )}
            <View 
                style={styles.dateContainer}
                accessibilityLabel={accessibilityLabel || "Sélection de date"}
            >
                <View style={[
                    styles.pickerWrapper,
                    errors?.day && styles.pickerWrapperError
                ]}>
                    <Picker
                        selectedValue={day}
                        style={styles.picker}
                        onValueChange={(value) => onDayChange(Number(value))}
                        accessibilityLabel="Jour"
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item 
                            label="Jour" 
                            value={0} 
                            color={colors.infoText}
                        />
                        {getDayOptions().map((option) => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                color={colors.text}
                            />
                        ))}
                    </Picker>
                </View>

                <View style={[
                    styles.pickerWrapper,
                    errors?.month && styles.pickerWrapperError
                ]}>
                    <Picker
                        selectedValue={month}
                        style={styles.picker}
                        onValueChange={(value) => onMonthChange(Number(value))}
                        accessibilityLabel="Mois"
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item 
                            label="Mois" 
                            value={0} 
                            color={colors.infoText}
                        />
                        {monthOptions.map((option) => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                color={colors.text}
                            />
                        ))}
                    </Picker>
                </View>

                <View style={[
                    styles.pickerWrapper,
                    errors?.year && styles.pickerWrapperError
                ]}>
                    <Picker
                        selectedValue={year}
                        style={styles.picker}
                        onValueChange={(value) => onYearChange(Number(value))}
                        accessibilityLabel="Année"
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item 
                            label="Année" 
                            value={0} 
                            color={colors.infoText}
                        />
                        {getYearOptions().map((option) => (
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
                    {errors?.day && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.day}
                        </Text>
                    )}
                    {errors?.month && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.month}
                        </Text>
                    )}
                    {errors?.year && (
                        <Text style={styles.errorText} accessibilityRole="alert">
                            {errors.year}
                        </Text>
                    )}
                </View>
            )}
        </View>
    );
}
