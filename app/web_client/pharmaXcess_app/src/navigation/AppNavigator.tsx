/**
 * AppNavigator
 * 
 * This navigator manages the main stack of the application for authenticated users.
 * 
 * Screens:
 * - HomeScreen: The primary landing screen for authenticated users.
 */

import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

/**
 * Creates the main navigation stack for authenticated users.
 * 
 * @returns {JSX.Element} The stack navigator containing the home screen.
 */
export default function AppNavigator() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
    );
}
