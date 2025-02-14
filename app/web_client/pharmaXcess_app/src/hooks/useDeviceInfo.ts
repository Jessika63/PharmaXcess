import { useWindowDimensions } from 'react-native';
import * as Device from 'expo-device';

interface DeviceInfoType {
    width: number;
    height: number;
    deviceType: string;
    isLandscape: boolean;
}

const deviceTypeMapping: { [key: number]: string } = {
  0: 'unknown',
  1: 'phone',
  2: 'tablet',
  3: 'desktop',
  4: 'tv',
};

const useDeviceInfo = (): DeviceInfoType => {
    const { width, height } = useWindowDimensions();
    const deviceTypeCode = Device.deviceType;
    const deviceType = deviceTypeCode != null ? deviceTypeMapping[deviceTypeCode] || 'unknown' : 'unknown';
    const isLandscape = width > height;

  return { width, height, deviceType, isLandscape };
};

export default useDeviceInfo;
