import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, StyleProp, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

type ProfileProps = {
    navigation: StackNavigationProp<any, any>;
};

type Item = {
    title: string;
    route: string;
    icon: "person-outline" | "medkit-outline" | "bandage-outline" | "bed-outline" | "alert-circle-outline" | "people-outline" | "person-add-outline";
};

export default function Profile({ navigation }: ProfileProps): JSX.Element {
    const items: Item[] = [
        { title: 'Mes informations', route: 'PersonalInfo', icon: 'person-outline' },
        { title: 'Mes maladies', route: 'Diseases', icon: 'medkit-outline' },
        { title: 'Mes traitements', route: 'Treatments', icon: 'bandage-outline' },
        { title: 'Mes hospitalisations', route: 'Hospitalizations', icon: 'bed-outline' },
        { title: 'Mes allergies', route: 'Allergies', icon: 'alert-circle-outline' },
        { title: 'Mes antécédents familiaux', route: 'FamilyHistory', icon: 'people-outline' },
        { title: 'Mes médecins', route: 'Doctors', icon: 'person-add-outline' },
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
                        <Ionicons name={item.icon} size={24} color="white" style={styles.icon} />
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
        marginBottom: 0,
        overflow: 'hidden',
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
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginLeft: 10,
    },
});