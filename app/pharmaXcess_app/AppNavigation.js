import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import Home from './screens/Home';
import MyPrescriptions from './screens/MyPrescriptions';
import Localisation from './screens/Localisation';
import ClickAndCollect from './screens/ClickAndCollect';
import Chat from './screens/Chat';
import Profile from './screens/Profile';
import PersonalInfo from './screens/PersonalInfo';
import Diseases from './screens/Diseases';
import Treatments from './screens/Treatments';
import Hospitalizations from './screens/Hospitalizations';
import Allergies from './screens/Allergies';
import FamilyHistory from './screens/FamilyHistory';
import Doctors from './screens/Doctors';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={Home} options={{ headerTitleAlign: 'center' }} />
      <HomeStack.Screen name="MyPrescriptions" component={MyPrescriptions} options={{ headerTitleAlign: 'center' }} />
    </HomeStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={Profile} options={{ headerTitleAlign: 'center' }} />
      <ProfileStack.Screen name="PersonalInfo" component={PersonalInfo} options={{ title: 'Mes informations' }} />
      {<ProfileStack.Screen name="Diseases" component={Diseases} options={{ title: 'Maladies' }} />}
      {<ProfileStack.Screen name="Treatments" component={Treatments} options={{ title: 'Traitements' }} />}
      {<ProfileStack.Screen name="Hospitalizations" component={Hospitalizations} options={{ title: 'Hospitalisations' }} />}
      {<ProfileStack.Screen name="Allergies" component={Allergies} options={{ title: 'Allergies' }} />}
      {<ProfileStack.Screen name="FamilyHistory" component={FamilyHistory} options={{ title: 'Antécédents familiaux' }} />}
      {<ProfileStack.Screen name="Doctors" component={Doctors} options={{ title: 'Médecins' }} />}
    </ProfileStack.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            if (route.name === 'HomeStack') {
              iconName = 'home-outline';
            } else if (route.name === 'Localisation') {
              iconName = 'location-outline';
            } else if (route.name === 'Click & Collect') {
              iconName = 'cart-outline';
            } else if (route.name === 'Chat') {
              iconName = 'chatbubble-outline';
            } else if (route.name === 'ProfileStack') {
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
                      backgroundColor: '#F57196',
                      borderRadius: 1.5,
                      marginTop: 4,
                    }}
                  />
                )}
              </View>
            );
          },
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#F57196',
          tabBarInactiveTintColor: '#F7C5E0',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="HomeStack" component={HomeStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Localisation" component={Localisation} />
        <Tab.Screen name="Click & Collect" component={ClickAndCollect} />
        <Tab.Screen name="Chat" component={Chat} />
        <Tab.Screen name="ProfileStack" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
