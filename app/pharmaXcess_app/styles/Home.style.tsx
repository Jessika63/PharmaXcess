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
    card: {
        width: '100%',
        height: 100, 
        borderRadius: 10,
        marginVertical: 10,
        overflow: 'hidden',
    }, 
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    }, 
    itemText: {
        fontSize: 18 * fontScale,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginBottom: 5,
    },
});

export default createStyles;