// src/components/ui/aspect-ratio.tsx

import * as React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Assuming utils.ts with cn is available

const StyledView = styled(View);

// Define the component's props
interface AspectRatioProps extends React.ComponentProps<typeof View> {
  // Use a string to represent the desired ratio, e.g., "16/9", "4/3"
  ratio?: string; 
  className?: string; // For NativeWind classes, including aspect-ratio utilities
  style?: StyleProp<ViewStyle>;
}

/**
 * @function AspectRatio
 * @description A wrapper component that maintains a consistent width-to-height ratio 
 * for its child content, often used for images or videos.
 * * @param {string} [ratio] - The desired aspect ratio (e.g., "16/9" or "1").
 * @param {string} [className] - NativeWind classes, which can include aspect-ratio utilities 
 * like 'aspect-square' or 'aspect-video'.
 */
export function AspectRatio({
  ratio,
  className,
  children,
  style,
  ...props
}: AspectRatioProps) {
  
  // 1. Calculate the padding percentage if a ratio prop is provided
  // Example: ratio="16/9" -> 9/16 * 100 = 56.25%
  let paddingBottom: number | undefined = undefined;

  if (ratio) {
    const parts = ratio.split('/');
    if (parts.length === 2) {
      const width = parseFloat(parts[0]);
      const height = parseFloat(parts[1]);
      if (width > 0 && height > 0) {
        // We use an invisible padding view wrapper in RN to force the height
        // based on the percentage of the width (Flexbox standard approach).
        // This is a common pattern when NativeWind's aspect-ratio class isn't sufficient.
        paddingBottom = (height / width) * 100;
      }
    }
  }

  // 2. Render the wrapper View
  // We prioritize the NativeWind className utilities if they are passed.
  // Otherwise, we use the calculated padding for a programmatic ratio.
  return (
    <StyledView
      className={cn("w-full relative", className)}
      style={style}
      {...props}
    >
      {/* This is the "trick" to set the height based on the width. 
        It only works if the parent has a defined width.
        If className contains 'aspect-ratio' classes, this wrapper is redundant 
        but serves as a robust fallback/alternative implementation.
      */}
      {paddingBottom !== undefined && (
        <View style={{ paddingTop: `${paddingBottom}%` }} />
      )}

      {/* The content container (children) positioned absolutely */}
      <View style={[StyleSheet.absoluteFill, { alignItems: 'stretch', justifyContent: 'center' }]}>
        {children}
      </View>
    </StyledView>
  );
}

// Export the component
export { AspectRatio };