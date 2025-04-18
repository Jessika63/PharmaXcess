import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';

export default function Settings({ navigation }): JSX.Element {
    const handleEditPress = (name: string): void => {
        navigation.navigate(name);
    };

    return (
        <LinearGradient colors={['#ffffff', '#f0f0f0']} style={{ flex: 1 }}>
            <FlatList
                data={[
                    { id: '1', name: 'Notifications' },
                    { id: '2', name: 'Sécurité' },
                    { id: '3', name: 'Confidentialité' },
                    { id: '4', name: 'Langue' },
                    { id: '5', name: 'À propos de nous' },
                ]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handleEditPress(item.name)}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                            <Text style={{ fontSize: 18 }}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </LinearGradient>
    );
}

