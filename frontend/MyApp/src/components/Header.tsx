
// src/components/ui/header.tsx

import * as React from 'react';
import { View, Text, Pressable, PressableProps, ViewProps } from 'react-native';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import { styled } from 'nativewind';
import { cn } from './ui/utils';

// --- Styled Components ---
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledPressable = styled(Pressable);

// --- Component Props ---
interface HeaderProps extends ViewProps {
  title?: string;
  onBack?: PressableProps['onPress'];
  actions?: React.ReactNode; // Typically icons/buttons wrapped in a View
  transparent?: boolean;
}

/**
 * @function Header
 * @description The main application header component, supporting a title, a back button, 
 * and optional action buttons.
 */
export function Header({ title, onBack, actions, transparent = false, className, ...props }: HeaderProps) {
  
  // Map CSS variables to NativeWind classes:
  const surfaceColor = 'bg-white dark:bg-gray-800'; // var(--surface)
  const outlineColor = 'border-gray-300 dark:border-gray-600'; // var(--outline)
  const onSurfaceText = 'text-gray-900 dark:text-gray-100'; // var(--on-surface)
  const surfaceVariantBg = 'bg-gray-100 dark:bg-gray-700'; // var(--surface-variant)
  
  const headerStyles = cn(
    // Sticky is ignored in RN, but fixed top positioning is implicit in a Screen component layout.
    "z-10", 
    transparent ? 'bg-transparent' : surfaceColor,
    `border-b ${outlineColor}`,
    className,
  );

  return (
    <StyledView 
      className={headerStyles}
      {...props}
    >
      <StyledView className="flex flex-row items-center justify-between h-14 px-4">
        
        {/* Left Section: Back Button and Title */}
        <StyledView className="flex flex-row items-center gap-4">
          {onBack && (
            <StyledPressable
              onPress={onBack}
              // p-2 -m-2 is used for touch target expansion
              className={cn(
                "p-2 rounded-full transition-colors",
                `active:${surfaceVariantBg}` // hover:bg-[var(--surface-variant)] emulation
              )}
            >
              <ArrowLeft size={24} className={onSurfaceText} />
            </StyledPressable>
          )}
          {title && (
            <StyledText className={cn("text-xl font-semibold", onSurfaceText)}>
              {title}
            </StyledText>
          )}
        </StyledView>
        
        {/* Right Section: Actions */}
        {actions && (
          <StyledView className="flex flex-row items-center gap-2">
            {actions}
          </StyledView>
        )}
      </StyledView>
    </StyledView>
  );
}

// --- Export the component ---
export { Header };