import React, { useState, useRef, useEffect } from 'react';
// Helpers pour date/âge (repris de PersonalInfo.native.tsx)
function formatBirthDate(raw: string | undefined | null): string {
  if (!raw) {
    return '';
  }
  try {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(raw))) {
      return String(raw);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) {
      const [y, m, d] = String(raw).split('-');
      const result = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      return result;
    }
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const dd = String(parsed.getDate()).padStart(2, '0');
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const yyyy = parsed.getFullYear();
      const result = `${dd}/${mm}/${yyyy}`;
      return result;
    }
    return '';
  } catch (e) {
    return '';
  }
}

function calculateAge(raw: string | undefined | null): number {
  if (!raw) {
    return 0;
  }
  try {
    let dateObj: Date | null = null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(raw))) {
      const m = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) dateObj = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) {
      dateObj = new Date(String(raw));
    } else {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) dateObj = parsed;
    }
    if (!dateObj) {
      return 0;
    }
    const today = new Date();
    let ageCalc = today.getFullYear() - dateObj.getFullYear();
    const mo = today.getMonth() - dateObj.getMonth();
    if (mo < 0 || (mo === 0 && today.getDate() < dateObj.getDate())) ageCalc--;
    return ageCalc;
  } catch (e) {
    return 0;
  }
}
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Camera, CameraView } from 'expo-camera';
import qrApi from '../../utils/api/qr';
// File handling and sharing
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import config from '../../config';
import logger from '../../utils/logger';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import createStyles from '../../styles/ProfilPatients.style';
import createProfileInfoStyles from '../../styles/ProfileInfos.style'; 
import createMyPrescriptionsStyles from '../../styles/MyPrescriptions.style'; 


type Hospitalization = { 
  id: string; 
  reason: string; 
  hospital: string; 
  service: string; 
  doctor: string; 
  date: string; 
  duration?: string; 
};

type Doctor = { 
  id: string; 
  name: string; 
  specialty: string; 
  phone: string; 
  email: string; 
  address: string; 
}; 

type Patient = { 
  id: string; 
  firstName: string; 
  lastName: string; 
  age: number; 
  dateOfBirth: string; 
  phone: string; 
  email: string; 
  address: string; 
  weight: string; 
  height: string; 
  bloodType: string; 
  socialSecurityNumber: string; 
  medicalHistory: string[]; 
  allergies: string[]; 
  currentMedications: string[];
  hospitalizations: Hospitalization[]; 
  doctors: Doctor[]; 
  emergencyContact: { 
    name: string; 
    phone: string; 
    relationship: string; 
  }; 
}; 

type ProfileItem = { 
  title: string;
  icon: "person-outline" | "medkit-outline" | "bandage-outline" | "bed-outline" | "alert-circle-outline" | "people-outline" | "person-add-outline" | "document-text-outline" | "clipboard-outline";
  data: string[]; 
}; 

type SectionType = 'info' | 'maladies' | 'traitements' | 'hospitalisations' | 'allergies' | 'antecedents' | 'medecins' | 'documents' | 'notes';

type DetailedItem = {
  id: string; 
  title: string;
  description: string;
  date?: string; 
  severity?: string; 
  notes?: string; 
}; 

type ProfessionalDocument = {
  id: string; 
  name: string; 
  type: string; 
  dateAdded: string;
  size: string; 
  uri: string;
  doctorId: string; // ID of the doctor who added the document
  patientId: string; 
}; 

type ConsultationNote = { 
  id: string; 
  patientId: string; 
  doctorId: string; 
  consultationDate: string;
  content: string;
  createdAt: string; 
};


export default function ProfilPatients(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);
  const profileInfoStyles = createProfileInfoStyles(colors, fontScale);
  const prescriptionStyles = createMyPrescriptionsStyles(colors, fontScale); 


  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false); 
  const [showNotesModal, setShowNotesModal] = useState(false); 
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false); 
  const [showAddNoteModal, setShowAddNoteModal] = useState(false); 
  const [previewDocument, setPreviewDocument] = useState<ProfessionalDocument | null>(null); 
  const [newNoteContent, setNewNoteContent] = useState(''); 
  const [newNoteDate, setNewNoteDate] = useState(''); 

  const cameraRef = useRef<CameraView | null>(null);

  // Mock currentDoctorId - in real app, this would come from auth context
  const currentDoctorId = 'DR001';
  // In production the documents list must come from backend; start empty and populate via API
  const [professionalDocuments, setProfessionalDocuments] = useState<ProfessionalDocument[]>([]);

  // Consultation notes should come from backend; start empty
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);

  // Patients list must come from backend for professionals; start empty
  const [patients, setPatients] = useState<Patient[]>([]);

  // Charger les patients suivis à la connexion (ou au montage)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${config.backendUrl.replace(/\/$/, '')}/followed_patients`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPatients(data.map((p) => {
              // Correction : inclure aussi 'date_naissance' (backend)
              const rawDob = p.date_naissance || p.date_de_naissance || p.dateOfBirth || p.date_of_birth || '';
              const age = calculateAge(rawDob);
              const dobFormatted = formatBirthDate(rawDob);
              return {
                id: String(p.id || p.user_id || p.utilisateur_id || p.telephone || 'unknown'),
                firstName: p.prenom || p.firstName || p.nom || '',
                lastName: p.nom || p.lastName || '',
                age,
                dateOfBirth: dobFormatted,
                phone: p.telephone || '',
                email: p.email || '',
                address: p.adresse || '',
                weight: (p.poids && String(p.poids)) || 'Non renseigné',
                height: (p.taille && String(p.taille)) || 'Non renseigné',
                bloodType: p.groupe_sanguin || 'Non renseigné',
                socialSecurityNumber: p.numero_securite_sociale || 'Non renseigné',
                // Utiliser les champs enrichis du backend si présents
                medicalHistory: p.maladies || p.medical_history || p.diseases || [],
                allergies: p.allergies || [],
                currentMedications: p.traitements || p.currentMedications || [],
                hospitalizations: p.hospitalisations || p.hospitalizations || [],
                doctors: p.medecins || p.doctors || [],
                emergencyContact: p.emergencyContact || {
                  name: p.contact_urgence_nom || '',
                  phone: p.contact_urgence_tel || '',
                  relationship: p.contact_urgence_relation || ''
                },
                familyHistory: p.antecedents || [],
                documents: p.documents || []
              }
            }));
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);
  

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
    return status === 'granted';
  };

  const handleScanPress = async () => {
    const hasPermission = await requestCameraPermission();
    if (hasPermission) {
      setShowScanner(true);
    } else {
      Alert.alert('Permission refusée', 'L\'accès à la caméra est nécessaire pour scanner les QR codes.');
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    
    try {
      // Prefer server-side parsing: send raw QR content to backend
      (async () => {
        try {
          const res = await qrApi.readProfileQrContent(data, 'medecin');
          if (res.ok && res.data && res.data.profile) {
            const p = res.data.profile;
            // Map backend fields to local Patient type conservatively
            const rawDob = p.date_naissance || p.date_de_naissance || p.dateOfBirth || p.date_of_birth || '';
            const age = calculateAge(rawDob);
            const dobFormatted = formatBirthDate(rawDob);
            const mapped: Patient = {
              id: String(p.id || p.user_id || p.utilisateur_id || p.telephone || 'unknown'),
              firstName: p.prenom || p.firstName || p.nom || '',
              lastName: p.nom || p.lastName || '',
              age,
              dateOfBirth: dobFormatted,
              phone: p.telephone || p.phone || '',
              email: p.email || '',
              address: p.adresse || p.address || '',
              weight: (p.poids && String(p.poids)) || 'Non renseigné',
              height: (p.taille && String(p.taille)) || 'Non renseigné',
              bloodType: p.groupe_sanguin || p.bloodType || 'Non renseigné',
              socialSecurityNumber: p.numero_securite_sociale || p.socialSecurityNumber || 'Non renseigné',
              medicalHistory: p.medicalHistory || p.medical_history || p.maladies || p.diseases || [],
              allergies: p.allergies || [],
              currentMedications: p.currentMedications || p.traitements || p.treatments || [],
              hospitalizations: p.hospitalizations || p.hospitalisations || [],
              doctors: p.doctors || p.medecins || [],
              emergencyContact: p.emergencyContact || {
                name: p.contact_urgence_nom || '',
                phone: p.contact_urgence_tel || '',
                relationship: p.contact_urgence_relation || ''
              }
            };

            // Ajout du patient à la liste suivie côté backend
            try {
              await fetch(`${config.backendUrl.replace(/\/$/, '')}/followed_patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ patient_id: p.id || p.user_id || p.utilisateur_id })
              });
            } catch (e) { /* ignore */ }

            const existing = patients.find(pt => pt.id === mapped.id);
            if (existing) {
              setSelectedPatient(existing);
            } else {
              setPatients(prev => [mapped, ...prev]);
              setSelectedPatient(mapped);
            }
            return;
          }

          // If server didn't return a profile, fallback to local parsing
          try {
            const patientData = JSON.parse(data);
            if (patientData.type === 'patient_profile' && patientData.patientId) {
              const existingPatient = patients.find(p => p.id === patientData.patientId);
              if (existingPatient) {
                setSelectedPatient(existingPatient);
              } else {
                const newPatient: Patient = {
                  id: patientData.id,
                  firstName: patientData.firstName,
                  lastName: patientData.lastName,
                  age: patientData.age,
                  dateOfBirth: patientData.dateOfBirth,
                  phone: patientData.phone,
                  email: patientData.email,
                  address: patientData.address,
                  weight: patientData.weight || 'Non renseigné',
                  height: patientData.height || 'Non renseigné',
                  bloodType: patientData.bloodType || 'Non renseigné',
                  socialSecurityNumber: patientData.socialSecurityNumber || 'Non renseigné',
                  medicalHistory: patientData.medicalHistory || [],
                  allergies: patientData.allergies || [],
                  currentMedications: patientData.currentMedications || [],
                  hospitalizations: patientData.hospitalizations || [],
                  doctors: patientData.doctors || [],
                  emergencyContact: patientData.emergencyContact || {
                    name: '',
                    phone: '',
                    relationship: ''
                  }
                };
                setPatients(prev => [newPatient, ...prev]);
                setSelectedPatient(newPatient);
                return;
              }
            }
          } catch (e) {
            // not JSON or fallback failed
          }

          Alert.alert('QR Code invalide', 'Ce QR code ne correspond pas à un profil patient valide.');
        } catch (err: any) {
          console.error('Scan error:', err);
          // Try local parse as last resort
          try {
            const patientData = JSON.parse(data);
            if (patientData.type === 'patient_profile' && patientData.patientId) {
              const newPatient: Patient = {
                id: patientData.id,
                firstName: patientData.firstName,
                lastName: patientData.lastName,
                age: patientData.age,
                dateOfBirth: patientData.dateOfBirth,
                phone: patientData.phone,
                email: patientData.email,
                address: patientData.address,
                weight: patientData.weight || 'Non renseigné',
                height: patientData.height || 'Non renseigné',
                bloodType: patientData.bloodType || 'Non renseigné',
                socialSecurityNumber: patientData.socialSecurityNumber || 'Non renseigné',
                medicalHistory: patientData.medicalHistory || [],
                allergies: patientData.allergies || [],
                currentMedications: patientData.currentMedications || [],
                hospitalizations: patientData.hospitalizations || [],
                doctors: patientData.doctors || [],
                emergencyContact: patientData.emergencyContact || {
                  name: '',
                  phone: '',
                  relationship: ''
                }
              };
              setPatients(prev => [newPatient, ...prev]);
              setSelectedPatient(newPatient);
              return;
            }
          } catch (e) {
            // ignore
          }

          Alert.alert('Erreur', 'Impossible de lire ce QR code. Assurez-vous qu\'il s\'agit d\'un QR code de profil patient.');
        }
      })();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de lire ce QR code. Assurez-vous qu\'il s\'agit d\'un QR code de profil patient.');
    }
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDetailedData = (patient: Patient, section: SectionType): DetailedItem[] => {
    switch (section) {
      case 'maladies':
        // Affichage complet comme côté user : nom, description, symptômes, date de début, examens
        return (patient.medicalHistory || []).map((maladie: any) => {
          // Compatibilité avec tous les formats (backend, anciens dumps, etc.)
          const id = maladie.id?.toString() ?? maladie.maladie_id?.toString() ?? '';
          const name = maladie.name || maladie.nom || '';
          const description = maladie.description || maladie.desc || '';
          const symptoms = maladie.symptoms || maladie.symptomes || '';
          const beginDate = maladie.beginDate || maladie.date_debut || maladie.date || '';
          const examens = maladie.examens || maladie.exams || '';
          // On concatène tout pour l'affichage détaillé
          let fullDesc = '';
          if (description) fullDesc += `Description : ${description}\n`;
          if (symptoms) fullDesc += `Symptômes : ${symptoms}\n`;
          if (beginDate) fullDesc += `Date de début : ${beginDate}\n`;
          if (examens) fullDesc += `Examens : ${examens}`;
          return {
            id,
            title: name,
            description: fullDesc.trim(),
            date: beginDate,
            severity: maladie.severity ?? '',
            notes: maladie.notes ?? ''
          };
        });
      case 'traitements':
        // Affichage complet : nom, description, début, fin, dosage, durée, effets secondaires
        return (patient.currentMedications || []).map((traitement: any) => {
          const id = traitement.id?.toString() ?? '';
          const name = traitement.nom || traitement.name || traitement.title || '';
          const description = traitement.description || '';
          const debut = traitement.debut || traitement.start || '';
          const fin = traitement.fin || traitement.end || '';
          const dosage = traitement.dosage || '';
          const duree = traitement.duree || '';
          const effets = traitement.effets_secondaires || traitement.side_effects || '';
          let fullDesc = '';
          if (description) fullDesc += `Description : ${description}\n`;
          if (debut) fullDesc += `Début : ${debut}\n`;
          if (fin) fullDesc += `Fin : ${fin}\n`;
          if (dosage) fullDesc += `Dosage : ${dosage}\n`;
          if (duree) fullDesc += `Durée : ${duree}\n`;
          if (effets) fullDesc += `Effets secondaires : ${effets}`;
          return {
            id,
            title: name,
            description: fullDesc.trim(),
            date: debut,
            notes: traitement.notes ?? ''
          };
        });
      case 'hospitalisations':
        // Affichage ultra complet comme côté patient : description, type, dates, hopital, service, medecin, etc.
        return (patient.hospitalizations || []).map((hosp: any) => {
          const id = hosp.id?.toString() ?? '';
          const description = hosp.description || '';
          const type = hosp.type || '';
          const dates = hosp.dates || hosp.date || '';
          const hopital = hosp.hopital || hosp.hospital || '';
          const service = hosp.service || '';
          const medecin = hosp.medecin || hosp.doctor || '';
          const raison = hosp.raison || hosp.reason || '';
          const duree = hosp.duree || hosp.duration || '';
          const notes = hosp.notes || '';
          let fullDesc = '';
          if (description) fullDesc += `Description : ${description}\n`;
          if (type) fullDesc += `Type : ${type}\n`;
          if (dates) fullDesc += `Dates : ${dates}\n`;
          if (hopital) fullDesc += `Hôpital : ${hopital}\n`;
          if (service) fullDesc += `Service : ${service}\n`;
          if (medecin) fullDesc += `Médecin : ${medecin}\n`;
          if (raison) fullDesc += `Raison : ${raison}\n`;
          if (duree) fullDesc += `Durée : ${duree}\n`;
          if (notes) fullDesc += `Notes : ${notes}`;
          return {
            id,
            title: raison || type || hopital || 'Hospitalisation',
            description: fullDesc.trim(),
            date: dates,
            notes
          };
        });
      case 'allergies':
        // Affichage complet : nom, début, gravité, symptômes, médicaments, commentaires
        return (patient.allergies || []).map((allergy: any) => {
          const id = allergy.id?.toString() ?? '';
          const nom = allergy.nom || allergy.name || allergy.title || '';
          const debut = allergy.debut || allergy.start || '';
          const gravite = allergy.gravite || allergy.severity || '';
          const symptomes = allergy.symptomes || allergy.symptoms || '';
          const medicaments = allergy.medicaments || '';
          const commentaires = allergy.commentaires || allergy.notes || '';
          let fullDesc = '';
          if (debut) fullDesc += `Début : ${debut}\n`;
          if (gravite) fullDesc += `Gravité : ${gravite}\n`;
          if (symptomes) fullDesc += `Symptômes : ${symptomes}\n`;
          if (medicaments) fullDesc += `Médicaments : ${medicaments}\n`;
          if (commentaires) fullDesc += `Commentaires : ${commentaires}`;
          return {
            id,
            title: nom,
            description: fullDesc.trim(),
            severity: gravite,
            notes: commentaires
          };
        });
      case 'antecedents':
        // Affichage complet : membre, maladie, sévérité, traitement
        return (patient.familyHistory || []).map((ant: any) => {
          const id = ant.id?.toString() ?? '';
          const membre = ant.membre || ant.member || '';
          const maladie = ant.maladie || ant.disease || '';
          const severite = ant.severite || ant.severity || '';
          const traitement = ant.traitement || ant.treatment || '';
          let fullDesc = '';
          if (membre) fullDesc += `Membre : ${membre}\n`;
          if (maladie) fullDesc += `Maladie : ${maladie}\n`;
          if (severite) fullDesc += `Sévérité : ${severite}\n`;
          if (traitement) fullDesc += `Traitement : ${traitement}`;
          return {
            id,
            title: maladie || membre || 'Antécédent',
            description: fullDesc.trim(),
            notes: traitement
          };
        });
      case 'medecins':
        // Affichage complet : nom, spécialité, téléphone, email, hôpital, adresse
        return (patient.doctors || []).map((doc: any) => {
          const id = doc.id?.toString() ?? '';
          const nom = doc.nom || doc.name || '';
          const specialite = doc.specialite || doc.specialty || '';
          const telephone = doc.telephone || doc.phone || '';
          const email = doc.email || '';
          const hopital = doc.hopital || doc.hospital || '';
          const adresse = doc.adresse || doc.address || '';
          let fullDesc = '';
          if (specialite) fullDesc += `Spécialité : ${specialite}\n`;
          if (telephone) fullDesc += `Téléphone : ${telephone}\n`;
          if (email) fullDesc += `Email : ${email}\n`;
          if (hopital) fullDesc += `Hôpital : ${hopital}\n`;
          if (adresse) fullDesc += `Adresse : ${adresse}`;
          return {
            id,
            title: nom,
            description: fullDesc.trim(),
            notes: adresse
          };
        });
      default:
        return [];
    }
  };

  const handleSectionPress = (section: SectionType) => {
    if (section === 'documents') {
      setShowDocumentsModal(true);
    } else if (section === 'notes') {
      setShowNotesModal(true);
    } else {
      setSelectedSection(section);
    }
  };

  const getSectionTitle = (section: SectionType): string => {
    switch (section) {
      case 'info': return 'Informations';
      case 'maladies': return 'Maladies';
      case 'traitements': return 'Traitements';
      case 'hospitalisations': return 'Hospitalisations';
      case 'allergies': return 'Allergies';
      case 'antecedents': return 'Antécédents familiaux';
      case 'medecins': return 'Médecins';
      case 'documents': return 'Documents'; 
      case 'notes': return 'Notes de consultation';
      // case 'documents': return 'Documents';
      // case 'notes': return 'Notes de consultation';
      default: return '';
    }
  };

  // Function to get patient info entries
  const getPatientInfoEntries = (patient: Patient) => {
    const labels: { [key: string]: string } = {
      email: 'Email',
      lastName: 'Nom',
      firstName: 'Prénom',
      dateOfBirth: 'Date de naissance',
      age: 'Âge',
      weight: 'Poids',
      height: 'Taille',
      bloodType: 'Groupe sanguin',
      phone: 'Numéro de téléphone',
      socialSecurityNumber: 'Numéro de sécurité sociale',
      address: 'Adresse',
      emergencyContactName: 'Contact d\'urgence (nom)',
      emergencyContactPhone: 'Contact d\'urgence (téléphone)',
    };

    const safe = (v: any) => (v === undefined || v === null || v === '' ? 'Non renseigné' : v);
    return [
      { key: 'email', label: labels.email, value: safe(patient.email) },
      { key: 'lastName', label: labels.lastName, value: safe(patient.lastName) },
      { key: 'firstName', label: labels.firstName, value: safe(patient.firstName) },
      { key: 'dateOfBirth', label: labels.dateOfBirth, value: safe(patient.dateOfBirth) },
      { key: 'age', label: labels.age, value: patient.age === undefined || patient.age === null || patient.age === '' ? 'Non renseigné' : `${patient.age} ans` },
      { key: 'weight', label: labels.weight, value: safe(patient.weight) },
      { key: 'height', label: labels.height, value: safe(patient.height) },
      { key: 'bloodType', label: labels.bloodType, value: safe(patient.bloodType) },
      { key: 'phone', label: labels.phone, value: safe(patient.phone) },
      { key: 'socialSecurityNumber', label: labels.socialSecurityNumber, value: safe(patient.socialSecurityNumber) },
      { key: 'address', label: labels.address, value: safe(patient.address) },
      { key: 'emergencyContactName', label: labels.emergencyContactName, value: safe(patient.emergencyContact?.name) },
      { key: 'emergencyContactPhone', label: labels.emergencyContactPhone, value: safe(patient.emergencyContact?.phone) },
    ];
  };

  const getProfileItems = (patient: Patient): (ProfileItem & { section: SectionType })[] => [
    {
      title: 'Maladies',
      icon: 'medkit-outline',
      section: 'maladies',
      data: patient.medicalHistory.length > 0 ? patient.medicalHistory : ['Aucune maladie renseignée']
    },
    {
      title: 'Traitements',
      icon: 'bandage-outline',
      section: 'traitements',
      data: patient.currentMedications.length > 0 ? patient.currentMedications : ['Aucun traitement actuel']
    },
    {
      title: 'Hospitalisations',
      icon: 'bed-outline',
      section: 'hospitalisations',
      data: patient.hospitalizations.length > 0 
        ? patient.hospitalizations.map(h => `${h.reason} - ${h.hospital} (${h.date})`)
        : ['Aucune hospitalisation enregistrée']
    },
    {
      title: 'Allergies',
      icon: 'alert-circle-outline',
      section: 'allergies',
      data: patient.allergies.length > 0 ? patient.allergies : ['Aucune allergie connue']
    },
    {
      title: 'Antécédents familiaux',
      icon: 'people-outline',
      section: 'antecedents',
      data: ((patient as any).familyHistory && (patient as any).familyHistory.length > 0) ? (patient as any).familyHistory : ['Aucun antécédent familial']
    },
    {
      title: 'Médecins',
      icon: 'person-add-outline',
      section: 'medecins',
      data: patient.doctors.length > 0 
        ? patient.doctors.map(d => `${d.name} (${d.specialty})`)
        : ['Aucun médecin enregistré']
    }, 
    {
      title: 'Documents', 
      icon: 'document-text-outline',
      section: 'documents', 
      data: professionalDocuments.filter(doc => doc.patientId === patient.id && doc.doctorId === currentDoctorId).length > 0 
        ? [`${professionalDocuments.filter(doc => doc.patientId === patient.id && doc.doctorId === currentDoctorId).length} document(s)`]
        : ['Aucun document ajouté'] 
    }, 
    { 
      title: 'Notes', 
      icon: 'clipboard-outline',
      section: 'notes', 
      data: consultationNotes.filter(note => note.patientId === patient.id && note.doctorId === currentDoctorId).length > 0
        ? [`${consultationNotes.filter(note => note.patientId === patient.id && note.doctorId === currentDoctorId).length} note(s) de consultation`]
        : ['Aucune note de consultation'] 

    },
  ];

  const renderPatientCard = ({ item }: { item: Patient }) => {
    // Affichage cohérent avec la logique patient :
    const ageAff = (typeof item.age === 'number' && item.age > 0) ? `${item.age} ans` : 'Non renseigné';
    const dobAff = item.dateOfBirth && item.dateOfBirth.length >= 4 ? item.dateOfBirth : 'Non renseigné';
    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => setSelectedPatient(item)}
      >
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.patientAge}>
            {ageAff} • Né(e) le {dobAff}
          </Text>
          <Text style={styles.patientId}>
            ID: {item.id}
          </Text>
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={colors.infoTitle} 
          style={styles.arrow}
        />
      </TouchableOpacity>
    );
  };

  const getSeverityColor = (severity?: string): string => {
    switch (severity?.toLowerCase()) {
      case 'sévère': return colors.error;
      case 'modérée': return colors.warning;
      case 'légère': return colors.success;
      default: return colors.infoTextSecondary;
    }
  };

  // Functions for document management 
  const handleAddDocument = () => { 
    setShowAddDocumentModal(true); 
  };

  const handleSimulateDocumentSelection = () => {
    const newDocument: ProfessionalDocument = { 
      id: `PDOC${Date.now()}`,
      name: `Nouveau document - ${selectedPatient?.firstName} ${selectedPatient?.lastName}`,
      type: 'Compte-rendu médical',
      dateAdded: new Date().toLocaleDateString('fr-FR'),
      size: '1.5 MB', 
      uri: `documents/nouveau_document_${Date.now()}.pdf`,
      doctorId: currentDoctorId,
      patientId: selectedPatient?.id || '' 
    };

    setPreviewDocument(newDocument); 
  }; 

  const handleAddDocumentSubmit = () => { 
    if (previewDocument) {
      setProfessionalDocuments(prev => [previewDocument, ...prev]);
      setPreviewDocument(null); 
      setShowAddDocumentModal(false); 
      Alert.alert('Succès', 'Document ajouté avec succès !');
    }
  };

  const handleCancelAddDocument = () => { 
    setPreviewDocument(null); 
    setShowAddDocumentModal(false); 
  };

  const handleViewDocument= (document: ProfessionalDocument) => { 
    (async () => {
      Alert.alert(
        document.name,
        `Type: ${document.type}\nTaille: ${document.size}\nAjouté le: ${document.dateAdded}`,
        [
          { text: 'Fermer', style: 'cancel'},
          {
            text: 'Télécharger',
            onPress: async () => {
              handleDownloadDocument(document);
            }
          }
        ]
      );
    })();
  };

  const handleDownloadDocument = async (document: ProfessionalDocument) => {
    try {
      const filenameBase = document.name ? document.name.replace(/[^a-z0-9.\-_]/gi, '_') : `document_${document.id}`;
      const filename = /\.[a-zA-Z0-9]+$/.test(filenameBase) ? filenameBase : `${filenameBase}.pdf`;

      // Determine source URL or local uri
      let source = document.uri || '';
      if (!/^https?:\/\//.test(source) && !source.startsWith('file://')) {
        // try constructing a backend URL (best-effort)
        source = `${config.backendUrl.replace(/\/$/, '')}/documents/${document.patientId}/${document.id}`;
      }

      const cachePath = `${FileSystem.cacheDirectory}${filename}`;

      // Download to cache first
      const downloadRes = await FileSystem.downloadAsync(source, cachePath);

      // Try to move to Downloads directory (Android)
      // Note: DownloadDirectoryPath may be undefined on iOS or some environments
      // Use (FileSystem as any) to access legacy constant without TS complaints
      const downloadsDir = (FileSystem as any).DownloadDirectoryPath as string | undefined;
      if (!downloadsDir) {
        // If no direct Downloads directory is available (common in Expo Go), open URL in browser to let system download
        if (/^https?:\/\//.test(source)) {
          Linking.openURL(source).catch((err) => {
            console.warn('[Download] Linking.openURL failed', err);
          });
          return;
        }
      }

      if (downloadsDir) {
        const targetPath = `${downloadsDir}/${filename}`;
        try {
          // On Android, request WRITE_EXTERNAL_STORAGE at runtime for older Android versions
          if (Platform.OS === 'android') {
            try {
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                  title: 'Permission d\'écriture',
                  message: 'L\'application a besoin d\'écrire dans Téléchargements pour sauvegarder le fichier.',
                  buttonNeutral: 'Demander plus tard',
                  buttonNegative: 'Annuler',
                  buttonPositive: 'OK',
                }
              );
              if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                console.warn('[Download] WRITE_EXTERNAL_STORAGE non accordée');
              }
            } catch (permErr) {
              console.warn('[Download] Permission request failed', permErr);
            }
          }

          // moveAsync may fail due to permission restrictions; attempt it
          await FileSystem.moveAsync({ from: downloadRes.uri, to: targetPath });
          Alert.alert('Téléchargement terminé', `Fichier enregistré dans Mes téléchargements: ${filename}`);
          return;
        } catch (err) {
          // fallback to MediaLibrary / Sharing below
          console.warn('[Download] Move to Downloads failed, falling back:', err);
        }
      }

      // Try to save to media library (may prompt for permission)
      try {
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
          // Try to add to 'Download' album if possible
          const albumName = 'Download';
          let album = await MediaLibrary.getAlbumAsync(albumName);
          if (!album) {
            try {
              album = await MediaLibrary.createAlbumAsync(albumName, asset, false);
            } catch (e) {
              console.warn('[Download] createAlbumAsync failed', e);
            }
          } else {
            try {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
            } catch (e) {
              console.warn('[Download] addAssetsToAlbumAsync failed', e);
            }
          }

          Alert.alert('Téléchargement terminé', `Fichier enregistré dans la bibliothèque: ${filename}`);
          return;
        }
      } catch (e) {
        console.warn('[Download] MediaLibrary save failed', e);
      }

      // Fallback: present share dialog so user can save manually (iOS / limited Android)
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, { dialogTitle: `Enregistrer ${filename}` });
        return;
      }

      // If sharing isn't available, try opening the document URL in the browser
      try {
        if (/^https?:\/\//.test(source)) {
          Alert.alert(
            'Téléchargement externe',
            'Impossible d\'enregistrer automatiquement sur l\'appareil. Ouvrir le document dans le navigateur pour le télécharger dans le dossier Téléchargements ?',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Ouvrir', onPress: () => { Linking.openURL(source).catch((err) => { console.warn('[Download] Linking.openURL failed', err); }); } }
            ]
          );
          return;
        }
      } catch (e) {
        // ignore
      }

      // Last resort: notify user where the cached file is located
      Alert.alert('Téléchargement', `Le fichier est disponible dans le cache: ${downloadRes.uri}`);
    } catch (err: any) {
      console.error('handleDownloadDocument error', err);
      Alert.alert('Erreur', `Impossible de télécharger le document: ${String(err)}`);
    }
  };

  // Functions for note management 
  const handleAddNote = () => { 
    setShowAddNoteModal(true); 
    setNewNoteDate(new Date().toLocaleDateString('fr-FR'));
  };

  const handleSaveNote = () => { 
    if (newNoteContent.trim() && newNoteDate.trim() && selectedPatient) {
      const newNote: ConsultationNote = { 
        id: `NOTE${Date.now()}`, 
        patientId: selectedPatient.id, 
        doctorId: currentDoctorId,
        consultationDate: newNoteDate, 
        content: newNoteContent, 
        createdAt: new Date().toLocaleString('fr-FR')
      };

      setConsultationNotes(prev => [newNote, ...prev]);
      setNewNoteContent(''); 
      setNewNoteDate(''); 
      setShowAddNoteModal(false); 
      Alert.alert('Succès', 'Note de consultation ajoutée avec succès !'); 
    } else { 
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');  
    }
  };

  const handleCancelNote = () => {
    setNewNoteContent(''); 
    setNewNoteDate(''); 
    setShowAddNoteModal(false); 
  };

  const getPatientDocuments = (patientId: string) => { 
    return professionalDocuments.filter(doc => 
      doc.patientId === patientId && doc.doctorId === currentDoctorId
    );
  };

  const getPatientNotes = (patientId: string) => { 
    return consultationNotes.filter(note => 
      note.patientId === patientId && note.doctorId === currentDoctorId
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); 
  };

  const renderSectionDetail = () => (
    <Modal
      visible={selectedSection !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.sectionModal}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedSection(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>
            {selectedSection && getSectionTitle(selectedSection)}
          </Text>
        </View>

        <ScrollView style={styles.sectionContent}>
          {selectedPatient && selectedSection && selectedSection !== 'info' && 
            getDetailedData(selectedPatient, selectedSection).map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardTitle}>{item.title}</Text>
                  {item.severity && (
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                      <Text style={styles.severityText}>{item.severity}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.itemDescription}>{item.description}</Text>
                
                {item.date && (
                  <Text style={styles.itemDate}>📅 {item.date}</Text>
                )}
                
                {item.notes && (
                  <Text style={styles.itemNotes}>💡 {item.notes}</Text>
                )}
              </View>
            ))
          }

          {/* For info section, show detailed cards like PersonalInfo */}
          {selectedPatient && selectedSection && selectedSection === 'info' && (
            <View style={{ padding: 16 }}>
              {getPatientInfoEntries(selectedPatient).map((info, index) => (
                <View 
                  key={info.key} 
                  style={[
                    profileInfoStyles.card,
                    { marginVertical: 8 },
                    index === 0 && { marginTop: 10 },
                    index === getPatientInfoEntries(selectedPatient).length - 1 && { marginBottom: 20 }
                  ]}
                >
                  <Text style={profileInfoStyles.title}>{info.label}</Text>
                  <Text style={profileInfoStyles.content}>{info.value}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // Documents Modal
  const renderDocumentsModal = () => (
    <Modal
      visible={showDocumentsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.sectionModal}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowDocumentsModal(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>
            Documents - {selectedPatient?.firstName} {selectedPatient?.lastName}
          </Text>
        </View>

        <ScrollView style={styles.sectionContent}>
          {selectedPatient && getPatientDocuments(selectedPatient.id).length > 0 ? (
            getPatientDocuments(selectedPatient.id).map((document) => (
              <TouchableOpacity 
                key={document.id}
                style={styles.itemCard}
                onPress={() => handleViewDocument(document)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemCardTitle}>{document.name}</Text>
                    <Text style={styles.itemDescription}>Type: {document.type}</Text>
                    <Text style={styles.itemDate}>📅 Ajouté le: {document.dateAdded}</Text>
                    <Text style={styles.itemNotes}>📄 Taille: {document.size}</Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors.editButtonBackground,
                      padding: 8,
                      borderRadius: 50
                    }}
                    onPress={() => handleViewDocument(document)}
                  >
                    <Ionicons name="eye" size={20} color={colors.iconPrimary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.itemCard, { alignItems: 'center', padding: 40 }]}>
              <Ionicons name="folder-open-outline" size={60} color={colors.primary} />
              <Text style={[styles.itemCardTitle, { marginTop: 20, textAlign: 'center' }]}>
                Aucun document
              </Text>
              <Text style={[styles.itemDescription, { textAlign: 'center', marginTop: 10 }]}>
                Vous n'avez encore ajouté aucun document pour ce patient
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={prescriptionStyles.buttonContainer}>
          <TouchableOpacity style={prescriptionStyles.button} onPress={handleAddDocument}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Ajouter</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={prescriptionStyles.button} onPress={() => setShowDocumentsModal(false)}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Fermer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Notes Modal
  const renderNotesModal = () => (
    <Modal
      visible={showNotesModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.sectionModal}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setShowNotesModal(false)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>
            Notes - {selectedPatient?.firstName} {selectedPatient?.lastName}
          </Text>
        </View>

        <ScrollView style={styles.sectionContent}>
          {selectedPatient && getPatientNotes(selectedPatient.id).length > 0 ? (
            getPatientNotes(selectedPatient.id).map((note) => (
              <View key={note.id} style={styles.itemCard}>
                <View style={styles.itemCardHeader}>
                  <Text style={styles.itemCardTitle}>Consultation du {note.consultationDate}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.severityText}>Note</Text>
                  </View>
                </View>
                
                <Text style={styles.itemDescription}>{note.content}</Text>
                
                <Text style={styles.itemDate}>📝 Rédigé le: {note.createdAt}</Text>
              </View>
            ))
          ) : (
            <View style={[styles.itemCard, { alignItems: 'center', padding: 40 }]}>
              <Ionicons name="clipboard-outline" size={60} color={colors.primary} />
              <Text style={[styles.itemCardTitle, { marginTop: 20, textAlign: 'center' }]}>
                Aucune note
              </Text>
              <Text style={[styles.itemDescription, { textAlign: 'center', marginTop: 10 }]}>
                Vous n'avez encore pris aucune note pour ce patient
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={prescriptionStyles.buttonContainer}>
          <TouchableOpacity style={prescriptionStyles.button} onPress={handleAddNote}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Ajouter</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={prescriptionStyles.button} onPress={() => setShowNotesModal(false)}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Fermer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Add Document Modal
  const renderAddDocumentModal = () => (
    <Modal
      visible={showAddDocumentModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={prescriptionStyles.container}>
        <ScrollView contentContainerStyle={prescriptionStyles.prescriptionList}>
          <View style={prescriptionStyles.prescriptionCard}>
            <Text style={[prescriptionStyles.prescriptionTitle, { textAlign: 'center', marginBottom: 20 }]}>
              Ajouter un document - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </Text>
            
            {!previewDocument ? (
              // File selection area
              <TouchableOpacity 
                style={[prescriptionStyles.prescriptionCard, { 
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderColor: colors.profileText,
                  backgroundColor: 'transparent'
                }]}
                onPress={() => {
                  Alert.alert(
                    'Sélectionner un fichier',
                    'Cette fonctionnalité nécessite l\'installation du package expo-document-picker pour permettre la sélection de fichiers.',
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Simuler la sélection', onPress: handleSimulateDocumentSelection }
                    ]
                  );
                }}
              >
                <Ionicons name="cloud-upload" size={50} color={colors.profileText} />
                <Text style={[prescriptionStyles.prescriptionTitle, { marginTop: 15, color: colors.profileText }]}>
                  Parcourir les fichiers
                </Text>
                <Text style={[prescriptionStyles.prescriptionText, { textAlign: 'center', marginTop: 10 }]}>
                  Formats acceptés: PDF, JPG, PNG
                </Text>
              </TouchableOpacity>
            ) : (
              // Document preview
              <View style={prescriptionStyles.prescriptionCard}>
                <Text style={[prescriptionStyles.prescriptionTitle, { textAlign: 'center', marginBottom: 15, color: colors.infoText }]}>
                  Document sélectionné
                </Text>
                <View style={{ marginBottom: 15 }}>
                  <Text style={prescriptionStyles.prescriptionTitle}>{previewDocument.name}</Text>
                  <Text style={prescriptionStyles.prescriptionText}>Type: {previewDocument.type}</Text>
                  <Text style={prescriptionStyles.prescriptionText}>Taille: {previewDocument.size}</Text>
                </View>
                <Text style={[prescriptionStyles.prescriptionText, { textAlign: 'center', fontStyle: 'italic', color: colors.infoText }]}>
                  Appuyez sur "Ajouter" pour confirmer l'ajout de ce document
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={prescriptionStyles.buttonContainer}>
          <TouchableOpacity
            style={prescriptionStyles.button}
            onPress={handleCancelAddDocument}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Annuler</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={prescriptionStyles.button}
            onPress={handleAddDocumentSubmit}
            disabled={!previewDocument}
          >
            <LinearGradient 
              colors={previewDocument ? [colors.primary, colors.secondary] : [colors.primary + '50', colors.secondary + '50']} 
              style={prescriptionStyles.gradient}
            >
              <Text style={[prescriptionStyles.buttonText, { opacity: previewDocument ? 1 : 0.5 }]}>
                Ajouter
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Add Note Modal
  const renderAddNoteModal = () => (
    <Modal
      visible={showAddNoteModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={prescriptionStyles.container}>
        <ScrollView contentContainerStyle={prescriptionStyles.prescriptionList}>
          <View style={prescriptionStyles.prescriptionCard}>
            <Text style={[prescriptionStyles.prescriptionTitle, { textAlign: 'center', marginBottom: 20 }]}>
              Ajouter une note - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </Text>
            
            <Text style={[prescriptionStyles.prescriptionText, { marginBottom: 10 }]}>
              Date de consultation *
            </Text>
            <TextInput
              style={[prescriptionStyles.prescriptionCard, { 
                marginBottom: 15,
                padding: 15,
                borderWidth: 1,
                borderRadius: 8
              }]}
              placeholder="JJ/MM/AAAA"
              value={newNoteDate}
              onChangeText={setNewNoteDate}
            />
            
            <Text style={[prescriptionStyles.prescriptionText, { marginBottom: 10 }]}>
              Contenu de la note *
            </Text>
            <TextInput
              style={[prescriptionStyles.prescriptionCard, { 
                marginBottom: 15,
                padding: 15,
                borderWidth: 1,
                borderRadius: 8,
                height: 120,
                textAlignVertical: 'top'
              }]}
              placeholder="Décrivez la consultation, les observations, recommandations..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={5}
            />
          </View>
        </ScrollView>

        <View style={prescriptionStyles.buttonContainer}>
          <TouchableOpacity
            style={prescriptionStyles.button}
            onPress={handleCancelNote}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Annuler</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={prescriptionStyles.button}
            onPress={handleSaveNote}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={prescriptionStyles.gradient}>
              <Text style={prescriptionStyles.buttonText}>Sauvegarder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPatientDetail = () => (
    <Modal
      visible={selectedPatient !== null}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.detailModal}>
        <View style={styles.detailHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedPatient(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.headerText} />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>
            Profil de {selectedPatient?.firstName} {selectedPatient?.lastName}
          </Text>
        </View>

        <ScrollView style={styles.detailContent}>
          {/* Profile Header */}
          <View style={styles.profileSection}>
            <TouchableOpacity 
              style={styles.profileHeader}
              onPress={() => handleSectionPress('info')}
            >
              <View style={styles.profileImage}>
                <Text style={styles.profileImageText}>
                  {selectedPatient?.firstName?.[0]}{selectedPatient?.lastName?.[0]}
                </Text>
              </View>
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileName}>
                  {selectedPatient?.firstName} {selectedPatient?.lastName}
                </Text>
                <Text style={styles.profileAge}>
                  {selectedPatient?.age} ans • ID: {selectedPatient?.id}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={colors.infoTitle} 
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Grid */}
          <View style={styles.gridContainer}>
            {selectedPatient && getProfileItems(selectedPatient).map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.gridItem}
                onPress={() => handleSectionPress(item.section)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.gradientBackground}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={40} 
                    color={colors.iconPrimary} 
                    style={styles.itemIcon}
                  />
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const renderScanner = () => (
    <Modal
      visible={showScanner}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.scannerModal}>
        {hasCameraPermission ? (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={handleBarCodeScanned}
            ref={cameraRef}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerText}>
                Pointez la caméra vers le QR code du profil patient
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowScanner(false)}
            >
              <Ionicons name="close" size={24} color={colors.iconPrimary} />
            </TouchableOpacity>
          </CameraView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Permission caméra requise</Text>
            <Text style={styles.emptySubtitle}>
              Veuillez autoriser l'accès à la caméra pour scanner les QR codes.
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un patient..."
              placeholderTextColor={colors.infoText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
            >
              <Ionicons name="qr-code-outline" size={24} color={colors.iconPrimary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          {filteredPatients.length > 0 ? (
            <FlatList
              data={filteredPatients}
              renderItem={renderPatientCard}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons 
                name="people-outline" 
                size={60} 
                color={colors.infoTextSecondary} 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'Aucun patient trouvé' : 'Aucun patient enregistré'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? 'Essayez avec un autre terme de recherche.'
                  : 'Scannez un QR code de profil patient pour commencer.'}
              </Text>
            </View>
          )}
        </View>
        {renderScanner()} 
        {renderPatientDetail()} 
        {renderSectionDetail()}
        {renderDocumentsModal()}
        {renderNotesModal()}
        {renderAddDocumentModal()}
        {renderAddNoteModal()} 

{/* 
        {renderScanner()}
        {renderPatientDetail()}
        {renderSectionDetail()} */}
      </View>
    </View>
  );
}