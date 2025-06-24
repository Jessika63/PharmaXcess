import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    diseaseList: {
        alignItems: 'center',
    },
    diseaseCard: {
        width: '100%',
        marginVertical: 8,
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        backgroundColor: '#f9f9f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    diseaseText: {
        fontSize: 16,
        color: '#666',
        marginVertical: 5,
        padding: 5,
    },
    diseaseTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
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
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
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
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    arrowContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    },
    selectorItemText: { 
        fontSize: 18,
        color: '#333',
    },
    selectorItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    scrollableModal: { 
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    selector: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollableContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
        padding: 20,
        backgroundColor: '#ffffff',
    },
});

export default styles;