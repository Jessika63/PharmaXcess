/**
 * Accessibility Configuration Utilities
 * Provides functions to programmatically manage screen reader focus and announcements.
 */

import { findNodeHandle, AccessibilityInfo } from "react-native";
import { RefObject } from "react";

/**
 * Set focus to a specific component for screen readers.
 * 
 * @param {RefObject<any>} ref - React reference to the target component.
 */
export const setScreenAccessibilityFocus = (ref: RefObject<any>) => {
    const reactTag = ref?.current?._nativeTag || findNodeHandle(ref.current);
    if (reactTag) {
        AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
};

/**
 * Announces a message for screen readers.
 * 
 * @param {string} message - The message to be announced.
 */
export const announceForAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
}