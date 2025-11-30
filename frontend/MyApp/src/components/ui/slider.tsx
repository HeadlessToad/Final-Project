// src/components/ui/slider.tsx

import * as React from "react";
import { View, ViewProps, StyleProp } from "react-native";
import SliderRN, { SliderProps as RNSliderProps } from '@react-native-community/slider';
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);

// --- Component Props (Simplified for single-thumb standard RN slider) ---
interface SliderProps extends Omit<RNSliderProps, 'style' | 'thumbTintColor' | 'minimumTrackTintColor' | 'maximumTrackTintColor'> {
  className?: string;
  // Radix props kept for compatibility, though complex range logic is omitted
  value?: number | number[]; 
  defaultValue?: number | number[];
  min?: number;
  max?: number;
}

/**
 * @function Slider
 * @description A styled wrapper around the native Slider component for single-value selection.
 * Note: Range selection (multiple thumbs) requires a specialized library not covered here.
 */
export function Slider({
  className,
  value, // We take the first value if it's an array
  defaultValue, // We take the first value if it's an array
  min = 0,
  max = 100,
  ...props
}: SliderProps) {
  
  // Extract a single value for the standard RN slider
  const singleValue = (Array.isArray(value) ? value[0] : value) as number | undefined;
  const singleDefaultValue = (Array.isArray(defaultValue) ? defaultValue[0] : defaultValue) as number | undefined;

  return (
    <StyledView
      data-slot="slider"
      // Container to set width/alignment. Orientation logic is complex and omitted.
      className={cn(
        "relative flex w-full touch-none items-center select-none disabled:opacity-50",
        className,
      )}
      // The default orientation is horizontal
    >
      <SliderRN
        // --- Value Props ---
        value={singleValue}
        minimumValue={min}
        maximumValue={max}
        step={props.step || 0}
        disabled={props.disabled}
        
        // --- Track Styling (Matches Radix design) ---
        // Track color (muted)
        maximumTrackTintColor="#d1d5db" // bg-muted (light gray)
        // Range color (primary)
        minimumTrackTintColor="#3b82f6" // bg-primary (blue)
        
        // --- Thumb Styling (Matches Radix design) ---
        // Thumb color (bg-background)
        thumbTintColor="white" 
        
        // --- Standard RN Props ---
        style={{ width: '100%', height: 40 }} // Set explicit width/height
        {...props}
      />
      
      {/* Thumb and additional Track elements are managed natively by SliderRN. */}
    </StyledView>
  );
}

// --- Export the component ---
export { Slider };