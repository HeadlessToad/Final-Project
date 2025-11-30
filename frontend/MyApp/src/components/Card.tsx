
// src/components/ui/card.tsx

import * as React from 'react';
import { View, Pressable, PressableProps, ViewProps } from 'react-native';
import { styled } from 'nativewind';
import { cn } from './utils';

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledPressable = styled(Pressable);

// --- Padding Map ---
const paddingStyles = {
  none: 'p-0',
  small: 'p-3',
  medium: 'p-4',
  large: 'p-6'
};

// --- Component Props ---
interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  onClick?: PressableProps['onPress'];
  padding?: 'none' | 'small' | 'medium' | 'large';
}

/**
 * @function Card
 * @description A styled container component that provides a surface for grouping content.
 * It uses Pressable when an onClick handler is provided for native touch feedback.
 */
export function Card({ children, className = '', onClick, padding = 'medium', ...props }: CardProps) {
  
  // Define base and dynamic styles
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700';
  const finalPadding = paddingStyles[padding] || paddingStyles.medium;

  // 1. If onClick is provided, use a Pressable for feedback
  if (onClick) {
    return (
      <StyledPressable
        onPress={onClick}
        // Apply hover/active state visual feedback via Pressable's pressed state
        className={({ pressed }) => cn(
          baseStyles,
          finalPadding,
          pressed ? 'shadow-md opacity-90' : 'shadow-sm', // Transition-shadow emulation
          className
        )}
        {...props}
      >
        {children}
      </StyledPressable>
    );
  }

  // 2. If no onClick, use a simple View
  return (
    <StyledView
      className={cn(
        baseStyles,
        finalPadding,
        className
      )}
      {...props}
    >
      {children}
    </StyledView>
  );
}

// --- Export the component ---
export { Card };