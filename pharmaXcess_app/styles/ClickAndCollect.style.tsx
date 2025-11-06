import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 20,
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        color: colors.headerText,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16 * fontScale,
        color: colors.headerText,
        opacity: 0.7,
        textAlign: 'center',
        marginTop: 5,
    },
    content: {
        flex: 1,
        padding: 15,
        paddingBottom: 100, // Space for floating buttons 
    },
    requestCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 15,
        shadowColor: colors.shadow || '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 5,
    },
    requestTime: {
        fontSize: 14 * fontScale,
        color: colors.infoText,
    },
    arrow: {
        marginLeft: 10,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        textAlign: 'center',
        marginTop: 20,
    },
    // Styles for request detail modal 
    detailModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    detailContent: {
        flex: 1,
        backgroundColor: colors.background,
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.card,
    },
    detailTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
    },
    closeButton: {
        padding: 5,
    },
    prescriptionContainer: {
        flex: 1,
        padding: 20,
    },
    prescriptionImage: {
        width: '100%',
        height: 400,
        borderRadius: 12,
        resizeMode: 'contain',
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 15,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    approveButton: {
        flex: 1,
        backgroundColor: colors.success || '#4CAF50',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.error || '#F44336',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
    // Styles for rejection modal 
    rejectModal: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rejectContent: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        margin: 20,
        width: '90%',
        borderWidth: 1,
        borderColor: colors.border,
    },
    rejectTitle: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 15,
        textAlign: 'center',
    },
    commentInput: {
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
        borderRadius: 8,
        padding: 15,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 16 * fontScale,
        color: colors.infoText,
        marginBottom: 20,
    },
    rejectButtonContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    sendButton: {
        flex: 1,
        backgroundColor: colors.error || '#F44336',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
});

export default createStyles;