// src/constants/theme.ts

import { useColorScheme } from "nativewind";

// --- 1. Base Colors (Mapping CSS values for TypeScript/Logic) ---
// These are the raw values for use in RN styles (e.g., Progress bar tintColor)
export const Colors = {
    // Light Mode
    light: {
        primary: "#2ECC71",
        secondary: "#3498DB",
        background: "#FAFAFA",
        surface: "#FFFFFF",
        error: "#E74C3C",
        onSurface: "#1A1A1A",
        outline: "#E0E0E0",
    },
    // Dark Mode
    dark: {
        primary: "#2ECC71",
        secondary: "#3498DB",
        background: "#121212",
        surface: "#1E1E1E",
        error: "#EF5350",
        onSurface: "#E8E8E8",
        outline: "#3A3A3A",
    }
};

/**
 * @function useAppTheme
 * @description Provides the current color scheme state for conditional logic 
 * and manually setting theme colors.
 */
export function useAppTheme() {
    const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const themeColors = isDark ? Colors.dark : Colors.light;

    return {
        isDark,
        themeColors,
        colorScheme,
        setColorScheme,
        toggleColorScheme,
    };
}

// --- 2. Global Styles (Simulating global.css Typography) ---
// This ensures h1, h2, etc., look correct when used in a default Text component.

export const Typography = {
    h1: "text-4xl font-semibold leading-tight tracking-tight", // 32px, 500 weight
    h2: "text-2xl font-semibold leading-snug",                 // 24px, 500 weight
    h3: "text-xl font-medium leading-normal",                  // 20px, 500 weight
    h4: "text-base font-medium leading-relaxed",               // 16px, 500 weight
    p: "text-sm leading-relaxed",                              // 14px
};