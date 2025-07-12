import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import Login from '../screens/account/Login.native';
import SignUp from '../screens/account/SignUp.native';

const AuthStack = createStackNavigator();

export default function AuthNavigation(): React.JSX.Element {
    const { colors } = useTheme();

    return (
        <AuthStack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 18,
                },
                headerBackTitleVisible: false,
                cardStyle: { backgroundColor: colors.background },
            }}
        >
            <AuthStack.Screen 
                name="Login" 
                component={Login}
                options={{
                    title: 'Connexion',
                    headerShown: false,
                }}
            />
            <AuthStack.Screen 
                name="SignUp" 
                component={SignUp}
                options={{
                    title: 'Inscription',
                    headerShown: true,
                    headerBackTitle: 'Retour',
                }}
            />
        </AuthStack.Navigator>
    );
}
