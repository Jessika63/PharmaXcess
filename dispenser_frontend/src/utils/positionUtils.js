import config from '../config';

/**
 * Get the user's current position using browser geolocation
 * @returns {Promise<{lat: number, lon: number}>} User's position
 * @throws {Error} If geolocation fails
 */
export const getUserPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Get default position from backend
 * @param {string} location - Optional location parameter ('paris', 'lyon', etc.)
 * @returns {Promise<{lat: number, lon: number, name: string}>} Default position
 */
export const getDefaultPosition = async (location = 'default') => {
  try {
    const url = `${config.backendUrl}/get_default_position?location=${location}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.position;
    } else {
      throw new Error(data.message || 'Failed to get default position');
    }
  } catch (error) {
    console.error('Error fetching default position:', error);
    // Fallback to hardcoded position if backend fails
    return config.Default_Location;
  }
};

/**
 * Get position with fallback strategy:
 * 1. Try to get user's geolocation
 * 2. If fails, get default position from backend
 * 3. If backend fails, use hardcoded position from config
 * 
 * @param {string} preferredLocation - Preferred location for fallback ('paris', 'lyon', etc.)
 * @returns {Promise<{lat: number, lon: number, name?: string}>} Position
 */
export const getPositionWithFallback = async (preferredLocation = 'default') => {
  try {
    // First try to get user's actual position
    const userPosition = await getUserPosition();
    console.log('✅ Using user geolocation:', userPosition);
    return userPosition;
  } catch (geoError) {
    console.warn('⚠️ Geolocation failed:', geoError.message);
    console.log('🔄 Attempting to get default position from backend...');
    
    try {
      // If geolocation fails, try to get default position from backend
      const defaultPosition = await getDefaultPosition(preferredLocation);
      console.log('✅ Using default position from backend:', defaultPosition);
      return defaultPosition;
    } catch (backendError) {
      console.warn('⚠️ Backend default position failed:', backendError.message);
      console.log('🔄 Using hardcoded fallback position from config...');
      
      // Ultimate fallback: use hardcoded position from config
      const fallbackPosition = config.Default_Location;
      console.log('✅ Using hardcoded fallback position:', fallbackPosition);
      return fallbackPosition;
    }
  }
};

/**
 * Simple function to get position - tries geolocation, falls back to backend default
 * This is the recommended function to use in most cases
 * 
 * @returns {Promise<{lat: number, lon: number}>} Position
 */
export const getPosition = async () => {
  try {
    return await getUserPosition();
  } catch (error) {
    console.warn('Geolocation not available, using default position');
    const defaultPos = await getDefaultPosition();
    return {
      lat: defaultPos.lat,
      lon: defaultPos.lon
    };
  }
};
