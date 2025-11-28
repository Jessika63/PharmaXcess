import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, StyleProp, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ViewStyle, TextStyle } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import createStyles from '../../styles/ProfileInfos.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useProfileData } from '../../hooks/useProfileData';
import profileApi from '../../utils/api/profile';
import { CustomPicker } from '../../components';

type FamilyHistoryItem = {
    name: string;
    familyMember: string;
    severity: string;
    treatment: string;
};

type FamilyHistoryProps = {
    navigation: StackNavigationProp<any, any>;
};

// The FamilyHistory component allows users to view, add, and modify family medical history items.
export default function FamilyHistory({ navigation }: FamilyHistoryProps) : React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const { familyHistory: profileFamilyHistory, addFamilyHistory, removeFamilyHistory } = useProfileData();
    const styles = createStyles(colors, fontScale);

    const familyMembers = ['Père', 'Mère', 'Frère', 'Sœur', 'Grand-père paternel', 'Grand-mère paternelle', 'Grand-père maternel', 'Grand-mère maternelle', 'Oncle', 'Tante', 'Cousin(e)', 'Autre'];
    const severityLevels = ['Léger', 'Modéré', 'Sévère', 'Critique'];

    // Start empty: family history should be supplied by backend/profile
    const [familyHistory, setFamilyHistory] = useState<FamilyHistoryItem[]>([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newFamilyHistory, setNewFamilyHistory] = useState<FamilyHistoryItem>({
        name: '',
        familyMember: '',
        severity: '',
        treatment: '',
    });
    const [editedFamilyHistory, setEditedFamilyHistory] = useState<FamilyHistoryItem>({
        name: '',
        familyMember: '',
        severity: '',
        treatment: '',
    });

    // For simple family history addition by profile 
    const [newFamilyHistorySimple, setNewFamilyHistorySimple] = useState<string>('');

    // Simple family history management by profile 
    const handleAddSimpleFamilyHistory = async (): Promise<void> => {
        // For other profiles, we only require the name field but save all available data
        if (!newFamilyHistory.name.trim()) {
            Alert.alert('Erreur', 'Veuillez entrer le nom de l\'antécédent familial.');
            return;
        }

        // Create complete family history data even for other profiles
        const familyHistoryData = {
            name: newFamilyHistory.name.trim(),
            familyMember: newFamilyHistory.familyMember || familyMembers[0],
            severity: newFamilyHistory.severity || severityLevels[0],
            treatment: newFamilyHistory.treatment || ''
        };

        const success = await addFamilyHistory(JSON.stringify(familyHistoryData));
        if (success) {
            // Reset all fields
            setNewFamilyHistorySimple('');
            setNewFamilyHistory({
                name: '',
                familyMember: '',
                severity: '',
                treatment: '',
            });
            setIsModalVisible(false);
            Alert.alert('Succès', 'Antécédent familial ajouté avec succès.');
        } else {
            Alert.alert('Erreur', 'Cet antécédent familial est déjà enregistré ou une erreur est survenue.');
        }
    };

    const handleEditPress = (index: number): void => {
        const item = familyHistory[index];
        setEditedFamilyHistory({ ...item });
        setEditingIndex(index);
        setEditModalVisible(true);
    };

    const handleSaveEdit = (): void => {
        if (!editedFamilyHistory.name || !editedFamilyHistory.treatment) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        if (editingIndex !== null) {
            const target = familyHistory[editingIndex];
            const payload = {
                maladie: editedFamilyHistory.name,
                membre: editedFamilyHistory.familyMember,
                severite: editedFamilyHistory.severity,
                traitement: editedFamilyHistory.treatment,
            } as any;

            if (isMainProfile && (target as any).id) {
                (async () => {
                    const res = await profileApi.updateFamilyHistory((target as any).id, payload);
                    if (res.ok) {
                        const list = await profileApi.getFamilyHistory();
                        if (list.ok && Array.isArray(list.data)) {
                            const mapped = list.data.map((e: any) => ({ id: e.id, name: e.maladie || e.name || '', familyMember: e.membre || '', severity: e.severite || '', treatment: e.traitement || '' }));
                            setFamilyHistory(mapped as any[]);
                        }
                        setEditModalVisible(false);
                        setEditingIndex(null);
                        Alert.alert('Succès', 'Les informations de l\'antécédent familial ont été mises à jour.');
                        return;
                    }
                    Alert.alert('Erreur', 'Impossible de mettre à jour l\'antécédent familial.');
                })();
            } else {
                const updatedFamilyHistory = [...familyHistory];
                updatedFamilyHistory[editingIndex] = editedFamilyHistory;
                setFamilyHistory(updatedFamilyHistory);
                setEditModalVisible(false);
                setEditingIndex(null);
                Alert.alert('Succès', 'Les informations de l\'antécédent familial ont été mises à jour.');
            }
        }
    };

    const handleDeleteFamilyHistory = (index: number): void => {
        const item = familyHistory[index];
        Alert.alert(
            'Supprimer l\'antécédent familial',
            `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Supprimer', 
                    style: 'destructive',
                    onPress: () => {
                        (async () => {
                            if (isMainProfile && (item as any).id) {
                                const res = await profileApi.deleteFamilyHistory((item as any).id);
                                if (res.ok) {
                                    const list = await profileApi.getFamilyHistory();
                                    if (list.ok && Array.isArray(list.data)) {
                                        const mapped = list.data.map((e: any) => ({ id: e.id, name: e.maladie || e.name || '', familyMember: e.membre || '', severity: e.severite || '', treatment: e.traitement || '' }));
                                        setFamilyHistory(mapped as any[]);
                                    }
                                    return;
                                }
                                Alert.alert('Erreur', 'Impossible de supprimer l\'antécédent familial.');
                                return;
                            }
                            const updatedFamilyHistory = familyHistory.filter((_, i) => i !== index);
                            setFamilyHistory(updatedFamilyHistory);
                        })();
                    }
                }
            ]
        );
    };

    const handleRemoveFamilyHistory = async (familyHistoryItem: string): Promise<void> => {
        Alert.alert(
            'Confirmer la suppression',
            `Êtes-vous sûr de vouloir supprimer "${familyHistoryItem}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await removeFamilyHistory(familyHistoryItem);
                        if (success) {
                            Alert.alert('Succès', 'Antécédent familial supprimé avec succès.');
                        } else {
                            Alert.alert('Erreur', 'Impossible de supprimer l\'antécédent familial.');
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
            title: 'Antécédents familiaux',
        });
    }, [navigation]);

    // Determine if it's the main profile 
    const isMainProfile = currentProfile?.name === 'Profil de base' || currentProfile?.relationship === 'self';

    // Load family history from backend when this is a server-backed profile
    React.useEffect(() => {
        const load = async () => {
            if (!currentProfile) return;
            const numericCandidate = Number(currentProfile.id);
            const isServerProfileLocal = !Number.isNaN(numericCandidate) && String(numericCandidate) === String(currentProfile.id);
            if (isServerProfileLocal) {
                const res = await profileApi.getFamilyHistory();
                if (res.ok && Array.isArray(res.data)) {
                    const mapped = res.data.map((e: any) => ({
                        id: e.id,
                        name: e.maladie || e.name || '',
                        familyMember: e.membre || e.familyMember || '',
                        severity: e.severite || e.severity || '',
                        treatment: e.traitement || e.treatment || '',
                    }));
                    setFamilyHistory(mapped);
                }
            } else {
                // fallback to profileFamilyHistory
                if (Array.isArray(profileFamilyHistory) && profileFamilyHistory.length > 0) {
                    try {
                        const mapped = profileFamilyHistory.map((a: any) => {
                            if (typeof a === 'string') {
                                try { const p = JSON.parse(a); return { id: p.id || undefined, name: p.name || p.maladie || p, familyMember: p.familyMember || p.membre || '', severity: p.severity || p.severite || '', treatment: p.treatment || p.traitement || '' }; } catch { return { name: a, familyMember: '', severity: '', treatment: '' }; }
                            }
                            return { id: a.id || undefined, name: a.name || a.maladie || '', familyMember: a.familyMember || a.membre || '', severity: a.severity || a.severite || '', treatment: a.treatment || a.traitement || '' };
                        });
                        setFamilyHistory(mapped as any[]);
                    } catch (e) { /* ignore */ }
                }
            }
        };
        load();
    }, [currentProfile?.id]);

    const handleAddPress = (): void => {
        if (!newFamilyHistory.name || !newFamilyHistory.treatment) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const finalFamilyHistory = {
            ...newFamilyHistory,
            familyMember: newFamilyHistory.familyMember || familyMembers[0],
            severity: newFamilyHistory.severity || severityLevels[0]
        };

        if (isMainProfile) {
            (async () => {
                const success = await addFamilyHistory(JSON.stringify(finalFamilyHistory));
                if (success) {
                    const res = await profileApi.getFamilyHistory();
                    if (res.ok && Array.isArray(res.data)) {
                        const mapped = res.data.map((e: any) => ({ id: e.id, name: e.maladie || e.name || '', familyMember: e.membre || '', severity: e.severite || '', treatment: e.traitement || '' }));
                        setFamilyHistory(mapped as any[]);
                    }
                    setNewFamilyHistory({ name: '', familyMember: '', severity: '', treatment: '' });
                    setIsModalVisible(false);
                    Alert.alert('Succès', 'Antécédent familial ajouté avec succès.');
                } else {
                    Alert.alert('Erreur', 'Cet antécédent est déjà enregistré ou une erreur est survenue.');
                }
            })();
        } else {
            setFamilyHistory([...familyHistory, finalFamilyHistory]);
            setNewFamilyHistory({ name: '', familyMember: '', severity: '', treatment: '' });
            setIsModalVisible(false);
        }
    };

    return (
        <View style={[styles.container, { flex: 1 }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
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

                {/* Conditional display based on profile */}
                {isMainProfile ? (
                    // For the main profile: predefined complex cards
                    <>
                        {familyHistory.map((item, index) => (
                            <View key={index} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>{item.name}</Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity onPress={() => handleEditPress(index)} style={styles.editButton}>
                                            <Ionicons name="create-outline" size={25} color={colors.iconPrimary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteFamilyHistory(index)} style={styles.deleteButton}>
                                            <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.cardText}>
                                    <Text style={styles.bold}>Membre de la famille: </Text>
                                    {item.familyMember}
                                </Text>
                                <Text style={styles.cardText}>
                                    <Text style={styles.bold}>Sévérité: </Text>
                                    {item.severity}
                                </Text>
                                <Text style={styles.cardText}>
                                    <Text style={styles.bold}>Traitement: </Text>
                                    {item.treatment}
                                </Text>
                            </View>
                        ))}
                    </>
                ) : (
                    // For other profiles: full family history display
                    <>
                        {profileFamilyHistory && profileFamilyHistory.length > 0 ? (
                            <>
                                {profileFamilyHistory.map((familyHistoryString, index) => {
                                    // Parse family history data (could be JSON string or simple name)
                                    let item: FamilyHistoryItem;
                                    try {
                                        item = JSON.parse(familyHistoryString);
                                    } catch {
                                        // Fallback for simple string names
                                        item = {
                                            name: familyHistoryString,
                                            familyMember: '',
                                            severity: '',
                                            treatment: ''
                                        };
                                    }
                                    
                                    return (
                                        <View key={index} style={styles.card}>
                                            <View style={styles.cardHeader}>
                                                <Text style={styles.cardTitle}>{item.name}</Text>
                                                <View style={styles.actionButtons}>
                                                    <TouchableOpacity onPress={() => handleRemoveFamilyHistory(familyHistoryString)} style={styles.deleteButton}>
                                                        <Ionicons name="trash-outline" size={25} color="#FF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {item.familyMember && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Membre de la famille: </Text>
                                                    {item.familyMember}
                                                </Text>
                                            )}
                                            {item.severity && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Sévérité: </Text>
                                                    {item.severity}
                                                </Text>
                                            )}
                                            {item.treatment && (
                                                <Text style={styles.cardText}>
                                                    <Text style={styles.bold}>Traitement: </Text>
                                                    {item.treatment}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </>
                        ) : (
                            <View style={[styles.card, { marginBottom: 20, alignItems: 'center', padding: 40 }]}> 
                                <Ionicons name="medical-outline" size={48} color={colors.iconPrimary} style={{ marginBottom: 15 }} />
                                <Text style={[styles.cardText, { textAlign: 'center', marginTop: 20 }]}>
                                    Aucun antécédent familial enregistré pour ce profil.
                                </Text>
                                <Text style={[styles.cardText, { textAlign: 'center', opacity: 0.7 }]}> 
                                    Ajoutez vos antécédents familiaux pour un meilleur suivi médical
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setIsModalVisible(true)}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Ajouter</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                    <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                        <Text style={styles.buttonText}>Retour</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <Modal animationType="slide" visible={isModalVisible}>
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <Text style={styles.modalTitle}>Ajouter un antécédent familial</Text>
                    
                    <TextInput
                        placeholder="Nom de la maladie"
                        value={isMainProfile ? newFamilyHistory.name : newFamilyHistorySimple}
                        onChangeText={(text: string) => {
                            if (isMainProfile) {
                                setNewFamilyHistory({ ...newFamilyHistory, name: text })
                            } else {
                                setNewFamilyHistorySimple(text);
                                // For other profiles, also update newFamilyHistory.name for consistency
                                setNewFamilyHistory({ ...newFamilyHistory, name: text });
                            }
                        }}
                        style={styles.input}
                    />
                    
                    <View style={{ width: '100%' }}>
                        <CustomPicker
                            label="Membre de la famille"
                            selectedValue={newFamilyHistory.familyMember || familyMembers[0]}
                            onValueChange={(value: string | number) => setNewFamilyHistory({ ...newFamilyHistory, familyMember: String(value) })}
                            options={familyMembers.map(member => ({ 
                                label: member, 
                                value: member 
                            }))}
                            placeholder="Sélectionner un membre"
                        />
                    </View>
                    
                    <View style={{ width: '100%' }}>
                        <CustomPicker
                            label="Sévérité"
                            selectedValue={newFamilyHistory.severity || severityLevels[0]}
                            onValueChange={(value: string | number) => setNewFamilyHistory({ ...newFamilyHistory, severity: String(value) })}
                            options={severityLevels.map(level => ({ 
                                label: level, 
                                value: level 
                            }))}
                            placeholder="Sélectionner la sévérité"
                        />
                    </View>
                    
                    <TextInput
                        placeholder="Traitement"
                        value={newFamilyHistory.treatment}
                        onChangeText={(text: string) => setNewFamilyHistory({ ...newFamilyHistory, treatment: text })}
                        style={styles.input}
                    />
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={isMainProfile ? handleAddPress : handleAddSimpleFamilyHistory} style={styles.button}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Ajouter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setIsModalVisible(false);
                            // Reset all fields for both main and other profiles
                            setNewFamilyHistorySimple('');
                            setNewFamilyHistory({
                                name: '',
                                familyMember: '',
                                severity: '',
                                treatment: '',
                            });
                        }} style={styles.button}>
                            <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Annuler</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>

            <Modal visible={isEditModalVisible} animationType="slide">
                <ScrollView
                    contentContainerStyle={styles.modalContainer}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="automatic"
                >
                    <Text style={styles.modalTitle}>Modifier l'antécédent familial</Text>
                    
                    <TextInput
                        placeholder="Nom de la maladie"
                        value={editedFamilyHistory.name}
                        onChangeText={(text: string) => setEditedFamilyHistory({ ...editedFamilyHistory, name: text })}
                        style={styles.input}
                    />
                    
                    <View style={{ width: '100%' }}>
                        <CustomPicker
                            label="Membre de la famille"
                            selectedValue={editedFamilyHistory.familyMember}
                            onValueChange={(value: string | number) => setEditedFamilyHistory({ ...editedFamilyHistory, familyMember: String(value) })}
                            options={familyMembers.map(member => ({ 
                                label: member, 
                                value: member 
                            }))}
                            placeholder="Sélectionner un membre"
                        />
                    </View>
                    
                    <View style={{ width: '100%' }}>
                        <CustomPicker
                            label="Sévérité"
                            selectedValue={editedFamilyHistory.severity}
                            onValueChange={(value: string | number) => setEditedFamilyHistory({ ...editedFamilyHistory, severity: String(value) })}
                            options={severityLevels.map(level => ({ 
                                label: level, 
                                value: level 
                            }))}
                            placeholder="Sélectionner la sévérité"
                        />
                    </View>
                    
                    <TextInput
                        placeholder="Traitement"
                        value={editedFamilyHistory.treatment}
                        onChangeText={(text: string) => setEditedFamilyHistory({ ...editedFamilyHistory, treatment: text })}
                        style={styles.input}
                    />
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={handleSaveEdit} style={styles.button}>
                            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Sauvegarder</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setEditModalVisible(false);
                            setEditingIndex(null);
                            setEditedFamilyHistory({
                                name: '',
                                familyMember: '',
                                severity: '',
                                treatment: '',
                            });
                        }} style={styles.button}>
                            <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Annuler</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}