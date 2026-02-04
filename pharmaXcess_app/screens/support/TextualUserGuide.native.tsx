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
            <Text style={styles.title}>Guide Utilisateur Application PharmaXcess</Text>
            <Text style={styles.paragraph}>
                Ce guide vous aidera à utiliser l'application PharmaXcess. Le contenu détaillé sera inséré ici.
            </Text>

            {/* Le contenu sera ajouté après que l'utilisateur fournisse le texte */}
            
        </ScrollView>
    );
}
