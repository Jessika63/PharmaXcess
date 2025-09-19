// color definitions for the light and dark themes in a React Native application.
export interface ColorScheme {
  // primary colors
  primary: string;
  secondary: string;
  accent: string;
  
  // background colors
  background: string;
  surface: string;
  card: string;
  
  // profile colors
  profileBorder: string;
  profileText: string;
  
  // text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // state colors 
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // interface colors
  border: string;
  divider: string;
  shadow: string;
  
  // specific application colors
  tabBarActive: string;
  tabBarInactive: string;
  headerBackground: string;
  headerText: string;

  // settings colors
  settingsTitle: string; 
  optionsPrimary: string;
  optionsSecondary: string;

  // icon colors
  iconPrimary: string; 

  // info colors
  infoTitle: string;
  infoText: string;
  infoTextSecondary: string;

  // input colors
  inputBackground: string;
  inputBorder: string;

  // edit button colors
  editButtonBackground: string;
}

export const lightTheme: ColorScheme = {
  // primary colors
  primary: '#EE9AD0', // good
  secondary: '#F57196', // good
  accent: '#FF6B9D', // good
  
  // background colors
  background: '#FFFFFF', // good
  surface: '#F8F9FA',
  card: '#f8f8f8', // good

  // profile colors
  profileBorder: '#F57196', // good
  profileText: '#333333', // good
  
  // Text colors 
  text: '#FFFFFF', // good
  textSecondary: '#666666',
  textMuted: '#999999',
  
  // state colors 
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // interface colors
  border: '#E0E0E0', // good
  divider: '#F0F0F0',
  shadow: '#000000', // good
  
  // specific application colors
  tabBarActive: '#F57196', // good
  tabBarInactive: '#F7C5E0', // good
  headerBackground: '#FFFFFF', // good
  headerText: '#1A1A1A', // good

  // settings
  settingsTitle: '#F57196', // good
  optionsPrimary: '#adadad', // good
  optionsSecondary: '#F57196', // good

  // icon colors
  iconPrimary: '#FFFFFF', // good

  // info colors
  infoTitle: '#333333', // good
  infoText: '#666666', // good
  infoTextSecondary: '#999999', // good

  // input colors
  inputBackground: '#F2F2F2', // good
  inputBorder: '#cccccc', // good

  // edit button colors
  editButtonBackground: '#F57196', // good
};

export const darkTheme: ColorScheme = {
  // primary colors
  primary: '#EE9AD0', // good
  secondary: '#F57196', // good
  accent: '#FF6B9D', // good
   
  // background colors
  background: '#121212', // good
  surface: '#1E1E1E',
  card: '#999999', // good

  // profile colors
  profileBorder: '#F57196', // good
  profileText: '#FFFFFF', // good
  
  // Text colors
  text: '#FFFFFF', // good
  textSecondary: '#CCCCCC',
  textMuted: '#888888',
  
  // state colors
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',
  
  // interface colors
  border: '#404040', // good
  divider: '#333333',
  shadow: '#000066', // good
  
  // specific application colors
  tabBarActive: '#F57196', // good
  tabBarInactive: '#B85C7A', // good
  headerBackground: '#1E1E1E', // good
  headerText: '#FFFFFF',  // good

  // settings
  settingsTitle: '#F57196', // good
  optionsPrimary: '#797979', // good
  optionsSecondary: '#F57196', // good

  // icon colors
  iconPrimary: '#FFFFFF', // good

  // info colors
  infoTitle: '#1e1e1e', // good
  infoText: '#3a3a3a', // good
  infoTextSecondary: '#555555', // good

  // input colors
  inputBackground: '#5F5F5F', // good
  inputBorder: '#404040', // good

  // edit button colors
  editButtonBackground: '#F57196', // good
};

export const Colors = {
  light: lightTheme,
  dark: darkTheme,
};
