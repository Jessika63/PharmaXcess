import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Linking } from 'react-native';
import config from '../../config';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import createStyles from '../../styles/MyPrescriptions.style';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';
import { useProfile } from '../../context/ProfileContext';
import documentsApi from '../../utils/api/documents';
// Static imports to ensure the native modules are bundled at startup
import * as DocumentPicker from 'expo-document-picker';
// Use legacy FileSystem API to preserve documentDirectory/cacheDirectory and
// backwards-compatible functions (getInfoAsync, downloadAsync, copyAsync).
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

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
    docId?: number | string;
    status?: 'processing' | 'done' | 'failed';
};

// The Documents component displays and manages the user's medical documents
export default function Documents({ navigation }: DocumentsProps): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();
    const { currentProfile } = useProfile();
    const styles = createStyles(colors, fontScale);

    const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
    const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
    const pollingRefs = useRef<Record<string, number>>({});
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

    // Fetch documents from backend when profile changes
    React.useEffect(() => {
        const fetchDocs = async () => {
            if (!currentProfile) return;
            try {
                const res = await documentsApi.getDocuments(currentProfile.id as any);
                if (res.ok && Array.isArray(res.data)) {
                    // normalize backend fields to our Document type
                    const docs = (res.data as any[]).map(d => ({
                        id: `DOC${d.id}`,
                        docId: d.id,
                        name: d.title || d.filename,
                        type: 'Document patient',
                        dateAdded: d.date_ajout || d.dateAdded || new Date().toLocaleDateString('fr-FR'),
                        size: d.size ? `${(d.size / 1024).toFixed(1)} KB` : '—',
                        uri: `${d.filename}`,
                        status: d.status || 'done'
                    }));
                    setDocuments(docs as Document[]);
                }
            } catch (e) {
                console.warn('Failed to fetch documents', e);
            }
        };
        fetchDocs();
    }, [currentProfile]);

    // Function to handle adding a new document
    const handleAddDocument = () => {
        setShowAddDocumentModal(true);
    };

    // Function to simulate adding a document (kept as fallback)
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

    // Open the native document picker (statically imported so it's bundled at startup)
    const handleOpenDocumentPicker = async () => {
        try {
            const res = await (DocumentPicker as any).getDocumentAsync({ type: '*/*' });
            if (!res) {
                Alert.alert('Erreur', "Aucun résultat du sélecteur de fichiers.");
                return;
            }
            // Handle both old (type: 'success'|'cancel') and new (canceled:boolean, assets:[]) return shapes
            const isCanceled = (res.type && res.type === 'cancel') || (typeof res.canceled === 'boolean' && res.canceled === true);
            if (isCanceled) {
                Alert.alert(
                    'Sélection annulée',
                    "Aucun fichier sélectionné. Si tu es sur un émulateur, vérifie que le fichier est accessible, ou essaye sur un appareil réel."
                );
                return;
            }

            let fileName: string | undefined;
            let fileUri: string | undefined;
            let fileSizeBytes: number | undefined;

            if (res.assets && Array.isArray(res.assets) && res.assets.length > 0) {
                const asset = res.assets[0];
                fileName = asset.name || asset.fileName || asset.uri?.split('/')?.pop();
                fileUri = asset.uri;
                fileSizeBytes = asset.size || asset.fileSize;
            } else if (res.type && res.type === 'success') {
                // Old shape
                fileName = res.name;
                fileUri = res.uri;
                fileSizeBytes = res.size;
            } else if (res.uri) {
                // Fallback
                fileUri = res.uri;
                fileName = res.name || (res.uri ? res.uri.split('/').pop() : undefined);
            }

            try {
                Alert.alert('Fichier sélectionné', `${fileName || '–'}\n${fileUri || 'URI manquante'}`);
            } catch (e) {
                // ignore
            }

            const newDocument: Document = {
                id: `DOC${Date.now()}`,
                name: fileName || `Document - ${new Date().toLocaleDateString('fr-FR')}`,
                type: 'Document patient',
                dateAdded: new Date().toLocaleDateString('fr-FR'),
                size: fileSizeBytes ? `${(fileSizeBytes / 1024).toFixed(1)} KB` : '—',
                uri: fileUri || ''
            };
            setPreviewDocument(newDocument);
        } catch (err) {
            Alert.alert(
                'Erreur',
                "Ouverture du sélecteur de fichiers échouée. Assurez-vous d'avoir installé 'expo-document-picker' et relancez l'application.",
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Simuler la sélection', onPress: handleSimulateDocumentSelection }
                ]
            );
        }
    };

    // Function to confirm adding the document
    const handleAddDocumentSubmit = async () => {
        if (!previewDocument) return;
        // If we have a backend and a numeric profile id, upload
        if (currentProfile && (currentProfile as any).id && previewDocument.uri && previewDocument.uri.length > 0) {
            try {
                const fileObj = { uri: previewDocument.uri, name: previewDocument.name };

                // Close modal and inform user immediately; upload runs in background
                setPreviewDocument(null);
                setShowAddDocumentModal(false);
                Alert.alert('Info', "Document en cours d'upload. L'application fonctionne normalement pendant l'upload.");

                // Start upload in background (non-blocking)
                (async () => {
                    try {
                        const res = await documentsApi.uploadDocument((currentProfile as any).id, fileObj, previewDocument.name);
                        if (res.ok && res.data) {
                            const created = res.data;
                            const newDoc: Document = {
                                id: `DOC${created.id}`,
                                docId: created.id,
                                name: created.title || created.filename || previewDocument.name,
                                type: 'Document patient',
                                dateAdded: new Date().toLocaleDateString('fr-FR'),
                                size: created.size ? `${(created.size / 1024).toFixed(1)} KB` : previewDocument.size || '—',
                                uri: created.filename || previewDocument.uri
                            };
                            // Add to list now that backend confirmed upload
                            setDocuments(prev => [newDoc, ...prev]);
                            Alert.alert('Succès', 'Document ajouté avec succès !');
                        } else {
                            Alert.alert('Erreur', `Échec de l'upload: ${res.error || res.status}`);
                        }
                    } catch (err) {
                        console.warn('Background upload error', err);
                        Alert.alert('Erreur', 'Erreur lors de l\'upload du document en arrière-plan.');
                    }
                })();

                return;
            } catch (e) {
                console.warn('Upload error', e);
                Alert.alert('Erreur', 'Erreur lors de l\'upload du document.');
            }
        }

        // fallback local behaviour
        setDocuments(prev => [previewDocument, ...prev]);
        setPreviewDocument(null);
        setShowAddDocumentModal(false);
        Alert.alert('Succès', 'Document ajouté en local (pas d\'upload).');
    };

    // Function to cancel document addition
    const handleCancelAddDocument = () => {
        setPreviewDocument(null);
        setShowAddDocumentModal(false);
    };

    // Function to handle viewing a document
    const handleViewDocument = (document: Document) => {
        // If document is still being processed/uploaded, block interactions
        if (document.status === 'processing' || !document.docId) {
            Alert.alert('Enregistrement', 'Le document est en cours d\'enregistrement. Réessayez plus tard.');
            return;
        }

        // Show options: Close, Delete, Download
        Alert.alert(
            document.name,
            `Type: ${document.type}\nTaille: ${document.size}\nAjouté le: ${document.dateAdded}`,
            [
                { text: 'Fermer', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => {
                    // confirm deletion
                    Alert.alert(
                        'Confirmer la suppression',
                        `Voulez-vous vraiment supprimer "${document.name}" ?`,
                        [
                            { text: 'Non', style: 'cancel' },
                            { text: 'Oui', style: 'destructive', onPress: async () => {
                                try {
                                    const uid = (currentProfile as any)?.id;
                                    if (!uid || !document.docId) {
                                        Alert.alert('Erreur', 'Impossible de supprimer: identifiants manquants.');
                                        return;
                                    }
                                    const res = await documentsApi.deleteDocument(uid, document.docId as any);
                                    if (res.ok) {
                                        setDocuments(prev => prev.filter(d => d.docId !== document.docId && d.id !== document.id));
                                        Alert.alert('Supprimé', 'Le document a été supprimé.');
                                    } else {
                                        Alert.alert('Erreur', `Impossible de supprimer: ${res.error || res.status}`);
                                    }
                                } catch (err) {
                                    console.warn('Delete error', err);
                                    Alert.alert('Erreur', 'Erreur lors de la suppression.');
                                }
                            }}
                        ]
                    );
                }},
                { 
                    text: 'Télécharger', 
                    onPress: () => handleDownloadDocument(document)
                }
            ]
        );
    };

    // Function to handle downloading a document
    const handleDownloadDocument = (document: Document) => {
        // If we have a docId and backend url, try to download via FileSystem + Sharing (works without external browser)
        const uid = (currentProfile as any)?.id;
        if (document.docId && uid) {
            const url = `${config.backendUrl.replace(/\/$/, '')}/documents/${uid}/${document.docId}`;
            (async () => {
                try {
                    const filename = document.name ? document.name.replace(/[^a-z0-9.\-_]/gi, '_') : `document_${document.docId}`;
                    const baseDir = (FileSystem as any)?.documentDirectory ?? (FileSystem as any)?.cacheDirectory ?? '';
                    if (!baseDir) {
                        console.warn('No writable directory available from FileSystem:', FileSystem);
                        // fallback to opening URL
                        Linking.openURL(url).catch((linkErr) => {
                            console.error('Linking.openURL failed:', linkErr);
                            Alert.alert('Erreur', 'Impossible de télécharger le document (aucun répertoire disponible).');
                        });
                        return;
                    }

                    const localPath = `${baseDir}${filename}`;
                    console.log('Downloading document from url:', url, 'to', localPath);

                    // Try downloadAsync (fast native download)
                        try {
                            // Prefer module's downloadAsync (some builds may use different shapes)
                            const downloadFn = (FileSystem as any)?.downloadAsync ?? (FileSystem as any)?.downloadResumable;
                            if (typeof downloadFn === 'function') {
                                const dl = await downloadFn(url, localPath);
                                const savedUri = dl?.uri || (dl && dl._downloadedFileUri) || null;
                                if (savedUri) {
                                    // Ask the user where to save: Téléchargements or Stockage interne (app)
                                    Alert.alert(
                                        'Téléchargé',
                                        `Fichier téléchargé: ${savedUri}\nOù souhaitez-vous l'enregistrer ?`,
                                        [
                                            { text: 'Annuler', style: 'cancel' },
                                            {
                                                text: 'Téléchargements',
                                                onPress: async () => {
                                                    try {
                                                        const dest = `file:///sdcard/Download/${filename}`;
                                                        await FileSystem.copyAsync({ from: savedUri, to: dest });
                                                        Alert.alert('Enregistré', `Fichier enregistré dans Téléchargements: ${dest}`);
                                                    } catch (copyErr) {
                                                            console.warn('Copy to downloads failed', copyErr);
                                                            // If copying to Downloads failed, try saving to gallery (for images) using expo-media-library
                                                            try {
                                                                const permission = await (MediaLibrary as any).requestPermissionsAsync();
                                                                if (permission && permission.granted) {
                                                                    const asset = await (MediaLibrary as any).createAssetAsync(savedUri);
                                                                    try {
                                                                        const album = await (MediaLibrary as any).getAlbumAsync('Download');
                                                                        if (album) {
                                                                            await (MediaLibrary as any).addAssetsToAlbumAsync([asset], album.id, false);
                                                                        } else {
                                                                            await (MediaLibrary as any).createAlbumAsync('Download', asset, false);
                                                                        }
                                                                        Alert.alert('Enregistré', 'Fichier enregistré dans la galerie (album Download).');
                                                                    } catch (albErr) {
                                                                        console.warn('Unable to create/add album', albErr);
                                                                        Alert.alert('Enregistré', `Fichier enregistré dans la galerie.`);
                                                                    }
                                                                    return;
                                                                }
                                                            } catch (mlErr) {
                                                                console.warn('Media library fallback failed', mlErr);
                                                            }
                                                            Alert.alert('Erreur', 'Impossible d\'écrire dans Téléchargements. Vérifiez les permissions.');
                                                    }
                                                }
                                            },
                                            {
                                                text: 'Stockage interne',
                                                onPress: () => {
                                                    Alert.alert('Enregistré', `Fichier disponible: ${savedUri}`);
                                                }
                                            }
                                        ]
                                    );
                                    return;
                                }
                            } else {
                                console.warn('FileSystem download function not available on module:', FileSystem);
                            }
                        } catch (e) {
                            console.warn('downloadAsync failed:', e);
                        }

                    // Fallback: open in browser (simpler and more reliable than manual base64 write)
                    Linking.openURL(url).catch((linkErr) => {
                        console.error('Linking.openURL failed:', linkErr);
                        Alert.alert('Erreur', 'Impossible de télécharger ou d\'ouvrir le document.');
                    });
                    return;
                } catch (err) {
                    // Show detailed error to help diagnose import/runtime failures
                    console.error('Download module import error', err);
                    Alert.alert(
                        'Module manquant / Erreur',
                        `Erreur lors de l'import ou de l'utilisation des modules natifs:\n${String(err)}\n\nPour télécharger les documents, installez 'expo-file-system' et 'expo-sharing' dans le dossier mobile et relancez l'app:\n\nexpo install expo-file-system expo-sharing`,
                        [{ text: 'OK' }]
                    );
                }
            })();
            return;
        }

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
                                    onPress={handleOpenDocumentPicker}
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