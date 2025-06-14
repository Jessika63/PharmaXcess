/**
 * Accessibility Utility Functions
 * Provides helpers to generate consistent accessibility props for React Native components.
 */

import { AccessibilityProps } from "react-native";

/**
 * Returns accessibility props for a visible and accessible component.
 *
 * @param {Object} params - Accessibility configuration.
 * @param {string} [params.label] - The accessibility label for screen readers.
 * @param {string} [params.hint] - Additional hint for screen readers.
 * @param {AccessibilityProps["accessibilityRole"]} [params.role] - Defines the role of the component (button, header, etc.).
 * @param {AccessibilityProps["accessibilityState"]} [params.state] - Describes the current state (selected, disabled, checked, etc.).
 * @param {"auto" | "yes" | "no" | "no-hide-descendants"} [params.importantForAccessibility] - Controls how important the component is for accessibility services.
 * @param {"none" | "polite" | "assertive"} [params.liveRegion] - Defines the live region behavior for accessibility announcements.
 * 
 * @returns {AccessibilityProps} - A set of accessibility props ready to be spread into a component.
 */
export const getAccessibilityProps = ({
    label,
    hint,
    role,
    state,
    importantForAccessibility,
    liveRegion,
}: {
    label?: string;
    hint?: string;
    role?: AccessibilityProps["accessibilityRole"];
    state?: AccessibilityProps["accessibilityState"];
    importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
    liveRegion?: "none" | "polite" | "assertive";
}
): AccessibilityProps => {
    return {
        accessible: true,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityRole: role,
        accessibilityState: state,
        importantForAccessibility: importantForAccessibility || "auto",
        accessibilityLiveRegion: liveRegion || "none",
    };
};

/**
 * Returns accessibility props to completely hide a component from screen readers.
 *
 * @returns {AccessibilityProps} - Props that make the component invisible to accessibility services.
 */
export const getHiddenAccessibilityProps = (): AccessibilityProps => {
    return {
        accessible: false,
        importantForAccessibility: "no-hide-descendants",
    };
};