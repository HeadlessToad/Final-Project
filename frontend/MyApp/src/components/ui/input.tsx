// src/components/ui/input.tsx

import * as React from "react";
import { TextInput, TextInputProps, View, Text } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
// Note: We style the TextInput directly and use a View wrapper if needed for complex styles.
const StyledTextInput = styled(TextInput);

// --- Component Props ---
// Extend standard TextInputProps and add a custom 'error' prop for conditional styling
interface InputProps extends TextInputProps {
  className?: string;
  type?: 'text' | 'email' | 'password' | 'number-pad' | 'url'; // Simplified web 'type' prop mapping
  error?: boolean; // Custom prop from FormControl to indicate validation error
}

/**
 * @function Input
 * @description A styled wrapper around the native TextInput component, used for text input fields.
 */
export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      className,
      type = 'text',
      error = false,
      ...props
    },
    ref
  ) => {
    
    // Map web 'type' to RN 'keyboardType' and 'secureTextEntry'
    const keyboardTypeMap: Record<string, TextInputProps['keyboardType']> = {
      'email': 'email-address',
      'number-pad': 'numeric',
      'url': 'url',
      'text': 'default',
    };
    
    const isPassword = type === 'password';
    
    // Dynamic classes based on state (simulating focus-visible and aria-invalid)
    const errorClasses = error 
      ? "border-red-500 ring-4 ring-red-500/20" 
      : "border-gray-300 dark:border-gray-700";
      
    const disabledClasses = props.disabled ? "opacity-50" : "";


    return (
      <StyledTextInput
        ref={ref}
        data-slot="input"
        // RN props mapping
        keyboardType={keyboardTypeMap[type] || 'default'}
        secureTextEntry={isPassword}
        placeholderTextColor="#9ca3af" // muted-foreground equivalent
        
        // NativeWind styling
        className={cn(
          // Base classes: flex h, w-full, min-w-0, rounded border, padding, text size, bg
          "flex h-12 w-full min-w-0 rounded-md px-3 py-1 text-base bg-gray-100 dark:bg-gray-800",
          "text-gray-900 dark:text-gray-100 placeholder:text-gray-500",
          
          // Border and error states
          errorClasses,
          disabledClasses,
          
          // Focus is handled by the RN Pressable/TextInput focus state and NativeWind's focus: classes.
          // Note: focus-visible: classes are often simplified to focus: in RN/NativeWind.
          
          className,
        )}
        {...props}
      />
    );
  }
);

// Set display name for HOC/forwardRef component
Input.displayName = "Input";

// --- Export the component ---
export { Input };