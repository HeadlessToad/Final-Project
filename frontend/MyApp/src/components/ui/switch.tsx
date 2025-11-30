// src/components/ui/switch.tsx

import * as React from "react";
import { View, Pressable, PressableProps, Animated } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; 
import AnimatedRe, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

// --- Styled Components ---
const StyledPressable = styled(Pressable);
const StyledAnimatedView = styled(AnimatedRe.View);

// --- Constants ---
const SWITCH_WIDTH = 32; // w-8 (32px)
const SWITCH_HEIGHT = 18.4; // h-[1.15rem] (approx 18.4px)
const THUMB_SIZE = 16; // size-4 (16px)
const THUMB_OFFSET = SWITCH_WIDTH - THUMB_SIZE - 2; // Calculation for the 'checked' position (32 - 16 - 2px gap = 14px)

// --- Component Props ---
interface SwitchProps extends Omit<PressableProps, 'onPress'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  className?: string; // For the root track
  thumbClassName?: string; // For the thumb indicator
}

/**
 * @function Switch
 * @description A fully customizable toggle switch component using Reanimated.
 */
export function Switch({
  className,
  thumbClassName,
  checked: controlledChecked,
  onCheckedChange,
  defaultChecked = false,
  disabled,
  ...props
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);

  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;
  
  // Reanimated Shared Value for the thumb's translation (x-position)
  const translateX = useSharedValue(isChecked ? THUMB_OFFSET : 0);

  // --- Animation Logic ---
  React.useEffect(() => {
    // Animate the thumb when the state changes
    translateX.value = withTiming(isChecked ? THUMB_OFFSET : 0, { duration: 250 });
  }, [isChecked, translateX]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });
  
  // --- Styling Logic (Mimics data-[state=checked] and data-[state=unchecked]) ---
  const trackClasses = isChecked 
    ? "bg-blue-600 border-blue-600" // data-[state=checked]:bg-primary
    : "bg-gray-300 dark:bg-gray-700"; // data-[state=unchecked]:bg-switch-background

  const handlePress = () => {
    if (disabled) return;
    
    const newCheckedState = !isChecked;
    if (!isControlled) {
      setUncontrolledChecked(newCheckedState);
    }
    onCheckedChange?.(newCheckedState);
  };

  return (
    <StyledPressable
      data-slot="switch"
      accessibilityRole="switch"
      accessibilityState={{ checked: isChecked, disabled: disabled }}
      onPress={handlePress}
      disabled={disabled}
      // Track (Root) Styling
      className={cn(
        "inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all",
        "relative overflow-hidden", // Necessary for the thumb to look correct
        trackClasses,
        disabled && "opacity-50",
        className,
      )}
      style={{ 
        width: SWITCH_WIDTH, 
        height: SWITCH_HEIGHT,
        // The thumb starts inside the track, so we need a slight padding/gap if needed.
        // We handle the offset in the THUMB_OFFSET calculation above.
      }}
      {...props}
    >
      {/* Thumb (Indicator) */}
      <StyledAnimatedView
        data-slot="switch-thumb"
        // Thumb Styling
        className={cn(
          "block size-4 rounded-full shadow-sm",
          isChecked 
            ? "bg-white" // Checked: bg-primary-foreground
            : "bg-white", // Unchecked: bg-card or bg-card-foreground
          thumbClassName
        )}
        style={[{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          // Fixed positioning required for Reanimated translation
          position: 'absolute',
          left: 1, // 1px visual inset/padding
          top: 1,
        }, animatedThumbStyle]}
      />
    </StyledPressable>
  );
}

// --- Export the component ---
export { Switch };