
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Profile, useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { canUserPerformAction, validateProfileCreation } from '../utils/profileValidation';

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  onSelect: (profile: Profile) => void;
  onEdit?: (profile: Profile) => void;
  onDelete?: (profileId: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  isActive, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const { colors } = useTheme();
  const { currentProfile } = useProfile();

  const canEdit = currentProfile?.permissions.canManageProfiles || profile.id === currentProfile?.id;
  const canDelete = currentProfile?.permissions.canManageProfiles && !profile.isMain;

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le profil',
      `Êtes-vous sûr de vouloir supprimer le profil "${profile.name}" ? Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onDelete?.(profile.id)
        }
      ]
    );
  };

  const getAgeDisplay = () => {
    if (profile.age !== undefined) {
      return `${profile.age} ans`;
    }
    if (profile.dateOfBirth) {
      const birthDate = new Date(profile.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return `${age} ans`;
    }
    return '';
  };

  return (
    <TouchableOpacity 
      onPress={() => onSelect(profile)}
      style={{
        backgroundColor: isActive ? colors.accent : colors.card,
        borderRadius: 12,
        padding: 16,
        margin: 8,
        borderWidth: isActive ? 2 : 1,
        borderColor: isActive ? colors.primary : colors.border,
        elevation: isActive ? 4 : 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            {profile.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            ) : (
              <Ionicons name="person" size={24} color={colors.iconPrimary} />
            )}
          </View>
          
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text,
                marginRight: 8
              }}>
                {profile.name}
              </Text>
              {profile.isMain && (
                <View style={{
                  backgroundColor: colors.success,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 12
                }}>
                  <Text style={{ color: colors.iconPrimary, fontSize: 10, fontWeight: 'bold' }}>
                    PRINCIPAL
                  </Text>
                </View>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              {profile.relationship && (
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginRight: 8
                }}>
                  {profile.relationship === 'self' ? 'Moi' : 
                   profile.relationship === 'child' ? 'Enfant' :
                   profile.relationship === 'parent' ? 'Parent' :
                   profile.relationship === 'spouse' ? 'Conjoint' : 'Autre'}
                </Text>
              )}
              
              {getAgeDisplay() && (
                <Text style={{
                  fontSize: 12,
                  color: colors.textSecondary
                }}>
                  {getAgeDisplay()}
                </Text>
              )}
            </View>

            {/* Permissions Indicators */}
            <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' }}>
              {!profile.permissions.canOrderMedication && (
                <View style={{
                  backgroundColor: colors.warning,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginRight: 4,
                  marginBottom: 2
                }}>
                  <Text style={{ color: colors.iconPrimary, fontSize: 8 }}>COMMANDE RESTREINTE</Text>
                </View>
              )}
              
              {!profile.permissions.canAccessChat && (
                <View style={{
                  backgroundColor: colors.error,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginRight: 4,
                  marginBottom: 2
                }}>
                  <Text style={{ color: colors.iconPrimary, fontSize: 8 }}>CHAT BLOQUÉ</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{ flexDirection: 'row' }}>
          {canEdit && onEdit && (
            <TouchableOpacity 
              onPress={() => onEdit(profile)}
              style={{
                backgroundColor: colors.info,
                padding: 8,
                borderRadius: 20,
                marginLeft: 4
              }}
            >
              <Ionicons name="pencil" size={16} color={colors.iconPrimary} />
            </TouchableOpacity>
          )}
          
          {canDelete && onDelete && (
            <TouchableOpacity 
              onPress={handleDelete}
              style={{
                backgroundColor: colors.error,
                padding: 8,
                borderRadius: 20,
                marginLeft: 4
              }}
            >
              <Ionicons name="trash" size={16} color={colors.iconPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface ProfileManagerProps {
  visible: boolean;
  onClose: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const { profiles, currentProfile, createProfile, updateProfile, deleteProfile, switchProfile } = useProfile();
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'other' as Profile['relationship'],
    age: '',
    dateOfBirth: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: 'other',
      age: '',
      dateOfBirth: ''
    });
    setEditingProfile(null);
  };

  const handleCreateProfile = async () => {
    const errors = validateProfileCreation({
      name: formData.name,
      relationship: formData.relationship,
      age: formData.age ? parseInt(formData.age) : undefined
    });

    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors[0].message);
      return;
    }

    const success = await createProfile({
      name: formData.name,
      relationship: formData.relationship,
      age: formData.age ? parseInt(formData.age) : undefined,
      dateOfBirth: formData.dateOfBirth || undefined
    });

    if (success) {
      resetForm();
      Alert.alert('Succès', 'Profil créé avec succès');
    } else {
      Alert.alert('Erreur', 'Impossible de créer le profil');
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;

    const updateData: Partial<Profile> = {
      name: formData.name,
      relationship: formData.relationship,
    };

    if (formData.age) {
      updateData.age = parseInt(formData.age);
    }

    if (formData.dateOfBirth) {
      updateData.dateOfBirth = formData.dateOfBirth;
    }

    const success = await updateProfile(editingProfile.id, updateData);

    if (success) {
      resetForm();
      Alert.alert('Succès', 'Profil modifié avec succès');
    } else {
      Alert.alert('Erreur', 'Impossible de modifier le profil');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      relationship: profile.relationship || 'other',
      age: profile.age?.toString() || '',
      dateOfBirth: profile.dateOfBirth || ''
    });
  };

  const handleDeleteProfile = async (profileId: string) => {
    const success = await deleteProfile(profileId);
    if (success) {
      Alert.alert('Succès', 'Profil supprimé');
    } else {
      Alert.alert('Erreur', 'Impossible de supprimer le profil');
    }
  };

  const handleSelectProfile = async (profile: Profile) => {
    await switchProfile(profile.id);
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text
          }}>
            Gestion des profils
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile List */}
        <View style={{ flex: 1, padding: 16 }}>
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={currentProfile?.id === profile.id}
              onSelect={handleSelectProfile}
              onEdit={handleEditProfile}
              onDelete={handleDeleteProfile}
            />
          ))}
        </View>

        {/* Add/Edit Profile Form */}
        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 16
          }}>
            {editingProfile ? 'Modifier le profil' : 'Nouveau profil'}
          </Text>

          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              backgroundColor: colors.background,
              color: colors.text
            }}
            placeholder="Nom"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
                flex: 1,
                marginRight: 8
              }}
              onPress={editingProfile ? handleUpdateProfile : handleCreateProfile}
            >
              <Text style={{
                color: colors.iconPrimary,
                textAlign: 'center',
                fontWeight: 'bold'
              }}>
                {editingProfile ? 'Modifier' : 'Créer'}
              </Text>
            </TouchableOpacity>

            {editingProfile && (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.textSecondary,
                  padding: 12,
                  borderRadius: 8,
                  flex: 1,
                  marginLeft: 8
                }}
                onPress={resetForm}
              >
                <Text style={{
                  color: colors.iconPrimary,
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Annuler
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
