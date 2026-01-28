import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
import createGridStyles from '../../styles/ProfileGrid.style'; 
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import QRCodeModal from '../../components/QRCodeModal'; 


type ProfileProps = {
    navigation: StackNavigationProp<any, any>;
};

type Item = {
    title: string;
    route: string;
    icon: "person-outline" | "medkit-outline" | "bandage-outline" | "bed-outline" | "alert-circle-outline" | "people-outline" | "person-add-outline" | "document-text-outline";
};

// The Profile component displays the user's profile information and allows navigation to various health-related sections of the app.
export default function Profile({ navigation }: ProfileProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { user, logout } = useAuth();
    const { currentProfile, profiles } = useProfile();
    const styles = createStyles(colors, fontScale);
    const gridStyles = createGridStyles(colors, fontScale);

    // State for QR code modal 
    const [isQRModalVisible, setIsQRModalVisible] = useState(false);

    // Function to handle logout
    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Déconnexion',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };
    // Function to get the relationship text based on the current profile's relationship
    const getRelationshipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Mon profil';
            case 'child': return 'Profil enfant'; 
            case 'parent': return 'Profil parent';
            case 'spouse': return 'Profil conjoint(e)';
            case 'other': return 'Autre profil';
            default: return 'Mon profil';
        } 
    }; 

    // Function to get the avatar URL for the current profile
    const getAvatarUrl = () => {
        return currentProfile?.avatar || 'https://www.w3schools.com/w3images/avatar2.png';
    };
    // Use React's useLayoutEffect to set the header options for the navigation
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={handleLogout} style={[styles.headerButton, { marginRight: 10 }]}>
                        <Ionicons name="log-out-outline" size={24} color={colors.profileText} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => setIsQRModalVisible(true)}
                        style={[styles.headerButton, { marginRight: 10 }]} 
                    >
                        <Ionicons name="qr-code-outline" size={24} color={colors.profileText} /> 
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.headerButton}>
                        <Ionicons name="settings-outline" size={24} color={colors.profileText} />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, handleLogout]);

    const items: Item[] = [
        { title: 'Mes informations', route: 'PersonalInfo', icon: 'person-outline' },
        { title: 'Mes maladies', route: 'Diseases', icon: 'medkit-outline' },
        { title: 'Mes traitements', route: 'Treatments', icon: 'bandage-outline' },
        { title: 'Mes hospitalisations', route: 'Hospitalizations', icon: 'bed-outline' },
        { title: 'Mes allergies', route: 'Allergies', icon: 'alert-circle-outline' },
        { title: 'Mes antécédents familiaux', route: 'FamilyHistory', icon: 'people-outline' },
        { title: 'Mes médecins', route: 'Doctors', icon: 'person-add-outline' },
        { title: 'Mes documents', route: 'Documents', icon: 'document-text-outline'},
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Section to select the profile */} 
            <TouchableOpacity 
                style={[styles.card, { marginBottom: 20 }]} 
                onPress={() => navigation.navigate('ProfileSelection')}
            > 
                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.cardGradient}> 
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}> 
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}> 
                            <Image 
                                source={{ uri: getAvatarUrl() }} 
                                style={[styles.profileImage, { width: 40, height: 40, marginLeft: 15 }]} 
                            />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.cardText, { color: colors.iconPrimary, fontSize: 16, fontWeight: 'bold' }]}>
                                    {currentProfile?.name || 'Aucun profil sélectionné'}
                                </Text>
                                <Text style={[styles.cardText, { color: colors.iconPrimary, fontSize: 12, opacity: 0.9 }]}>
                                    {getRelationshipText(currentProfile?.relationship)}
                                </Text>
                                {profiles.length > 1 && (
                                    <Text style={[styles.cardText, { color: colors.iconPrimary, fontSize: 11, opacity: 0.8 }]}>
                                        {profiles.length - 1} autre(s) profil(s) disponible(s)
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={{ alignItems: 'center'}}> 
                            <Ionicons name="people" size={24} color={colors.iconPrimary} style={{ marginRight: 15 }} /> 
                            <Ionicons name="chevron-forward" size={16} color={colors.iconPrimary} style={{ marginTop: 2 }} />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>

            {/* Current profile information */}
            <View style={[styles.profileContainer, { marginBottom: 50 }]}>
                <Image source={{ uri: getAvatarUrl() }} style={styles.profileImage} />
                <Text style={styles.profileName}>
                    {currentProfile?.name || user?.name}
                </Text>
            </View>
            
            {/* Grid of square cards for profile sections */}
            <View style={gridStyles.gridContainer}>
                {items.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={gridStyles.gridCard} 
                        onPress={() => navigation.navigate(item.route)}
                    >
                        <LinearGradient 
                            colors={[colors.primary, colors.secondary]} 
                            style={gridStyles.gridCardGradient}
                        >
                            <Ionicons 
                                name={item.icon} 
                                size={40} 
                                color={colors.iconPrimary} 
                                style={gridStyles.gridCardIcon} 
                            />
                            <Text style={gridStyles.gridCardText}>{item.title}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>
            
            {/* Logout button */}
            <TouchableOpacity style={[styles.card, { marginTop: 20 }]} onPress={handleLogout}>
                <LinearGradient colors={[colors.error, colors.error]} style={styles.cardGradient}>
                    <Text style={styles.cardText}>Se déconnecter</Text>
                    <Ionicons name="log-out-outline" size={24} color={colors.iconPrimary} style={styles.icon} />
                </LinearGradient>
            </TouchableOpacity>

            {/* QR Code Modal */} 
            <QRCodeModal
                visible={isQRModalVisible} 
                onClose={() => setIsQRModalVisible(false)} 
                profile={currentProfile} 
            /> 
        </ScrollView>
    );
}
