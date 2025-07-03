import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Option {
    label: string;
    value: string | number;
}

interface CustomPickerProps {
    label: string;
    selectedValue: string | number;
    onValueChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    enabled?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: any;
    error?: string;
}

export default function CustomPicker({
    label,
    selectedValue,
    onValueChange,
    options,
    placeholder = "Sélectionner...",
    enabled = true,
    accessibilityLabel,
    accessibilityHint,
    style,
    error
}: CustomPickerProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Find the currently selected option to display its label
    const selectedOption = options.find(option => option.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const styles = StyleSheet.create({
        container: {
            marginBottom: 15,
            flex: 1, 
        },
        // Label style using theme color for consistent field titles
        label: {
            fontSize: 16 * fontScale,
            fontWeight: '600',
            color: colors.settingsTitle,
            marginBottom: 8,
        },
        // Container style for the picker field with error state support
        pickerContainer: {
            borderWidth: 2, 
            borderColor: error ? (colors.error || '#FF6B6B') : colors.inputBorder,
            borderRadius: 10,
            backgroundColor: colors.inputBackground,
            overflow: 'hidden',
            minHeight: 50, 
        },
        // Touchable button style that triggers the dropdown modal
        pickerButton: {
            height: 50,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            backgroundColor: colors.inputBackground, 
        },
        // Text style for the selected value display using theme-aware color
        pickerText: {
            fontSize: 16 * fontScale,
            color: colors.infoText, 
            flex: 1,
        },
        // Modal backdrop container with semi-transparent overlay
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalContent: {
            backgroundColor: colors.background,
            marginHorizontal: 20,
            borderRadius: 10,
            maxHeight: '50%',
        },
        modalHeader: {
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 18 * fontScale,
            fontWeight: 'bold',
            color: colors.settingsTitle,
            textAlign: 'center',
        },
        optionItem: {
            padding: 15,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        optionText: {
            fontSize: 16 * fontScale,
            color: colors.text, 
        },
        errorText: {
            color: colors.error || '#FF6B6B',
            fontSize: 14 * fontScale,
            marginTop: 5,
            marginLeft: 5,
        },
        disabled: {
            opacity: 0.6,
        },
    });

    const handleOptionSelect = (option: Option) => {
        onValueChange(option.value);
        setIsModalVisible(false);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.pickerContainer, !enabled && styles.disabled]}>
                <TouchableOpacity
                    style={styles.pickerButton}
                    onPress={() => enabled && setIsModalVisible(true)}
                    disabled={!enabled}
                    accessibilityLabel={accessibilityLabel || label}
                    accessibilityHint={accessibilityHint}
                >
                    <Text style={styles.pickerText}>{displayText}</Text>
                    <Ionicons 
                        name="chevron-down" 
                        size={20} 
                        color={colors.infoTitle} 
                    />
                </TouchableOpacity>
            </View>
            
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.optionItem}
                                    onPress={() => handleOptionSelect(item)}
                                >
                                    <Text style={styles.optionText}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
            
            {error && (
                <Text style={styles.errorText} accessibilityRole="alert">
                    {error}
                </Text>
            )}
        </View>
    );
}
