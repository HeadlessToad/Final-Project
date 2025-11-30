// src/components/ui/scroll-area.tsx

import * as React from "react";
import { View, ScrollView, ViewProps, ScrollViewProps } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);
const StyledScrollView = styled(ScrollView);

// --- 1. ScrollArea Root Component ---
interface ScrollAreaProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
  // Use RN standard prop names for customizability
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
}

/**
 * @function ScrollArea
 * @description A container that defines a fixed viewport for scrollable content, 
 * using the native ScrollView component.
 */
export function ScrollArea({
  className,
  children,
  showsHorizontalScrollIndicator = false,
  showsVerticalScrollIndicator = true,
  ...props
}: ScrollAreaProps) {
  
  return (
    <StyledView
      data-slot="scroll-area"
      // The outer View enforces the size of the scrollable "viewport"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* ScrollAreaPrimitive.Viewport is replaced by the ScrollView */}
      <StyledScrollView
        data-slot="scroll-area-viewport"
        // Ensure the ScrollView fills the parent View
        className="size-full"
        // Hide the horizontal indicator by default for cleaner mobile UI
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        // Native scrollbars are often transient and not customizable in RN
        // We set indicator style to dark/light for better visibility against backgrounds
        indicatorStyle="default" // "white" or "black" on iOS/Android
        contentContainerStyle={{ paddingVertical: 1 }} // Small padding to prevent content clipping
      >
        {children}
      </StyledScrollView>
      
      {/* ScrollBar and Corner components are omitted/handled by the OS */}
    </StyledView>
  );
}

// --- 2. ScrollBar Component (Omitted/Placeholder) ---
// The ScrollAreaPrimitive.ScrollAreaScrollbar and Thumb components cannot be replicated 
// as they control native OS scrolling behavior not exposed to React Native.

interface ScrollBarProps extends ViewProps {
    orientation?: 'vertical' | 'horizontal';
    className?: string;
}

/**
 * @function ScrollBar
 * @description Placeholder. Custom scrollbar control is not possible in standard React Native.
 */
export function ScrollBar({ orientation = "vertical", className, ...props }: ScrollBarProps) {
    console.warn("ScrollBar is a web-only concept. Use ScrollView's indicatorStyle prop instead.");
    return null;
}

// --- Final Export ---
export { ScrollArea, ScrollBar };