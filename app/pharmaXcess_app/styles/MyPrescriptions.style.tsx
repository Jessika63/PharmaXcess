import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';


const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    prescriptionList: {
      flexGrow: 1,
      padding: 16,
      paddingBottom: 100, // Space for bottom buttons
    },
    prescriptionCard: {
      width: '100%',
      marginVertical: 8,
      borderRadius: 10,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    prescriptionTitle: {
        fontSize: 20 * fontScale,
        fontWeight: 'bold',
        color: colors.infoTitle,
        marginBottom: 10,
    },
    prescriptionText: {
      fontSize: 16 * fontScale,
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
      width: '100%',
      alignItems: 'center',
      marginVertical: 16,
      padding: 16,
      borderRadius: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    image: {
      width: '100%',
      aspectRatio: 1,
      maxWidth: 300,
      maxHeight: 300,
      marginBottom: 16,
      borderRadius: 10,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
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
      fontSize: 16 * fontScale,
    },
});
export default createStyles;