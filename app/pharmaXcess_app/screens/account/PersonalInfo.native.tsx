import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextStyle, StyleProp, ViewStyle, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileChat.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
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
    emergencyContact: string;
};


// The PersonalInfo component displays the personal information of a patient, allowing them to view and modify their details.
export default function PersonalInfo({ navigation }: PersonalInfoProps) : React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const styles = createStyles(colors, fontScale);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [patientInfo, setPatientInfo] = useState<PatientInfo>({
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
        emergencyContact: 'Jane Doe, 06 12 34 56 79',
    });

    const [editedInfo, setEditedInfo] = useState<PatientInfo>(patientInfo);

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
        emergencyContact: 'Contact d\'urgence',
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const handleModifyPress = (): void => {
        setEditedInfo({ ...patientInfo });
        setIsModalVisible(true);
    };

    const handleSaveChanges = (): void => {
        if (!editedInfo.name || !editedInfo.email || !editedInfo.phone) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }
        setPatientInfo({ ...editedInfo });
        setIsModalVisible(false);
        Alert.alert('Succès', 'Vos informations ont été mises à jour.');
    };

    const handleInputChange = (field: keyof PatientInfo, value: string | number): void => {
        setEditedInfo(prev => ({ ...prev, [field]: value }));
    };

    // Styles locaux pour le modal
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
            <View style={[styles.buttonContainer, { marginBottom: 20 }]}>
                <TouchableOpacity style={styles.button} onPress={handleModifyPress}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Modifier</Text>
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
                        <Text style={modalStyles.modalTitle}>Modifier mes informations</Text>
                        
                        <Text style={modalStyles.label}>Nom complet</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Nom complet"
                            value={editedInfo.name}
                            onChangeText={(text) => handleInputChange('name', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Date de naissance</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="DD/MM/YYYY"
                            value={editedInfo.birthDate}
                            onChangeText={(text) => handleInputChange('birthDate', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Âge</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Âge"
                            value={editedInfo.age.toString()}
                            onChangeText={(text) => handleInputChange('age', parseInt(text) || 0)}
                            keyboardType="numeric"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Poids</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="ex: 70 kg"
                            value={editedInfo.weight}
                            onChangeText={(text) => handleInputChange('weight', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Taille</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="ex: 180 cm"
                            value={editedInfo.height}
                            onChangeText={(text) => handleInputChange('height', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <CustomPicker
                            label="Groupe sanguin"
                            selectedValue={editedInfo.bloodType}
                            onValueChange={(value) => handleInputChange('bloodType', String(value))}
                            options={bloodTypes.map(type => ({ label: type, value: type }))}
                            placeholder="Sélectionner un groupe sanguin"
                        />
                        
                        <Text style={modalStyles.label}>Téléphone</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="06 12 34 56 78"
                            value={editedInfo.phone}
                            onChangeText={(text) => handleInputChange('phone', text)}
                            keyboardType="phone-pad"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Email</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="email@exemple.com"
                            value={editedInfo.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Numéro de sécurité sociale</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="123-45-6789"
                            value={editedInfo.socialSecurityNumber}
                            onChangeText={(text) => handleInputChange('socialSecurityNumber', text)}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Adresse</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Adresse complète"
                            value={editedInfo.address}
                            onChangeText={(text) => handleInputChange('address', text)}
                            multiline
                            numberOfLines={2}
                            placeholderTextColor={colors.inputBorder}
                        />
                        
                        <Text style={modalStyles.label}>Contact d'urgence</Text>
                        <TextInput
                            style={modalStyles.input}
                            placeholder="Nom, numéro de téléphone"
                            value={editedInfo.emergencyContact}
                            onChangeText={(text) => handleInputChange('emergencyContact', text)}
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
