import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Profile({ navigation }) {
    
    const items = [
        { title: 'Mes informations', route: 'PersonalInfo' },
        { title: 'Mes maladies', route: 'Diseases' },
        { title: 'Mes traitements', route: 'Treatments' },
        { title: 'Mes hospitalisations', route: 'Hospitalizations' },
        { title: 'Mes allergies', route: 'Allergies' },
        { title: 'Mes antécédents familiaux', route: 'FamilyHistory' },
        { title: 'Mes médecins', route: 'Doctors' },
    ];
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.profileContainer}>
                <Image source={{ uri: 'https://www.w3schools.com/w3images/avatar2.png' }} style={styles.profileImage} />
                <Text style={styles.profileName}>John Doe</Text>
            </View>
            {items.map((item, index) => (
                <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate(item.route)}>
                    <LinearGradient colors={['#EE9AD0', '#F57196']} style={styles.gradient}>
                        <Text style={styles.cardText}>{item.title}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: 'white',
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#F57196',
        marginBottom: 10,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
        marginBottom: -25,
    },
    card: {
        width: '110%',
        height: 100,
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: -30,
    },
    cardText: {
        fontSize: 20,
        color: 'white',
        marginLeft: 10,
    },
    gradient: {
        paddingVertical: 15,
        flex: 1,
        justifyContent: 'center',
        borderRadius: 10,
    },
});
