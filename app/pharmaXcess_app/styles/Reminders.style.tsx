import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    alarmCard: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    disabledAlarmCard: {
        opacity: 0.6,
        backgroundColor: colors.inputBackground,
    },
    alarmMainInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    alarmTimeContainer: {
        flex: 1,
    },
    alarmTime: {
        fontSize: 32 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        lineHeight: 38 * fontScale,
    },
    alarmNextTime: {
        fontSize: 14 * fontScale,
        color: colors.infoTextSecondary,
        marginTop: 4,
    },
    alarmSwitchContainer: {
        alignItems: 'flex-end',
    },
    alarmDetails: {
        marginBottom: 12,
    },
    alarmMedicine: {
        fontSize: 18 * fontScale,
        fontWeight: '600',
        color: colors.infoTitle,
        marginBottom: 4,
    },
    alarmDays: {
        fontSize: 14 * fontScale,
        color: colors.infoText,
        marginBottom: 4,
    },
    alarmSound: {
        fontSize: 14 * fontScale,
        color: colors.infoTextSecondary,
    },
    alarmActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    editIconButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: colors.optionsSecondary,
    },
    deleteIconButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFEBEE',
    },
    disabledText: {
        opacity: 0.5,
    },
    fixedButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.inputBorder,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    addAlarmButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
    },
    // Agenda-specific styles for prescription reminders
    agendaCard: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    completedCard: {
        opacity: 0.7,
        backgroundColor: colors.inputBackground,
        borderColor: '#4CAF50',
    },
    agendaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    agendaDateContainer: {
        flex: 1,
    },
    agendaDate: {
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12 * fontScale,
        color: 'white',
        fontWeight: 'bold',
    },
    agendaActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityIndicator: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    agendaContent: {
        marginBottom: 12,
    },
    agendaTitle: {
        fontSize: 18 * fontScale,
        fontWeight: '600',
        color: colors.infoTitle,
        marginBottom: 6,
    },
    agendaNotes: {
        fontSize: 14 * fontScale,
        color: colors.infoText,
        marginBottom: 4,
        fontStyle: 'italic',
    },
    agendaSound: {
        fontSize: 13 * fontScale,
        color: colors.infoTextSecondary,
    },
    agendaFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    alarmName: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
    },
    alarmText: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        marginVertical: 5,
        padding: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        width: '40%',
    },
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    buttonText: {
        color: colors.text,
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        flexGrow: 1,
    },
    modalTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.settingsTitle,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: colors.inputBackground,
        fontSize: 16 * fontScale,
    },
    label: {
        fontSize: 16 * fontScale,
        fontWeight: 'bold',
        marginBottom: 10,
        color: colors.settingsTitle,
    },
    selectedDay: {
        backgroundColor: colors.optionsSecondary,
    },
    dayText: {
        color: colors.infoTitle,
        textAlign: 'center',
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: colors.editButtonBackground,
        padding: 8,
        borderRadius: 50,
    },
});
export default createStyles;