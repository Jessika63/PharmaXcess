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
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 10,
        padding: 3,
        marginHorizontal: 10,
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: colors.secondary,
    },
    inactiveTab: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontSize: 16 * fontScale,
        fontWeight: '600',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    inactiveTabText: {
        color: colors.headerText,
    },
    badgeContainer: {
        position: 'absolute',
        top: -5,
        right: 10,
        backgroundColor: colors.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'none',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12 * fontScale,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
        paddingBottom: 80,
    },
    ticketCard: {
        backgroundColor: colors.card,
        padding: 15,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    ticketInfo: {
        flex: 1,
    },
    ticketTitle: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 5,
    },
    ticketPatient: {
        fontSize: 14 * fontScale,
        color: colors.infoText,
        marginBottom: 3,
    },
    ticketDate: {
        fontSize: 12 * fontScale,
        color: colors.infoTextSecondary,
    },
    ticketPreview: {
        fontSize: 14 * fontScale,
        color: colors.infoText,
        marginTop: 8,
        lineHeight: 20 * fontScale,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12 * fontScale,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    emptyIcon: {
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 10,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        textAlign: 'center',
        lineHeight: 24 * fontScale,
    },
    // Assignment Modal Styles
    assignmentModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assignmentContent: {
        backgroundColor: colors.background,
        borderRadius: 15,
        padding: 25,
        margin: 20,
        minWidth: '80%',
        alignItems: 'center',
    },
    assignmentTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.headerText,
        marginBottom: 15,
        textAlign: 'center',
    },
    assignmentText: {
        fontSize: 16 * fontScale,
        color: colors.headerText,
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22 * fontScale,
    },
    assignmentButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    assignmentButton: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 100,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    assignButton: {
        backgroundColor: colors.success,
    },
    cancelButton: {
        backgroundColor: colors.error,
    },
    assignmentButtonText: {
        color: '#FFFFFF',
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // Conversation Styles (inherited from patient chat)
    conversationContainer: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    conversationInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    conversationTitle: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginRight: 10,
    },
    messagesList: {
        flex: 1,
    },
    messageContainer: {
        marginVertical: 5,
    },
    userMessage: {
        alignItems: 'flex-end',
    },
    supportMessage: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
    },
    userBubble: {
        backgroundColor: colors.secondary,
    },
    supportBubble: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        fontSize: 16 * fontScale,
        lineHeight: 20 * fontScale,
    },
    userText: {
        color: '#FFFFFF',
    },
    supportText: {
        color: colors.headerText,
    },
    messageTime: {
        fontSize: 12 * fontScale,
        marginTop: 5,
    },
    userTime: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    supportTime: {
        color: colors.infoText,
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        backgroundColor: colors.inputBackground,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        maxHeight: 100,
        fontSize: 16 * fontScale,
        color: colors.infoTitle,
    },
    sendButton: {
        backgroundColor: colors.secondary,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: colors.infoTextSecondary,
    },
});

export default createStyles;