import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext';
import { useFontScale } from '../context/FontScaleContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../styles/CustomPicker.style';

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
    const styles = createStyles(colors, fontScale);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Find the currently selected option to display its label
    const selectedOption = options.find(option => option.value === selectedValue);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const handleOptionSelect = (option: Option) => {
        onValueChange(option.value);
        setIsModalVisible(false);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.pickerContainer, error && styles.pickerContainerError, !enabled && styles.disabled]}>
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
