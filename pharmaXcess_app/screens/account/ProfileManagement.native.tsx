import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createCardStyles from '../../styles/CardGrid.style';
import createStyles from '../../styles/ProfileManagement.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile, Profile } from '../../context/ProfileContext';
import { Picker } from '@react-native-picker/picker';

type ProfileManagementProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

// The ProfileManagement component allows users to manage their profiles, including editing and deleting profiles.
export default function ProfileManagement({ navigation }: ProfileManagementProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { profiles, updateProfile, deleteProfile } = useProfile();
    const cardStyles = createCardStyles(colors, fontScale); 
    const styles = createStyles(colors, fontScale);

    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editRelationship, setEditRelationship] = useState<'self' | 'child' | 'parent' | 'spouse' | 'other'>('other');

    // Function to handle editing a profile
    const handleEditProfile = (profile: Profile) => {
        setSelectedProfile(profile);
        setEditName(profile.name);
        setEditRelationship(profile.relationship || 'other');
        setShowEditModal(true);
    };

    // Function to update the profile
    const handleUpdateProfile = async () => {
        if (!selectedProfile || !editName.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer un nom pour le profil');
            return;
        }

        const success = await updateProfile(selectedProfile.id, {
            name: editName.trim(),
            relationship: editRelationship,
        });

        if (success) {
            setShowEditModal(false);
            setSelectedProfile(null);
            Alert.alert('Succès', 'Profil mis à jour avec succès');
        } else {
            Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
        }
    };

    // Function to delete a profile
    const handleDeleteProfile = (profile: Profile) => {
        if (profile.isMain) {
            Alert.alert('Erreur', 'Impossible de supprimer le profil principal');
            return;
        }

        Alert.alert(
            'Supprimer le profil',
            `Êtes-vous sûr de vouloir supprimer le profil "${profile.name}" ? Cette action est irréversible et supprimera toutes les données associées.`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await deleteProfile(profile.id);
                        if (success) {
                            Alert.alert('Succès', 'Profil supprimé avec succès');
                        } else { 
                            Alert.alert('Erreur', 'Impossible de supprimer le profil');
                        }
                    }, 
                }, 
            ] 
        ); 
    }; 

    // Function to get the relationship text based on the relationship type
    const getRelationshipText = (relationship?: string) => {
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
            title: 'Gestion des profils', 
        });
    }, [navigation]); 

    return ( 
        <View style={[styles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                <Text style={[styles.profileName, { textAlign: 'center', marginBottom: 20 }]}>
                    Gérer vos profils
                </Text>

                {profiles.map((profile) => (
                    <View key={profile.id} style={[cardStyles.card, { marginBottom: 15 }]}>
                        <LinearGradient 
                            colors={[colors.background, colors.background]} 
                            style={[cardStyles.cardGradient, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Image 
                                    source={{ uri: getAvatarUrl(profile) }} 
                                    style={[styles.profileImage, { width: 50, height: 50, marginRight: 15 }]} 
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={[cardStyles.cardText, { fontSize: 18, fontWeight: 'bold' }]}>
                                        {profile.name}
                                        {profile.isMain && ' (Principal)'}
                                    </Text>
                                    <Text style={[cardStyles.cardText, { fontSize: 14, opacity: 0.8 }]}>
                                        {getRelationshipText(profile.relationship)}
                                    </Text>
                                    <Text style={[cardStyles.cardText, { fontSize: 12, opacity: 0.6 }]}>
                                        Créé le: {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons 
                                    name={getRelationshipIcon(profile.relationship) as any} 
                                    size={24} 
                                    color={colors.iconPrimary} 
                                    style={{ marginRight: 15 }} 
                                />
                                
                                <TouchableOpacity 
                                    onPress={() => handleEditProfile(profile)}
                                    style={{ marginRight: 10 }}
                                >
                                    <Ionicons name="pencil" size={22} color={colors.primary} />
                                </TouchableOpacity>
                                
                                {!profile.isMain && (
                                    <TouchableOpacity 
                                        onPress={() => handleDeleteProfile(profile)}
                                    >
                                        <Ionicons name="trash" size={22} color="#ff6b6b" />
                                    </TouchableOpacity> 
                                )} 
                            </View> 
                        </LinearGradient>
                    </View> 
                ))} 

                {profiles.length === 0 && ( 
                    <View style={[cardStyles.card, { alignItems: 'center', padding: 40 }]}>
                        <Ionicons name="people-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                        <Text style={[cardStyles.cardText, { textAlign: 'center', fontSize: 16 }]}>
                            Aucun profil trouvé
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal to edit a profile */}
            <Modal 
                visible={showEditModal}
                transparent={true} 
                animationType="slide"
                onRequestClose={() => setShowEditModal(false)} 
            > 
                <View style={styles.modalOverlay}> 
                    <View style={styles.modalContainer}> 
                        <Text style={styles.modalTitle}>
                            Modifier le profil
                        </Text>

                        <Text style={styles.inputLabel}>Nom du profil</Text>
                        <TextInput
                            style={styles.input}
                            value={editName}
                            onChangeText={setEditName}
                            placeholder="Entrez le nom du profil"
                            placeholderTextColor={colors.text + '80'}
                        />

                        {selectedProfile && !selectedProfile.isMain && (
                            <>
                                <Text style={styles.inputLabel}>Relation</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={editRelationship}
                                        onValueChange={(itemValue: string) => setEditRelationship(itemValue as 'self' | 'child' | 'parent' | 'spouse' | 'other')}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label="Enfant" value="child" />
                                        <Picker.Item label="Parent" value="parent" />
                                        <Picker.Item label="Conjoint(e)" value="spouse" />
                                        <Picker.Item label="Autre" value="other" />
                                    </Picker>
                                </View>
                            </>
                        )}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.cancelButton, { backgroundColor: 'transparent', overflow: 'hidden' }]}
                                onPress={() => setShowEditModal(false)}
                            >
                                <LinearGradient 
                                    colors={[colors.textSecondary, colors.infoTextSecondary]} 
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
                                >
                                    <Text style={[styles.cancelButtonText, { color: colors.iconPrimary }]}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.saveButton, { backgroundColor: 'transparent', overflow: 'hidden' }]}
                                onPress={handleUpdateProfile}
                            >
                                <LinearGradient 
                                    colors={[colors.primary, colors.secondary]} 
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}
                                >
                                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    ); 
} 
