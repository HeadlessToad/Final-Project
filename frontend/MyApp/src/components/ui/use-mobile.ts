// src/hooks/use-mobile.ts

import * as React from "react";
import { useWindowDimensions } from "react-native";

// --- Constants ---
// Define a standard mobile breakpoint width (e.g., typically max width of a large phone/min width of a tablet)
const MOBILE_BREAKPOINT = 768; // Matches the original web breakpoint

/**
 * @function useIsMobile
 * @description A responsive hook that returns true if the current screen width is below
 * the defined MOBILE_BREAKPOINT (768px), distinguishing between phones and tablets/web views.
 * @returns {boolean} True if the device width is considered "mobile" (phone sized).
 */
export function useIsMobile(): boolean {
  // useWindowDimensions is preferred over Dimensions.get('window') 
  // because it automatically updates on rotation or screen resizing (e.g., split screen).
  const { width } = useWindowDimensions();

  // If running on a narrow phone screen, return true.
  // This logic is crucial for running your previously converted components 
  // that rely on this hook for conditional rendering (like Sidebar).
  return width < MOBILE_BREAKPOINT;
}

/**
 * @function useMobileBreakpoint
 * @description An alternative to provide the dimensions directly for finer control.
 * @returns {object} { width, height, isMobile }
 */
export function useMobileBreakpoint() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;

  return { width, height, isMobile, MOBILE_BREAKPOINT };
}