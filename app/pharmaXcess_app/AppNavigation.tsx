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
import SoundTypeOptions from './screens/SoundTypeOptions';
import VibrationOptions from './screens/VibrationsOptions';
import PrivacySecurity from './screens/PrivacySecurity';
import ConsentOptions from './screens/ConsentOptions';
import AuthenticationOptions from './screens/AuthenticationOptions';
import SensibleDataOptions from './screens/SensibleDataOptions';
import PersonalDataOptions from './screens/PersonalDataOptions';
import ReglementationOptions from './screens/ReglementationOptions';
import AdvancedSecurityOptions from './screens/AdvancedSecurityoptions';
import Notifications from './screens/Notifications';
import AccountProfile from './screens/AccountProfile';
import HelpSupport from './screens/HelpSupport';
import Tutorial from './screens/Tutorial';
import FirstSteps from './screens/FirstSteps';
import MedicationManagement from './screens/MedicationManagement';
import PrescriptionImport from './screens/PrescriptionImport';
import MedicalProfile from './screens/MedicalProfile';
import FAQ from './screens/FAQ';
import GeneralFAQ from './screens/GeneralFAQ';

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
      <ProfileStack.Screen name="Settings" component={Settings} options={{ headerTitleAlign: 'center', title: 'Paramètres' }} />
      <ProfileStack.Screen name="PersonalInfo" component={PersonalInfo} options={{ headerTitleAlign: 'center', title: 'Mes informations' }} />
      <ProfileStack.Screen name="Diseases" component={Diseases} options={{ headerTitleAlign: 'center', title: 'Maladies' }} />
      <ProfileStack.Screen name="Treatments" component={Treatments} options={{ headerTitleAlign: 'center', title: 'Traitements' }} />
      <ProfileStack.Screen name="Hospitalizations" component={Hospitalizations} options={{ headerTitleAlign: 'center', title: 'Hospitalisations' }} />
      <ProfileStack.Screen name="Allergies" component={Allergies} options={{ headerTitleAlign: 'center', title: 'Allergies' }} />
      <ProfileStack.Screen name="FamilyHistory" component={FamilyHistory} options={{ headerTitleAlign: 'center', title: 'Antécédents familiaux' }} />
      <ProfileStack.Screen name="Doctors" component={Doctors} options={{ headerTitleAlign: 'center', title: 'Médecins' }} />
      <ProfileStack.Screen name="VisualOptions" component={VisualOptions} options={{ headerTitleAlign: 'center', title: 'Options visuelles ' }} />
      <ProfileStack.Screen name="AudioOptions" component={AudioOptions} options={{ headerTitleAlign: 'center', title: 'Notifications sonores ' }} />
      <ProfileStack.Screen name="VolumeOptions" component={VolumeOptions} options={{ headerTitleAlign: 'center', title: 'Volume' }} />
      <ProfileStack.Screen name="SoundTypeOptions" component={SoundTypeOptions} options={{ headerTitleAlign: 'center', title: 'Type de son' }} />
      <ProfileStack.Screen name="VibrationOptions" component={VibrationOptions} options={{ headerTitleAlign: 'center', title: 'Vibrations' }} />
      <ProfileStack.Screen name="PrivacySecurity" component={PrivacySecurity} options={{ headerTitleAlign: 'center', title: 'Confidentialité et sécurité' }} />
      <ProfileStack.Screen name="ConsentOptions" component={ConsentOptions} options={{ headerTitleAlign: 'center', title: 'Consentement et données ' }} />
      <ProfileStack.Screen name="AuthenticationOptions" component={AuthenticationOptions} options={{ headerTitleAlign: 'center', title: 'Authentification et sécurité' }} />
      <ProfileStack.Screen name="SensibleDataOptions" component={SensibleDataOptions} options={{ headerTitleAlign: 'center', title: 'Protection des informations sensibles' }} />
      <ProfileStack.Screen name="PersonalDataOptions" component={PersonalDataOptions} options={{ headerTitleAlign: 'center', title: 'Gestion des données personnelles' }} />
      <ProfileStack.Screen name="ReglementationOptions" component={ReglementationOptions} options={{ headerTitleAlign: 'center', title: 'Conformité réglementaire' }} />
      <ProfileStack.Screen name="AdvancedSecurityOptions" component={AdvancedSecurityOptions} options={{ headerTitleAlign: 'center', title: 'Sécurité avancée' }} />
      <ProfileStack.Screen name="Notifications" component={Notifications} options={{ headerTitleAlign: 'center', title: 'Notifications' }} />
      <ProfileStack.Screen name="AccountProfile" component={AccountProfile} options={{ headerTitleAlign: 'center', title: 'Compte et profil' }} />
      <ProfileStack.Screen name="HelpSupport" component={HelpSupport} options={{ headerTitleAlign: 'center', title: 'Aide et support' }} />
      <ProfileStack.Screen name="Tutorial" component={Tutorial} options={{ headerTitleAlign: 'center', title: 'Tutoriel' }} />
      <ProfileStack.Screen name="FirstSteps" component={FirstSteps} options={{ headerTitleAlign: 'center', title: 'Premiers pas' }} />
      <ProfileStack.Screen name="MedicationManagement" component={MedicationManagement} options={{ headerTitleAlign: 'center', title: 'Gestion des médicaments' }} />
      <ProfileStack.Screen name="PrescriptionImport" component={PrescriptionImport} options={{ headerTitleAlign: 'center', title: 'Importation des ordonnances' }} />
      <ProfileStack.Screen name="MedicalProfile" component={MedicalProfile} options={{ headerTitleAlign: 'center', title: 'Profil médical' }} />
      <ProfileStack.Screen name="FAQ" component={FAQ} options={{ headerTitleAlign: 'center', title: 'FAQ' }} />
      <ProfileStack.Screen name="GeneralFAQ" component={GeneralFAQ} options={{ headerTitleAlign: 'center', title: 'FAQ Général' }} />
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
