import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from './context/ThemeContext';

// Common screens 
import Home from './screens/common/Home.native';
// Chat screen for communication
import Chat from './screens/communication/Chat.native';

// Health screens 
// Importing various health-related screens for managing user health records
import Diseases from './screens/health/Diseases.native';
import Allergies from './screens/health/Allergies.native';
import FamilyHistory from './screens/health/FamilyHistory.native';
import Hospitalizations from './screens/health/Hospitalizations.native';
import Doctors from './screens/health/Doctors.native';
import MedicalProfile from './screens/health/MedicalProfile.native';

// Medications screens
import MyPrescriptions from './screens/medications/MyPrescriptions.native';
import Treatments from './screens/medications/Treatments.native';
import MedicineReminders from './screens/medications/MedicineReminders.native';
import PrescriptionReminders from './screens/medications/PrescriptionReminders.native';
import MedicationManagement from './screens/medications/MedicationManagement.native';
import PrescriptionImport from './screens/medications/PrescriptionImport.native';
import MedicationManagementFAQ from './screens/medications/MedicationManagementFAQ.native';

// Pharmacy screens
import Localisation from './screens/pharmacy/Localisation.native';
import ClickAndCollect from './screens/pharmacy/ClickAndCollect.native';
import PartnerPharmaciesFAQ from './screens/pharmacy/PartnerPharmaciesFAQ.native';

// Settings screens 
// Importing various settings screens for user preferences and configurations
import Settings from './screens/settings/Settings.native';
import VisualOptions from './screens/settings/VisualOptions.native';
import AudioOptions from './screens/settings/AudioOptions.native';
import VolumeOptions from './screens/settings/VolumeOptions.native';
import SoundTypeOptions from './screens/settings/SoundTypeOptions.native';
import VibrationOptions from './screens/settings/VibrationsOptions.native';
import ReglementationOptions from './screens/settings/ReglementationOptions.native';
import AppPreferences from './screens/settings/AppPreferences.native';

// Support screens 
// Tutorial and FAQ screens for user assistance
import HelpSupport from './screens/support/HelpSupport.native';
import Tutorial from './screens/support/Tutorial.native';
import FAQ from './screens/support/FAQ.native';
import GeneralFAQ from './screens/support/GeneralFAQ.native';
import TechnicalIssuesFAQ from './screens/support/TechnicalIssuesFAQ.native';
import TechnicalSupport from './screens/support/TechnicalSupport.native';
import ReportIssue from './screens/support/ReportIssue.native';

// Privacy and security screens
import PrivacySecurity from './screens/privacy/PrivacySecurity.native';
import ConsentOptions from './screens/privacy/ConsentOptions.native';
import SensibleDataOptions from './screens/privacy/SensibleDataOptions.native';
import AdvancedSecurityOptions from './screens/privacy/AdvancedSecurityoptions.native';
import AdvancedPrivacy from './screens/privacy/AdvancedPrivacy.native';
import PersonalDataUsage from './screens/privacy/PersonalDataUsage.native';
import CookieManagement from './screens/privacy/CookieManagement.native';

// Account screens
import Profile from './screens/account/Profile.native';
import PersonalInfo from './screens/account/PersonalInfo.native';
import PersonalDataOptions from './screens/account/PersonalDataOptions.native';
import AccountProfile from './screens/account/AccountProfile.native';
import AccountPrivacyFAQ from './screens/account/AccountPrivacyFAQ.native';
import AccountManagement from './screens/account/AccountManagement.native';

// Others screens
import AuthenticationOptions from './screens/authentication/AuthenticationOptions.native';
import ViewDocuments from './screens/documents/ViewDocuments.native';
import ExerciseRights from './screens/legal/ExerciseRights.native';

// Notifications screens 
// Notification preferences and settings screens
import Notifications from './screens/notifications/Notifications.native';
import NotificationPreferences from './screens/notifications/NotificationPreferences.native';
import CommunicationPreferences from './screens/notifications/CommunicationPreferences.native';

// Onboarding screens
import FirstSteps from './screens/onboarding/FirstSteps.native';
import HistoryTransparency from './screens/onboarding/HistoryTransparency.native';


type TabBarIconProps = {
  color: string;
  size: number;
  focused: boolean;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Function to create a stack navigator for a given set of screens
function createStack(screens: { name: string; component: React.ComponentType<any>; title: string }[], colors: any): React.JSX.Element {
  return (
    <Stack.Navigator
      screenOptions={{
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
        headerBackTitleVisible: false,
      }}
    >
      {screens.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{ title: screen.title }}
        />
      ))}
    </Stack.Navigator>
  );
}

const HomeStackScreen = (): React.JSX.Element => {
  // The stack navigator for the Home section, which includes screens for home, prescriptions, medicine reminders, and prescription reminders.
  const { colors } = useTheme();
  return createStack([
    { name: 'Home', component: Home, title: 'Accueil' },
    { name: 'MyPrescriptions', component: MyPrescriptions, title: 'Mes ordonnances' },
    { name: 'MedicineReminders', component: MedicineReminders, title: 'Mes rappels médicaments' },
    { name: 'PrescriptionReminders', component: PrescriptionReminders, title: 'Mes rappels ordonnances' },
  ], colors);
}

const ProfileStackScreen = (): React.JSX.Element => {
  // The stack navigator for the Profile section, which includes screens for user profile, settings, personal information, health records, privacy options, and support.
  const { colors } = useTheme();
  return createStack([
    { name: 'Profile', component: Profile, title: 'Profil' },
    { name: 'Settings', component: Settings, title: 'Paramètres' },
    { name: 'PersonalInfo', component: PersonalInfo, title: 'Mes informations' },
    { name: 'Diseases', component: Diseases, title: 'Maladies' },
    { name: 'Treatments', component: Treatments, title: 'Traitements' },
    { name: 'Hospitalizations', component: Hospitalizations, title: 'Hospitalisations' },
    { name: 'Allergies', component: Allergies, title: 'Allergies' },
    { name: 'FamilyHistory', component: FamilyHistory, title: 'Antécédents familiaux' },
    { name: 'Doctors', component: Doctors, title: 'Médecins' },
    { name: 'VisualOptions', component: VisualOptions, title: 'Options visuelles' },
    { name: 'AudioOptions', component: AudioOptions, title: 'Notifications sonores' },
    { name: 'VolumeOptions', component: VolumeOptions, title: 'Volume' },
    { name: 'SoundTypeOptions', component: SoundTypeOptions, title: 'Type de son' },
    { name: 'VibrationOptions', component: VibrationOptions, title: 'Vibrations' },
    { name: 'PrivacySecurity', component: PrivacySecurity, title: 'Confidentialité et sécurité' },
    { name: 'ConsentOptions', component: ConsentOptions, title: 'Consentement et données' },
    { name: 'AuthenticationOptions', component: AuthenticationOptions, title: 'Authentification et sécurité' },
    { name: 'SensibleDataOptions', component: SensibleDataOptions, title: 'Protection des informations sensibles' },
    { name: 'PersonalDataOptions', component: PersonalDataOptions, title: 'Gestion des données personnelles' },
    { name: 'ReglementationOptions', component: ReglementationOptions, title: 'Conformité réglementaire' },
    { name: 'AdvancedSecurityOptions', component: AdvancedSecurityOptions, title: 'Sécurité avancée' },
    { name: 'Notifications', component: Notifications, title: 'Notifications' },
    { name: 'AccountProfile', component: AccountProfile, title: 'Compte et profil' },
    { name: 'HelpSupport', component: HelpSupport, title: 'Aide et support' },
    { name: 'Tutorial', component: Tutorial, title: 'Tutoriel' },
    { name: 'FirstSteps', component: FirstSteps, title: 'Premiers pas' },
    { name: 'MedicationManagement', component: MedicationManagement, title: 'Gestion des médicaments' },
    { name: 'PrescriptionImport', component: PrescriptionImport, title: 'Importation des ordonnances' },
    { name: 'MedicalProfile', component: MedicalProfile, title: 'Profil médical' },
    { name: 'FAQ', component: FAQ, title: 'FAQ' },
    { name: 'GeneralFAQ', component: GeneralFAQ, title: 'FAQ Général' },
    { name: 'AccountPrivacyFAQ', component: AccountPrivacyFAQ, title: 'FAQ Compte et confidentialité' },
    { name: 'MedicationManagementFAQ', component: MedicationManagementFAQ, title: 'FAQ Gestion des médicaments' },
    { name: 'TechnicalIssuesFAQ', component: TechnicalIssuesFAQ, title: 'FAQ Problèmes techniques' },
    { name: 'PartnerPharmaciesFAQ', component: PartnerPharmaciesFAQ, title: 'FAQ Pharmacies partenaires' },
    { name: 'TechnicalSupport', component: TechnicalSupport, title: 'Support technique' },
    { name: 'ReportIssue', component: ReportIssue, title: 'Signaler un problème' },
    { name: 'AppPreferences', component: AppPreferences, title: "Préférences de l'application" },
    { name: 'AdvancedPrivacy', component: AdvancedPrivacy, title:'Confidentialité avancée'},
    { name:'ViewDocuments', component : ViewDocuments, title:'Consulter nos documents'},
    { name: 'NotificationPreferences', component: NotificationPreferences, title: 'Préférences de notification' },
    { name: 'HistoryTransparency', component: HistoryTransparency, title: 'Historique et transparence' },
    { name: 'PersonalDataUsage', component: PersonalDataUsage, title: 'Utilisation des données personnelles' },
    { name: 'CommunicationPreferences', component: CommunicationPreferences, title: 'Préférences de communication' },
    { name: 'CookieManagement', component: CookieManagement, title: 'Gestion des cookies' },
    { name: 'ExerciseRights', component: ExerciseRights, title: 'Exercice des droits RGPD' },
    { name: 'AccountManagement', component: AccountManagement, title: 'Gestion de compte' },
  ], colors);
}

export default function AppNavigation(): React.JSX.Element {
  const { colors } = useTheme();
  
  // the main navigation container with bottom tab navigation
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }: TabBarIconProps): React.JSX.Element => {
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
        })}
      >
        {/* The tabs */} 
        {/* The HomeStack includes the Home screen and related screens for managing prescriptions and reminders */}
        <Tab.Screen name="HomeStack" component={HomeStackScreen} options={{ headerShown: false }} />
        <Tab.Screen name="Localisation" component={Localisation} options={{ 
          headerTitleAlign: 'center', 
          title: 'Localisation',
          headerTintColor: colors.headerText
        }} />
        <Tab.Screen name="Click & Collect" component={ClickAndCollect} options={{ 
          headerTitleAlign: 'center', 
          title: 'Click & Collect',
          headerTintColor: colors.headerText
        }}/>
        <Tab.Screen name="Chat" component={Chat} options={{ 
          headerTitleAlign: 'center', 
          title: 'Mes discussions',
          headerTintColor: colors.headerText
        }} />
        <Tab.Screen name="ProfileStack" component={ProfileStackScreen} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
