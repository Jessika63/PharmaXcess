import { findNodeHandle, AccessibilityInfo } from "react-native";
import { RefObject } from "react";

export const setScreenAccessibilityFocus = (ref: RefObject<any>) => {
    const reactTag = ref?.current?._nativeTag || findNodeHandle(ref.current);
    if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
};

export const announceForAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
}