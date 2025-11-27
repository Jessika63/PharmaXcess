import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import createStyles from '../../styles/Home.style';

type HomeProps = {
    navigation: StackNavigationProp<any, any>; 
};

type Item = {
    title: string;
    route: string;
    icon: React.JSX.Element;
};

// The Home component serves as the main dashboard for the application, providing quick access to various features such as prescriptions, medication reminders, and prescription reminders.
export default function Home({ navigation }: HomeProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { t } = useTranslation('common');
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const getWelcomeMessage = () => { 
        if (!currentProfile) { 
            return "Bienvenue sur PharmaXcess"; 
        }

        const profileName = currentProfile.name; 
        const relationship = currentProfile.relationship; 

        return `Bonjour ${profileName}, bienvenue sur votre espace santé.`;
    }; 

    const getProfileIcon = () => { 
        if (!currentProfile) { 
            return "person-circle-outline"; 
        }

        switch (currentProfile.relationship) { 
            case 'self': 
                return "person-circle-outline"; 
            case 'child': 
                return "happy-outline"; 
            case 'parent': 
                return "person-outline"; 
            case 'spouse': 
                return "heart-outline"; 
            case 'other': 
                return "people-outline"; 
            default: 
                return "person-circle-outline"; 
        }
    }; 

    const items: Item[] = [
        {
            title: 'Mes ordonnances',
            route: 'MyPrescriptions',
            icon: <Ionicons name="document-text-outline" size={24} color={colors.iconPrimary} />,
        },
        {
            title: 'Mes rappels médicaments',
            route: 'MedicineReminders',
            icon: <MaterialCommunityIcons name="pill" size={24} color={colors.iconPrimary} />,
        },
        {
            title: 'Mes rappels ordonnances',
            route: 'PrescriptionReminders',
            icon: <Ionicons name="newspaper-outline" size={24} color={colors.iconPrimary} />,
        },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Welcome message with current profile - at the very top */}
            <View style={{ paddingHorizontal: 20, paddingTop: 0, paddingBottom: 100 }}>
                <Text style={{ 
                    fontSize: 24 * fontScale,
                    fontWeight: 'bold',
                    color: colors.profileText,
                    textAlign: 'center',
                    marginBottom: 5
                }}>
                    {getWelcomeMessage()}
                </Text>
            </View>

            {/* Map through the items array to create a card for each feature */}
            {items.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.card}
                    onPress={() => navigation.navigate(item.route)}
                >
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.gradient}
                    >
                        <Text style={styles.itemText}>{item.title}</Text>
                        {item.icon}
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
