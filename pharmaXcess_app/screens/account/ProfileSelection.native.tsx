import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Modal, TextInput } from 'react-native'; 
import { Picker } from '@react-native-picker/picker'; 
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
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
                    style={[styles.headerButton, { marginRight: 10 }]}
                >
                    <Ionicons name="settings-outline" size={24} color={colors.profileText} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return ( 
        <View style={[styles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.profileName, { textAlign: 'center', marginBottom: 20 }]}>
                    Sélectionnez un profil
                </Text>

                {profiles.map((profile) => (
                    <TouchableOpacity 
                        key={profile.id} 
                        style={[styles.card, currentProfile?.id === profile.id && { borderWidth: 3, borderColor: colors.primary }]} 
                        onPress={() => handleProfileSwitch(profile.id)}
                    >
                        <LinearGradient 
                            colors={currentProfile?.id === profile.id ? [colors.primary, colors.secondary] : [colors.background, colors.background]} 
                            style={[styles.cardGradient, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Image 
                                    source={{ uri: getAvatarUrl(profile) }} 
                                    style={[styles.profileImage, { width: 50, height: 50, marginRight: 15 }]} 
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.cardText, { fontSize: 18, fontWeight: 'bold' }, currentProfile?.id === profile.id && { color: '#fff' }]}>
                                        {profile.name}
                                        {profile.isMain && ' (Principal)'}
                                    </Text>
                                    <Text style={[styles.cardText, { fontSize: 14, opacity: 0.8 }, currentProfile?.id === profile.id && { color: '#fff' }]}>
                                        {getRelatiionshipText(profile.relationship)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons 
                                    name={getRelationshipIcon(profile.relationship) as any} 
                                    size={24} 
                                    color={currentProfile?.id === profile.id ? '#fff' : colors.iconPrimary} 
                                    style={{ marginRight: 10 }} 
                                />
                                {currentProfile?.id === profile.id && (
                                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
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
                            <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                            <Text style={[styles.cardText, { color: '#fff', fontWeight: 'bold' }]}>
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
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <View style={{
                        backgroundColor: colors.background,
                        borderRadius: 15,
                        padding: 20,
                        width: '100%',
                        maxWidth: 400
                    }}>
                        <Text style={[styles.profileName, { textAlign: 'center', marginBottom: 20 }]}>
                            Nouveau profil
                        </Text>

                        <Text style={[styles.cardText, { marginBottom: 10 }]}>Nom du profil</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 20,
                                fontSize: 16,
                                color: colors.text
                            }}
                            value={newProfileName}
                            onChangeText={setNewProfileName}
                            placeholder="Entrez le nom du profil"
                            placeholderTextColor={colors.text + '80'}
                        />

                        <Text style={[styles.cardText, { marginBottom: 10 }]}>Relation</Text>
                        <View style={{
                            borderWidth: 1,
                            borderColor: colors.primary,
                            borderRadius: 10,
                            marginBottom: 20
                        }}>
                            <Picker
                                selectedValue={newProfileRelationship}
                                onValueChange={(itemValue) => setNewProfileRelationship(itemValue as 'child' | 'parent' | 'spouse' | 'other')}
                                style={{ color: colors.text }}
                            >
                                <Picker.Item label="Enfant" value="child" />
                                <Picker.Item label="Parent" value="parent" />
                                <Picker.Item label="Conjoint(e)" value="spouse" />
                                <Picker.Item label="Autre" value="other" />
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 10,
                                    backgroundColor: colors.secondary + '30',
                                    marginRight: 10,
                                    alignItems: 'center'
                                }}
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={{ 
                                    flex: 1, 
                                    padding: 15, 
                                    borderRadius: 10, 
                                    backgroundColor: colors.primary,
                                    marginLeft: 10,
                                    alignItems: 'center'
                                }}
                                onPress={handleCreateProfile}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Créer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    ); 
} 
