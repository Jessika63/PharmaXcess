import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useFontScale } from '../../context/FontScaleContext';

// Guide utilisateur textuel de l'application PharmaXcess
export default function TextualUserGuide(): React.JSX.Element {
    const { colors } = useTheme();
    const { fontScale } = useFontScale();

    const styles = StyleSheet.create({
        container: {
            flexGrow: 1,
            backgroundColor: colors.background,
            padding: 20,
        },
        title: {
            fontSize: 24 * fontScale,
            fontWeight: 'bold',
            color: colors.headerText,
            marginBottom: 20,
            textAlign: 'center',
        },
        sectionTitle: {
            fontSize: 20 * fontScale,
            fontWeight: 'bold',
            color: colors.primary,
            marginTop: 20,
            marginBottom: 10,
        },
        subSectionTitle: {
            fontSize: 18 * fontScale,
            fontWeight: '600',
            color: colors.headerText,
            marginTop: 15,
            marginBottom: 8,
        },
        subSubSectionTitle: {
            fontSize: 16 * fontScale,
            fontWeight: '600',
            color: colors.textSecondary,
            marginTop: 10,
            marginBottom: 5,
        },
        paragraph: {
            fontSize: 14 * fontScale,
            color: colors.textSecondary,
            marginBottom: 10,
            lineHeight: 22,
        },
        listItem: {
            fontSize: 14 * fontScale,
            color: colors.textSecondary,
            marginLeft: 15,
            marginBottom: 5,
            lineHeight: 22,
        },
    });

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Guide Utilisateur{'\n'}Application PharmaXcess</Text>
            <Text style={styles.paragraph}>
                Ce guide décrit les fonctionnalités de l'application mobile PharmaXcess pour les patients et les professionnels de santé.
            </Text>

            <Text style={styles.sectionTitle}>Sommaire</Text>
            <Text style={styles.listItem}>1. Gestion du Compte</Text>
            <Text style={styles.listItem}>2. Gestion du Profil Patient</Text>
            <Text style={styles.listItem}>3. Gestion des Ordonnances et Rappels</Text>
            <Text style={styles.listItem}>4. Click & Collect et Localisation</Text>
            <Text style={styles.listItem}>5. Support Utilisateur (Chat/Tickets)</Text>
            <Text style={styles.listItem}>6. Accessibilité et Interface Utilisateur</Text>

            <Text style={styles.sectionTitle}>1. Gestion du Compte</Text>
            <Text style={styles.paragraph}>
                Cette section explique comment vous connecter et créer votre compte.
            </Text>

            <Text style={styles.subSectionTitle}>1.1 Création et Connexion (Patient)</Text>
            <Text style={styles.paragraph}>Pour créer un compte patient :</Text>
            <Text style={styles.listItem}>1. Ouvrez l'application et sélectionnez "S'inscrire".</Text>
            <Text style={styles.listItem}>2. Choisissez "Patient" comme type de compte.</Text>
            <Text style={styles.listItem}>3. Entrez votre email et votre mot de passe, puis cliquez sur "S'inscrire".</Text>

            <Text style={styles.paragraph}>Pour vous connecter en tant que patient :</Text>
            <Text style={styles.listItem}>1. Ouvrez l'application et choisissez "Patient" comme type de compte.</Text>
            <Text style={styles.listItem}>2. Entrez votre email et mot de passe, puis cliquez sur "Se connecter".</Text>
            <Text style={styles.paragraph}>
                Vous pouvez également vous déconnecter via le menu de l'application.
            </Text>

            <Text style={styles.subSectionTitle}>1.2 Création et Connexion (Professionnel de Santé)</Text>
            <Text style={styles.paragraph}>Pour créer un compte professionnel :</Text>
            <Text style={styles.listItem}>1. Ouvrez l'application et sélectionnez "S'inscrire".</Text>
            <Text style={styles.listItem}>2. Choisissez "Professionnel de santé" comme type de compte.</Text>
            <Text style={styles.listItem}>3. Entrez votre email et votre mot de passe, puis cliquez sur "S'inscrire".</Text>

            <Text style={styles.paragraph}>Pour vous connecter en tant que professionnel :</Text>
            <Text style={styles.listItem}>1. Ouvrez l'application et choisissez "Professionnel de santé" comme type de compte.</Text>
            <Text style={styles.listItem}>2. Entrez votre email et mot de passe, puis cliquez sur "Se connecter".</Text>
            <Text style={styles.paragraph}>
                Vous pouvez également vous déconnecter via le menu de l'application.
            </Text>

            <Text style={styles.sectionTitle}>2. Gestion du Profil Patient</Text>
            <Text style={styles.paragraph}>
                Une fois connecté en tant que patient, vous pouvez gérer toutes vos informations de santé.
            </Text>

            <Text style={styles.subSectionTitle}>2.1 Compléter le Profil Principal</Text>
            <Text style={styles.paragraph}>
                Vous pouvez ajouter et mettre à jour vos informations personnelles de base :
            </Text>
            <Text style={styles.listItem}>1. Allez à la page "Profil" (icône de personne).</Text>
            <Text style={styles.listItem}>2. Cliquez sur l'onglet "Mes informations".</Text>
            <Text style={styles.listItem}>3. Appuyez sur "Modifier".</Text>
            <Text style={styles.listItem}>4. Remplissez les informations et cliquez sur "Sauvegarder".</Text>

            <Text style={styles.subSectionTitle}>2.2 Compléter le Profil Médical</Text>
            <Text style={styles.paragraph}>
                Cette section vous permet d'ajouter toutes les informations liées à votre santé :
            </Text>
            <Text style={styles.listItem}>1. Allez à la page "Profil" (icône de personne).</Text>
            <Text style={styles.listItem}>2. Cliquez sur l'onglet d'information que vous souhaitez modifier (par exemple : Maladies, Traitements, Allergies, Documents, etc.).</Text>
            <Text style={styles.listItem}>3. Appuyez sur "Ajouter".</Text>
            <Text style={styles.listItem}>4. Remplissez les informations et cliquez sur "Sauvegarder".</Text>

            <Text style={styles.subSectionTitle}>2.3 Gestion des Sous-profils</Text>
            <Text style={styles.paragraph}>
                Vous pouvez gérer des profils additionnels (par exemple, pour vos enfants ou des proches) :
            </Text>

            <Text style={styles.subSubSectionTitle}>Créer un sous-profil</Text>
            <Text style={styles.listItem}>1. Allez à la page "Profil".</Text>
            <Text style={styles.listItem}>2. Cliquez sur "Mon profil".</Text>
            <Text style={styles.listItem}>3. Appuyez sur le bouton "Ajouter un profil".</Text>
            <Text style={styles.listItem}>4. Remplissez les informations et cliquez sur "Sauvegarder".</Text>

            <Text style={styles.subSubSectionTitle}>Basculer entre les profils</Text>
            <Text style={styles.listItem}>1. Allez à la page "Profil".</Text>
            <Text style={styles.listItem}>2. Assurez-vous d'être sur le profil principal.</Text>
            <Text style={styles.listItem}>3. Cliquez sur le bouton "Profil" en haut de la page.</Text>
            <Text style={styles.listItem}>4. Sélectionnez le sous-profil souhaité.</Text>

            <Text style={styles.subSectionTitle}>2.4 Partage de Profil</Text>
            <Text style={styles.paragraph}>
                Vous pouvez partager vos informations de profil avec un professionnel de santé de manière sécurisée :
            </Text>
            <Text style={styles.listItem}>1. Allez à la page "Profil" (icône de personne).</Text>
            <Text style={styles.listItem}>2. Cliquez sur le bouton QR code (icône de QR code). Le professionnel pourra scanner ce code.</Text>

            <Text style={styles.sectionTitle}>3. Gestion des Ordonnances et Rappels</Text>
            <Text style={styles.paragraph}>
                Gérez vos prescriptions et ne manquez jamais une prise de médicament ou un renouvellement.
            </Text>

            <Text style={styles.subSectionTitle}>3.1 Capture d'Ordonnance</Text>
            <Text style={styles.subSubSectionTitle}>Ajouter une ordonnance</Text>
            <Text style={styles.listItem}>1. Sur la page "Accueil", appuyez sur "Mes ordonnances".</Text>
            <Text style={styles.listItem}>2. Cliquez sur "Ajouter".</Text>
            <Text style={styles.listItem}>3. Prenez une photo claire de votre ordonnance.</Text>
            <Text style={styles.listItem}>4. Appuyez sur "Valider".</Text>
            <Text style={styles.paragraph}>
                Si la photo est non valide ou floue, le système vous en informera et la photo sera refusée.
            </Text>

            <Text style={styles.subSectionTitle}>3.2 Rappels</Text>
            <Text style={styles.subSubSectionTitle}>Rappel de renouvellement d'ordonnance</Text>
            <Text style={styles.listItem}>1. Sur la page "Accueil", appuyez sur "Rappel ordonnance".</Text>
            <Text style={styles.listItem}>2. Cliquez sur "Ajouter".</Text>
            <Text style={styles.listItem}>3. Remplissez les détails du renouvellement.</Text>
            <Text style={styles.listItem}>4. Appuyez sur "Valider".</Text>

            <Text style={styles.subSubSectionTitle}>Rappel de prise de médicament</Text>
            <Text style={styles.listItem}>1. Sur la page "Accueil", appuyez sur "Rappel médicaments".</Text>
            <Text style={styles.listItem}>2. Cliquez sur "Ajouter".</Text>
            <Text style={styles.listItem}>3. Remplissez les détails de la prise de médicament.</Text>
            <Text style={styles.listItem}>4. Appuyez sur "Valider".</Text>

            <Text style={styles.sectionTitle}>4. Click & Collect et Localisation</Text>
            <Text style={styles.paragraph}>
                Utilisez l'application pour interagir avec les pharmacies et trouver des distributeurs.
            </Text>

            <Text style={styles.subSectionTitle}>4.1 Envoi d'Ordonnance au Pharmacien</Text>
            <Text style={styles.subSubSectionTitle}>Envoyer une ordonnance pour examen</Text>
            <Text style={styles.listItem}>1. Allez à la page "Click & Collect" (icône de panier).</Text>
            <Text style={styles.listItem}>2. Cliquez sur "Prendre une ordonnance en photo".</Text>
            <Text style={styles.listItem}>3. Capturez la photo et appuyez sur "Valider". Le pharmacien recevra l'ordonnance.</Text>

            <Text style={styles.subSubSectionTitle}>Validation ou Refus par le pharmacien</Text>
            <Text style={styles.listItem}>• Le pharmacien peut examiner l'ordonnance (via "Voir l'ordonnance") et la "Valider".</Text>
            <Text style={styles.listItem}>• Le pharmacien peut également "Refuser" l'ordonnance s'il y a un problème, et devra fournir une raison (un commentaire) à l'utilisateur.</Text>

            <Text style={styles.subSectionTitle}>4.2 Localisation et Itinéraire</Text>
            <Text style={styles.subSubSectionTitle}>Trouver un distributeur ou une pharmacie</Text>
            <Text style={styles.listItem}>1. Allez à la page "Localisation" (icône de broche).</Text>
            <Text style={styles.listItem}>2. La carte affichera les distributeurs de médicaments et les pharmacies à proximité de votre position.</Text>

            <Text style={styles.subSubSectionTitle}>Générer un itinéraire</Text>
            <Text style={styles.listItem}>1. Sur la page "Localisation", cliquez sur une pharmacie/un distributeur.</Text>
            <Text style={styles.listItem}>2. Sélectionnez votre moyen de transport.</Text>
            <Text style={styles.listItem}>3. Cliquez sur "Y aller" pour lancer l'itinéraire.</Text>

            <Text style={styles.subSubSectionTitle}>Scanner le QR code du distributeur</Text>
            <Text style={styles.listItem}>1. Sur la page "Localisation", cliquez sur le bouton QR code.</Text>
            <Text style={styles.listItem}>2. Scannez le QR code affiché sur l'écran du distributeur pour interagir avec lui.</Text>

            <Text style={styles.sectionTitle}>5. Support Utilisateur (Chat/Tickets)</Text>
            <Text style={styles.paragraph}>
                Vous pouvez demander de l'aide et, si vous êtes un professionnel, répondre aux demandes.
            </Text>

            <Text style={styles.subSectionTitle}>5.1 Créer un ticket de support (Utilisateur)</Text>
            <Text style={styles.listItem}>1. Allez à la page "Chat" (icône de bulle de discussion).</Text>
            <Text style={styles.listItem}>2. Appuyez sur "Ouvrir un ticket".</Text>
            <Text style={styles.listItem}>3. Remplissez les informations décrivant votre problème.</Text>
            <Text style={styles.listItem}>4. Appuyez sur "Confirmer".</Text>

            <Text style={styles.subSectionTitle}>5.2 Répondre et Fermer un ticket (Professionnel de Santé)</Text>
            <Text style={styles.listItem}>1. Allez à la page "Tickets" (icône de bulle de discussion).</Text>
            <Text style={styles.listItem}>2. Dans l'onglet "Tickets", cliquez sur un ticket et appuyez sur "Oui, m'assigner".</Text>
            <Text style={styles.listItem}>3. Allez à l'onglet "Mes conversations" et ouvrez la discussion.</Text>
            <Text style={styles.listItem}>4. Entrez votre message de réponse dans le champ de saisie et appuyez sur le bouton d'envoi (icône de flèche).</Text>
            <Text style={styles.listItem}>5. Pour fermer le ticket, cliquez sur le bouton permettant d'indiquer que le problème est résolu (par exemple, "Oui" si on vous demande si le problème est résolu, ou "Non" pour continuer la discussion).</Text>

            <Text style={styles.sectionTitle}>6. Accessibilité et Interface Utilisateur</Text>
            <Text style={styles.paragraph}>
                Des options d'affichage sont disponibles pour améliorer votre expérience utilisateur.
            </Text>

            <Text style={styles.subSectionTitle}>6.1 Guides d'Aide</Text>
            <Text style={styles.paragraph}>
                Vous avez accès à deux types de guides d'utilisation :
            </Text>
            <Text style={styles.subSubSectionTitle}>1. Guide textuel :</Text>
            <Text style={styles.listItem}>• Allez à la page "Profil" &gt; Bouton des paramètres (icône d'engrenage) &gt; "Aide et support" &gt; "Tutoriel" &gt; "Guide textuel".</Text>

            <Text style={styles.subSubSectionTitle}>2. Instruction vidéo via QR code :</Text>
            <Text style={styles.listItem}>• Allez à la page "Profil" &gt; Bouton des paramètres (icône d'engrenage) &gt; "Aide et support" &gt; "Tutoriel" &gt; "Guide vidéo". En scannant le QR code, vous accéderez à une instruction vidéo.</Text>

            <Text style={styles.subSectionTitle}>6.2 Réglages d'Affichage</Text>
            <Text style={styles.paragraph}>
                L'application est compatible avec les réglages de votre appareil pour un meilleur confort visuel.
            </Text>
            <Text style={styles.listItem}>• Mode Sombre : L'application adopte automatiquement le mode sombre si celui-ci est activé dans les paramètres de votre appareil.</Text>
            <Text style={styles.listItem}>• Agrandissement du texte : La taille du texte dans l'application s'ajuste si vous modifiez la taille du texte dans les paramètres de votre appareil pour une meilleure lisibilité.</Text>
            <Text style={styles.listItem}>• Accessibilité VoiceOver : L'application est entièrement compatible avec les fonctionnalités de lecture d'écran (VoiceOver) de votre appareil. Activez VoiceOver dans les paramètres de votre appareil et naviguez dans l'application à l'aide des gestes VoiceOver.</Text>
        </ScrollView>
    );
}
