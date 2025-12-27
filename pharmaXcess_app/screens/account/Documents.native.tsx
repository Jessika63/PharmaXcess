import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';

type DocumentsProps = {
    navigation: StackNavigationProp<any, any>;
};

type Document = {
    id: string;
    name: string;
    type: string;
    dateAdded: string;
    size: string;
    uri: string;
};

// The Documents component displays and manages the user's medical documents
export default function Documents({ navigation }: DocumentsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    // Use documents from the backend-backed profile when available, otherwise start empty
    const [documents, setDocuments] = useState<Document[]>(() => {
        try {
            if (currentProfile && Array.isArray((currentProfile as any).documents)) {
                return (currentProfile as any).documents as Document[];
            }
        } catch (e) {
            // ignore and fall back to empty
        }
        return [] as Document[];
    });

    // Keep local state in sync when profile changes (e.g., loaded from backend)
    React.useEffect(() => {
        if (currentProfile && Array.isArray((currentProfile as any).documents)) {
            setDocuments((currentProfile as any).documents as Document[]);
        }
    }, [currentProfile]);

    // Function to handle adding a new document
    const handleAddDocument = () => {
        setShowAddDocumentModal(true);
    };

    // Function to simulate adding a document
    const handleSimulateDocumentSelection = () => {
        const newDocument: Document = {
            id: `DOC${Date.now()}`,
            name: `Nouveau document - ${new Date().toLocaleDateString('fr-FR')}`,
            type: 'Document patient',
            dateAdded: new Date().toLocaleDateString('fr-FR'),
            size: '1.5 MB',
            uri: `documents/nouveau_document_${Date.now()}.pdf`
        };
        
        setPreviewDocument(newDocument);
    };

    // Function to confirm adding the document
    const handleAddDocumentSubmit = () => {
        if (previewDocument) {
            setDocuments(prev => [previewDocument, ...prev]);
            setPreviewDocument(null);
            setShowAddDocumentModal(false);
            Alert.alert('Succès', 'Document ajouté avec succès !');
        }
    };

    // Function to cancel document addition
    const handleCancelAddDocument = () => {
        setPreviewDocument(null);
        setShowAddDocumentModal(false);
    };

    // Function to handle viewing a document
    const handleViewDocument = (document: Document) => {
        Alert.alert(
            document.name,
            `Type: ${document.type}\nTaille: ${document.size}\nAjouté le: ${document.dateAdded}`,
            [
                { text: 'Fermer', style: 'cancel' },
                { 
                    text: 'Télécharger', 
                    onPress: () => handleDownloadDocument(document)
                }
            ]
        );
    };

    // Function to handle downloading a document
    const handleDownloadDocument = (document: Document) => {
        Alert.alert(
            'Téléchargement',
            `Le document "${document.name}" sera téléchargé prochainement.`,
            [{ text: 'OK' }]
        );
    };

    // Function to render a document card
    const renderDocumentCard = (document: Document) => (
        <TouchableOpacity 
            key={document.id}
            style={styles.prescriptionCard}
            onPress={() => handleViewDocument(document)}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.prescriptionTitle}>{document.name}</Text>
                    <Text style={styles.prescriptionText}>Type: {document.type}</Text>
                    <Text style={styles.prescriptionText}>Ajouté le: {document.dateAdded}</Text>
                    <Text style={styles.prescriptionText}>Taille: {document.size}</Text>
                </View>
                <TouchableOpacity
                    style={{
                        backgroundColor: colors.editButtonBackground,
                        padding: 8,
                        borderRadius: 50
                    }}
                    onPress={() => handleViewDocument(document)}
                >
                    <Ionicons name="eye" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.prescriptionList}>
                {/* Documents List */}
                {documents.length > 0 ? (
                    documents.map(renderDocumentCard)
                ) : (
                    <View style={[styles.prescriptionCard, { alignItems: 'center', padding: 40 }]}>
                        <Ionicons name="folder-open-outline" size={60} color={colors.primary} />
                        <Text style={[styles.prescriptionTitle, { marginTop: 20, textAlign: 'center' }]}>
                            Aucun document
                        </Text>
                        <Text style={[styles.prescriptionText, { textAlign: 'center', marginTop: 10 }]}>
                            Commencez par ajouter votre premier document médical
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleAddDocument}>
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

            {/* Add Document Modal */}
            <Modal
                visible={showAddDocumentModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.container}>
                    <ScrollView contentContainerStyle={styles.prescriptionList}>
                        <View style={styles.prescriptionCard}>
                            <Text style={[styles.prescriptionTitle, { textAlign: 'center', marginBottom: 20 }]}>
                                Ajouter un document
                            </Text>
                            
                            {!previewDocument ? (
                                // File selection area
                                <TouchableOpacity 
                                    style={[styles.prescriptionCard, { 
                                        alignItems: 'center',
                                        borderStyle: 'dashed',
                                        borderWidth: 2,
                                        borderColor: colors.infoText,
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
                                    <Ionicons name="cloud-upload" size={50} color={colors.infoText} />
                                    <Text style={[styles.prescriptionTitle, { marginTop: 15, color: colors.infoText }]}>
                                        Parcourir les fichiers
                                    </Text>
                                    <Text style={[styles.prescriptionText, { textAlign: 'center', marginTop: 10 }]}>
                                        Formats acceptés: PDF, JPG, PNG
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                // Document preview
                                <View style={styles.prescriptionCard}>
                                    <Text style={[styles.prescriptionTitle, { textAlign: 'center', marginBottom: 15, color: colors.infoText }]}>
                                        Document sélectionné
                                    </Text>
                                    <View style={{ marginBottom: 15 }}>
                                        <Text style={styles.prescriptionTitle}>{previewDocument.name}</Text>
                                        <Text style={styles.prescriptionText}>Type: {previewDocument.type}</Text>
                                        <Text style={styles.prescriptionText}>Taille: {previewDocument.size}</Text>
                                    </View>
                                    <Text style={[styles.prescriptionText, { textAlign: 'center', fontStyle: 'italic', color: colors.infoText }]}>
                                        Appuyez sur "Ajouter" pour confirmer l'ajout de ce document
                                    </Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAddDocumentSubmit}
                            disabled={!previewDocument}
                        >
                            <LinearGradient 
                                colors={previewDocument ? [colors.primary, colors.secondary] : [colors.primary + '50', colors.secondary + '50']} 
                                style={styles.gradient}
                            >
                                <Text style={[styles.buttonText, { opacity: previewDocument ? 1 : 0.5 }]}>
                                    Ajouter
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.button}
                            onPress={handleCancelAddDocument}
                        >
                            <LinearGradient colors={[colors.textSecondary, colors.infoTextSecondary]} style={styles.gradient}>
                                <Text style={styles.buttonText}>Annuler</Text> 
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}