import { StyleSheet } from 'react-native';
import { ColorScheme } from './Colors';

const createStyles = (colors: ColorScheme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
        backgroundColor: colors.background,
    },
    card: {
        width: '100%', 
        height: 120,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        paddingVertical: 15,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'column', 
    },
    cardText: {
        fontSize: 20,
        color: colors.text,
        fontWeight: 'bold',
        marginLeft: 10,
        textAlign: 'center',   
        marginBottom: 5,
        flexWrap: 'wrap',      
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
        marginTop: 10, 
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.profileBorder,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.profileText,
        marginTop: 10,
        marginBottom: -25,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerButton: {
        marginRight: 10,
    },
});

export default createStyles;