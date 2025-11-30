// src/components/ui/skeleton.tsx

import * as React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledAnimatedView = styled(Animated.View);

// --- Component Props ---
interface SkeletonProps extends ViewProps {
  className?: string;
}

/**
 * @function Skeleton
 * @description A placeholder component that pulsates to indicate content is loading.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  
  // 1. Animated Opacity Value (Mimics animate-pulse)
  const pulseOpacity = useSharedValue(1);

  React.useEffect(() => {
    // Start the pulsing animation when the component mounts
    pulseOpacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, easing: Easing.inOut(Easing.quad) }), // Fade out to 0.5 opacity
      -1, // Repeat indefinitely
      true // Reverse the animation (fade back in)
    );
  }, [pulseOpacity]);

  // 2. Animated Style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
    };
  });

  return (
    <StyledAnimatedView
      data-slot="skeleton"
      // Base classes: background color, rounded corners
      className={cn("bg-gray-200 dark:bg-gray-700 rounded-md", className)}
      style={animatedStyle}
      {...props}
    />
  );
}

// --- Export the component ---
export { Skeleton };