// src/components/ui/label.tsx

import * as React from "react";
import { Text, TextProps } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledText = styled(Text);

// --- Component Props ---
// We use TextProps and include a custom prop 'htmlFor' for compatibility 
// (though it doesn't function in RN)
interface LabelProps extends TextProps {
  className?: string;
  htmlFor?: string; // Kept for compatibility with the Form component structure
}

/**
 * @function Label
 * @description A styled wrapper around the native Text component, used for labeling form fields.
 * Note: In React Native, the label is visually associated with the input, 
 * not programmatically linked via 'htmlFor'. Accessibility is handled via Input props.
 */
export function Label({
  className,
  htmlFor, // Retained for type compatibility with form.tsx
  children,
  ...props
}: LabelProps) {
  
  // We remove all complex pseudo-classes and rely on standard text styling
  
  return (
    <StyledText
      data-slot="label"
      // Base classes: text size, font weight, and spacing
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium text-gray-800 dark:text-gray-200",
        // Note: Disabled states for labels should be handled by the parent FormItem 
        // passing down an explicit 'disabled' prop or styling.
        className,
      )}
      {...props}
    >
      {children}
    </StyledText>
  );
}

// --- Export the component ---
export { Label };