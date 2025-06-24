import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    hospitalizationList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 100,
    },
    hospitalizationCard: {
        width: '100%',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
        marginVertical: 8,
    },
    hospitalizationTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    hospitalizationText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    editButton: {
        position: 'absolute',
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
        top: 10,
    },
    gradient: {
        padding: 15,
        borderRadius: 10,
    },
    bold: {
        fontWeight: 'bold',
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
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    },
    scrollableModal: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    selectorItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    selectorItemText: {
        fontSize: 18,
        color: '#333',
    },
    selector: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#F2F2F2',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
    },
});

export default styles;