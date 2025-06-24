import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    treatmentList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    treatmentCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    gradient: {
        padding: 15,
        borderRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    treatmentTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    editButton: {
        backgroundColor: '#F57196',
        padding: 5,
        borderRadius: 50,
    },
    treatmentText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
        marginTop: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 30,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f2f2f2',
        color: '#333',
        fontSize: 16,
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
    selector: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#f2f2f2',
        color: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollableContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
        padding: 20,
        backgroundColor: 'white',
    },
});

export default styles;