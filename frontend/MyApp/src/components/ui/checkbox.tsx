// src/components/ui/checkbox.tsx

import * as React from "react";
import { View, Pressable, PressableProps } from "react-native";
import { Check } from "lucide-react-native"; // CheckIcon renamed to Check in RN version
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);

// --- Component Props ---
interface CheckboxProps extends Omit<PressableProps, 'onPress'> {
  // Use RN standard props for controlled/uncontrolled state
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  defaultChecked?: boolean;
  className?: string;
}

/**
 * @function Checkbox
 * @description A multi-variant checkbox component that handles its own checked state 
 * and provides clear visual feedback.
 */
export function Checkbox({
  className,
  checked: controlledChecked,
  onCheckedChange,
  defaultChecked = false,
  disabled,
  ...props
}: CheckboxProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);

  const isControlled = controlledChecked !== undefined;
  const isChecked = isControlled ? controlledChecked : uncontrolledChecked;

  // Handle the press event to toggle state
  const handlePress = () => {
    if (disabled) return;

    const newCheckedState = !isChecked;
    if (!isControlled) {
      setUncontrolledChecked(newCheckedState);
    }
    onCheckedChange?.(newCheckedState);
  };
  
  // Dynamic class name based on state
  const checkedClasses = isChecked
    ? "bg-blue-600 border-blue-600" // data-[state=checked]:bg-primary
    : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600"; // bg-input-background, border

  return (
    <StyledPressable
      data-slot="checkbox"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled: disabled }}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        // Base styling: size, shape, shadow, transition
        "size-4 shrink-0 rounded-[4px] border shadow-xs transition-opacity flex items-center justify-center",
        
        // Dynamic styling for checked state
        checkedClasses,
        
        // Disabled styling
        disabled && "opacity-50",
        
        // Focus/Ring is handled by NativeWind's implementation of Pressable styles
        // You would typically use focus:ring-3 in NativeWind if needed, but we keep it simple here.
        
        className,
      )}
      {...props}
    >
      {/* Checkmark Indicator */}
      {isChecked && (
        <StyledView
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-white"
        >
          {/* CheckIcon with size matching original size-3.5 */}
          <Check size={14} color="white" /> 
        </StyledView>
      )}
    </StyledPressable>
  );
}

// --- Export the component ---
export { Checkbox };