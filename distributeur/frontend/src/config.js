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
  FaHome
} from 'react-icons/fa';
import logo from './assets/logo.png';

const config = {
  // Backend configuration
  backendUrl: 'http://localhost:5000',
  
  // Background colors
  backgroundColors: {
    default: '#e8c3cb', // Main background color from tailwind config
    alternative: '#d5b0b8', // Alternative background mentioned in comments
    primary: '#d45b93', // Primary pink color
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
    button: '#f0d4d9', // Different background for buttons
    text: '#f5e6e9' // Different background for text containers
  },
  
  // Text colors
  textColors: {
    primary: 'text-gray-800', // Main text color used throughout
    secondary: 'text-gray-600', // Secondary text color
    white: 'text-white',
    black: 'text-black', // Black text for light backgrounds
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
    // Main gradient buttons
    mainGradient: 'bg-gradient-to-r from-pink-500 to-rose-400',
    mainGradientHover: 'hover:from-[#d45b93] hover:to-[#e65866] hover:scale-105',
    
    // Action buttons
    red: 'bg-red-500 text-white',
    redHover: 'hover:bg-red-600',
    green: 'bg-green-500 text-white',
    greenHover: 'hover:bg-green-600',
    
    // Alternative buttons
    darkPink: 'bg-pink-900 text-white',
    darkPinkHover: 'hover:bg-pink-950',
    white: 'bg-white text-pink-500',
    
    // Transparent buttons
    transparent: 'bg-transparent text-white',
    
    // Button background color (different from text background)
    buttonBackground: 'bg-pink-200',
    
    // Text area background color
    textBackground: 'bg-pink-100'
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
    ring: 'focus:ring-4 focus:ring-pink-300',
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
  },
  
  // Common button styles
  buttonStyles: {
    // Primary buttons
    primary: 'bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300',
    
    // Secondary buttons
    secondary: 'bg-white text-pink-500 rounded-xl shadow hover:scale-105 transition-transform duration-300',
    
    // Action buttons
    danger: 'bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition-transform duration-300',
    success: 'bg-green-500 text-white rounded-lg shadow-lg transition-transform duration-300',
    
    // Navigation buttons
    back: 'bg-gradient-to-r from-pink-500 to-rose-400 text-gray-800 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 flex items-center',
  },
  
  // Modal styles
  modalStyles: {
    overlay: 'fixed inset-0 bg-black bg-opacity-30 z-50',
    content: 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-1/2 max-h-full bg-gradient-to-b from-pink-500 to-rose-400 text-gray-800 flex flex-col justify-center items-center rounded-2xl shadow-lg p-6 z-50',
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
};

export default config; 