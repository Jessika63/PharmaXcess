import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { getDefaultPermissions, generateProfileId, validateProfileCreation } from '../utils/profileValidation';
import profileApi from '../utils/api/profile';

export interface Profile {
    id: string; 
    name: string; 
    avatar?: string; 
    email?: string;
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

    // Medical data specific to the profile (backend returns objects)
    diseases?: any[];
    treatments?: any[];
    allergies?: any[];
    familyHistory?: any[];
    doctors?: any[];
    hospitalizations?: any[];
    // Metadata
    createdAt: string;
    updatedAt: string;
    // raw backend information
    metadata?: any;
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
                            // backend stores full name in 'nom' now
                            name: `${p.nom || ''}`.trim(),
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
                    // If we fail to load server profiles for an authenticated user, do NOT create a local fake profile.
                    // Instead keep profiles empty and let UI show an empty/no-profile state so user knows they must use a real account.
                    console.warn('Failed to load server profiles for authenticated user; not creating a local fake profile', e);
                    setProfiles([]);
                    setCurrentProfile(null);
                    await saveProfiles([], null);
                    return;
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
                // No existing profiles in local storage.
                // Only create a local main profile when the app is NOT authenticated.
                if (!isAuthenticated || !user) {
                    await createMainProfile();
                } else {
                    // Authenticated but no local profiles and server fetch didn't return any: keep empty state
                    setProfiles([]);
                    setCurrentProfile(null);
                }
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
                    const profile_type = mapRelationship(profileData.relationship);

                    console.log('Calling registerSubprofile ->', { name, profile_type, main_profile_id: user.id });
                    const res = await profileApi.registerSubprofile(name, profile_type, user.id);
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
            // If authenticated and profileId looks numeric (server-side), try to persist to backend
            if (isAuthenticated && user) {
                try {
                    const numericCandidate = Number(profileId);
                    const targetId = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(profileId)
                        ? numericCandidate
                        : profileId;

                    // Map frontend profileData to backend fields where relevant
                    const body: any = {};

                    // Normalize/validate date to YYYY-MM-DD (backend expects SQL date)
                    const normalizeDateToISO = (s?: string) => {
                        if (!s) return undefined;
                        const str = String(s).trim();
                        // already ISO
                        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
                        // DD/MM/YYYY
                        const m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                        if (m) {
                            const day = Number(m[1]);
                            const month = Number(m[2]);
                            const year = Number(m[3]);
                            if (month < 1 || month > 12) return undefined;
                            const maxDay = new Date(year, month, 0).getDate();
                            if (day < 1 || day > maxDay) return undefined;
                            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        }
                        // Try generic Date parse as last resort
                        const parsed = new Date(str);
                        if (!Number.isNaN(parsed.getTime())) {
                            const y = parsed.getFullYear();
                            const mo = String(parsed.getMonth() + 1).padStart(2, '0');
                            const d = String(parsed.getDate()).padStart(2, '0');
                            return `${y}-${mo}-${d}`;
                        }
                        return undefined;
                    };

                    if (profileData.dateOfBirth) {
                        const normalized = normalizeDateToISO(profileData.dateOfBirth);
                        if (normalized) {
                            body.date_naissance = normalized;
                        } else {
                            console.warn('Skipping date_naissance: invalid date format', profileData.dateOfBirth);
                        }
                    }
                    // if front stores other metadata fields use these keys
                    if ((profileData as any).weight) body.poids = (profileData as any).weight;
                    if ((profileData as any).height) body.taille = (profileData as any).height;
                    if ((profileData as any).bloodGroup) body.groupe_sanguin = (profileData as any).bloodGroup;
                    if ((profileData as any).telephone) body.telephone = (profileData as any).telephone;
                    if ((profileData as any).socialNumber) body.numero_securite_sociale = (profileData as any).socialNumber;
                    if ((profileData as any).adresse) body.adresse = (profileData as any).adresse;
                    // Support updating full name from frontend; backend will store in 'nom' (and optionally 'prenom')
                    if ((profileData as any).name) {
                        body.nom = (profileData as any).name;
                        // also set prenom to the same value to avoid NOT NULL constraints and keep display consistent
                        body.prenom = (profileData as any).name;
                    }
                    if ((profileData as any).contact_urgence_nom) body.contact_urgence_nom = (profileData as any).contact_urgence_nom;
                    if ((profileData as any).contact_urgence_tel) body.contact_urgence_tel = (profileData as any).contact_urgence_tel;

                    // Only call backend if we have at least one field to update
                    if (Object.keys(body).length > 0) {
                        console.log('Calling backend updateInfos ->', { userId: targetId, body });
                        const res = await profileApi.updateInfos(targetId, body);
                        console.log('updateInfos response', res);
                        if (!res.ok) {
                            console.warn('Backend updateInfos failed', res.error);
                            // continue to update locally for offline UX
                        }
                        // If successful, the backend stores the data. We'll still update local cache below.
                    }
                } catch (e) {
                    console.warn('Error calling backend updateInfos', e);
                }
            }

            // Update local cache/state
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

            // Fetch and attach detailed info from backend for the newly active profile
            try {
                // If switch was done server-side, subsequent calls that depend on session will use the new session
                console.log('Fetching profile details for', profileId);
                // Try to fetch detailed infos for this profile
                const infosRes = await profileApi.getInfos(profileId);
                if (infosRes.ok && infosRes.data) {
                    const infos = infosRes.data as any;
                    // Map backend fields (French) to frontend profile fields
                    setCurrentProfile(prev => prev ? ({
                        ...prev,
                        dateOfBirth: infos.date_naissance || prev.dateOfBirth,
                        // keep email on the top-level for easier access in other places
                        email: infos.email || prev.email,
                        // store raw backend infos under `metadata` for other UI usage
                        // (contains poids, taille, groupe_sanguin, telephone, etc.)
                        metadata: infos,
                    }) : prev);
                }

                // Fetch diseases and allergies accessible to the current session/profile
                const diseasesRes = await profileApi.getDiseases();
                if (diseasesRes.ok && Array.isArray(diseasesRes.data)) {
                    // attach to current profile
                    setCurrentProfile(prev => prev ? ({ ...prev, diseases: diseasesRes.data }) : prev);
                }

                const allergiesRes = await profileApi.getAllergies();
                if (allergiesRes.ok && Array.isArray(allergiesRes.data)) {
                    setCurrentProfile(prev => prev ? ({ ...prev, allergies: allergiesRes.data }) : prev);
                }
            } catch (e) {
                console.warn('Failed to fetch profile details after switch', e);
            }

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