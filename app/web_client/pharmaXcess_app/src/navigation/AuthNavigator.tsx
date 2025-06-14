/**
 * AuthNavigator
 * 
 * This navigator manages the authentication stack of the application.
 * 
 * Screens:
 * - LoginScreen: User login interface.
 * - ForgotPasswordScreen: Password recovery interface.
 * - SignUpScreen: New user registration interface.
 * - OTPVerificationScreen: One-time password verification screen.
 * 
 * Features:
 * - Dynamic background color based on the current theme.
 * - Hidden header for all authentication screens.
 */

import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen/LoginScreen.native';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen.native';
import SignUpScreen from '../screens/SignUpScreen/SignUpScreen.native';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import { useTheme } from '@/src/context/ThemeContext';

/**
 * Type definition for the authentication stack parameters.
 * 
 * @typedef {Object} AuthStackParamList
 * @property {undefined} Login - Login screen.
 * @property {undefined} ForgotPassword - Forgot password screen.
 * @property {undefined} SignUp - Sign up screen.
 * @property {undefined} OTPVerification - OTP verification screen.
 */
export type AuthStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
    SignUp: undefined;
    OTPVerification: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Creates the authentication navigation stack.
 * 
 * @returns {JSX.Element} The stack navigator for the authentication flow.
 */
export default function AuthNavigator() {
    const { colors } = useTheme();
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: colors.background },
            }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
        </Stack.Navigator>
    );
}