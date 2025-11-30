// src/components/ui/progress.tsx

import * as React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);
const StyledAnimatedView = styled(Animated.View);

// --- Component Props ---
interface ProgressProps extends ViewProps {
  className?: string;
  value: number; // The progress value (0 to 100)
  indicatorClassName?: string; // Optional class for the colored bar
}

/**
 * @function Progress
 * @description A customizable progress bar component with animated updates.
 * @param {number} value - The progress percentage (0-100).
 */
export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  
  const progressValue = Math.min(100, Math.max(0, value || 0));
  
  // Use Reanimated to smoothly transition the width property
  const animatedStyle = useAnimatedStyle(() => {
    return {
      // The width is directly set by the progress value
      width: withTiming(`${progressValue}%`, { duration: 400 }),
    };
  });

  return (
    <StyledView
      data-slot="progress"
      className={cn(
        // Root styling: track color (primary/20), fixed height, full width, rounded
        "bg-blue-600/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <StyledAnimatedView
        data-slot="progress-indicator"
        // Base styling for the indicator bar
        className={cn(
          "bg-blue-600 h-full", // primary color, full height
          indicatorClassName
        )}
        // Apply the animated width style
        style={animatedStyle}
      />
    </StyledView>
  );
}

// --- Export the component ---
export { Progress };