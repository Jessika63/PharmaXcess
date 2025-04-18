import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { TextStyle, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Modal } from 'react-native';
import { TextInput } from 'react-native';
import { Alert } from 'react-native';
import { StyleProp } from 'react-native';

export default function VisualOptions({ navigation }): JSX.Element {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newOption, setNewOption] = useState({
        id: '',
        name: '',
        description: '',
    });

    const handleAddOption = () => {
        if (!newOption.name || !newOption.description) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
            return;
        }

        const newOptionData = {
            id: Math.random().toString(),
            name: newOption.name,
            description: newOption.description,
        };

        // Add the new option to the list (this part is not implemented in this snippet)
        setNewOption({
            id: '',
            name: '',
            description: '',
        });
        setIsModalVisible(false);
    };
    const handleEditPress = (name: string): void => {
        Alert.alert('Édition', `Éditez l\'option ${name}`);
    }
    const handleDeletePress = (name: string): void => {
        Alert.alert('Suppression', `Supprimez l\'option ${name}`);
    }
    const handleModalClose = (): void => {
        setIsModalVisible(false);
        setNewOption({
            id: '',
            name: '',
            description: '',
        });
    }
    const handleModalOpen = (): void => {
        setIsModalVisible(true);
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Options Visuelles</Text>
            <FlatList
                data={[]}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.optionContainer}>
                        <Text style={styles.optionName}>{item.name}</Text>
                        <Text style={styles.optionDescription}>{item.description}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => handleEditPress(item.name)}>
                                <Ionicons name="create-outline" size={24} color="black" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeletePress(item.name)}>
                                <Ionicons name="trash-outline" size={24} color="black" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <TouchableOpacity onPress={handleModalOpen} style={styles.addButton}>
                <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
            {isModalVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={handleModalClose}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <TextInput
                                placeholder="Nom de l'option"
                                value={newOption.name}
                                onChangeText={(text) => setNewOption({ ...newOption, name: text })}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Description de l'option"
                                value={newOption.description}
                                onChangeText={(text) => setNewOption({ ...newOption, description: text })}
                                style={[styles.input, styles.textArea]}
                                multiline
                            />
                            <TouchableOpacity onPress={handleAddOption} style={[styles.button, styles.addButton]}>
                                <Text style={styles.buttonText}>Ajouter</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleModalClose} style={[styles.button, styles.cancelButton]}>
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create ({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#FFF',
    } as ViewStyle,
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    } as TextStyle,
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    } as ViewStyle,
    optionName: {
        fontSize: 18,
    } as TextStyle,
    optionDescription: {
        fontSize: 14,
        color: '#666',
    } as TextStyle,
    buttonContainer: {
        flexDirection: 'row',
    } as ViewStyle,
    addButton: {
        backgroundColor: '#F57196',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    } as ViewStyle,
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    } as ViewStyle,
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    } as ViewStyle,
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#F2F2F2',
        color: '#333',
        fontSize: 16,
    } as TextStyle,
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    } as TextStyle,
    button: {
        backgroundColor: '#F57196',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    } as ViewStyle,
    cancelButton: {
        backgroundColor: '#ccc',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    } as ViewStyle,
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    gradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    } as ViewStyle,
    gradientButton: {
        borderRadius: 5,
        padding: 10,
        alignItems: 'center',
    } as ViewStyle,
    gradientText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    } as TextStyle,
    distanceText: {
        fontSize: 14,
        color: '#555',
    } as TextStyle,
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
    } as ViewStyle,
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#F57196',
    } as TextStyle,
});