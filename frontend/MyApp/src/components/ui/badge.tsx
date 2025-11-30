// src/components/ui/badge.tsx

import * as React from "react";
import { View, Text } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { styled } from "nativewind";
import { cn } from "./utils"; // Utility for merging class names

// --- Styled Components for NativeWind ---
const StyledView = styled(View);
const StyledText = styled(Text);

// Define the core Badge styles using cva
export const badgeVariants = cva(
  // Base classes: inline-flex (flex row in RN), centered, rounded border, padding, text size, font weight
  // NOTE: RN doesn't need "whitespace-nowrap" or "w-fit" explicitly if Flex is set correctly.
  "flex flex-row items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 gap-1 overflow-hidden",
  {
    variants: {
      variant: {
        // Default (Primary/Action color)
        default:
          "border-transparent bg-blue-600 text-white dark:bg-blue-700", // Using explicit blue/white colors
        
        // Secondary (Muted color, often for non-critical status)
        secondary:
          "border-transparent bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
        
        // Destructive (Error/Warning color)
        destructive:
          "border-transparent bg-red-600 text-white dark:bg-red-800",
        
        // Outline (Bordered but transparent background)
        outline:
          "border-gray-300 bg-transparent text-gray-800 dark:border-gray-600 dark:text-gray-200",
        
        // --- Custom variants specific to your GreenMind app ---
        // For waste categories
        plastic: "border-transparent bg-green-500 text-white", // Green for recycling success
        paper: "border-transparent bg-yellow-500 text-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// --- Badge Component Props ---
interface BadgeProps extends React.ComponentProps<typeof View>, VariantProps<typeof badgeVariants> {
  className?: string;
  children: React.ReactNode;
  // We handle the text children separately to apply text styles
  textClassName?: string;
}

/**
 * @function Badge
 * @description A small, contextual label used for statuses, points, or classifications.
 */
export function Badge({
  className,
  variant,
  children,
  textClassName,
  ...props
}: BadgeProps) {
  
  // Logic to separate text content from potential icon content
  const childrenArray = React.Children.toArray(children);
  const textChild = childrenArray.find(
    (child) => typeof child === 'string' || (React.isValidElement(child) && child.type === Text)
  );
  const otherChildren = childrenArray.filter(
    (child) => child !== textChild
  );

  // Determine text color class based on variant
  const isDarkText = variant === 'secondary' || variant === 'paper' || variant === 'outline';
  const textColorClass = isDarkText ? 'text-gray-800 dark:text-gray-900' : 'text-white';
  

  return (
    <StyledView
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {/* Non-Text Children (e.g., Icons) */}
      {otherChildren}

      {/* Text Content */}
      <StyledText 
        className={cn("text-xs font-medium", textColorClass, textClassName)}
      >
        {textChild}
      </StyledText>
    </StyledView>
  );
}

// --- Export the components and variants ---
export { Badge, badgeVariants };

// --- Usage Example ---
/*
import { Award } from 'lucide-react-native';

<Badge variant="plastic" className="size-fit">
  <Award size={12} color="white" />
  Plastic
</Badge>

<Badge variant="default">1,750 Points</Badge> [cite: 116] 
*/