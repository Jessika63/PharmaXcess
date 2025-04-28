import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleProp, ViewStyle } from 'react-native';

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
import MedicineReminders from './screens/MedicineReminders';
import Settings from './screens/Settings';
import PrescriptionReminders from './screens/PrescriptionReminders';
import VisualOptions from './screens/VisualOptions';
import AudioOptions from './screens/AudioOptions';
import VolumeOptions from './screens/VolumeOptions';

type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();


function HomeStackScreen(): JSX.Element {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={Home} options={{ headerTitleAlign: 'center', title: 'Accueil' }} />
      <HomeStack.Screen name="MyPrescriptions" component={MyPrescriptions} options={{ headerTitleAlign: 'center', title: 'Mes ordonnances'}} />
      <HomeStack.Screen name="MedicineReminders" component={MedicineReminders} options={{ headerTitleAlign: 'center', title: 'Mes rappels médicaments' }} />
      <HomeStack.Screen name="PrescriptionReminders" component={PrescriptionReminders} options={{ headerTitleAlign: 'center', title: 'Mes rappels ordonnances' }} />
    </HomeStack.Navigator>
  );
}

function ProfileStackScreen(): JSX.Element {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={Profile} options={{ headerTitleAlign: 'center', title: 'Profil' }} />
      <ProfileStack.Screen name="Settings" component={Settings} options={{ title: 'Paramètres' }} />
      <ProfileStack.Screen name="PersonalInfo" component={PersonalInfo} options={{ title: 'Mes informations' }} />
      <ProfileStack.Screen name="Diseases" component={Diseases} options={{ title: 'Maladies' }} />
      <ProfileStack.Screen name="Treatments" component={Treatments} options={{ title: 'Traitements' }} />
      <ProfileStack.Screen name="Hospitalizations" component={Hospitalizations} options={{ title: 'Hospitalisations' }} />
      <ProfileStack.Screen name="Allergies" component={Allergies} options={{ title: 'Allergies' }} />
      <ProfileStack.Screen name="FamilyHistory" component={FamilyHistory} options={{ title: 'Antécédents familiaux' }} />
      <ProfileStack.Screen name="Doctors" component={Doctors} options={{ title: 'Médecins' }} />
      <ProfileStack.Screen name="VisualOptions" component={VisualOptions} options={{ title: 'Options de visualisation' }} />
      <ProfileStack.Screen name="AudioOptions" component={AudioOptions} options={{ title: 'Options audio' }} />
      <ProfileStack.Screen name="VolumeOptions" component={VolumeOptions} options={{ title: 'Options de volume' }} />
    </ProfileStack.Navigator>
  );
}

export default function AppNavigation(): JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }: TabBarIconProps): JSX.Element => {
            let iconName: keyof typeof Ionicons.glyphMap = 'help-outline'; // Default value

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
                    } as StyleProp<ViewStyle>}
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
        <Tab.Screen name="Localisation" component={Localisation} options={{ headerTitleAlign: 'center', title: 'Localisation'}} />
        <Tab.Screen name="Click & Collect" component={ClickAndCollect} options={{ headerTitleAlign: 'center', title: 'Click & Collect'}}/>
        <Tab.Screen name="Chat" component={Chat} options={{ headerTitleAlign: 'center', title: 'Mes discussions'}} />
        <Tab.Screen name="ProfileStack" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
