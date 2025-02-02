import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

const App = () => {
    return (
    <View style={styles.container}>
        <Text style={styles.text}>Bienvenue dans pharmaXcess_app !</Text>
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default App;
