import { Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { registerRootComponent } from 'expo';
import SplashScreenComponent from './src/components/SplashScreen';

export default function App () {
    const [appReady, setAppReady] = useState(false);

    if (!appReady) {
        return <SplashScreenComponent onReady={() => setAppReady(true)} />;
    }

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

registerRootComponent(App);
