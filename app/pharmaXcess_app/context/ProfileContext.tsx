import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface Profile {
    id: string; 
    name: string; 
    avatar?: string; 
    dateOfBirth?: string; 
    relationship?: 'self' | 'child' | 'parent' | 'spouse' | 'other';
    isMain?: boolean;
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
            const storedProfiles = await AsyncStorage.getItem(getStorageKey('list'));
            const storedCurrentProfileId = await AsyncStorage.getItem(getStorageKey('current'));

            if (storedProfiles) {
                const profilesList: Profile[] = JSON.parse(storedProfiles);
                setProfiles(profilesList);

                // Set current profile
                if (storedCurrentProfileId) {
                    const currentProf = profilesList.find(p => p.id === storedCurrentProfileId);
                    if (currentProf) {
                        setCurrentProfile(currentProf);
                    } else {
                        // If stored profile doesn't exist anymore, take the main profile
                        const mainProfile = profilesList.find(p => p.isMain);
                        setCurrentProfile(mainProfile || profilesList[0] || null);
                    }
                } else {
                    // No stored current profile, take the main profile
                    const mainProfile = profilesList.find(p => p.isMain);
                    setCurrentProfile(mainProfile || profilesList[0] || null);
                }
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
            id: `main_${user.id}`,
            name: user.name || 'Mon profil',
            relationship: 'self',
            isMain: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(), 
        }; 

        const newProfiles = [mainProfile];
        setProfiles(newProfiles);
        setCurrentProfile(mainProfile);

        await AsyncStorage.setItem(getStorageKey('list'), JSON.stringify(newProfiles)); 
        await AsyncStorage.setItem(getStorageKey('current'), mainProfile.id); 
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

            const newProfile: Profile = {
                id: `profile_${Date.now()}`,
                name: profileData.name || 'Nouveau profil',
                avatar: profileData.avatar,
                dateOfBirth: profileData.dateOfBirth,
                relationship: profileData.relationship || 'other',
                isMain: false,
                diseases: [],
                treatments: [],
                allergies: [],
                familyHistory: [],
                doctors: [],
                hospitalizations: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...profileData,
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
            if (profileToDelete?.isMain) {
                throw new Error('Cannot delete main profile');
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