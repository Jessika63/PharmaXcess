/**
 * useDeviceInfo Hook
 * 
 * Custom React hook to retrieve device and screen information.
 * Provides:
 * - Screen width and height
 * - Device type (phone, tablet, desktop, TV, unknown)
 * - Device orientation (landscape or portrait)
 * 
 * This hook is useful for responsive layouts and device-specific adjustments.
 */

import { useWindowDimensions } from 'react-native';
import * as Device from 'expo-device';

/**
 * Represents the structure of the device information returned by the hook.
 * @typedef {Object} DeviceInfoType
 * @property {number} width - The current width of the device screen.
 * @property {number} height - The current height of the device screen.
 * @property {string} deviceType - The type of the device (phone, tablet, desktop, TV, unknown).
 * @property {boolean} isLandscape - Indicates if the device is in landscape mode.
 */
interface DeviceInfoType {
    width: number;
    height: number;
    deviceType: string;
    isLandscape: boolean;
}

/**
 * Maps Expo Device type codes to readable device type names.
 * @typedef {Object.<number, string>} DeviceTypeMapping
 */
const deviceTypeMapping: { [key: number]: string } = {
  0: 'unknown',
  1: 'phone',
  2: 'tablet',
  3: 'desktop',
  4: 'tv',
};

/**
 * Custom hook to retrieve device information.
 * Automatically updates on screen size changes.
 *
 * @returns {DeviceInfoType} The current device information.
 * 
 * @example
 * const { width, height, deviceType, isLandscape } = useDeviceInfo();
 */
const useDeviceInfo = (): DeviceInfoType => {
    const { width, height } = useWindowDimensions();
    const deviceTypeCode = Device.deviceType;
    const deviceType = deviceTypeCode != null ? deviceTypeMapping[deviceTypeCode] || 'unknown' : 'unknown';
    const isLandscape = width > height;

  return { width, height, deviceType, isLandscape };
};

export default useDeviceInfo;
