import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getDefaultPermissions, generateProfileId, validateProfileCreation } from '../utils/profileValidation';
import profileApi from '../utils/api/profile';

export interface Profile {
    id: string; 
    name: string; 
    avatar?: string; 
    dateOfBirth?: string; 
    age?: number;
    relationship?: 'self' | 'child' | 'parent' | 'spouse' | 'other';
    isMain?: boolean;
    // Permissions for different actions 
    permissions: { 
        canOrderMedication: boolean; 
        canViewPrescriptions: boolean; 
        canManageProfiles: boolean; 
        canAccessChat: boolean; 
        canViewFullMedicalHistory: boolean; 
    }; 

    // Medical data specific to the profile
    diseases?: string[];
    treatments?: string[];
    allergies?: string[];
    familyHistory?: string[];
    doctors?: string[];
    hospitalizations?: string[];
    // Metadata
    createdAt: string;
    updatedAt: string;
}

interface ProfileContextType { 
    profiles: Profile[]; 
    currentProfile: Profile | null;
    isLoading: boolean;
    // Profile actions
    createProfile: (profileData: Partial<Profile>) => Promise<boolean>;
    updateProfile: (profileId: string, profileData: Partial<Profile>) => Promise<boolean>;
    deleteProfile: (profileId: string) => Promise<boolean>;
    switchProfile: (profileId: string) => Promise<boolean>;
    // Utilities
    getProfileById: (profileId: string) => Profile | null;
    getMainProfile: () => Profile | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined); 

interface ProfileProviderProps { 
    children: ReactNode; 
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => { 
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user, isAuthenticated } = useAuth();

    // Load profiles on startup
    useEffect(() => {
        if (isAuthenticated && user) {
            loadProfiles();
        } else {
            // Clear profiles if user logs out
            setProfiles([]);
            setCurrentProfile(null);
            setIsLoading(false);
        }
    }, [isAuthenticated, user]);

    const getStorageKey = (key: string) => `profiles_${user?.id}_${key}`;

    const loadProfiles = async () => {
        try {
            setIsLoading(true);
            // If authenticated, try to fetch accessible profiles from backend and use them.
            if (isAuthenticated && user) {
                try {
                    const res = await profileApi.getAccessibleProfiles();
                    if (res.ok && res.data && Array.isArray(res.data.accessible_profiles)) {
                        const serverProfilesRaw = res.data.accessible_profiles;
                        const profilesList: Profile[] = serverProfilesRaw.map((p: any) => ({
                            id: String(p.id),
                            name: `${p.nom || ''}`.trim() + (p.prenom ? ` ${p.prenom}` : ''),
                            relationship: (p.profile_type === 'enfant' ? 'child' : p.profile_type === 'parent' ? 'parent' : p.profile_type === 'epoux' ? 'spouse' : p.profile_type === 'autre' ? 'other' : p.profile_type === 'parent' ? 'parent' : 'self') as any,
                            isMain: String(p.id) === String(user.id),
                            permissions: getDefaultPermissions(undefined),
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        }));

                        const profilesWithPermissions = profilesList.map(profile => ({
                            ...profile,
                            permissions: profile.permissions || getDefaultPermissions(profile.relationship, profile.age),
                        }));

                        setProfiles(profilesWithPermissions);

                        // choose current profile: prefer stored current if present, otherwise main or first
                        const storedCurrentProfileId = await AsyncStorage.getItem(getStorageKey('current'));
                        if (storedCurrentProfileId) {
                            const currentProf = profilesWithPermissions.find(p => p.id === storedCurrentProfileId);
                            setCurrentProfile(currentProf || profilesWithPermissions.find(p => p.isMain) || profilesWithPermissions[0] || null);
                        } else {
                            setCurrentProfile(profilesWithPermissions.find(p => p.isMain) || profilesWithPermissions[0] || null);
                        }

                        // persist server profiles locally so UI works offline
                        await saveProfiles(profilesWithPermissions, currentProfile || null);
                        return;
                    }
                } catch (e) {
                    console.warn('Failed to load server profiles, falling back to local storage', e);
                    // continue to load local profiles below
                }
            }

            const storedProfiles = await AsyncStorage.getItem(getStorageKey('list'));
            const storedCurrentProfileId = await AsyncStorage.getItem(getStorageKey('current'));

            if (storedProfiles) {
                const profilesList: Profile[] = JSON.parse(storedProfiles);

                // Ensure all profiles have permissions
                const profilesWithPermissions = profilesList.map(profile => {
                    if (!profile.permissions) {
                        return {
                            ...profile,
                            permissions: getDefaultPermissions(profile.relationship, profile.age)
                        };
                    }
                    return profile;
                });

                setProfiles(profilesWithPermissions);

                // Set current profile
                if (storedCurrentProfileId) {
                    const currentProf = profilesWithPermissions.find(p => p.id === storedCurrentProfileId);
                    if (currentProf) {
                        setCurrentProfile(currentProf);
                    } else {
                        // If stored profile doesn't exist anymore, take the main profile
                        const mainProfile = profilesWithPermissions.find(p => p.isMain);
                        setCurrentProfile(mainProfile || profilesWithPermissions[0] || null);
                    }
                } else {
                    // No stored current profile, take the main profile
                    const mainProfile = profilesWithPermissions.find(p => p.isMain);
                    setCurrentProfile(mainProfile || profilesWithPermissions[0] || null);
                }

                // Save the updated profiles with permissions
                await saveProfiles(profilesWithPermissions);
            } else {
                // No existing profiles, create the user's main profile
                await createMainProfile();
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createMainProfile = async () => {
        if (!user) return;

        const mainProfile: Profile = {
            id: generateProfileId(),
            name: user.name || 'Mon profil',
            relationship: 'self',
            isMain: true,
            permissions: getDefaultPermissions('self'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(), 
        }; 

        const newProfiles = [mainProfile];
        setProfiles(newProfiles);
        setCurrentProfile(mainProfile);

        await saveProfiles(newProfiles, mainProfile); 
    }; 

    const saveProfiles = async (newProfiles: Profile[], newCurrentProfile?: Profile | null) => {
        await AsyncStorage.setItem(getStorageKey('list'), JSON.stringify(newProfiles));
        if (newCurrentProfile) {
            await AsyncStorage.setItem(getStorageKey('current'), newCurrentProfile.id);
        }
    };

    const createProfile = async (profileData: Partial<Profile>): Promise<boolean> => { 
        try { 
            if (!user) return false;
            // Validate profile data 
            const validationErrors = validateProfileCreation(profileData);
            if (validationErrors.length > 0) {
                console.error('Profile validation errors:', validationErrors);
                return false;
            }

            // Calculate age from dateOfBirth if provided
            let age = profileData.age;
            if (profileData.dateOfBirth && !age) {
                const birthDate = new Date(profileData.dateOfBirth);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // If user is authenticated, try to create subprofile on backend
            if (isAuthenticated && user) {
                try {
                    // Map frontend relationship to backend profile_type
                    const mapRelationship = (rel?: string) => {
                        switch (rel) {
                            case 'child': return 'enfant';
                            case 'parent': return 'parent';
                            case 'spouse': return 'epoux';
                            case 'other': return 'autre';
                            case 'self': return 'parent';
                            default: return 'autre';
                        }
                    };

                    const name = (profileData.name || 'Nouveau profil').trim();
                    // Split name heuristically into prenom (first) and nom (rest)
                    const parts = name.split(' ').filter(Boolean);
                    const prenom = parts.length > 0 ? parts[0] : '';
                    const nom = parts.length > 1 ? parts.slice(1).join(' ') : (parts[0] || '');
                    const profile_type = mapRelationship(profileData.relationship);

                    console.log('Calling registerSubprofile ->', { nom, prenom, profile_type, main_profile_id: user.id });
                    const res = await profileApi.registerSubprofile(nom, prenom, profile_type, user.id);
                    console.log('registerSubprofile response', res);

                    if (res.ok && res.data && (res.status === 201 || res.data.sub_profile_id)) {
                        const createdId = String(res.data.sub_profile_id || res.data.sub_profile_id || res.data.sub_profile_id);
                        const newProfile: Profile = {
                            id: createdId,
                            name,
                            avatar: profileData.avatar,
                            dateOfBirth: profileData.dateOfBirth,
                            age: age,
                            relationship: profileData.relationship || 'other',
                            isMain: false,
                            permissions: getDefaultPermissions(profileData.relationship, age),
                            diseases: profileData.diseases || [],
                            treatments: profileData.treatments || [],
                            allergies: profileData.allergies || [],
                            familyHistory: profileData.familyHistory || [],
                            doctors: profileData.doctors || [],
                            hospitalizations: profileData.hospitalizations || [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };

                        const newProfiles = [...profiles, newProfile];
                        setProfiles(newProfiles);
                        await saveProfiles(newProfiles);
                        return true;
                    }

                    // If backend creation failed, fall back to local creation
                    console.warn('Backend registerSubprofile failed, falling back to local profile creation', res.error);
                } catch (e) {
                    console.warn('Error calling backend registerSubprofile, falling back to local creation', e);
                }
            }

            // Local-only creation (used when not authenticated or when backend call fails)
            const newProfile: Profile = {
                id: generateProfileId(),
                name: profileData.name || 'Nouveau profil',
                avatar: profileData.avatar,
                dateOfBirth: profileData.dateOfBirth,
                age: age,
                relationship: profileData.relationship || 'other',
                isMain: false,
                permissions: getDefaultPermissions(profileData.relationship, age),
                diseases: profileData.diseases || [],
                treatments: profileData.treatments || [],
                allergies: profileData.allergies || [],
                familyHistory: profileData.familyHistory || [],
                doctors: profileData.doctors || [],
                hospitalizations: profileData.hospitalizations || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const newProfiles = [...profiles, newProfile];
            setProfiles(newProfiles);
            await saveProfiles(newProfiles);

            return true;
        } catch (error) { 
            console.error('Error creating profile:', error);
            return false; 
        }
    }; 

    const updateProfile = async (profileId: string, profileData: Partial<Profile>): Promise<boolean> => { 
        try { 
            const updatedProfiles = profiles.map(profile => 
                profile.id === profileId 
                    ? { ...profile, ...profileData, updatedAt: new Date().toISOString() }
                    : profile
            );

            setProfiles(updatedProfiles);

            // Update current profile if it's the one being modified
            if (currentProfile?.id === profileId) {
                const updatedCurrentProfile = updatedProfiles.find(p => p.id === profileId);
                if (updatedCurrentProfile) {
                    setCurrentProfile(updatedCurrentProfile);
                }
            }

            await saveProfiles(updatedProfiles);
            return true;
        } catch (error) { 
            console.error('Error updating profile:', error);
            return false; 
        }
    };

    const deleteProfile = async (profileId: string): Promise<boolean> => { 
        try { 
            // Don't allow deletion of the main profile
            const profileToDelete = profiles.find(p => p.id === profileId);
            if (!profileToDelete) {
                console.error('Profile not found');
                return false;
            }
            
            if (profileToDelete.isMain) {
                console.error('Cannot delete main profile');
                return false;
            }

            // Only allow deletion if current user has permission
            if (currentProfile && !currentProfile.permissions.canManageProfiles) {
                console.error('Current profile does not have permission to delete profiles');
                return false;
            }

            // Don't allow deleting the last profile
            if (profiles.length <= 1) {
                console.error('Cannot delete the last profile');
                return false;
            }

            const updatedProfiles = profiles.filter(profile => profile.id !== profileId);
            setProfiles(updatedProfiles);

            // If the deleted profile was the current profile, switch to the main profile
            if (currentProfile?.id === profileId) {
                const mainProfile = updatedProfiles.find(p => p.isMain);
                const newCurrentProfile = mainProfile || updatedProfiles[0] || null;
                setCurrentProfile(newCurrentProfile);
                await saveProfiles(updatedProfiles, newCurrentProfile);
            } else {
                await saveProfiles(updatedProfiles);
            }

            return true;
        } catch (error) { 
            console.error('Error deleting profile:', error);
            return false; 
        }
    };

    const switchProfile = async (profileId: string): Promise<boolean> => {
        try {
            const profile = profiles.find(p => p.id === profileId);
            if (!profile) return false;

            // If the user is authenticated, try to switch server-side so session user_id matches
            if (isAuthenticated && user) {
                try {
                    // Prefer sending a numeric id to backend when possible
                    const numericCandidate = Number(profileId);
                    const sendId = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(profileId)
                        ? numericCandidate
                        : profileId;
                    console.log('Calling backend switch_profile ->', { new_profile_id: sendId });
                    const res = await profileApi.switchProfile(sendId);
                    if (!res.ok) {
                        console.warn('Backend switch profile failed', res.error);
                        return false;
                    }
                    // backend switched session - reflect locally as well
                } catch (e) {
                    console.warn('Error calling backend switchProfile', e);
                    return false;
                }
            }

            setCurrentProfile(profile);
            await AsyncStorage.setItem(getStorageKey('current'), profileId);
            return true;
        } catch (error) {
            console.error('Error switching profile:', error);
            return false;
        }
    };

    const getProfileById = (profileId: string): Profile | null => { 
        return profiles.find(p => p.id === profileId) || null; 
    };

    const getMainProfile = (): Profile | null => { 
        return profiles.find(p => p.isMain) || null; 
    };

    const value: ProfileContextType = { 
        profiles, 
        currentProfile, 
        isLoading, 
        createProfile, 
        updateProfile, 
        deleteProfile, 
        switchProfile, 
        getProfileById, 
        getMainProfile, 
    }; 

    return ( 
        <ProfileContext.Provider value={value}> 
            {children} 
        </ProfileContext.Provider>
    ); 
}; 

export const useProfile = (): ProfileContextType => { 
    const context = useContext(ProfileContext); 
    if (!context) { 
        throw new Error('useProfile must be used within a ProfileProvider'); 
    } 
    return context; 
};