import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen/LoginScreen.native';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen/ForgotPasswordScreen.native';
import SignUpScreen from '../screens/SignUpScreen/SignUpScreen.native';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import { useTheme } from '@/src/context/ThemeContext';

export type AuthStackParamList = {
    Login: undefined;
    ForgotPassword: undefined;
    SignUp: undefined;
    OTPVerification: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

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