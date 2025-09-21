import { Profile } from '../context/ProfileContext'; 
import profile from '../locales/en/profile';

export interface ValidationError { 
    field: string; 
    message: string; 
}

export const validateProfileCreation = (profile: Partial<Profile>): ValidationError[] => { 
    const errors: ValidationError[] = [];

    // Validate name 
    if (!profile.name?.trim()) { 
        errors.push({ field: 'name', message: 'Le nom est obligatoire' }); 
    } else if (profile.name.trim().length < 2) { 
        errors.push({ field: 'name', message: 'Le nom doit contenir au moins 2 caractères' });
    } else if (profile.name.trim().length > 50) { 
        errors.push({ field: 'name', message: 'Le nom ne peut pas dépasser 50 caractères' }); 
    }

    // Validate age if provided 
    if (profile.relationship && !['self', 'child', 'parent', 'spouse', 'other'].includes(profile.relationship)) { 
        errors.push({ field: 'relationship', message: 'Le type de relation n\'est pas valide' });
    }

    return errors;
}; 

export const getDefaultPermissions = (relationship?: string, age?: number): Profile['permissions'] => { 
    const isChild = age !== undefined && age < 16; 
    const isMinor = age !== undefined && age < 18; 

    return { 
        canOrderMedication: !isChild, 
        canViewPrescriptions: true, 
        canManageProfiles: relationship === 'self' && !isMinor, 
        canAccessChat: !isChild, 
        canViewFullMedicalHistory: !isChild
    }; 
}; 

export const canUserPerformAction = (profile: Profile, action: string): boolean => { 
    // If permissions are not defined, use default permissions 
    if (!profile.permissions) { 
        const defaultPermissions = getDefaultPermissions(profile.relationship, profile.age); 
        profile.permissions = defaultPermissions; 
    }

    switch (action) { 
        case 'delete_profile': 
            return profile.isMain === true; 
        case 'manage_profiles':
            return profile.permissions?.canManageProfiles ?? false;
        case 'order_medication': 
            return profile.permissions?.canOrderMedication ?? false; 
        case 'view_prescriptions': 
            return profile.permissions?.canViewPrescriptions ?? true;
        case 'access_chat': 
            return profile.permissions?.canAccessChat ?? false; 
        case 'view_medical_history': 
            return profile.permissions?.canViewFullMedicalHistory ?? false; 
        default: 
            return true; 
    }
}; 

export const generateProfileId = (): string => { 
    return Date.now().toString() + Math.random().toString(36).substr(2, 9); 
};