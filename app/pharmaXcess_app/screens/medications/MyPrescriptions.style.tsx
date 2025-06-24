import { StyleSheet } from 'react-native';



const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
      alignItems: 'center',
    },
    prescriptionList: {
      alignItems: 'center',
      padding: 20,
      paddingBottom: 100,
      width: '110%',
    },
    prescriptionCard: {
      width: '100%',
      backgroundColor: '#F2F2F2',
      marginVertical: 8,
      borderRadius: 10,
      padding: 20,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    prescriptionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    prescriptionText: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    prescriptionMedications: {
      fontSize: 14,
      color: '#666',
      marginBottom: 10,
    },
    camera: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
    },
    photoPreview: {
      alignItems: 'center',
      marginBottom: 20,
    },
    image: {
      width: 300,
      height: 300,
      marginBottom: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    button: {
      flex: 1,
      marginHorizontal: 8,
      borderRadius: 10,
      overflow: 'hidden',
    },
    gradient: {
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
});
export default styles;