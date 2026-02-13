// Frontend configuration file
import {
  FaPrescriptionBottle,
  FaPills,
  FaSearch,
  FaArrowLeft,
  FaMoneyBillWave,
  FaFilter,
  FaSync,
  FaTimes,
  FaRedo,
  FaClock,
  FaMapMarkerAlt,
  FaWalking,
  FaBicycle,
  FaBus,
  FaCar,
  FaFilePrescription,
  FaIdCard,
  FaAddressCard,
  FaCheck,
  FaCamera,
  FaUndo,
  FaTimesCircle,
  FaHome,
  FaQrcode,
  FaInfoCircle,
  FaExclamationTriangle,
  FaShoppingCart

} from 'react-icons/fa';
import logo from './assets/logo.png';

const env = process.env.REACT_APP_ENV;

let backendUrl;

if (env === 'production') {
    backendUrl = 'http://57.128.57.96:5000';
} else if (env === 'development') {
    backendUrl = 'http://localhost:5000';
} else {
    console.error("⚠️ La variable ENV n'est pas définie correctement");
}
backendUrl = 'http://57.128.57.96:5000';
// Define the constants separately first
const Epitech_Paris = {
  lat: 48.815273,
  lon: 2.363006,
  name: "Epitech Kremlin-Bicêtre",
};

const Epitech_Lyon = {
  lat: 45.746288,
  lon: 4.835127,
  name: "Epitech Lyon",
};

const getDefaultLocation = () => {
  const location = process.env.REACT_APP_DEFAULT_LOCATION || 'paris';
  return location === 'lyon' ? Epitech_Lyon : Epitech_Paris;
};

const config = {
  // Backend configuration
  backendUrl: backendUrl,

  // Configuration CORS dynamique
  cors: {
    secretKey: process.env.REACT_APP_CORS_SECRET_KEY,
    registerEndpoint: '/register-origin',
    isRegistered: false
  },

  // Background colors
  backgroundColors: {
    default: 'rgba(245, 113, 150, 0.15)', // #F57196 at 15% opacity 
    alternative: 'rgba(245, 113, 150, 0.20)', // Slightly more opaque variant
    primary: '#F57196', // Primary pink color
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    button: '#000000', // Black background for buttons
    text: '#ffffff' // White background for text containers/steps
  },

  // Text colors
  textColors: {
    primary: 'text-black', // Main text color - black
    secondary: 'text-gray-700', // Secondary text color 
    white: 'text-white',
    black: 'text-black', // Black text for light backgrounds
    button: 'text-black', // Black text for buttons 

    red: 'text-red-600',
    pink: 'text-pink-500',
    green: 'text-green-500',
  },

  // Font sizes
  fontSizes: {
    xs: 'text-base',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    xxl: 'text-5xl', // Used in some modals
  },

  // Button colors and styles
  buttonColors: {
    // Main buttons - white background with black text 
    mainGradient: 'bg-white',
    mainGradientHover: 'hover:bg-gray-100 hover:scale-105',


    // Action buttons
    red: 'bg-red-600 text-white',
    redHover: 'hover:bg-red-700', 
    green: 'bg-green-600 text-white', 
    greenHover: 'hover:bg-green-700', 


    // Alternative buttons
    darkPink: 'bg-white text-black',
    darkPinkHover: 'hover:bg-gray-100',
    white: 'bg-white text-black',


    // Transparent buttons
    transparent: 'bg-transparent text-black',

    // Button background color - white
    buttonBackground: 'bg-white', 

    // Text area/steps background color - white 
    textBackground: 'bg-white'

  },

  // Border radius
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  },

  // Shadows
  shadows: {
    sm: 'shadow',
    md: 'shadow-lg',
    lg: 'shadow-xl',
  },

  // Transitions
  transitions: {
    default: 'transition-transform duration-300',
    slow: 'transition-transform duration-500',
  },

  // Focus states
  focusStates: {
    ring: 'focus:ring-4 focus:ring-gray-400', 

    outline: 'focus:outline-none',
  },

  // Scale effects
  scaleEffects: {
    hover: 'hover:scale-105',
    focus: 'scale-105',
  },

  // Icons - All icons used in the application
  icons: {
    // Navigation icons
    arrowLeft: FaArrowLeft,
    redo: FaRedo,
    undo: FaUndo,

    // Action icons
    check: FaCheck,
    times: FaTimes,
    timesCircle: FaTimesCircle,
    sync: FaSync,

    // Medical icons
    prescription: FaPrescriptionBottle,
    pills: FaPills,
    filePrescription: FaFilePrescription,
    cart: FaShoppingCart,


    // Document icons
    idCard: FaIdCard,
    addressCard: FaAddressCard,

    // Search and filter icons
    search: FaSearch,
    filter: FaFilter,

    // Payment and money icons
    money: FaMoneyBillWave,

    // Time and clock icons
    clock: FaClock,

    // Location and map icons
    mapMarker: FaMapMarkerAlt,

    // Transport icons
    walking: FaWalking,
    bicycle: FaBicycle,
    bus: FaBus,
    car: FaCar,

    // Camera and media icons
    camera: FaCamera,

    // Logo
    logo: logo,

    // Home icon
    home: FaHome,

    qrCode: FaQrcode,

    // Info and warning icons
    info: FaInfoCircle,
    warning: FaExclamationTriangle,
  },

  // Common button styles
  buttonStyles: {
    // Primary buttons 
    primary: 'bg-white text-black rounded-2xl shadow-lg hover:bg-gray-100 hover:scale-105 transition-transform duration-300',

    // Secondary buttons 
    secondary: 'bg-white text-black rounded-xl shadow hover:bg-gray-100 hover:scale-105 transition-transform duration-300',

    // Action buttons
    danger: 'bg-red-600 text-white rounded-x1 shadow hover:bg-red-700 transition-transform duration-300', 
    success: 'bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform duration-300',

    // Navigation buttons - white with black text
    back: 'bg-white text-black rounded-2x1 shadow-lg hover:bg-gray-100 hover:scale-105 transition-transform duration-300 flex items-center',
  },

  // Modal styles
  modalStyles: {
    overlay: 'fixed inset-0 bg-black bg-opacity-30 z-50',
    content: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-1/2 max-h-full bg-white text-black flex flex-col justify-center items-center rounded-2xl shadow-lg p-6 z-50',
  },

  // Layout classes
  layout: {
    container: 'w-full h-screen flex flex-col items-center',
    header: 'w-4/5 flex justify-between items-center',
    content: 'w-2/3 flex flex-col items-center',
    buttonGrid: 'grid grid-cols-1 gap-4 place-items-center',
    buttonGrid3: 'grid grid-cols-3 gap-6',
  },

  // Spacing
  spacing: {
    xs: 'space-y-4',
    sm: 'space-y-6',
    md: 'space-y-8',
    lg: 'space-y-12',
    xl: 'space-y-16',
    xxl: 'space-y-28',
  },

  // Padding and margins
  padding: {
    button: 'px-8 py-4',
    buttonLarge: 'px-12 py-8',
    buttonXLarge: 'px-16 py-6',
    modal: 'p-6',
    container: 'p-8',
  },

  // Margins
  margins: {
    top: 'mt-2',
    topMedium: 'mt-6',
    topLarge: 'mt-12',
    bottom: 'mb-4',
    bottomMedium: 'mb-8',
    bottomLarge: 'mb-12',
  },
  // Default position if no geolocation
  Epitech_Paris: Epitech_Paris,
  Epitech_Lyon: Epitech_Lyon,
  Default_Location: getDefaultLocation(),

};

export default config;
