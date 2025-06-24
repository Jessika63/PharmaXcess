import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        alignItems: 'center',
    },
    allergyList: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 20,
    },
    allergyCard: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#f5f5f5',
        marginVertical: 8,
        borderRadius: 10,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    allergyTitle: {
        fontSize: 20,
        color: '#333',
        fontWeight: 'bold',
    },
    editButton: {
        alignSelf: 'flex-end',
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#F57196',
        padding: 8,
        borderRadius: 50,
    },
    allergyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        width: '48%',
    },
    gradient: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 20,
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
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
    scrollableModal: {
        flexGrow: 1,
        padding: 20,
    },
    selector: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#F2F2F2',
    },
    selectorText: {
        color: '#333',
        fontSize: 16,
    },
});

export default styles;