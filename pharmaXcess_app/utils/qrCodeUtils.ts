import { Profile } from '../context/ProfileContext';

export interface QRProfileData {
  type: 'pharmaXcess_profile';
  version: string;
  timestamp: string;
  qrId: string; // Unique ID for this QR code 
  profile: {
    id: string;
    name: string;
    dateOfBirth?: string;
    age?: number;
    relationship?: string;
    diseases?: string[];
    treatments?: string[];
    allergies?: string[];
    familyHistory?: string[];
    doctors?: string[];
    hospitalizations?: string[];
    avatar?: string;
    // Metadata for verification 
    createdAt: string;
    updatedAt: string;
  };
  security: {
    checksum: string; // To verify data integrity 
    expiryDate?: string; // Optional expiration date 
  };
}

/**
 * Generates a unique identifier for the QR code
 */
const generateUniqueId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

/**
 * Generate a simple checksum for data integrity verification
 */
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Generates the QR code data string from the profile information
 */
export const generateQRData = (profile: Profile, expiryDays?: number): string => {
  if (!profile) {
    throw new Error('Profile is required to generate QR data');
  }

  const timestamp = new Date().toISOString();
  const qrId = generateUniqueId(); // Unique ID for this QR code 

  // Calculate expiry date if expiryDays is provided
  let expiryDate: string | undefined;
  if (expiryDays && expiryDays > 0) {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);
    expiryDate = expiry.toISOString();
  }

  const profileData = {
    id: profile.id,
    name: profile.name,
    dateOfBirth: profile.dateOfBirth,
    age: profile.age,
    relationship: profile.relationship,
    diseases: profile.diseases || [],
    treatments: profile.treatments || [],
    allergies: profile.allergies || [],
    familyHistory: profile.familyHistory || [],
    doctors: profile.doctors || [],
    hospitalizations: profile.hospitalizations || [],
    avatar: profile.avatar,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };

  // Generate checksum 
  const dataForChecksum = JSON.stringify(profileData) + timestamp + qrId;
  const checksum = generateChecksum(dataForChecksum);

  const qrData: QRProfileData = {
    type: 'pharmaXcess_profile',
    version: '1.0',
    timestamp,
    qrId,
    profile: profileData,
    security: {
      checksum,
      expiryDate,
    },
  };

  return JSON.stringify(qrData);
};

/**
 * Validates the QR code data string and returns the parsed data if valid
 */
export const validateQRData = (qrString: string): { isValid: boolean; data?: QRProfileData; error?: string } => {
  try {
    const qrData: QRProfileData = JSON.parse(qrString);

    // Type verification 
    if (qrData.type !== 'pharmaXcess_profile') {
      return { isValid: false, error: 'Type de QR code non reconnu' };
    }

    // Version verification 
    if (!qrData.version || qrData.version !== '1.0') {
      return { isValid: false, error: 'Version du QR code non supportée' };
    }

    // Expiry verification if applicable 
    if (qrData.security.expiryDate) {
      const expiryDate = new Date(qrData.security.expiryDate);
      if (expiryDate < new Date()) {
        return { isValid: false, error: 'QR code expiré' };
      }
    }

    // Checksum verification 
    const dataForChecksum = JSON.stringify(qrData.profile) + qrData.timestamp + qrData.qrId;
    const expectedChecksum = generateChecksum(dataForChecksum);
    
    if (qrData.security.checksum !== expectedChecksum) {
      return { isValid: false, error: 'Données du QR code corrompues' };
    }

    // Mandatory fields verification 
    if (!qrData.profile.id || !qrData.profile.name) {
      return { isValid: false, error: 'Données du profil incomplètes' };
    }

    return { isValid: true, data: qrData };
  } catch (error) {
    return { isValid: false, error: 'Format de QR code invalide' };
  }
};

/**
 * Extracts only the health-related data from the QRProfileData 
 */
export const extractHealthData = (qrData: QRProfileData) => {
  return {
    personalInfo: {
      name: qrData.profile.name,
      age: qrData.profile.age,
      dateOfBirth: qrData.profile.dateOfBirth,
    },
    medicalInfo: {
      diseases: qrData.profile.diseases || [],
      treatments: qrData.profile.treatments || [],
      allergies: qrData.profile.allergies || [],
      familyHistory: qrData.profile.familyHistory || [],
      hospitalizations: qrData.profile.hospitalizations || [],
    },
    doctors: qrData.profile.doctors || [],
    lastUpdated: qrData.profile.updatedAt,
    qrGeneratedAt: qrData.timestamp,
  };
};