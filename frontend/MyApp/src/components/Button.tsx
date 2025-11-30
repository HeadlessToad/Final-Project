// src/components/ui/button.tsx

import * as React from 'react';
import { Pressable, Text, View, ActivityIndicator, PressableProps, ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { styled } from 'nativewind';
import { cn } from './utils'; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- 1. CVA for Button Variants and Sizes ---

// NOTE on Colors: We are mapping the general CSS variables from the original code
// (--primary, --secondary) to high-contrast, eco-friendly Tailwind classes 
// to match the "GreenMind" theme and the UI description.
export const buttonVariants = cva(
  // Base styles: rounded-full, transition, flex, centered content, gap
  "rounded-full transition-all duration-200 flex flex-row items-center justify-center gap-2",
  {
    variants: {
      variant: {
        // primary: 'bg-[var(--primary)] text-[var(--on-primary)]' -> Eco Green
        primary: "bg-green-600 active:bg-green-700 shadow-md",
        
        // secondary: 'bg-[var(--secondary)] text-white' -> Dark Blue/Secondary Accent
        secondary: "bg-blue-600 active:bg-blue-700 shadow-md",
        
        // outline: 'border-2 border-[var(--primary)] text-[var(--primary)]' -> Green Border
        outline: "border-2 border-green-600 bg-transparent active:bg-green-100/30",
        
        // text: 'text-[var(--primary)]' -> Flat Green Text
        text: "bg-transparent active:bg-green-100/30",
      },
      size: {
        // small: 'h-10 px-4 text-sm'
        small: "h-10 px-4 text-sm",
        // medium: 'h-12 px-6'
        medium: "h-12 px-6",
        // large: 'h-14 px-8'
        large: "h-14 px-8",
      },
      fullWidth: {
        true: "w-full",
      },
      disabled: {
        true: "opacity-50", // disabled:opacity-50
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
      fullWidth: false,
    },
  },
);

// --- CVA for Text Color (Separated for RN Text component) ---
const textVariants = cva("font-semibold", {
  variants: {
    variant: {
      primary: "text-white", // on-primary
      secondary: "text-white",
      outline: "text-green-600", // primary color
      text: "text-green-600", // primary color
    },
    size: {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'medium',
  }
});


// --- 2. Component Props and Definition ---
interface ButtonProps extends Omit<PressableProps, 'onPress' | 'children' | 'disabled' | 'style'>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onPress?: PressableProps['onPress'];
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean; // Added mobile loading state
}

/**
 * @function Button
 * @description A multi-variant, reusable button component with built-in loading and icon support.
 */
export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
  fullWidth = false,
  icon,
  disabled = false,
  isLoading = false,
  className,
  ...props
}: ButtonProps) {
  
  const isDisabled = disabled || isLoading;
  const indicatorColor = (variant === 'primary' || variant === 'secondary') ? 'white' : '#10B981'; // Primary color for non-filled variants

  return (
    <StyledPressable
      className={cn(
        buttonVariants({ variant, size, fullWidth, disabled: isDisabled }),
        className
      )}
      onPress={onPress}
      disabled={isDisabled}
      // Use Pressable's state for native touch feedback (active:bg-...)
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {/* Icon (Equivalent of web <span>{icon}</span>) */}
          {icon && <StyledView>{icon}</StyledView>}
          
          {/* Children (Text) */}
          <StyledText 
            className={cn(
              textVariants({ variant, size })
            )}
          >
            {children}
          </StyledText>
        </>
      )}
    </StyledPressable>
  );
}

// --- Export Variants for other components (like Button.tsx) ---
export { buttonVariants, Button };