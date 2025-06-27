import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

type ProfileProps = {
    navigation: StackNavigationProp<any, any>;
};

type Item = {
    title: string;
    route: string;
    icon: "person-outline" | "medkit-outline" | "bandage-outline" | "bed-outline" | "alert-circle-outline" | "people-outline" | "person-add-outline";
};

// The Profile component displays the user's profile information and allows navigation to various health-related sections of the app.
export default function Profile({ navigation }: ProfileProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);
    // Use React's useLayoutEffect to set the header options for the navigation
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerButton}>
                    <Ionicons name="settings-outline" size={24} color={colors.profileText} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const items: Item[] = [
        { title: 'Mes informations', route: 'PersonalInfo', icon: 'person-outline' },
        { title: 'Mes maladies', route: 'Diseases', icon: 'medkit-outline' },
        { title: 'Mes traitements', route: 'Treatments', icon: 'bandage-outline' },
        { title: 'Mes hospitalisations', route: 'Hospitalizations', icon: 'bed-outline' },
        { title: 'Mes allergies', route: 'Allergies', icon: 'alert-circle-outline' },
        { title: 'Mes antécédents familiaux', route: 'FamilyHistory', icon: 'people-outline' },
        { title: 'Mes médecins', route: 'Doctors', icon: 'person-add-outline' },
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileContainer}>
                <Image source={{ uri: 'https://www.w3schools.com/w3images/avatar2.png' }} style={styles.profileImage} />
                <Text style={styles.profileName}>John Doe</Text>
            </View>
            {/* Map through the items array to create a card for each profile item */}
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                        <Ionicons name={item.icon} size={24} color={colors.iconPrimary} style={styles.icon} />
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}
