import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    doctorList: {
      alignItems: 'center',
      padding: 20,
      paddingBottom: 100,
      width: '100%',
    },
    doctorCard: {
      width: '100%',
      backgroundColor: '#F2F2F2',
      marginVertical: 8,
      borderRadius: 10,
      marginBottom: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    editButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: '#F57196',
      padding: 8,
      borderRadius: 50,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    doctorTitle: {
      fontSize: 20,
      color: '#333',
      fontWeight: 'bold',
    },
    doctorText: {
      fontSize: 16,
      color: '#666',
      marginBottom: 10,
    },
    bold: {
      fontWeight: 'bold',
    },
    buttonContainer: {
      width: '100%',
      marginTop: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 20,
    },
    button: {
      flex: 1,
      marginHorizontal: 10,
      width: '40%',
      borderRadius: 10,
    },
    gradient: {
      padding: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    buttonText: {
      fontSize: 20,
      color: '#fff',
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
    }
  });

  export default styles;