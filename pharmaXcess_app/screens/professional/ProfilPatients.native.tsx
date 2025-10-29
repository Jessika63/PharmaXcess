import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Camera, CameraView } from 'expo-camera';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import createStyles from '../../styles/ProfilPatients.style';
import createProfileInfoStyles from '../../styles/ProfileInfos.style'; 

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
  icon: "person-outline" | "medkit-outline" | "bandage-outline" | "bed-outline" | "alert-circle-outline" | "people-outline" | "person-add-outline";
  data: string[]; 
}; 

type SectionType = 'info' | 'maladies' | 'traitements' | 'hospitalisations' | 'allergies' | 'antecedents' | 'medecins';

type DetailedItem = {
  id: string; 
  title: string;
  description: string;
  date?: string; 
  severity?: string; 
  notes?: string; 
}; 


export default function ProfilPatients(): React.JSX.Element {
  const { colors } = useTheme();
  const { fontScale } = useFontScale();
  const styles = createStyles(colors, fontScale);
  const profileInfoStyles = createProfileInfoStyles(colors, fontScale);

  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<CameraView | null>(null);

  // Mock data - patients
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 'P001',
      firstName: 'Jean',
      lastName: 'Dupont',
      age: 45,
      dateOfBirth: '15/03/1979',
      phone: '06 12 34 56 78',
      email: 'jean.dupont@email.com',
      address: '123 Rue de la Paix, 75001 Paris',
      weight: '75 kg',
      height: '1m78',
      bloodType: 'A+',
      socialSecurityNumber: '1 79 03 75 001 234 56',
      medicalHistory: ['Hypertension artérielle', 'Diabète type 2'],
      allergies: ['Pénicilline', 'Arachides'],
      currentMedications: ['Metformine 850mg', 'Ramipril 5mg'],
      hospitalizations: [
        {
          id: 'H001',
          reason: 'Chirurgie cardiaque',
          hospital: 'Hôpital Pitié-Salpêtrière',
          service: 'Cardiologie',
          doctor: 'Dr. Martin',
          date: '15/06/2022',
          duration: '5 jours'
        },
        {
          id: 'H002',
          reason: 'Contrôle diabète',
          hospital: 'Clinique Saint-Louis',
          service: 'Endocrinologie',
          doctor: 'Dr. Dubois',
          date: '12/03/2023',
          duration: '2 jours'
        }
      ],
      doctors: [
        {
          id: 'D001',
          name: 'Dr. Martin Dubois',
          specialty: 'Médecine générale',
          phone: '01 45 67 89 12',
          email: 'martin.dubois@medical.fr',
          address: 'Cabinet médical Saint-Antoine, 15 rue de la Santé, 75014 Paris'
        },
        {
          id: 'D002',
          name: 'Dr. Sophie Lemaire',
          specialty: 'Cardiologie',
          phone: '01 56 09 20 00',
          email: 'sophie.lemaire@hopital-pompidou.fr',
          address: 'Hôpital Européen Georges Pompidou, 20 rue Leblanc, 75015 Paris'
        }
      ],
      emergencyContact: {
        name: 'Marie Dupont',
        phone: '06 98 76 54 32',
        relationship: 'Épouse'
      }
    },
    {
      id: 'P002',
      firstName: 'Marie',
      lastName: 'Curie',
      age: 38,
      dateOfBirth: '22/08/1986',
      phone: '06 87 65 43 21',
      email: 'marie.curie@email.com',
      address: '456 Avenue de la Science, 75005 Paris',
      weight: '62 kg',
      height: '1m65',
      bloodType: 'O-',
      socialSecurityNumber: '2 86 08 75 005 678 90',
      medicalHistory: ['Migraine chronique', 'Anémie'],
      allergies: ['Aspirine'],
      currentMedications: ['Sumatriptan 50mg', 'Fer sulfate'],
      hospitalizations: [
        {
          id: 'H003',
          reason: 'Traitement de l\'anémie',
          hospital: 'Hôpital Cochin',
          service: 'Hématologie',
          doctor: 'Dr. Laurent',
          date: '08/09/2023',
          duration: '3 jours'
        }
      ],
      doctors: [
        {
          id: 'D003',
          name: 'Dr. Claire Laurent',
          specialty: 'Hématologie',
          phone: '01 58 41 25 00',
          email: 'claire.laurent@hopital-cochin.fr',
          address: 'Hôpital Cochin, 27 rue du Faubourg Saint-Jacques, 75014 Paris'
        },
        {
          id: 'D004',
          name: 'Dr. Michel Petit',
          specialty: 'Neurologie',
          phone: '01 42 16 00 00',
          email: 'michel.petit@pitie-salpetriere.fr',
          address: 'Hôpital Pitié-Salpêtrière, 47-83 Boulevard de l\'Hôpital, 75013 Paris'
        }
      ],
      emergencyContact: {
        name: 'Pierre Curie',
        phone: '06 11 22 33 44',
        relationship: 'Époux'
      }
    },
    {
      id: 'P003',
      firstName: 'Pierre',
      lastName: 'Martin',
      age: 62,
      dateOfBirth: '10/12/1962',
      phone: '06 55 44 33 22',
      email: 'pierre.martin@email.com',
      address: '789 Boulevard Saint-Germain, 75006 Paris',
      weight: '82 kg',
      height: '1m75',
      bloodType: 'B+',
      socialSecurityNumber: '1 62 12 75 006 789 01',
      medicalHistory: ['Arthrose', 'Cholestérol élevé'],
      allergies: ['Aucune allergie connue'],
      currentMedications: ['Atorvastatine 20mg', 'Glucosamine'],
      hospitalizations: [
        {
          id: 'H004',
          reason: 'Prothèse de hanche',
          hospital: 'Hôpital Saint-Antoine',
          service: 'Orthopédie',
          doctor: 'Dr. Rousseau',
          date: '20/01/2023',
          duration: '7 jours'
        },
        {
          id: 'H005',
          reason: 'Bilan cardiologique',
          hospital: 'Clinique du Faubourg',
          service: 'Cardiologie',
          doctor: 'Dr. Moreau',
          date: '05/11/2023',
          duration: '1 jour'
        }
      ],
      doctors: [
        {
          id: 'D005',
          name: 'Dr. Jean Rousseau',
          specialty: 'Orthopédie',
          phone: '01 49 28 20 00',
          email: 'jean.rousseau@st-antoine.fr',
          address: 'Hôpital Saint-Antoine, 184 rue du Faubourg Saint-Antoine, 75012 Paris'
        },
        {
          id: 'D006',
          name: 'Dr. Anne Moreau',
          specialty: 'Cardiologie',
          phone: '01 45 75 43 21',
          email: 'anne.moreau@clinique-faubourg.fr',
          address: 'Clinique du Faubourg, 8 rue de la Roquette, 75011 Paris'
        }
      ],
      emergencyContact: {
        name: 'Sophie Martin',
        phone: '06 77 88 99 00',
        relationship: 'Fille'
      }
    }
  ]);

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
      // Try to parse QR code data as JSON
      const patientData = JSON.parse(data);
      
      // Check if it's a valid patient QR code
      if (patientData.type === 'patient_profile' && patientData.patientId) {
        // Find existing patient or create new one
        const existingPatient = patients.find(p => p.id === patientData.patientId);
        
        if (existingPatient) {
          setSelectedPatient(existingPatient);
        } else {
          // Create new patient from QR data
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
        };          setPatients(prev => [newPatient, ...prev]);
          setSelectedPatient(newPatient);
        }
      } else {
        Alert.alert('QR Code invalide', 'Ce QR code ne correspond pas à un profil patient valide.');
      }
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
        return [
          {
            id: '1',
            title: 'Hypertension artérielle',
            description: 'Pression artérielle élevée de manière chronique.',
            date: '01/01/2020',
            severity: 'Modérée',
            notes: 'Contrôlée par médicaments. Surveillance régulière nécessaire.'
          },
          {
            id: '2',
            title: 'Diabète type 2',
            description: 'Trouble métabolique caractérisé par une hyperglycémie.',
            date: '15/06/2018',
            severity: 'Sévère',
            notes: 'Nécessite un suivi strict du régime alimentaire et de la glycémie.'
          }
        ];
      case 'traitements':
        return [
          {
            id: '1',
            title: 'Metformine 850mg',
            description: 'Antidiabétique oral pour le contrôle de la glycémie.',
            date: 'Depuis le 15/06/2018',
            notes: 'À prendre 2 fois par jour avec les repas.'
          },
          {
            id: '2',
            title: 'Ramipril 5mg',
            description: 'Inhibiteur de l\'enzyme de conversion pour l\'hypertension.',
            date: 'Depuis le 01/01/2020',
            notes: 'À prendre le matin à jeun.'
          }
        ];
      case 'hospitalisations':
        return patient.hospitalizations.map((hospitalization) => ({
          id: hospitalization.id,
          title: hospitalization.reason,
          description: `Hôpital: ${hospitalization.hospital}\nService: ${hospitalization.service}\nMédecin: ${hospitalization.doctor}`,
          date: hospitalization.date,
          notes: hospitalization.duration ? `Durée: ${hospitalization.duration}` : undefined
        }));
      case 'allergies':
        return [
          {
            id: '1',
            title: 'Pénicilline',
            description: 'Réaction allergique aux antibiotiques à base de pénicilline.',
            severity: 'Sévère',
            notes: 'Éviter tous les dérivés de la pénicilline. Porter un bracelet d\'allergie.'
          },
          {
            id: '2',
            title: 'Arachides',
            description: 'Allergie alimentaire aux cacahuètes et dérivés.',
            severity: 'Modérée',
            notes: 'Lire attentivement les étiquettes alimentaires.'
          }
        ];
      case 'antecedents':
        return [
          {
            id: '1',
            title: 'Diabète familial',
            description: 'Antécédents de diabète type 2 dans la famille.',
            notes: 'Père et grand-père paternel diabétiques. Surveillance glycémique recommandée.'
          },
          {
            id: '2',
            title: 'Maladies cardiovasculaires',
            description: 'Antécédents familiaux de problèmes cardiaques.',
            notes: 'Mère décédée d\'un infarctus à 65 ans. Oncle maternel avec AVC à 58 ans.'
          }
        ];
      case 'medecins':
        return patient.doctors.map((doctor) => ({
          id: doctor.id,
          title: doctor.name,
          description: `Spécialité: ${doctor.specialty}\nEmail: ${doctor.email}\nTéléphone: ${doctor.phone}`,
          notes: `Adresse: ${doctor.address}`
        }));
      default:
        return [];
    }
  };

  const handleSectionPress = (section: SectionType) => {
    setSelectedSection(section);
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

    return [
      { key: 'email', label: labels.email, value: patient.email },
      { key: 'lastName', label: labels.lastName, value: patient.lastName },
      { key: 'firstName', label: labels.firstName, value: patient.firstName },
      { key: 'dateOfBirth', label: labels.dateOfBirth, value: patient.dateOfBirth },
      { key: 'age', label: labels.age, value: `${patient.age} ans` },
      { key: 'weight', label: labels.weight, value: patient.weight },
      { key: 'height', label: labels.height, value: patient.height },
      { key: 'bloodType', label: labels.bloodType, value: patient.bloodType },
      { key: 'phone', label: labels.phone, value: patient.phone },
      { key: 'socialSecurityNumber', label: labels.socialSecurityNumber, value: patient.socialSecurityNumber },
      { key: 'address', label: labels.address, value: patient.address },
      { key: 'emergencyContactName', label: labels.emergencyContactName, value: patient.emergencyContact.name },
      { key: 'emergencyContactPhone', label: labels.emergencyContactPhone, value: patient.emergencyContact.phone },
    ];
  };

  const getProfileItems = (patient: Patient): (ProfileItem & { section: SectionType })[] => [
    {
      title: 'Informations',
      icon: 'person-outline',
      section: 'info',
      data: [
        `Email: ${patient.email}`,
        `Nom: ${patient.lastName}`,
        `Prénom: ${patient.firstName}`,
        `Date de naissance: ${patient.dateOfBirth}`,
        `Âge: ${patient.age} ans`,
        `Poids: ${patient.weight}`,
        `Taille: ${patient.height}`,
        `Groupe sanguin: ${patient.bloodType}`,
        `Numéro de téléphone: ${patient.phone}`,
        `Numéro de sécurité sociale: ${patient.socialSecurityNumber}`,
        `Adresse: ${patient.address}`,
        `Contact d'urgence (nom): ${patient.emergencyContact.name}`,
        `Contact d'urgence (téléphone): ${patient.emergencyContact.phone}`
      ]
    },
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
      data: ['Diabète familial', 'Maladies cardiovasculaires']
    },
    {
      title: 'Médecins',
      icon: 'person-add-outline',
      section: 'medecins',
      data: patient.doctors.length > 0 
        ? patient.doctors.map(d => `${d.name} (${d.specialty})`)
        : ['Aucun médecin enregistré']
    }
  ];

  const renderPatientCard = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={styles.patientCard}
      onPress={() => setSelectedPatient(item)}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.patientAge}>
          {item.age} ans • Né(e) le {item.dateOfBirth}
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

  const getSeverityColor = (severity?: string): string => {
    switch (severity?.toLowerCase()) {
      case 'sévère': return colors.error;
      case 'modérée': return colors.warning;
      case 'légère': return colors.success;
      default: return colors.infoTextSecondary;
    }
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
            <View style={styles.profileHeader}>
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
            </View>
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
                    color="#FFFFFF" 
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
              <Ionicons name="close" size={24} color="#FFFFFF" />
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
              <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
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

{/* 
        {renderScanner()}
        {renderPatientDetail()}
        {renderSectionDetail()} */}
      </View>
    </View>
  );
}