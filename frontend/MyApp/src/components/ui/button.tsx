// src/components/ui/button.tsx

import * as React from "react";
import { Pressable, Text, View, ActivityIndicator, PressableProps, ViewProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// Define the core Button styles using cva
export const buttonVariants = cva(
  // Base classes: Flex row, centered content, rounded, medium font, transition (opacity/color)
  "flex flex-row items-center justify-center gap-2 rounded-md text-sm font-medium transition-opacity",
  {
    variants: {
      variant: {
        // Default (Primary/Action color - e.g., "Classify Now")
        default: "bg-blue-600 active:bg-blue-700", 
        
        // Destructive (Error/Warning - e.g., "Delete Account")
        destructive: "bg-red-600 active:bg-red-700",
        
        // Outline (Secondary, border visible - e.g., "Cancel")
        outline: "border border-gray-300 bg-transparent active:bg-gray-100 dark:border-gray-700 dark:active:bg-gray-800",
        
        // Secondary (Muted background - e.g., "Feedback")
        secondary: "bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:active:bg-gray-600",
        
        // Ghost (No background, flat - e.g., "Forgot Password")
        ghost: "active:bg-gray-100 dark:active:bg-gray-800",
        
        // Link (Text with underline offset)
        link: "text-blue-600 underline-offset-4",
      },
      size: {
        // Default size (for most actions)
        default: "h-10 px-4 py-2", 
        // Small size
        sm: "h-8 px-3 py-1.5 gap-1.5", 
        // Large size
        lg: "h-12 px-6 py-3", 
        // Icon-only size
        icon: "size-10 p-0", 
      },
      // Utility variant to adjust padding when an icon is present (mimics has-[>svg]:px-3)
      hasIcon: {
        true: "", // This is generally handled by the `gap-2` above and icon size
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Define the text color based on the button variant
const textVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-white",
      destructive: "text-white",
      outline: "text-gray-800 dark:text-gray-100",
      secondary: "text-gray-800 dark:text-gray-100",
      ghost: "text-gray-800 dark:text-gray-100",
      link: "text-blue-600 dark:text-blue-400",
    },
    size: {
      default: "text-sm",
      sm: "text-xs",
      lg: "text-base",
      icon: "text-sm",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

// --- Button Component Props ---
interface ButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, 'children' | 'style'>,
    VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  isLoading?: boolean; // New prop for loading state
  children: React.ReactNode;
  icon?: React.ReactNode; // Ensure icon prop is included
  fullWidth?: boolean; // Ensure fullWidth is included
}

/**
 * @function Button
 * @description A multi-variant, reusable button component for all user interactions.
 * Uses Pressable for native touch feedback and supports loading state.
 */
export function Button({
  className,
  variant,
  size,
  textClassName,
  isLoading = false,
  children,
  disabled,
  icon,
  fullWidth, // Destructure fullWidth
  ...props
}: ButtonProps) {
  
  // Calculate text color for the Activity Indicator
  const indicatorColor = variant === 'default' || variant === 'destructive' ? 'white' : '#1f2937'; // dark gray
  
  // Get the contents to check for icons (Used in the original implementation structure)
  const childrenArray = React.Children.toArray(children);
  
  // Determine if the icon-adjusted padding is needed (complex logic simplified by NativeWind Flex)
  const finalClasses = cn(
    // Pass fullWidth as a CVA variant
    buttonVariants({ variant, size, fullWidth: fullWidth }), 
    (disabled || isLoading) && "opacity-50", // Apply disabled state opacity
    className
  );
  
  const finalTextClasses = cn(
    textVariants({ variant, size }),
    textClassName,
  );

  return (
    <StyledPressable
      className={finalClasses}
      disabled={disabled || isLoading} // Pass disabled to Pressable
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <>
          {/* Render icon if provided (from props) */}
          {icon && <StyledView>{icon}</StyledView>}
          
          {/* Render text content from children */}
          {childrenArray.map((child, index) => 
            (typeof child === 'string' || typeof child === 'number') ? (
              <StyledText key={index} className={finalTextClasses}>
                {child}
              </StyledText>
            ) : null
          )}
        </>
      )}
    </StyledPressable>
  );
}

// --- Export the components and variants ---
export { buttonVariants, Button };