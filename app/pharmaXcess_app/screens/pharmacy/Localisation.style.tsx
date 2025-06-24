import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    map: {
        flex: 1,
    },
    menu: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
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
        borderBottomColor: '#ccc',
    },
    distributorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57196',
    },
    routeContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#F7C5E0',
        borderRadius: 10,
        alignItems: 'center',
    },
    routeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
        width: '100%',
        backgroundColor: '#FFF',
    },
    goButton: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    goButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    distanceText: {
        fontSize: 14,
        color: '#555',
    },
    selectedDistributor: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5,
    },
    gradientButton: {
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    },
});
export default styles;