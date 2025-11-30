// src/components/ui/textarea.tsx

import * as React from "react";
import { TextInput, TextInputProps } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledTextInput = styled(TextInput);

// --- Component Props ---
interface TextareaProps extends TextInputProps {
  className?: string;
  error?: boolean; // Custom prop from FormControl to indicate validation error
}

/**
 * @function Textarea
 * @description A styled multiline text input field (using TextInput with multiline=true).
 */
export const Textarea = React.forwardRef<TextInput, TextareaProps>(
  (
    {
      className,
      error = false,
      ...props
    },
    ref
  ) => {
    
    // Dynamic classes based on state (simulating focus-visible and aria-invalid)
    const errorClasses = error 
      ? "border-red-500 ring-4 ring-red-500/20" 
      : "border-gray-300 dark:border-gray-700";
      
    const disabledClasses = props.disabled ? "opacity-50" : "";

    return (
      <StyledTextInput
        ref={ref}
        data-slot="textarea"
        // --- Core RN Multiline/Layout Props ---
        multiline={true}
        textAlignVertical="top" // Ensures text starts at the top (like a web textarea)
        
        placeholderTextColor="#9ca3af" // muted-foreground equivalent
        
        // --- NativeWind styling ---
        className={cn(
          // Base classes: min-height, w-full, rounded border, padding, bg, text size
          "flex min-h-24 w-full rounded-md border bg-gray-100 dark:bg-gray-800 px-3 py-2 text-base",
          "text-gray-900 dark:text-gray-100 placeholder:text-gray-500",
          "resize-none", // RN handles resize differently, but this class is maintained
          
          // Border and error states
          errorClasses,
          disabledClasses,
          
          className,
        )}
        {...props}
      />
    );
  }
);

// Set display name for HOC/forwardRef component
Textarea.displayName = "Textarea";

// --- Export the component ---
export { Textarea };