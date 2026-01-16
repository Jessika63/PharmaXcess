import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Modal, TextInput } from 'react-native'; 
import { Picker } from '@react-native-picker/picker'; 
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createCardStyles from '../../styles/CardGrid.style';
import { createStyles } from '../../styles/ProfileSelection.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { Profile, useProfile } from '../../context/ProfileContext';

type ProfileSelectionProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

// The ProfileSelection component allows users to select or create a profile for managing their health data.
export default function ProfileSelection({ navigation }: ProfileSelectionProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { profiles, currentProfile, switchProfile, createProfile } = useProfile();
    const cardStyles = createCardStyles(colors, fontScale); 
    const styles = createStyles(colors, fontScale);

    const [showCreateModal, setShowCreateModal] = useState(false); 
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileRelationship, setNewProfileRelationship] = useState<'child' | 'parent' | 'spouse' | 'other'>('other');

    const handleProfileSwitch = async (profileId: string) => {
        const success = await switchProfile(profileId);
        if (success) {
            navigation.goBack();
        } else {
            Alert.alert('Erreur', 'Impossible de changer de profil');
        }
    };

    const handleCreateProfile = async () => { 
        if (!newProfileName.trim()) { 
            Alert.alert('Erreur', 'Veuillez entrer un nom pour le profil'); 
            return; 
        }

        const success = await createProfile({ 
            name: newProfileName.trim(), 
            relationship: newProfileRelationship, 
        }); 

        if (success) { 
            setShowCreateModal(false); 
            setNewProfileName(''); 
            setNewProfileRelationship('other'); 
            Alert.alert('Succès', 'Profil créé avec succès');
        } else { 
            Alert.alert('Erreur', 'Impossible de créer le profil'); 
        }
    }; 

    const getRelatiionshipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Moi';
            case 'child': return 'Enfant';
            case 'parent': return 'Parent';
            case 'spouse': return 'Conjoint(e)';
            case 'other': return 'Autre';
            default: return 'Non défini';
        }
    };

    const getRelationshipIcon = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'person';
            case 'child': return 'happy';
            case 'parent': return 'people';
            case 'spouse': return 'heart';
            case 'other': return 'person-add';
            default: return 'person';
        }
    };

    const getAvatarUrl = (profile: Profile) => {
        return profile.avatar || 'https://www.w3schools.com/w3images/avatar2.png';
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Choisir un profil',
            headerRight: () => (
                <TouchableOpacity 
                    onPress={() => navigation.navigate('ProfileManagement')} 
                    style={[cardStyles.headerButton, { marginRight: 10 }]}
                >
                    <Ionicons name="settings-outline" size={24} color={colors.profileText} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return ( 
        <View style={[cardStyles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[cardStyles.profileName, { textAlign: 'center', marginBottom: 20 }]}>
                    Sélectionnez un profil
                </Text>

                {profiles.map((profile) => (
                    <TouchableOpacity 
                        key={profile.id} 
                        style={[cardStyles.card, currentProfile?.id === profile.id && { borderWidth: 3, borderColor: colors.primary }]} 
                        onPress={() => handleProfileSwitch(profile.id)}
                    >
                        <LinearGradient 
                            colors={currentProfile?.id === profile.id ? [colors.primary, colors.secondary] : [colors.background, colors.background]} 
                            style={[cardStyles.cardGradient, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Image 
                                    source={{ uri: getAvatarUrl(profile) }} 
                                    style={[cardStyles.profileImage, { width: 50, height: 50, marginLeft: 15 }]} 
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={[cardStyles.cardText, { fontSize: 18, fontWeight: 'bold' }, currentProfile?.id === profile.id && { color: colors.iconPrimary }]}>
                                        {profile.name}
                                        {profile.isMain && ' (Principal)'}
                                    </Text>
                                    <Text style={[cardStyles.cardText, { fontSize: 14, opacity: 0.8 }, currentProfile?.id === profile.id && { color: colors.iconPrimary }]}>
                                        {getRelatiionshipText(profile.relationship)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons 
                                    name={getRelationshipIcon(profile.relationship) as any} 
                                    size={24} 
                                    color={currentProfile?.id === profile.id ? colors.iconPrimary : colors.profileText} 
                                    style={{ marginRight: 10 }} 
                                />
                                {currentProfile?.id === profile.id && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.iconPrimary} style={{ marginRight: 10 }} />
                                )}
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}

                {/* Button to create a new profile - only shown when currentProfile is the main profile */}
                {currentProfile?.isMain && (
                    <TouchableOpacity 
                        style={[styles.card, { marginTop: 20 }]} 
                        onPress={() => setShowCreateModal(true)}
                    >
                        <LinearGradient 
                            colors={[colors.secondary, colors.primary]} 
                            style={[styles.cardGradient, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={colors.iconPrimary} style={{ marginRight: 10 }} />
                            <Text style={[styles.cardText, { color: colors.iconPrimary, fontWeight: 'bold' }]}>
                                Créer un nouveau profil
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* Modal for creating a new profile */}
            <Modal 
                visible={showCreateModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            Nouveau profil
                        </Text>

                        <Text style={styles.inputLabel}>Nom du profil</Text>
                        <TextInput
                            style={styles.input}
                            value={newProfileName}
                            onChangeText={setNewProfileName}
                            placeholder="Entrez le nom du profil"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <Text style={styles.inputLabel}>Relation</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={newProfileRelationship}
                                onValueChange={(itemValue) => setNewProfileRelationship(itemValue as 'child' | 'parent' | 'spouse' | 'other')}
                                style={styles.picker}
                            >
                                <Picker.Item label="Enfant" value="child" />
                                <Picker.Item label="Parent" value="parent" />
                                <Picker.Item label="Conjoint(e)" value="spouse" />
                                <Picker.Item label="Autre" value="other" />
                            </Picker>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: 'transparent', overflow: 'hidden' }]}
                                onPress={() => setShowCreateModal(false)}
                            >
                                <LinearGradient 
                                    colors={[colors.textSecondary, colors.infoTextSecondary]} 
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.iconPrimary }]}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.createButton, { backgroundColor: 'transparent', overflow: 'hidden' }]}
                                onPress={handleCreateProfile}
                            >
                                <LinearGradient 
                                    colors={[colors.primary, colors.secondary]} 
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
                                >
                                    <Text style={[styles.createButtonText, { color: colors.iconPrimary }]}>Créer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    ); 
} 
