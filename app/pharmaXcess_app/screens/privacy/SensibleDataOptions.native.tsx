import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import createStyles from '../../styles/SettingsCheck.style';
import { useTheme } from '../../context/ThemeContext';

// The SensibleDataOptions component allows users to configure options for sensitive data handling in the application.
export default function SensibleDataOptions({ navigation }): React.JSX.Element {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [dataType, setDataType] = useState('default');
    const [dataDuration, setDataDuration] = useState('default');

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.title}>Masque des informations</Text>
                {['default', 'type1', 'type2', 'type3'].map((type) => ( 
                    <TouchableOpacity
                        key={type}
                        style={[styles.option, dataType === type && styles.selectedOption]}
                        onPress={() => setDataType(type)}
                    >
                        <Ionicons
                            name={dataType === type ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {type === 'default'
                                ? 'Mode discret '
                                : type === 'type1'
                                ? 'Notifications privées'
                                : type === 'type2'
                                ? 'Masquage automatique après 5 minutes'
                                : 'Déverouillage des informations masquées'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.title}>Verrouillage par section</Text>
                {['default', 'short', 'medium'].map((duration) => (
                    <TouchableOpacity
                        key={duration}
                        style={[styles.option, dataDuration === duration && styles.selectedOption]}
                        onPress={() => setDataDuration(duration)}
                    >
                        <Ionicons
                            name={dataDuration === duration ? 'checkmark-circle' : 'ellipse-outline'}
                            size={24}
                            color={colors.iconPrimary}
                        />
                        <Text style={styles.optionText}>
                            {duration === 'default'
                                ? 'Ordonnances'
                                : duration === 'short'
                                ? 'Historique médical'
                                : 'Traitements en cours'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <TouchableOpacity style={styles.returnButton} onPress={() => navigation.goBack()}>
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                    <Text style={styles.returnButtonText}>Retour</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}
