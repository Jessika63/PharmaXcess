import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';


const createStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    map: {
        flex: 1,
    },
    menu: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    distributorItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    distributorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.secondary,
    },
    routeContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: colors.accent,
        borderRadius: 10,
        alignItems: 'center',
    },
    text: {
      color: colors.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: colors.inputBackground,
        fontSize: 16,
    },
    goButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.profileText,
        textAlign: 'center',
        marginTop: 20,
    },
    distanceText: {
        fontSize: 14,
        color: colors.infoTextSecondary,
    },
    selectedDistributor: {
        marginTop: 10,
        padding: 10,
        backgroundColor: colors.background,
        borderRadius: 10,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    gradientButton: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
});
export default createStyles;