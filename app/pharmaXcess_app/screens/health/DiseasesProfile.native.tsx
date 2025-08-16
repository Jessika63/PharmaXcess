import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/CardGrid.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';

type DiseasesProps = { 
    navigation: StackNavigationProp<any, any>; 
}; 

export default function Diseases({ navigation }: DiseasesProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const { diseases, addDisease, removeDisease } = useProfileData();
    const styles = createStyles(colors, fontScale);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [newDisease, setNewDisease] = useState<string>('');

    const handleAddDisease = async (): Promise<void> => {
        if (!newDisease.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer le nom de la maladie.');
            return;
        }

        const success = await addDisease(newDisease.trim());
        if (success) {
            setNewDisease('');
            setModalVisible(false);
            Alert.alert('Succès', 'Maladie ajoutée avec succès.');
        } else {
            Alert.alert('Erreur', 'Cette maladie est déjà enregistrée ou une erreur est survenue.');
        }
    };

    const handleRemoveDisease = async (disease: string): Promise<void> => {
        Alert.alert(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer "${disease}" ?`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await removeDisease(disease);
                        if (success) {
                            Alert.alert('Succès', 'Maladie supprimée avec succès.');
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer la maladie.');
                        }
                    },
                },
            ]
        );
    };

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
            title: 'Maladies',
        });
    }, [navigation]);

    return ( 
        <View style={[styles.container, { flex: 1 }]}> 
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header for current profile */}
                {currentProfile && (
                    <View style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary + '10' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={[styles.cardText, { fontSize: 18, fontWeight: 'bold', color: colors.primary }]}>
                                    {currentProfile.name}
                                </Text>
                                <Text style={[styles.cardText, { fontSize: 14, opacity: 0.7 }]}>
                                    {getRelationshipText(currentProfile.relationship)}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => navigation.navigate('ProfileSelection')}>
                                <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View> 
                )} 

                {/* List of diseases */} 
                {diseases.length > 0 ? (
                    <View style={[styles.card, { marginBottom: 20}]}> 
                        <Text style={[styles.cardText, { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }]}> 
                            Maladies enregistrées ({diseases.length})
                        </Text>
                        {diseases.map((disease, index) => ( 
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.card, {
                                    marginBottom: 10, 
                                    backgroundColor: colors.background,
                                    borderWidth: 1,
                                    borderColor: colors.primary + '30'
                                }]}
                            >
                                <LinearGradient 
                                    colors={[colors.background, colors.background]} 
                                    style={[styles.cardGradient, { 
                                        flexDirection: 'row', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center' 
                                    }]}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.cardText, { fontSize: 16, fontWeight: 'bold' }]}>
                                            {disease}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => handleRemoveDisease(disease)}
                                        style={{ padding: 5 }}
                                    >
                                        <Ionicons name="close-circle" size={22} color="#ff6b6b" />
                                    </TouchableOpacity>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : ( 
                    <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                        <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                        <Text style={[styles.cardText, { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }]}> 
                            Aucune maladie enregistrée
                        </Text>
                        <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}> 
                            Ajoutez vos maladies pour un meilleur suivi médical
                        </Text>
                    </View>
                )}

                {/* Button to add a new disease */} 
                <TouchableOpacity 
                    onPress={() => setModalVisible(true)} 
                    style={[styles.card]}
                >
                    <LinearGradient 
                        colors={[colors.primary, colors.secondary]}
                        style={[styles.cardGradient, { alignItems: 'center', padding: 20 }]} 
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
                            <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 10 }} />
                            <Text style={[styles.cardText, { color: '#fff', fontWeight: 'bold', fontSize: 16 }]}>
                                Ajouter une maladie
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal to add a disease */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <View style={{
                        backgroundColor: colors.background,
                        borderRadius: 15,
                        padding: 20,
                        width: '100%',
                        maxWidth: 400
                    }}>
                        <Text style={[styles.cardText, { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }]}>
                            Ajouter une maladie
                        </Text>

                        <Text style={[styles.cardText, { marginBottom: 10 }]}>Nom de la maladie</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: colors.primary,
                                borderRadius: 10,
                                padding: 15,
                                marginBottom: 20,
                                fontSize: 16,
                                color: colors.text
                            }}
                            value={newDisease}
                            onChangeText={setNewDisease}
                            placeholder="Ex: Diabète, Hypertension, Asthme..."
                            placeholderTextColor={colors.text + '80'}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 10,
                                    backgroundColor: colors.secondary + '30',
                                    marginRight: 10,
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    setModalVisible(false);
                                    setNewDisease('');
                                }}
                            >
                                <Text style={{ color: colors.text, fontWeight: 'bold' }}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    flex: 1,
                                    padding: 15,
                                    borderRadius: 10,
                                    backgroundColor: colors.primary,
                                    marginLeft: 10,
                                    alignItems: 'center'
                                }}
                                onPress={handleAddDisease}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Ajouter</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    ); 
}