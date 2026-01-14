import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TouchableOpacity, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Professional screens
import ClickAndCollect from '../screens/professional/ClickAndCollect.native';
import Chat from '../screens/professional/Chat.native';
import ProfilPatients from '../screens/professional/ProfilPatients.native';

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const Tab = createBottomTabNavigator();

export default function ProfessionalNavigation(): React.JSX.Element {
  const { colors } = useTheme();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const LogoutButton = () => (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out-outline" size={24} color={colors.headerText} />
    </TouchableOpacity>
  );
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }: TabBarIconProps): React.JSX.Element => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          if (route.name === 'ClickAndCollect') {
            iconName = 'bag-outline';
          } else if (route.name === 'Chat') {
            iconName = 'chatbubble-outline';
          } else if (route.name === 'ProfilPatients') {
            iconName = 'person-outline';
          }

          return (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && (
                <View
                  style={{
                    width: size,
                    height: 3,
                    backgroundColor: colors.tabBarActive,
                    borderRadius: 1.5,
                    marginTop: 4,
                  } as StyleProp<ViewStyle>}
                />
              )}
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.headerBackground,
          borderTopColor: colors.border,
          paddingTop: 8,
        },
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.headerText,
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
          borderBottomColor: colors.border,
        },
        headerTintColor: colors.headerText,
        headerRight: () => <LogoutButton />,
      })}
    >
      <Tab.Screen 
        name="ClickAndCollect" 
        component={ClickAndCollect} 
        options={{ 
          title: 'Click and Collect'
        }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={Chat} 
        options={{ 
          title: 'Chat',
          // Remove logout button from Chat header
          headerRight: () => null
        }} 
      />
      <Tab.Screen 
        name="ProfilPatients" 
        component={ProfilPatients} 
        options={{ 
          title: 'Profil Patients'
        }} 
      />
    </Tab.Navigator>
  );
}