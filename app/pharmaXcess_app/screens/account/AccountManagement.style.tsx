import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
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
        color: 'white',
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
});

export default styles;