import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme, fontScale: number) => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    camera: {
      flex: 1,
      justifyContent: 'flex-end',
      width: '100%',
      backgroundColor: colors.background,
    },
    image: {
      width: 300,
      height: 300,
      marginBottom: 20,
    },
    centeredContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    button: {
      flex: 1,
      marginHorizontal: 10,
      justifyContent: 'center',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 50,
      left: 20,
      right: 20,
      alignSelf: 'center',
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 30,
    },
    loadingText: {
      fontSize: 18 * fontScale,
      color: colors.profileText,
      marginBottom: 20,
      textAlign: 'center',
      justifyContent: 'center',
    },
});

export default createStyles;