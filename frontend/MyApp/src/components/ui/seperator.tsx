// src/components/ui/separator.tsx

import * as React from "react";
import { View, ViewProps } from "react-native";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components ---
const StyledView = styled(View);

// --- Component Props ---
interface SeparatorProps extends ViewProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical'; // Default to horizontal
  decorative?: boolean; // Kept for semantics, but unused in RN layout
}

/**
 * @function Separator
 * @description A visual or semantic divider between sections of content.
 * @param {string} [orientation='horizontal'] - Defines if the separator is a horizontal line (w-full, h-px) or vertical line (h-full, w-px).
 */
export function Separator({
  className,
  orientation = "horizontal",
  decorative = true, // Ignored by RN layout, but kept for semantic compatibility
  ...props
}: SeparatorProps) {
  
  const orientationClasses = 
    orientation === 'horizontal' 
      ? 'h-px w-full' // data-[orientation=horizontal] equivalent
      : 'h-full w-px'; // data-[orientation=vertical] equivalent

  return (
    <StyledView
      data-slot="separator-root"
      // Accessibility role for dividers
      accessibilityRole="none" 
      accessibilityElementsHidden={decorative}
      
      className={cn(
        // Base styling: border color, shrink property
        "bg-gray-200 dark:bg-gray-700 shrink-0", 
        orientationClasses,
        className,
      )}
      {...props}
    />
  );
}

// --- Export the component ---
export { Separator };