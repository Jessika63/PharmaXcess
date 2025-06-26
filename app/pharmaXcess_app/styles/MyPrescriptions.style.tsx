import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';


const createStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    prescriptionList: {
      alignItems: 'center',
    },
    prescriptionCard: {
      width: '100%',
      marginVertical: 8,
      borderRadius: 10,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    prescriptionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 10,
    },
    prescriptionText: {
      fontSize: 16,
      color: colors.infoText,
      marginVertical: 5,
      padding: 5,
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
      fontWeight: 'bold',
      fontSize: 16,
    },
});
export default createStyles;