import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextStyle, StyleProp, ViewStyle, Modal, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { CustomPicker } from '../../components';

type PersonalInfoProps = {
    navigation: StackNavigationProp<any, any>;
};

type PatientInfo = {
    name: string;
    birthDate: string;
    age: number;
    weight: string;
    height: string; 
    bloodType: string;
    phone: string;
    email: string;
    socialSecurityNumber: string;
    address: string;
    // split emergency contact into two fields for clarity
    emergencyContactName: string;
    emergencyContactPhone: string;
};


// The PersonalInfo component displays the personal information of a patient, allowing them to view and modify their details.
export default function PersonalInfo({ navigation }: PersonalInfoProps) : React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile, updateProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Determine if it's the main profile 
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';
    
    // Main profile data (pre-filled for main profile, empty for others)
    const [patientInfo, setPatientInfo] = useState<PatientInfo>(
            isMainProfile ? {
            name: 'John Doe',
            birthDate: '01/01/1980',
            age: 42,
            weight: '70 kg',
            height: '180 cm',
            bloodType: 'A+',
            phone: '06 12 34 56 78',
            email: 'johndoe@hotmail.com',
            socialSecurityNumber: '123-45-6789',
            address: '1 rue de la paix, 75000 Paris',
            emergencyContactName: 'Jane Doe',
            emergencyContactPhone: '06 12 34 56 79',
        } : {
            name: '',
            birthDate: '',
            age: 0,
            weight: '',
            height: '',
            bloodType: '',
            phone: '',
            email: '',
            socialSecurityNumber: '',
            address: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
        }
    );

    const [editedInfo, setEditedInfo] = useState<PatientInfo>(patientInfo);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Define labels for each piece of patient information to be displayed in French
    const labels: { [key in keyof PatientInfo]: string } = {
        name: 'Nom',
        birthDate: 'Date de naissance',
        age: 'Âge',
        weight: 'Poids',
        height: 'Taille',
        bloodType: 'Groupe sanguin',
        phone: 'Téléphone',
        email: 'Email',
        socialSecurityNumber: 'Numéro de sécurité sociale',
        address: 'Adresse',
        emergencyContactName: 'Contact d\'urgence - Nom',
        emergencyContactPhone: 'Contact d\'urgence - Téléphone',
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const getRelationshipText = (relationship?: string) => {
        switch (relationship) {
            case 'self': return 'Mon profil';
            case 'child': return 'Profil enfant';
            case 'parent': return 'Profil parent';
            case 'spouse': return 'Profil conjoint(e)';
            case 'other': return 'Autre profil';
            default: return 'Mon profil';
        }
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Informations personnelles',
        });
    }, [navigation]);

    // Handlers for modifying and saving information
    const handleModifyPress = (): void => {
        setEditedInfo({ ...patientInfo });
        setIsModalVisible(true);
    };

    const handleSaveChanges = async (): Promise<void> => {
        if (!editedInfo.name || !editedInfo.email || !editedInfo.phone) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        // Validate date format (expect DD/MM/YYYY) if provided
        const isValidDDMMYYYY = (s?: string) => {
            if (!s) return true; // empty allowed elsewhere
            const m = String(s).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
            if (!m) return false;
            const day = Number(m[1]);
            const month = Number(m[2]);
            const year = Number(m[3]);
            if (month < 1 || month > 12) return false;
            const maxDay = new Date(year, month, 0).getDate();
            if (day < 1 || day > maxDay) return false;
            return true;
        };

        if (editedInfo.birthDate && !isValidDDMMYYYY(editedInfo.birthDate)) {
            Alert.alert('Erreur', "Le format de la date doit être JJ/MM/AAAA (ex: 01/01/1980).");
            return;
        }

        // Prepare data to persist via ProfileContext (will call backend when authenticated)
        try {
            // Parse weight (e.g. "70 kg") and height (e.g. "180 cm") to numbers where possible
            const parseNumber = (s: string) => {
                if (!s) return undefined;
                const cleaned = String(s).replace(/[a-zA-Z]/g, '').replace(',', '.').trim();
                const n = Number(cleaned);
                return Number.isFinite(n) ? n : undefined;
            };

            const weightNum = parseNumber(editedInfo.weight as string);
            const heightNum = parseNumber(editedInfo.height as string);

            // Use the two separate emergency contact fields
            const emergencyName = editedInfo.emergencyContactName ? String(editedInfo.emergencyContactName).trim() : undefined;
            const emergencyPhone = editedInfo.emergencyContactPhone ? String(editedInfo.emergencyContactPhone).trim() : undefined;

            const payload: any = {
                // frontend keys expected by updateProfile mapping
                dateOfBirth: editedInfo.birthDate,
                // send full name as 'name' so backend can update 'nom' (no split needed)
                name: editedInfo.name,
                weight: weightNum !== undefined ? weightNum : editedInfo.weight,
                height: heightNum !== undefined ? heightNum : editedInfo.height,
                bloodGroup: editedInfo.bloodType,
                telephone: editedInfo.phone,
                socialNumber: editedInfo.socialSecurityNumber,
                adresse: editedInfo.address,
            };

            if (emergencyName) payload.contact_urgence_nom = emergencyName;
            if (emergencyPhone) payload.contact_urgence_tel = emergencyPhone;

            // If we have a current profile, try to persist via context (which will call backend when authenticated)
            if (currentProfile && updateProfile) {
                const success = await updateProfile(currentProfile.id, payload as any);
                if (!success) {
                    Alert.alert('Erreur', "Impossible d'enregistrer les informations sur le serveur. Elles ont été enregistrées localement.");
                }
            }

            // Update local UI state regardless so user sees changes immediately
            setPatientInfo({ ...editedInfo });
            setIsModalVisible(false);
            Alert.alert('Succès', 'Vos informations ont été mises à jour.');
        } catch (e) {
            console.warn('Failed to save personal info', e);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde.');
        }
    };

    const handleInputChange = (field: keyof PatientInfo, value: string | number): void => {
        setEditedInfo(prev => ({ ...prev, [field]: value }));
    };

    // Local styles for modal and inputs
    const modalStyles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        modalTitle: {
            fontSize: 24 * fontScale,
            fontWeight: 'bold',
            marginBottom: 20,
            color: colors.settingsTitle,
            textAlign: 'center',
        },
        input: {
            width: '100%',
            padding: 15,
            borderWidth: 2,
            borderColor: colors.inputBorder,
            borderRadius: 10,
            marginBottom: 15,
            backgroundColor: colors.inputBackground,
            fontSize: 16 * fontScale,
            color: colors.infoText,
        },
        label: {
            fontSize: 16 * fontScale,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.settingsTitle,
        },
        scrollContainer: {
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 30,
        },
    });

    return (
        <ScrollView 
            style={modalStyles.scrollContainer}
            contentContainerStyle={modalStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
        >
            {/* Header for current profile */}
            {currentProfile && (
                <View style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={[styles.title, { color: colors.primary, fontWeight: 'bold' }]}>
                                {getRelationshipText(currentProfile.relationship)}
                            </Text>
                            <Text style={[styles.content, { color: colors.primary, opacity: 0.8 }]}>
                                {currentProfile.name}
                            </Text>
                        </View>
                        <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                    </View>
                </View>
            )}

            {/* Conditional rendering based on profile type */}
            {isMainProfile ? (
                // For main profile: show existing information
                <>
                    {/* Map through the patientInfo object to display each piece of information */}
                    {Object.entries(patientInfo).map(([key, value], index) => (
                        <View 
                            key={key} 
                            style={[
                                styles.card,
                                { marginVertical: 8 },
                                index === 0 && { marginTop: 10 },
                                index === Object.entries(patientInfo).length - 1 && { marginBottom: 20 }
                            ]}
                        >
                            <Text style={styles.title}>{labels[key as keyof PatientInfo]}</Text>
                            <Text style={styles.content}>{value}</Text>
                        </View>
                    ))}
                </>
            ) : (
                // For other profiles: show message if no information
                <>
                    {Object.values(patientInfo).every(val => val === '' || val === 0) ? (
                        <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}>
                            <Ionicons name="person-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                            <Text style={[styles.content, { textAlign: 'center', marginTop: 20 }]}>
                                Aucune information personnelle enregistrée pour ce profil.
                            </Text>
                            <Text style={[styles.content, { textAlign: 'center', opacity: 0.7 }]}>
                                Ajoutez les informations personnelles pour ce profil
                            </Text>
                        </View>
                    ) : (
                        // Show information if available
                        Object.entries(patientInfo).map(([key, value], index) => (
                            value !== '' && value !== 0 && (
                                <View 
                                    key={key} 
                                    style={[
                                        styles.card,
                                        { marginVertical: 8 },
                                        index === 0 && { marginTop: 10 },
                                    ]}
                                >
                                    <Text style={styles.title}>{labels[key as keyof PatientInfo]}</Text>
                                    <Text style={styles.content}>{value}</Text>
                                </View>
                            )
                        ))
                    )}
                </>
            )}

            <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
                <TouchableOpacity style={styles.button} onPress={handleModifyPress}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>
                            {isMainProfile ? 'Modifier' : Object.values(patientInfo).every(val => val === '' || val === 0) ? 'Ajouter' : 'Modifier'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Modal pour modifier les informations */}
            <Modal visible={isModalVisible} animationType="slide">
                <View style={modalStyles.modalContainer}>
                    <ScrollView 
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                    >
                        <Text style={modalStyles.modalTitle}>
                            {isMainProfile ? 'Modifier mes informations' : Object.values(patientInfo).every(val => val === '' || val === 0) ? 'Ajouter les informations' : 'Modifier les informations'}
                        </Text>
                        
                        <Text style={modalStyles.label}>Nom complet</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Nom complet"
                            value={editedInfo.name}
                            onChangeText={(text: string) => handleInputChange('name', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Date de naissance</Text>
                        <TouchableOpacity
                            style={[modalStyles.input, { justifyContent: 'center' }]}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={{ color: editedInfo.birthDate ? colors.infoText : colors.inputBorder }}>
                                {editedInfo.birthDate || 'Sélectionner une date'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={(() => {
                                    if (editedInfo.birthDate) {
                                        const m = String(editedInfo.birthDate).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                                        if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
                                    }
                                    return new Date();
                                })()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={(event: any, selectedDate?: Date) => {
                                    // keep picker open on iOS until user dismisses
                                    setShowDatePicker(Platform.OS === 'ios');
                                    if (selectedDate) {
                                        const dd = String(selectedDate.getDate()).padStart(2, '0');
                                        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
                                        const yyyy = selectedDate.getFullYear();
                                        const formatted = `${dd}/${mm}/${yyyy}`;
                                        handleInputChange('birthDate', formatted);
                                    }
                                }}
                            />
                        )}
                        
                        <Text style={modalStyles.label}>Âge</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Âge"
                            value={editedInfo.age.toString()}
                            onChangeText={(text: string) => handleInputChange('age', parseInt(text) || 0)}
                            keyboardType="numeric"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Poids</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="ex: 70 kg"
                            value={editedInfo.weight}
                            onChangeText={(text: string) => handleInputChange('weight', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Taille</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="ex: 180 cm"
                            value={editedInfo.height}
                            onChangeText={(text: string) => handleInputChange('height', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <CustomPicker
                            label="Groupe sanguin"
                            selectedValue={editedInfo.bloodType}
                            onValueChange={(value: string) => handleInputChange('bloodType', String(value))}
                            options={bloodTypes.map(type => ({ label: type, value: type }))}
                            placeholder="Sélectionner un groupe sanguin"
                        />
                        
                        <Text style={modalStyles.label}>Téléphone</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="06 12 34 56 78"
                            value={editedInfo.phone}
                            onChangeText={(text: string) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Email</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="email@exemple.com"
                            value={editedInfo.email}
                            onChangeText={(text: string) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Numéro de sécurité sociale</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="123-45-6789"
                            value={editedInfo.socialSecurityNumber}
                            onChangeText={(text: string) => handleInputChange('socialSecurityNumber', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Adresse</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Adresse complète"
                            value={editedInfo.address}
                            onChangeText={(text: string) => handleInputChange('address', text)}
                            multiline
                            numberOfLines={2}
                            placeholderTextColor={colors.inputBorder}
                        />

                        <Text style={modalStyles.label}>Contact d'urgence - Nom</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Nom du contact"
                            value={editedInfo.emergencyContactName}
                            onChangeText={(text: string) => handleInputChange('emergencyContactName', text)}
                            placeholderTextColor={colors.inputBorder}
                        />

                        <Text style={modalStyles.label}>Contact d'urgence - Téléphone</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Numéro de téléphone"
                            value={editedInfo.emergencyContactPhone}
                            onChangeText={(text: string) => handleInputChange('emergencyContactPhone', text)}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
                                <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Enregistrer</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(false)}>
                                <LinearGradient colors={['#666', '#999']} style={styles.gradient}>
                                    <Text style={styles.buttonText}>Annuler</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>
    );
}
