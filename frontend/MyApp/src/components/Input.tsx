// src/components/ui/input.tsx

import * as React from 'react';
import { TextInput, TextInputProps, View, Text, ViewProps, StyleProp, TextStyle } from 'react-native';
import { styled } from 'nativewind';
import { cn } from './utils';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

// --- Component Props (Merged with existing interface, updated for RN) ---
interface InputProps extends Omit<TextInputProps, 'style' | 'onChange' | 'value'> {
  type?: 'text' | 'email' | 'password' | 'number-pad' | 'url'; // Simplified web type mapping
  placeholder?: string;
  label?: string;
  value?: string;
  onChange?: (text: string) => void; // RN onChangeText
  icon?: React.ReactNode;
  error?: string | boolean; // Can be a string message or a boolean state from useForm
  fullWidth?: boolean;
  className?: string;
}

/**
 * @function Input
 * @description A styled wrapper around the native TextInput component, supporting labels, icons, and error states.
 */
export const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      label,
      value,
      onChange, // Maps to onChangeText
      icon,
      error = false, // Controlled by FormField/FormControl
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {

    // --- Color and Style Mapping ---
    // Mapping custom CSS variables to NativeWind classes
    const SURFACE_BG = 'bg-white dark:bg-gray-800'; // var(--surface)
    const ON_SURFACE_TEXT = 'text-gray-900 dark:text-gray-100'; // var(--on-surface)
    const ON_SURFACE_VARIANT = 'text-gray-500 dark:text-gray-400'; // var(--on-surface-variant)
    const PRIMARY_COLOR = 'border-blue-600 dark:border-blue-400'; // var(--primary)
    const OUTLINE_COLOR = 'border-gray-300 dark:border-gray-700'; // var(--outline)
    const ERROR_COLOR = 'border-red-500 dark:border-red-400'; // var(--error)
    
    // RN Prop Mapping
    const keyboardTypeMap: Record<string, TextInputProps['keyboardType']> = {
      'email': 'email-address',
      'number-pad': 'numeric',
      'url': 'url',
      'text': 'default',
    };
    
    const isPassword = type === 'password';

    // Dynamic classes based on state
    const inputBorderClasses = error ? ERROR_COLOR : OUTLINE_COLOR;
    const paddingLeft = icon ? 'pl-12' : 'pl-4'; // px-4 becomes pl-4 or pl-12

    // --- Component Structure ---
    return (
      <StyledView 
        className={cn('flex flex-col gap-2', fullWidth ? 'w-full' : '', className)} 
      >
        {/* Label (if provided) */}
        {label && (
          <StyledText className={cn('text-sm ml-4', ON_SURFACE_VARIANT)}>
            {label}
          </StyledText>
        )}

        {/* Input and Icon Wrapper */}
        <StyledView className="relative">
          
          {/* Icon (Absolute Positioned) */}
          {icon && (
            <StyledView className="absolute left-4 top-1/2 flex h-full justify-center">
              {/* Note: translate-y-1/2 is implicitly handled by h-full justify-center in RN */}
              <StyledView className={ON_SURFACE_VARIANT}>{icon}</StyledView>
            </StyledView>
          )}

          {/* TextInput Field */}
          <StyledTextInput
            ref={ref}
            onChangeText={onChange} // Use RN's standard onChangeText prop
            value={value}
            placeholder={placeholder}
            keyboardType={keyboardTypeMap[type] || 'default'}
            secureTextEntry={isPassword}
            placeholderTextColor="rgba(107, 114, 128, 1)" // var(--on-surface-variant)
            
            // NativeWind Styling
            className={cn(
              'h-14 w-full border rounded-xl px-4 transition-all', // rounded-[var(--radius-md)] -> rounded-xl
              SURFACE_BG,
              inputBorderClasses,
              ON_SURFACE_TEXT,
              paddingLeft,

              // Focus state simulation (focus:border-[var(--primary)] focus:ring-2...)
              // In RN/NativeWind, we use focus: classes or handle ring via error state/animation.
              // We rely on the active state and focus:border/ring classes in NativeWind config.
              'focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20',

              props.editable === false && 'opacity-60', // Disabled/read-only state

              // The original component had no explicit className prop, but we add it last for overrides
            )}
            {...props}
          />
        </StyledView>
        
        {/* Error Message */}
        {typeof error === 'string' && error.length > 0 && (
          <StyledText className={cn('text-sm ml-4 text-red-500 dark:text-red-400')}>
            {error}
          </StyledText>
        )}
      </StyledView>
    );
  }
);

Input.displayName = "Input";

// --- Export the component ---
export { Input };
