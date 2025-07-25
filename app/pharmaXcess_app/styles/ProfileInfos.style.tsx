import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    list: {
        alignItems: 'center',
    },
    card: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardText: {
        fontSize: 16 * fontScale,
        color: colors.infoText,
        marginVertical: 5,
        padding: 5,
    },
    cardTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 10,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    bold: {
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: colors.editButtonBackground,
        padding: 8,
        borderRadius: 50,
        marginLeft: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#FFFFFF',
        padding: 8,
        borderRadius: 50,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#FFEBEE',
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
    buttonText: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 16 * fontScale,
    },
    arrowContainer: {
        alignItems: 'center',
        marginTop: 10,
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
    modalTitle: {
        fontSize: 24 * fontScale,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.settingsTitle,
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: 20,
        flexGrow: 1,
    },
    // Field title style for section headers in modals (e.g., "Date de début", "Durée")
    fieldTitle: {
        fontSize: 18 * fontScale,
        color: colors.settingsTitle,
        marginVertical: 8,
        fontWeight: 'bold',
    },
    // Container for date picker dropdowns arranged horizontally (day, month, year)
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 2,
    },
    // Individual date picker dropdown style within dateContainer
    datePicker: {
        flex: 1,
        marginHorizontal: 2,
        minWidth: 0, 
    },
    // Container for dosage/duration picker dropdowns arranged horizontally (value, unit)
    dosageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 2,
    },
    // Individual dosage/duration picker dropdown style within dosageContainer
    dosagePicker: {
        flex: 1,
        marginHorizontal: 2,
        minWidth: 0, 
    },
    // Container for modal action buttons (Confirm/Cancel) arranged horizontally
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    // Individual modal button style within modalButtonContainer
    modalButton: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default createStyles;