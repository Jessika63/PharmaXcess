import { AccessibilityProps } from "react-native";

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

export const getHiddenAccessibilityProps = (): AccessibilityProps => {
    return {
        accessible: false,
        importantForAccessibility: "no-hide-descendants",
    };
};