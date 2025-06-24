import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    section: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#F57196',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#adadad',
    },
    selectedOption: {
        backgroundColor: '#F57196',
    },
    optionText: {
        marginLeft: 10,
        color: 'white',
        fontSize: 16,
    },
    returnButton: {
        marginTop: 20,
        width: '80%',
        alignSelf: 'center',
    },
    gradient: {
        alignItems: 'center',
        borderRadius: 5,
        padding: 15,
    },
    returnButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
});
export default styles;