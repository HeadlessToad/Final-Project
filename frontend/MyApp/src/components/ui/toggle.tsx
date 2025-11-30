// src/components/ui/toggle.tsx

import * as React from "react";
import { Pressable, Text, ViewProps, PressableProps, TextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

// --- Toggle Variants (The Core CVA) ---
export const toggleVariants = cva(
  // Base classes: inline-flex (flex row), centered, rounded, font styles
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50",
  {
    variants: {
      variant: {
        // Default (Transparent background, relies on text/active colors)
        default: "bg-transparent text-gray-700 active:bg-gray-200 dark:text-gray-200 dark:active:bg-gray-700",
        
        // Outline (Bordered, transparent background)
        outline:
          "border border-gray-300 bg-transparent hover:bg-gray-200 hover:text-gray-900 active:bg-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 dark:active:bg-gray-700",
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-8 px-2 min-w-8",
        lg: "h-12 px-3 min-w-12",
      },
      // Custom variant to handle the Radix data-[state=on] styling
      state: {
        on: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100", // Accent color for 'on' state
        off: "bg-transparent text-gray-600 dark:text-gray-300",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "off",
    },
  },
);

// --- Toggle Component Props ---
interface ToggleProps extends PressableProps, VariantProps<typeof toggleVariants> {
  className?: string;
  children: React.ReactNode;
  // Standard RN controlled state props
  pressed?: boolean; // Replaces Radix 'state' prop
  onPressedChange?: (pressed: boolean) => void;
  defaultPressed?: boolean;
}

/**
 * @function Toggle
 * @description A multi-variant, two-state button component.
 */
export function Toggle({
  className,
  variant,
  size,
  pressed: controlledPressed,
  onPressedChange,
  defaultPressed = false,
  children,
  ...props
}: ToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = React.useState(defaultPressed);
  
  const isControlled = controlledPressed !== undefined;
  const isPressed = isControlled ? controlledPressed : uncontrolledPressed;

  const handlePress = (event: any) => {
    if (props.disabled) return;
    
    const newPressedState = !isPressed;
    if (!isControlled) {
      setUncontrolledPressed(newPressedState);
    }
    onPressedChange?.(newPressedState);
    props.onPress?.(event);
  };
  
  const stateVariant = isPressed ? "on" : "off";

  return (
    <StyledPressable
      data-slot="toggle"
      accessibilityRole="button"
      accessibilityState={{ selected: isPressed }}
      onPress={handlePress}
      // Apply CVA styling
      className={cn(toggleVariants({ variant, size, state: stateVariant, className }))}
      {...props}
    >
        {/* We explicitly wrap children in a Text component if they are strings */}
        {React.Children.map(children, (child) => 
            typeof child === 'string' || typeof child === 'number' ? (
                <StyledText className="text-sm font-medium text-inherit">{child}</StyledText>
            ) : (
                // Assume non-text children are icons and render them directly
                child
            )
        )}
    </StyledPressable>
  );
}

// --- Export the component and variants ---
export { Toggle, toggleVariants };