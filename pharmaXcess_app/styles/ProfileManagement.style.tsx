import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.profileText,
    },
    profileCard: {
        marginBottom: 15,
    },
    profileCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 50,
        height: 50,
        marginRight: 15,
        borderRadius: 25,
        borderWidth: 2,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.profileText,
    },
    profileRelationship: {
        fontSize: 14 * fontScale,
        opacity: 0.8,
        color: colors.profileText,
    },
    profileDate: {
        fontSize: 12 * fontScale,
        opacity: 0.6,
        color: colors.profileText,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginRight: 10,
    },
    relationshipIcon: {
        marginRight: 15,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
    },
    emptyIcon: {
        marginBottom: 15,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16 * fontScale,
        color: colors.profileText,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: colors.background,
        borderRadius: 15,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.profileText,
    },
    inputLabel: {
        marginBottom: 10,
        fontSize: 16 * fontScale,
        color: colors.profileText,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16 * fontScale,
        color: colors.profileText,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: 10,
        marginBottom: 20,
        overflow: 'hidden',
    },
    picker: {
        color: colors.profileText,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: colors.surface,
        marginRight: 10,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: colors.primary,
        marginLeft: 10,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16 * fontScale,
    },
    cancelButtonText: {
        color: colors.profileText,
    },
    saveButtonText: {
        color: '#FFFFFF',
    },
});

export default createStyles;
